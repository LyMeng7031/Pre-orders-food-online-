// Notification utility functions
import Notification from "@/models/Notification";
import mongoose from "mongoose";

export async function createNotification({
  recipient,
  sender,
  type,
  title,
  message,
  relatedId,
  relatedType,
  priority = "MEDIUM",
  actionUrl,
  metadata,
}: {
  recipient: string;
  sender?: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
  priority?: string;
  actionUrl?: string;
  metadata?: any;
}) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");

    const notification = new Notification({
      recipient,
      sender,
      type,
      title,
      message,
      relatedId,
      relatedType,
      priority,
      actionUrl,
      metadata,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Pre-defined notification templates
export const notificationTemplates = {
  orderPlaced: (
    orderId: string,
    customerName: string,
    restaurantName: string,
  ) => ({
    type: "ORDER_PLACED",
    title: "New Order Received!",
    message: `${customerName} placed a new order at ${restaurantName}`,
    relatedId: orderId,
    relatedType: "order",
    actionUrl: `/owner/orders`,
    priority: "HIGH",
  }),

  orderStatusUpdate: (orderId: string, status: string) => ({
    type: "ORDER_STATUS",
    title: `Order ${status}`,
    message: `Your order has been ${status.toLowerCase()}`,
    relatedId: orderId,
    relatedType: "order",
    actionUrl: `/orders/${orderId}`,
    priority: "MEDIUM",
  }),

  ownerApproved: () => ({
    type: "OWNER_APPROVED",
    title: "Account Approved! 🎉",
    message:
      "Your restaurant owner account has been approved. You can now start managing your restaurant!",
    actionUrl: "/dashboard",
    priority: "HIGH",
  }),

  ownerRejected: (reason?: string) => ({
    type: "OWNER_REJECTED",
    title: "Account Application Rejected",
    message:
      reason ||
      "Your restaurant owner application was not approved at this time.",
    actionUrl: "/login",
    priority: "HIGH",
  }),

  paymentReceived: (orderId: string, amount: number) => ({
    type: "PAYMENT_RECEIVED",
    title: "Payment Received",
    message: `Payment of $${amount.toFixed(2)} received for order`,
    relatedId: orderId,
    relatedType: "order",
    actionUrl: `/owner/orders`,
    priority: "MEDIUM",
  }),

  deliveryUpdate: (orderId: string, update: string) => ({
    type: "DELIVERY_UPDATE",
    title: "Delivery Update",
    message: update,
    relatedId: orderId,
    relatedType: "order",
    actionUrl: `/orders/${orderId}`,
    priority: "MEDIUM",
  }),
};

// Helper function to create notification using template
export async function createNotificationFromTemplate(
  templateKey: keyof typeof notificationTemplates,
  recipient: string,
  sender: string,
  ...args: any[]
) {
  const template = notificationTemplates[templateKey];
  const notificationData =
    typeof template === "function" ? template(...args) : template;

  return await createNotification({
    recipient,
    sender,
    ...notificationData,
  });
}
