import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  /**
   * Send deadline warning email
   */
  async sendDeadlineWarningEmail(
    to: string,
    customerName: string,
    deadlineTime: Date,
    orderTotal: number,
    customerPhone: string,
  ): Promise<void> {
    const subject = `Order Deadline Alert: ${customerName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #dc3545; margin-bottom: 20px;">⏰ Order Deadline Alert</h2>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; border-left: 4px solid #dc3545;">
            <h3 style="color: #333; margin-bottom: 15px;">Customer Pickup Information</h3>
            
            <div style="margin-bottom: 15px;">
              <strong>Customer Name:</strong> ${customerName}<br>
              <strong>Phone:</strong> ${customerPhone}<br>
              <strong>Pickup Time:</strong> ${deadlineTime.toLocaleString()}<br>
              <strong>Order Total:</strong> $${orderTotal.toFixed(2)}
            </div>
            
            <div style="background-color: #fff3cd; padding: 12px; border-radius: 4px; margin-top: 15px;">
              <p style="color: #856404; margin: 0;">
                <strong>Action Required:</strong> Please ensure the order is ready for pickup at the specified time.
              </p>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 14px;">
            <p>This is an automated notification from your restaurant ordering system.</p>
            <p>If you believe this is an error, please contact your system administrator.</p>
          </div>
        </div>
      </div>
    `;

    const text = `
      ORDER DEADLINE ALERT
      
      Customer: ${customerName}
      Phone: ${customerPhone}
      Pickup Time: ${deadlineTime.toLocaleString()}
      Order Total: $${orderTotal.toFixed(2)}
      
      Action Required: Please ensure the order is ready for pickup at the specified time.
      
      This is an automated notification from your restaurant ordering system.
    `;

    await this.sendEmail({
      to,
      subject,
      text,
      html,
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(
    to: string,
    customerName: string,
    orderDetails: any,
    totalAmount: number,
  ): Promise<void> {
    const subject = `Order Confirmation - ${orderDetails.restaurantName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">✓ Order Confirmed</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-bottom: 15px;">Thank you for your order, ${customerName}!</h2>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">Order Details</h3>
            
            ${orderDetails.items
              .map(
                (item: any, index: number) => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; ${index < orderDetails.items.length - 1 ? "border-bottom: 1px solid #eee;" : ""}">
                <span>${item.quantity}x ${item.name}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `,
              )
              .join("")}
            
            <div style="display: flex; justify-content: space-between; margin-top: 15px; font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px;">
              <span>Total:</span>
              <span>$${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div style="background-color: #d1ecf1; padding: 12px; border-radius: 4px; margin-bottom: 20px;">
            <p style="color: #0c5460; margin: 0;">
              <strong>Pickup Information:</strong> ${orderDetails.pickupInfo || "Will be provided shortly"}
            </p>
          </div>
          
          <div style="text-align: center; color: #6c757d; font-size: 14px;">
            <p>We'll notify you when your order is ready for pickup.</p>
            <p>Thank you for choosing ${orderDetails.restaurantName}!</p>
          </div>
        </div>
      </div>
    `;

    const text = `
      ORDER CONFIRMATION
      
      Thank you for your order, ${customerName}!
      
      Order Details:
      ${orderDetails.items.map((item: any) => `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`).join("\n")}
      
      Total: $${totalAmount.toFixed(2)}
      
      Pickup Information: ${orderDetails.pickupInfo || "Will be provided shortly"}
      
      We'll notify you when your order is ready for pickup.
      Thank you for choosing ${orderDetails.restaurantName}!
    `;

    await this.sendEmail({
      to,
      subject,
      text,
      html,
    });
  }

  /**
   * Send order ready notification email
   */
  async sendOrderReadyEmail(
    to: string,
    customerName: string,
    orderDetails: any,
  ): Promise<void> {
    const subject = `Your Order is Ready! - ${orderDetails.restaurantName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">🎉 Your Order is Ready!</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-bottom: 15px;">Great news, ${customerName}!</h2>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">Pickup Details</h3>
            
            <div style="margin-bottom: 15px;">
              <strong>Restaurant:</strong> ${orderDetails.restaurantName}<br>
              <strong>Order Number:</strong> ${orderDetails.orderNumber}<br>
              <strong>Ready Time:</strong> ${new Date().toLocaleString()}<br>
              <strong>Pickup Address:</strong> ${orderDetails.pickupAddress}
            </div>
            
            <div style="background-color: #d4edda; padding: 12px; border-radius: 4px;">
              <p style="color: #155724; margin: 0;">
                <strong>📍 Please come to the pickup counter with your order number.</strong>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; color: #6c757d; font-size: 14px;">
            <p>Enjoy your meal! Thank you for choosing ${orderDetails.restaurantName}.</p>
          </div>
        </div>
      </div>
    `;

    const text = `
      YOUR ORDER IS READY!
      
      Great news, ${customerName}!
      
      Pickup Details:
      Restaurant: ${orderDetails.restaurantName}
      Order Number: ${orderDetails.orderNumber}
      Ready Time: ${new Date().toLocaleString()}
      Pickup Address: ${orderDetails.pickupAddress}
      
      Please come to the pickup counter with your order number.
      
      Enjoy your meal! Thank you for choosing ${orderDetails.restaurantName}.
    `;

    await this.sendEmail({
      to,
      subject,
      text,
      html,
    });
  }

  /**
   * Test email configuration
   */
  async testEmail(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("Email configuration test failed:", error);
      return false;
    }
  }
}

export default EmailService;
