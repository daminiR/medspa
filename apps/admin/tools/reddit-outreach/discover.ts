import * as fs from 'fs';
import * as path from 'path';
import { RedditClient } from './reddit-client';
import { AIDrafter } from './ai-drafter';
import { Prospect, ProspectsData } from './types';

const DATA_FILE = path.join(__dirname, 'data', 'prospects.json');

export async function discover() {
  console.log('🔍 Starting Reddit discovery...\n');

  // Load config from environment
  const redditConfig = {
    clientId: process.env.REDDIT_CLIENT_ID || '',
    clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
    username: process.env.REDDIT_USERNAME || '',
    password: process.env.REDDIT_PASSWORD || '',
    userAgent: process.env.REDDIT_USER_AGENT || 'MedSpaOutreach/1.0',
  };

  const geminiApiKey = process.env.GEMINI_API_KEY || '';

  if (!redditConfig.clientId || !redditConfig.clientSecret || !geminiApiKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, GEMINI_API_KEY');
    console.error('   REDDIT_USERNAME, REDDIT_PASSWORD');
    process.exit(1);
  }

  const reddit = new RedditClient(redditConfig);
  const drafter = new AIDrafter(geminiApiKey);

  // Target subreddits
  const subreddits = [
    'medspa',
    'estheticians',
    'medicalaesthetics',
    'smallbusiness',
    'entrepreneur',
  ];

  // Load existing prospects
  let existingData: ProspectsData = { prospects: [], lastUpdated: new Date().toISOString() };
  if (fs.existsSync(DATA_FILE)) {
    existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }

  const existingIds = new Set(existingData.prospects.map(p => p.id));
  const newProspects: Prospect[] = [];

  for (const subreddit of subreddits) {
    console.log(`📍 Searching r/${subreddit}...`);

    try {
      const posts = await reddit.getHotPosts(subreddit, 10);

      for (const post of posts) {
        // Skip if already processed
        if (existingIds.has(post.id)) {
          continue;
        }

        // Skip if too old (>7 days)
        const age = Date.now() / 1000 - post.created_utc;
        if (age > 7 * 24 * 60 * 60) {
          continue;
        }

        // Skip if no body text
        if (!post.body || post.body.length < 50) {
          continue;
        }

        console.log(`   💬 Generating draft for: ${post.title.substring(0, 60)}...`);

        const draft = await drafter.generateResponse(post);

        const prospect: Prospect = {
          id: post.id,
          type: 'post',
          subreddit: post.subreddit,
          url: post.url,
          originalText: `${post.title}\n\n${post.body}`,
          aiDraft: draft,
          status: 'new',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          redditData: post,
        };

        newProspects.push(prospect);
        existingIds.add(post.id);

        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`   ❌ Error processing r/${subreddit}:`, error);
    }
  }

  // Save prospects
  const updatedData: ProspectsData = {
    prospects: [...existingData.prospects, ...newProspects],
    lastUpdated: new Date().toISOString(),
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2));

  console.log(`\n✅ Discovery complete!`);
  console.log(`   Found ${newProspects.length} new prospects`);
  console.log(`   Total prospects: ${updatedData.prospects.length}`);
  console.log(`   Saved to: ${DATA_FILE}\n`);
}
