import { PrismaClient, Notification, DeadlineOrder, NotificationDeliveryMethod, NotificationPriority } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import * as cron from 'node-cron';
import EmailService from './emailService';

const prisma = new PrismaClient();

export interface NotificationData {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  deliveryMethod?: NotificationDeliveryMethod;
  scheduledFor?: Date;
  metadata?: any;
}

export class NotificationService {
  private io: SocketIOServer;
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.initializeScheduledNotifications();
  }

  /**
   * Create and send a notification immediately
   */
  async createNotification(data: NotificationData): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        ...data,
        isScheduled: !!data.scheduledFor,
        isSent: !data.scheduledFor,
        sentAt: data.scheduledFor ? null : new Date(),
      },
    });

    if (!data.scheduledFor) {
      await this.sendNotification(notification);
    }

    return notification;
  }

  /**
   * Schedule a deadline warning notification for a deadline order
   */
  async scheduleDeadlineWarning(
    deadlineOrder: DeadlineOrder,
    warningMinutesBefore: number = 30
  ): Promise<void> {
    // Check if warning already scheduled
    const existingWarning = await prisma.notification.findFirst({
      where: {
        relatedId: deadlineOrder.id,
        relatedType: 'DEADLINE_ORDER',
        type: 'DEADLINE_WARNING',
        isScheduled: true,
      },
    });

    if (existingWarning) {
      return; // Avoid duplicate notifications
    }

    const warningTime = new Date(deadlineOrder.deadlineTime);
    warningTime.setMinutes(warningTime.getMinutes() - warningMinutesBefore);

    // Only schedule if warning time is in the future
    if (warningTime <= new Date()) {
      return;
    }

    const notificationData: NotificationData = {
      recipientId: deadlineOrder.ownerId,
      type: 'DEADLINE_WARNING',
      title: 'Order Deadline Approaching',
      message: `Order for ${deadlineOrder.customerName} is due for pickup in ${warningMinutesBefore} minutes at ${deadlineOrder.deadlineTime.toLocaleTimeString()}`,
      relatedId: deadlineOrder.id,
      relatedType: 'DEADLINE_ORDER',
      priority: NotificationPriority.HIGH,
      actionUrl: `/dashboard/orders/${deadlineOrder.id}`,
      deliveryMethod: NotificationDeliveryMethod.IN_APP,
      scheduledFor: warningTime,
      metadata: {
        customerName: deadlineOrder.customerName,
        customerPhone: deadlineOrder.customerPhone,
        deadlineTime: deadlineOrder.deadlineTime,
        orderTotal: deadlineOrder.totalAmount,
        warningMinutesBefore,
      },
    };

    const notification = await this.createNotification(notificationData);
    this.scheduleNotification(notification);
  }

  /**
   * Schedule a notification using node-cron
   */
  private scheduleNotification(notification: Notification): void {
    if (!notification.scheduledFor) return;

    const scheduleTime = notification.scheduledFor;
    const now = new Date();
    
    // If the scheduled time is in the past, send immediately
    if (scheduleTime <= now) {
      this.sendScheduledNotification(notification.id);
      return;
    }

    // Create a cron job for the exact time
    const cronExpression = this.getCronExpression(scheduleTime);
    const task = cron.schedule(cronExpression, () => {
      this.sendScheduledNotification(notification.id);
    }, {
      timezone: 'UTC',
    });

    task.start();
    this.scheduledJobs.set(notification.id, task);
  }

  /**
   * Convert a Date to a cron expression for exact time scheduling
   */
  private getCronExpression(date: Date): string {
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    
    return `${minutes} ${hours} ${day} ${month} *`;
  }

  /**
   * Send a scheduled notification
   */
  async sendScheduledNotification(notificationId: string): Promise<void> {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification || notification.isSent) {
        return;
      }

      await this.sendNotification(notification);
      
      // Clean up the scheduled job
      const job = this.scheduledJobs.get(notificationId);
      if (job) {
        job.stop();
        this.scheduledJobs.delete(notificationId);
      }
    } catch (error) {
      console.error('Error sending scheduled notification:', error);
    }
  }

  /**
   * Send notification via appropriate channels
   */
  async sendNotification(notification: Notification): Promise<void> {
    try {
      // Update notification as sent
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          isSent: true,
          sentAt: new Date(),
        },
      });

      // Send via different channels based on delivery method
      switch (notification.deliveryMethod) {
        case NotificationDeliveryMethod.IN_APP:
          await this.sendInAppNotification(notification);
          break;
        case NotificationDeliveryMethod.EMAIL:
          await this.sendEmailNotification(notification);
          break;
        case NotificationDeliveryMethod.PUSH:
          await this.sendPushNotification(notification);
          break;
        case NotificationDeliveryMethod.SMS:
          await this.sendSMSNotification(notification);
          break;
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Send real-time in-app notification via WebSocket
   */
  private async sendInAppNotification(notification: Notification): Promise<void> {
    // Get recipient details
    const recipient = await prisma.user.findUnique({
      where: { id: notification.recipientId },
      select: { id: true, name: true, email: true },
    });

    if (!recipient) return;

    // Emit to user's socket room
    this.io.to(`user:${notification.recipientId}`).emit('notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
    });
  }

  /**
   * Send email notification (placeholder - implement with your email service)
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    const recipient = await prisma.user.findUnique({
      where: { id: notification.recipientId },
      select: { email: true, name: true },
    });

    if (!recipient?.email) return;

    // TODO: Implement email sending logic
    console.log(`Email notification to ${recipient.email}:`, {
      subject: notification.title,
      body: notification.message,
    });
  }

  /**
   * Send push notification (placeholder - implement with push service)
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    // TODO: Implement push notification logic
    console.log('Push notification:', notification);
  }

  /**
   * Send SMS notification (placeholder - implement with SMS service)
   */
  private async sendSMSNotification(notification: Notification): Promise<void> {
    const recipient = await prisma.user.findUnique({
      where: { id: notification.recipientId },
      select: { phone: true },
    });

    if (!recipient?.phone) return;

    // TODO: Implement SMS sending logic
    console.log(`SMS notification to ${recipient.phone}:`, notification.message);
  }

  /**
   * Initialize scheduled notifications on service start
   */
  private async initializeScheduledNotifications(): Promise<void> {
    try {
      const scheduledNotifications = await prisma.notification.findMany({
        where: {
          isScheduled: true,
          isSent: false,
          scheduledFor: {
            gte: new Date(),
          },
        },
      });

      for (const notification of scheduledNotifications) {
        this.scheduleNotification(notification);
      }
    } catch (error) {
      console.error('Error initializing scheduled notifications:', error);
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    const { limit = 50, offset = 0, unreadOnly = false } = options;

    const where = {
      recipientId: userId,
      ...(unreadOnly && { isRead: false }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        isRead: true,
      },
    });
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    const job = this.scheduledJobs.get(notificationId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(notificationId);
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Graceful cleanup
   */
  cleanup(): void {
    this.scheduledJobs.forEach((job, id) => {
      job.stop();
    });
    this.scheduledJobs.clear();
  }
}

export default NotificationService;
