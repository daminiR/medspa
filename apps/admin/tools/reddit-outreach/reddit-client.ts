import { RedditPost, RedditComment } from './types';

export interface RedditConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  userAgent: string;
}

export class RedditClient {
  private config: RedditConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: RedditConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.config.userAgent,
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: this.config.username,
        password: this.config.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early

    if (!this.accessToken) {
      throw new Error('Failed to get access token');
    }

    return this.accessToken;
  }

  async searchPosts(subreddit: string, query: string, limit: number = 25): Promise<RedditPost[]> {
    const token = await this.getAccessToken();

    const url = new URL(`https://oauth.reddit.com/r/${subreddit}/search`);
    url.searchParams.set('q', query);
    url.searchParams.set('restrict_sr', 'true');
    url.searchParams.set('sort', 'new');
    url.searchParams.set('limit', limit.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': this.config.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to search posts: ${response.statusText}`);
    }

    const data = await response.json();

    return data.data.children.map((child: any) => ({
      id: child.data.id,
      subreddit: child.data.subreddit,
      title: child.data.title,
      body: child.data.selftext,
      url: `https://reddit.com${child.data.permalink}`,
      author: child.data.author,
      created_utc: child.data.created_utc,
      score: child.data.score,
      num_comments: child.data.num_comments,
    }));
  }

  async getHotPosts(subreddit: string, limit: number = 25): Promise<RedditPost[]> {
    const token = await this.getAccessToken();

    const url = new URL(`https://oauth.reddit.com/r/${subreddit}/hot`);
    url.searchParams.set('limit', limit.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': this.config.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get hot posts: ${response.statusText}`);
    }

    const data = await response.json();

    return data.data.children.map((child: any) => ({
      id: child.data.id,
      subreddit: child.data.subreddit,
      title: child.data.title,
      body: child.data.selftext,
      url: `https://reddit.com${child.data.permalink}`,
      author: child.data.author,
      created_utc: child.data.created_utc,
      score: child.data.score,
      num_comments: child.data.num_comments,
    }));
  }

  async postComment(postId: string, text: string): Promise<{ success: boolean; commentId?: string; error?: string }> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch('https://oauth.reddit.com/api/comment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.config.userAgent,
        },
        body: new URLSearchParams({
          thing_id: `t3_${postId}`,
          text: text,
        }),
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();

      if (data.json?.errors?.length > 0) {
        return { success: false, error: data.json.errors[0].join(': ') };
      }

      return {
        success: true,
        commentId: data.json?.data?.things?.[0]?.data?.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async replyToComment(commentId: string, text: string): Promise<{ success: boolean; commentId?: string; error?: string }> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch('https://oauth.reddit.com/api/comment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.config.userAgent,
        },
        body: new URLSearchParams({
          thing_id: `t1_${commentId}`,
          text: text,
        }),
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();

      if (data.json?.errors?.length > 0) {
        return { success: false, error: data.json.errors[0].join(': ') };
      }

      return {
        success: true,
        commentId: data.json?.data?.things?.[0]?.data?.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
