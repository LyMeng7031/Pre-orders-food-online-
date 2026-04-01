import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import NotificationService from '@/lib/notificationService';

// Initialize notification service
let notificationService: NotificationService;

function getNotificationService(): NotificationService {
  if (!notificationService) {
    const { Server } = require('socket.io');
    const http = require('http');
    const server = http.createServer();
    const io = new Server(server);
    notificationService = new NotificationService(io);
  }
  return notificationService;
}

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = getNotificationService();
    await service.markAllAsRead(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
