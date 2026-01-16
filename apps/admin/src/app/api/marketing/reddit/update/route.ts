/**
 * POST /api/marketing/reddit/update - Update prospect status or draft
 */

import { NextRequest, NextResponse } from 'next/server';
import { redditProspects } from '@/lib/data/reddit';
import { RedditProspectStatus } from '@/types/reddit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prospectId, status, draftResponse } = body;

    if (!prospectId) {
      return NextResponse.json(
        { success: false, error: 'prospectId is required' },
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
    const updates: Partial<typeof prospect> = {};

    // Update status if provided
    if (status) {
      const validStatuses: RedditProspectStatus[] = ['new', 'drafted', 'approved', 'posted', 'skipped'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }

      updates.status = status;

      // Set timestamp based on status
      if (status === 'skipped') {
        updates.skippedAt = new Date();
      } else if (status === 'approved') {
        updates.approvedAt = new Date();
      } else if (status === 'posted') {
        updates.postedAt = new Date();
      }
    }

    // Update draft response if provided
    if (draftResponse !== undefined) {
      updates.draftResponse = draftResponse;
    }

    // Apply updates
    redditProspects[prospectIndex] = {
      ...prospect,
      ...updates,
    };

    return NextResponse.json({
      success: true,
      data: redditProspects[prospectIndex],
      message: 'Prospect updated successfully',
    });
  } catch (error) {
    console.error('Reddit update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update prospect' },
      { status: 500 }
    );
  }
}
