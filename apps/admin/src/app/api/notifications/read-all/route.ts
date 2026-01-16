/**
 * POST /api/notifications/read-all - Mark all notifications as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { markAllAsRead } from '@/lib/notifications/notificationStore';

// POST - Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    // Use 'staff-all' or a specific user ID from auth context
    // For now, mark all as read for the default staff user
    const userId = 'staff-all';
    const updatedCount = markAllAsRead(userId);

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `${updatedCount} notification(s) marked as read`,
    });
  } catch (error) {
    console.error('Notifications read-all POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
