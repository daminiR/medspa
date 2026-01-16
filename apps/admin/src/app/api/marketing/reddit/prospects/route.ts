/**
 * GET /api/marketing/reddit/prospects - Get all Reddit prospects with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { redditProspects } from '@/lib/data/reddit';
import { RedditProspect, RedditProspectStatus, RedditStatusCounts } from '@/types/reddit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as RedditProspectStatus | null;
    const search = searchParams.get('search') || '';

    let result = [...redditProspects];

    // Calculate status counts
    const statusCounts: RedditStatusCounts = {
      new: redditProspects.filter(p => p.status === 'new').length,
      drafted: redditProspects.filter(p => p.status === 'drafted').length,
      approved: redditProspects.filter(p => p.status === 'approved').length,
      posted: redditProspects.filter(p => p.status === 'posted').length,
      skipped: redditProspects.filter(p => p.status === 'skipped').length,
    };

    // Filter by status
    if (status) {
      result = result.filter(p => p.status === status);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.subreddit.toLowerCase().includes(searchLower) ||
        p.originalText.toLowerCase().includes(searchLower)
      );
    }

    // Sort by age (newest first)
    result.sort((a, b) => a.ageHours - b.ageHours);

    return NextResponse.json({
      success: true,
      data: result,
      statusCounts,
    });
  } catch (error) {
    console.error('Reddit prospects GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Reddit prospects' },
      { status: 500 }
    );
  }
}
