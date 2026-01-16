/**
 * GET /api/notifications - List notifications for current user
 * POST /api/notifications/read-all - Mark all as read (handled separately)
 */

import { NextRequest, NextResponse } from 'next/server';
import type {
  NotificationType,
  NotificationApiResponse,
} from '@/types/notifications';
import {
  getNotifications,
  getUnreadCount,
} from '@/lib/notifications/notificationStore';

// Re-export types for other route files that import from this file
export type { NotificationType, NotificationApiResponse as Notification };

// GET - List notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const readFilter = searchParams.get('read');
    const typeFilter = searchParams.get('type');

    // Get notifications from shared store
    let result = [...getNotifications()];

    // Filter by read status
    if (readFilter !== null && readFilter !== '') {
      const isRead = readFilter === 'true';
      result = result.filter(n => n.read === isRead);
    }

    // Filter by type
    if (typeFilter) {
      result = result.filter(n => n.type === typeFilter);
    }

    // Filter out expired notifications
    const now = new Date();
    result = result.filter(n => !n.expiresAt || new Date(n.expiresAt) > now);

    // Sort by createdAt
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Calculate unread count before pagination
    const unreadCount = getUnreadCount();
    const total = result.length;

    // Pagination
    const start = (page - 1) * limit;
    result = result.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      notifications: result,
      unreadCount,
      total,
      page,
      limit,
      hasMore: start + limit < total,
    });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
