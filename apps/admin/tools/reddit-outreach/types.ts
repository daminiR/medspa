export interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  body: string;
  url: string;
  author: string;
  created_utc: number;
  score: number;
  num_comments: number;
}

export interface RedditComment {
  id: string;
  post_id: string;
  subreddit: string;
  body: string;
  author: string;
  created_utc: number;
  score: number;
  permalink: string;
}

export interface ProspectDraft {
  original: string;
  draft: string;
}

export interface Prospect {
  id: string;
  type: 'post' | 'comment';
  subreddit: string;
  url: string;
  originalText: string;
  aiDraft: string;
  status: 'new' | 'approved' | 'posted' | 'skipped';
  createdAt: string;
  updatedAt: string;
  postMethod?: 'api' | 'browser';
  redditData?: RedditPost | RedditComment;
}

export interface ProspectsData {
  prospects: Prospect[];
  lastUpdated: string;
}

// Discovery Service Types (for B2B prospect discovery)
export interface DiscoveryProspect {
  id: string;
  type: 'post' | 'comment';
  author: string;
  subreddit: string;
  title?: string; // For posts
  content: string;
  url: string;
  score: number;
  createdAt: Date;
  relevanceScore: number;
  frustrationSignals: string[];
  keywords: string[];
}

export interface SearchQuery {
  subreddit: string;
  keywords: string[];
}

export interface FrustrationSignal {
  keyword: string;
  weight: number;
}
