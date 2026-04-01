import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import NotificationService from '@/lib/notificationService';

// Initialize notification service (will be injected by middleware in production)
let notificationService: NotificationService;

function getNotificationService(): NotificationService {
  if (!notificationService) {
    // In production, this would be injected from the socket handler
    // For now, create a temporary instance
    const { Server } = require('socket.io');
    const http = require('http');
    const server = http.createServer();
    const io = new Server(server);
    notificationService = new NotificationService(io);
  }
  return notificationService;
}

/**
 * GET /api/notifications
 * Fetch notifications for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const service = getNotificationService();
    const result = await service.getUserNotifications(session.user.id, {
      limit,
      offset,
      unreadOnly,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (admin/staff only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      recipientId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      priority,
      actionUrl,
      deliveryMethod,
      scheduledFor,
      metadata,
    } = body;

    // Validate required fields
    if (!recipientId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientId, type, title, message' },
        { status: 400 }
      );
    }

    const service = getNotificationService();
    const notification = await service.createNotification({
      recipientId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      priority,
      actionUrl,
      deliveryMethod,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      metadata,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
