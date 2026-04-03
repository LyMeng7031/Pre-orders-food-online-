import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import NotificationService from './notificationService';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export class SocketHandler {
  private io: SocketIOServer;
  private notificationService: NotificationService;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.notificationService = new NotificationService(this.io);
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware for Socket.IO
   */
  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  /**
   * Setup event handlers for Socket.IO connections
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected via WebSocket`);

      // Join user-specific room for targeted notifications
      socket.join(`user:${socket.userId}`);

      // Join role-based rooms
      if (socket.user?.role) {
        socket.join(`role:${socket.user.role}`);
      }

      // Handle joining order-specific rooms
      socket.on('join-order-room', (orderId: string) => {
        socket.join(`order:${orderId}`);
      });

      // Handle joining deadline order rooms
      socket.on('join-deadline-order-room', (orderId: string) => {
        socket.join(`deadline-order:${orderId}`);
      });

      // Handle notification read status
      socket.on('mark-notification-read', async (notificationId: string) => {
        try {
          await this.notificationService.markAsRead(notificationId);
          
          // Emit updated unread count to the user
          const { notifications } = await this.notificationService.getUserNotifications(
            socket.userId!,
            { unreadOnly: true }
          );
          
          socket.emit('unread-count-updated', notifications.length);
        } catch (error) {
          socket.emit('error', { message: 'Failed to mark notification as read' });
        }
      });

      // Handle marking all notifications as read
      socket.on('mark-all-notifications-read', async () => {
        try {
          await this.notificationService.markAllAsRead(socket.userId!);
          socket.emit('unread-count-updated', 0);
        } catch (error) {
          socket.emit('error', { message: 'Failed to mark all notifications as read' });
        }
      });

      // Handle fetching notifications
      socket.on('fetch-notifications', async (options: { limit?: number; offset?: number; unreadOnly?: boolean }) => {
        try {
          const result = await this.notificationService.getUserNotifications(
            socket.userId!,
            options
          );
          socket.emit('notifications-fetched', result);
        } catch (error) {
          socket.emit('error', { message: 'Failed to fetch notifications' });
        }
      });

      // Handle deadline order creation (auto-schedule warning)
      socket.on('deadline-order-created', async (deadlineOrderData: any) => {
        try {
          // This would typically be handled in the API endpoint, but we can also support it via socket
          const deadlineOrder = await prisma.deadlineOrder.findUnique({
            where: { id: deadlineOrderData.id },
            include: {
              items: true,
            },
          });

          if (deadlineOrder) {
            await this.notificationService.scheduleDeadlineWarning(deadlineOrder);
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to schedule deadline warning' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`User ${socket.userId} disconnected: ${reason}`);
      });

      // Send initial unread count
      this.sendInitialUnreadCount(socket);
    });
  }

  /**
   * Send initial unread notification count to newly connected user
   */
  private async sendInitialUnreadCount(socket: AuthenticatedSocket): Promise<void> {
    try {
      const { notifications } = await this.notificationService.getUserNotifications(
        socket.userId!,
        { unreadOnly: true }
      );
      socket.emit('unread-count-updated', notifications.length);
    } catch (error) {
      console.error('Error sending initial unread count:', error);
    }
  }

  /**
   * Broadcast notification to all restaurant owners
   */
  async broadcastToRestaurantOwners(event: string, data: any): Promise<void> {
    this.io.to('role:OWNER').emit(event, data);
  }

  /**
   * Send notification to specific user
   */
  async sendToUser(userId: string, event: string, data: any): Promise<void> {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Send notification to users in order room
   */
  async sendToOrderRoom(orderId: string, event: string, data: any): Promise<void> {
    this.io.to(`order:${orderId}`).emit(event, data);
  }

  /**
   * Send notification to users in deadline order room
   */
  async sendToDeadlineOrderRoom(orderId: string, event: string, data: any): Promise<void> {
    this.io.to(`deadline-order:${orderId}`).emit(event, data);
  }

  /**
   * Get the notification service instance
   */
  getNotificationService(): NotificationService {
    return this.notificationService;
  }

  /**
   * Graceful shutdown
   */
  shutdown(): void {
    this.notificationService.cleanup();
    this.io.close();
  }
}

export default SocketHandler;
