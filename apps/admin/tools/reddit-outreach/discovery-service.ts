import * as fs from 'fs';
import * as path from 'path';
import { DiscoveryRedditClient } from './discovery-client';
import { DiscoveryProspect, SearchQuery, FrustrationSignal } from './types';

export class ProspectDiscoveryService {
  private redditClient: DiscoveryRedditClient;
  private prospectsFilePath: string;

  // Target subreddits for MedSpa owners
  private readonly SUBREDDITS = [
    'Esthetics',
    'MedicalSpa',
    'smallbusiness',
    'Entrepreneur',
  ];

  // Search keywords targeting pain points
  private readonly KEYWORDS = [
    'medspa software',
    'scheduling nightmare',
    'booking system',
    'mindbody frustrated',
    'vagaro',
    'boulevard software',
    'looking for spa software',
    'hate my booking',
    'switching from',
  ];

  // Frustration signals with weights for relevance scoring
  private readonly FRUSTRATION_SIGNALS: FrustrationSignal[] = [
    { keyword: 'frustrated', weight: 3 },
    { keyword: 'nightmare', weight: 3 },
    { keyword: 'hate', weight: 3 },
    { keyword: 'terrible', weight: 2 },
    { keyword: 'awful', weight: 2 },
    { keyword: 'worst', weight: 2 },
    { keyword: 'switching from', weight: 4 },
    { keyword: 'looking for', weight: 3 },
    { keyword: 'better alternative', weight: 4 },
    { keyword: 'tired of', weight: 2 },
    { keyword: 'fed up', weight: 3 },
    { keyword: 'overpriced', weight: 2 },
    { keyword: 'complicated', weight: 2 },
    { keyword: 'glitchy', weight: 2 },
    { keyword: 'unreliable', weight: 2 },
    { keyword: 'poor support', weight: 2 },
    { keyword: 'nightmare', weight: 3 },
    { keyword: 'recommend against', weight: 4 },
  ];

  // Maximum age of posts to consider (in days)
  private readonly MAX_POST_AGE_DAYS = 30;

  constructor() {
    this.redditClient = new DiscoveryRedditClient();
    this.prospectsFilePath = path.join(__dirname, 'data', 'discovery-prospects.json');
  }

  /**
   * Discover prospects from Reddit based on predefined queries
   */
  async discoverProspects(limit: number = 50): Promise<DiscoveryProspect[]> {
    console.log('🔍 Starting prospect discovery...');

    const allProspects: DiscoveryProspect[] = [];
    const seenIds = new Set<string>();

    // Search each subreddit with each keyword
    for (const subreddit of this.SUBREDDITS) {
      console.log(`\n📍 Searching r/${subreddit}...`);

      for (const keyword of this.KEYWORDS) {
        console.log(`  🔎 Keyword: "${keyword}"`);

        try {
          // Search for posts matching the keyword
          const posts = await this.redditClient.searchSubreddit(
            subreddit,
            keyword,
            10
          );

          await this.redditClient.delay(2000); // Rate limiting

          for (const post of posts) {
            // Filter by age
            if (!this.isWithinAgeLimit(post.created_utc)) {
              continue;
            }

            // Check if already seen
            if (seenIds.has(post.id)) {
              continue;
            }

            // Convert to prospect and check relevance
            const prospect = this.convertPostToProspect(post, keyword);

            if (prospect.relevanceScore > 0) {
              allProspects.push(prospect);
              seenIds.add(post.id);
              console.log(`    ✅ Found prospect: ${prospect.id} (score: ${prospect.relevanceScore})`);
            }

            // Also check comments on high-scoring posts
            if (post.score > 5) {
              const comments = await this.redditClient.getPostComments(
                subreddit,
                post.id
              );

              await this.redditClient.delay(2000); // Rate limiting

              for (const comment of comments) {
                if (!this.isWithinAgeLimit(comment.created_utc) || seenIds.has(comment.id)) {
                  continue;
                }

                const commentProspect = this.convertCommentToProspect(
                  comment,
                  post.subreddit,
                  keyword
                );

                if (commentProspect.relevanceScore > 0) {
                  allProspects.push(commentProspect);
                  seenIds.add(comment.id);
                  console.log(`    ✅ Found prospect (comment): ${commentProspect.id} (score: ${commentProspect.relevanceScore})`);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error searching r/${subreddit} for "${keyword}":`, error);
        }
      }
    }

    // Sort by relevance (score + recency)
    const sortedProspects = this.sortByRelevance(allProspects);

    // Limit results
    const limitedProspects = sortedProspects.slice(0, limit);

    console.log(`\n✨ Discovered ${limitedProspects.length} prospects`);

    return limitedProspects;
  }

  /**
   * Load saved prospects from JSON file
   */
  loadSavedProspects(): DiscoveryProspect[] {
    try {
      if (!fs.existsSync(this.prospectsFilePath)) {
        console.log('No saved prospects file found');
        return [];
      }

      const data = fs.readFileSync(this.prospectsFilePath, 'utf-8');
      const prospects = JSON.parse(data);

      // Convert date strings back to Date objects
      return prospects.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      }));
    } catch (error) {
      console.error('Error loading saved prospects:', error);
      return [];
    }
  }

  /**
   * Save prospects to JSON file
   */
  saveProspects(prospects: DiscoveryProspect[]): void {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.prospectsFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Save to file
      fs.writeFileSync(
        this.prospectsFilePath,
        JSON.stringify(prospects, null, 2),
        'utf-8'
      );

      console.log(`💾 Saved ${prospects.length} prospects to ${this.prospectsFilePath}`);
    } catch (error) {
      console.error('Error saving prospects:', error);
      throw error;
    }
  }

  /**
   * Convert Reddit post to Prospect
   */
  private convertPostToProspect(post: any, keyword: string): DiscoveryProspect {
    const content = `${post.title}\n\n${post.selftext}`.toLowerCase();
    const frustrationSignals = this.detectFrustrationSignals(content);
    const relevanceScore = this.calculateRelevanceScore(
      post.score,
      post.created_utc,
      frustrationSignals
    );

    return {
      id: post.id,
      type: 'post',
      author: post.author,
      subreddit: post.subreddit,
      title: post.title,
      content: post.selftext || '',
      url: `https://www.reddit.com${post.permalink}`,
      score: post.score,
      createdAt: new Date(post.created_utc * 1000),
      relevanceScore,
      frustrationSignals,
      keywords: [keyword],
    };
  }

  /**
   * Convert Reddit comment to Prospect
   */
  private convertCommentToProspect(
    comment: any,
    subreddit: string,
    keyword: string
  ): DiscoveryProspect {
    const content = comment.body.toLowerCase();
    const frustrationSignals = this.detectFrustrationSignals(content);
    const relevanceScore = this.calculateRelevanceScore(
      comment.score,
      comment.created_utc,
      frustrationSignals
    );

    return {
      id: comment.id,
      type: 'comment',
      author: comment.author,
      subreddit,
      content: comment.body,
      url: `https://www.reddit.com${comment.permalink}`,
      score: comment.score,
      createdAt: new Date(comment.created_utc * 1000),
      relevanceScore,
      frustrationSignals,
      keywords: [keyword],
    };
  }

  /**
   * Detect frustration signals in text
   */
  private detectFrustrationSignals(text: string): string[] {
    const signals: string[] = [];

    for (const signal of this.FRUSTRATION_SIGNALS) {
      if (text.includes(signal.keyword.toLowerCase())) {
        signals.push(signal.keyword);
      }
    }

    return signals;
  }

  /**
   * Calculate relevance score based on multiple factors
   */
  private calculateRelevanceScore(
    redditScore: number,
    createdTimestamp: number,
    frustrationSignals: string[]
  ): number {
    // Base score from Reddit upvotes
    let score = Math.log10(Math.max(redditScore, 1)) * 10;

    // Recency bonus (newer posts get higher scores)
    const ageInDays = (Date.now() / 1000 - createdTimestamp) / (60 * 60 * 24);
    const recencyBonus = Math.max(0, (30 - ageInDays) / 30) * 20;
    score += recencyBonus;

    // Frustration signals bonus
    for (const signal of frustrationSignals) {
      const signalData = this.FRUSTRATION_SIGNALS.find(
        (s) => s.keyword === signal
      );
      if (signalData) {
        score += signalData.weight * 5;
      }
    }

    return Math.round(score * 10) / 10;
  }

  /**
   * Check if post is within age limit
   */
  private isWithinAgeLimit(createdTimestamp: number): boolean {
    const ageInDays = (Date.now() / 1000 - createdTimestamp) / (60 * 60 * 24);
    return ageInDays <= this.MAX_POST_AGE_DAYS;
  }

  /**
   * Sort prospects by relevance (score + recency)
   */
  private sortByRelevance(prospects: DiscoveryProspect[]): DiscoveryProspect[] {
    return prospects.sort((a, b) => {
      // Primary: relevance score
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }

      // Secondary: recency
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }
}
