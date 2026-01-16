/**
 * POST /api/marketing/reddit/post - Post comment via Reddit API
 */

import { NextRequest, NextResponse } from 'next/server';
import { redditProspects } from '@/lib/data/reddit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prospectId, draftResponse } = body;

    if (!prospectId) {
      return NextResponse.json(
        { success: false, error: 'prospectId is required' },
        { status: 400 }
      );
    }

    if (!draftResponse) {
      return NextResponse.json(
        { success: false, error: 'draftResponse is required' },
        { status: 400 }
      );
    }

    // Find the prospect
    const prospectIndex = redditProspects.findIndex(p => p.id === prospectId);

    if (prospectIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Prospect not found' },
        { status: 404 }
      );
    }

    const prospect = redditProspects[prospectIndex];

    // In production, this would:
    // 1. Authenticate with Reddit API using OAuth
    // 2. Post comment to the thread
    // 3. Handle rate limiting and errors
    // 4. Store the comment ID for tracking

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Randomly simulate success or failure (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      // Update prospect
      redditProspects[prospectIndex] = {
        ...prospect,
        status: 'posted',
        draftResponse,
        postedAt: new Date(),
        errorMessage: undefined,
      };

      return NextResponse.json({
        success: true,
        data: redditProspects[prospectIndex],
        message: 'Comment posted successfully',
      });
    } else {
      // Simulate error
      const errorMessage = 'Rate limit exceeded. Please try again in 5 minutes.';

      redditProspects[prospectIndex] = {
        ...prospect,
        errorMessage,
      };

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          data: redditProspects[prospectIndex],
        },
        { status: 429 }
      );
    }
  } catch (error) {
    console.error('Reddit post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post comment' },
      { status: 500 }
    );
  }
}
