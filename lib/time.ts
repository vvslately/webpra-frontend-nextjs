/**
 * Format date to Thai relative time (e.g., "7 ชั่วโมงที่แล้ว")
 * Handles timezone conversion from UTC to Thai time (UTC+7)
 * 
 * Fix: If the time shows 7 hours behind, it means server time is UTC
 * but being interpreted as local time. We add 7 hours to correct it.
 */
export function formatRelativeTime(dateString: string): string {
  // Parse the date string from server (assumed to be UTC)
  const serverDate = new Date(dateString);
  
  // Get current time
  const now = new Date();
  
  // Fix timezone: If server sends UTC time but it appears 7 hours behind,
  // we need to add 7 hours to match Thai timezone (UTC+7)
  const THAI_UTC_OFFSET_MS = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
  const adjustedServerTime = serverDate.getTime() + THAI_UTC_OFFSET_MS;
  
  // Calculate difference in milliseconds
  // Note: getTime() returns UTC milliseconds, which is timezone-agnostic
  const diffInMilliseconds = now.getTime() - adjustedServerTime;
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  
  // If negative (future date), show as "เมื่อสักครู่"
  if (diffInSeconds < 0) return "เมื่อสักครู่";
  
  if (diffInSeconds < 60) return "เมื่อสักครู่";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;
  
  // For older dates, show actual date in Thai timezone
  const adjustedDate = new Date(adjustedServerTime);
  return adjustedDate.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date to full Thai date and time
 */
export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get current time in Thai timezone (UTC+7)
 */
export function getThaiTime(): Date {
  const now = new Date();
  // Convert to Thai time (UTC+7)
  const thaiOffset = 7 * 60; // 7 hours in minutes
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const thaiTime = new Date(utcTime + (thaiOffset * 60000));
  return thaiTime;
}

/**
 * Convert UTC date to Thai timezone (UTC+7)
 */
export function toThaiTime(date: Date): Date {
  const thaiOffset = 7 * 60; // 7 hours in minutes
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const thaiTime = new Date(utcTime + (thaiOffset * 60000));
  return thaiTime;
}

