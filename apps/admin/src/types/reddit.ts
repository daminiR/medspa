export type RedditProspectStatus = 'new' | 'drafted' | 'approved' | 'posted' | 'skipped';

export interface RedditProspect {
  id: string;
  subreddit: string;
  title: string;
  snippet: string;
  originalText: string;
  url: string;
  score: number;
  ageHours: number;
  status: RedditProspectStatus;
  draftResponse?: string;
  generatedAt?: Date;
  postedAt?: Date;
  skippedAt?: Date;
  approvedAt?: Date;
  errorMessage?: string;
}

export interface RedditStatusCounts {
  new: number;
  drafted: number;
  approved: number;
  posted: number;
  skipped: number;
}
