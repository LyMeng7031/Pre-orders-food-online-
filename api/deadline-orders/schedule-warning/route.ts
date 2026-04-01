import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import NotificationService from '@/lib/notificationService';

const prisma = new PrismaClient();

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
 * POST /api/deadline-orders/schedule-warning
 * Schedule a deadline warning for an order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, warningMinutesBefore = 30 } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get the deadline order
    const deadlineOrder = await prisma.deadlineOrder.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!deadlineOrder) {
      return NextResponse.json(
        { error: 'Deadline order not found' },
        { status: 404 }
      );
    }

    const service = getNotificationService();
    await service.scheduleDeadlineWarning(deadlineOrder, warningMinutesBefore);

    return NextResponse.json({ 
      success: true, 
      message: `Warning scheduled for ${warningMinutesBefore} minutes before deadline` 
    });
  } catch (error) {
    console.error('Error scheduling deadline warning:', error);
    return NextResponse.json(
      { error: 'Failed to schedule deadline warning' },
      { status: 500 }
    );
  }
}
