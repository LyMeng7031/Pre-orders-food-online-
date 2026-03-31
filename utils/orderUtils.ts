export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function formatPickupTime(dateTime: string): string {
  const date = new Date(dateTime);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
}

export function validatePickupTime(dateTime: string): boolean {
  const pickupTime = new Date(dateTime);
  const now = new Date();
  const minTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

  return pickupTime > minTime;
}
