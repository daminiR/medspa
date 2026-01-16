/**
 * PATCH /api/notifications/:id/read - Mark a notification as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { markAsRead, getNotifications } from '@/lib/notifications/notificationStore';

// PATCH - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const success = markAsRead(id);
    if (!success) {
      // Check if notification exists at all
      const notification = getNotifications().find(n => n.id === id);
      if (!notification) {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        );
      }
      // Already read
      return NextResponse.json({
        success: true,
        notification,
      });
    }

    // Find the updated notification
    const notification = getNotifications().find(n => n.id === id);

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Notification read PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
