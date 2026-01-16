import { DiscoveryProspect } from './types';

/**
 * Reddit client for prospect discovery using the public JSON API
 * No authentication required - uses Reddit's public JSON endpoints
 */
export class DiscoveryRedditClient {
  private baseUrl = 'https://www.reddit.com';

  /**
   * Search for posts in a specific subreddit
   */
  async searchSubreddit(
    subreddit: string,
    query: string,
    limit: number = 25
  ): Promise<any[]> {
    try {
      // Using Reddit's JSON API (no auth required for public data)
      const searchUrl = `${this.baseUrl}/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=${limit}&sort=new`;

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'MedSpa-Discovery-Tool/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.children.map((child: any) => child.data);
    } catch (error) {
      console.error(`Error searching r/${subreddit}:`, error);
      return [];
    }
  }

  /**
   * Get recent posts from a subreddit
   */
  async getRecentPosts(subreddit: string, limit: number = 25): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/r/${subreddit}/new.json?limit=${limit}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MedSpa-Discovery-Tool/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.children.map((child: any) => child.data);
    } catch (error) {
      console.error(`Error fetching posts from r/${subreddit}:`, error);
      return [];
    }
  }

  /**
   * Get comments from a post
   */
  async getPostComments(subreddit: string, postId: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/r/${subreddit}/comments/${postId}.json`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MedSpa-Discovery-Tool/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();

      // Reddit returns an array: [post_data, comments_data]
      if (data.length > 1) {
        return this.flattenComments(data[1].data.children);
      }

      return [];
    } catch (error) {
      console.error(`Error fetching comments:`, error);
      return [];
    }
  }

  /**
   * Flatten nested comment structure
   */
  private flattenComments(comments: any[]): any[] {
    const flattened: any[] = [];

    for (const comment of comments) {
      if (comment.kind === 't1') {
        flattened.push(comment.data);

        if (comment.data.replies && comment.data.replies.data) {
          flattened.push(...this.flattenComments(comment.data.replies.data.children));
        }
      }
    }

    return flattened;
  }

  /**
   * Rate limiting - add delay between requests
   */
  async delay(ms: number = 2000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
