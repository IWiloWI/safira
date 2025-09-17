import { Request } from 'express';
import { AnalyticsActivity, Analytics } from '@/types/database';
import { readJSONFile, writeJSONFile } from './fileUtils';
import path from 'path';

const ANALYTICS_FILE = path.join(__dirname, '../../data/analytics.json');

/**
 * Track user activity for analytics
 */
export async function trackActivity(
  req: Request, 
  type: string, 
  data: Record<string, any>
): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const now = new Date();
    const germanTime = now.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Berlin'
    });
    
    const analytics = await readJSONFile<Analytics>(ANALYTICS_FILE, {
      views: [],
      qrScans: [],
      deviceInfo: [],
      tableActivity: {},
      recentActivity: []
    });
    
    const activityItem: AnalyticsActivity = {
      time: germanTime,
      description: data.description || `${type} event`,
      timestamp: timestamp,
      type: type,
      user: (req as any).user?.username || 'Unknown',
      data: data
    };
    
    analytics.recentActivity.unshift(activityItem);
    analytics.recentActivity = analytics.recentActivity.slice(0, 10);
    
    await writeJSONFile(ANALYTICS_FILE, analytics);
    console.log('📊 Activity tracked:', type);
  } catch (error) {
    console.error('Failed to track activity:', error);
    // Don't throw - analytics failures shouldn't break main functionality
  }
}

/**
 * Get client IP address
 */
export function getClientIP(req: Request): string {
  return (req.ip || 
          req.connection.remoteAddress || 
          req.headers['x-forwarded-for'] as string ||
          'unknown').toString();
}

/**
 * Get user agent string
 */
export function getUserAgent(req: Request): string {
  return req.get('User-Agent') || 'unknown';
}

/**
 * Parse device information from user agent
 */
export function parseDeviceInfo(userAgent: string): {
  browser?: string;
  os?: string;
  mobile?: boolean;
} {
  const deviceInfo: { browser?: string; os?: string; mobile?: boolean } = {};

  // Basic browser detection
  if (userAgent.includes('Chrome')) {
    deviceInfo.browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    deviceInfo.browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    deviceInfo.browser = 'Safari';
  } else if (userAgent.includes('Edge')) {
    deviceInfo.browser = 'Edge';
  } else if (userAgent.includes('Opera')) {
    deviceInfo.browser = 'Opera';
  }

  // Basic OS detection
  if (userAgent.includes('Windows')) {
    deviceInfo.os = 'Windows';
  } else if (userAgent.includes('Mac')) {
    deviceInfo.os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    deviceInfo.os = 'Linux';
  } else if (userAgent.includes('Android')) {
    deviceInfo.os = 'Android';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    deviceInfo.os = 'iOS';
  }

  // Mobile detection
  deviceInfo.mobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  return deviceInfo;
}

/**
 * Calculate analytics aggregations
 */
export function calculateAnalyticsAggregations(analytics: Analytics): {
  totalViews: number;
  totalQRScans: number;
  todayViews: number;
  uniqueVisitors: number;
} {
  const today = new Date().toDateString();
  
  const totalViews = analytics.views.length;
  const totalQRScans = analytics.qrScans.length;
  const todayViews = analytics.views.filter(view => 
    new Date(view.timestamp).toDateString() === today
  ).length;
  
  // Calculate unique visitors based on IP addresses
  const uniqueIPs = new Set(analytics.views.map(view => view.ip).filter(Boolean));
  const uniqueVisitors = uniqueIPs.size;

  return {
    totalViews,
    totalQRScans,
    todayViews,
    uniqueVisitors
  };
}

/**
 * Get analytics for a specific date range
 */
export function getAnalyticsForDateRange(
  analytics: Analytics, 
  startDate: Date, 
  endDate: Date
): Analytics {
  const isInRange = (timestamp: string): boolean => {
    const date = new Date(timestamp);
    return date >= startDate && date <= endDate;
  };

  return {
    views: analytics.views.filter(view => isInRange(view.timestamp)),
    qrScans: analytics.qrScans.filter(scan => isInRange(scan.timestamp)),
    deviceInfo: analytics.deviceInfo.filter(device => isInRange(device.timestamp)),
    tableActivity: analytics.tableActivity,
    recentActivity: analytics.recentActivity.filter(activity => isInRange(activity.timestamp))
  };
}

/**
 * Get top performing tables by QR scan activity
 */
export function getTopTables(analytics: Analytics, limit: number = 5): Array<{
  tableId: string;
  scans: number;
}> {
  const tableCounts = analytics.tableActivity;
  
  return Object.entries(tableCounts)
    .map(([tableId, scans]) => ({ tableId, scans }))
    .sort((a, b) => b.scans - a.scans)
    .slice(0, limit);
}

/**
 * Get hourly view distribution for today
 */
export function getHourlyViews(analytics: Analytics): Record<number, number> {
  const today = new Date().toDateString();
  const hourlyViews: Record<number, number> = {};

  // Initialize all hours
  for (let i = 0; i < 24; i++) {
    hourlyViews[i] = 0;
  }

  analytics.views
    .filter(view => new Date(view.timestamp).toDateString() === today)
    .forEach(view => {
      const hour = new Date(view.timestamp).getHours();
      hourlyViews[hour]++;
    });

  return hourlyViews;
}

/**
 * Clean old analytics data (older than specified days)
 */
export async function cleanOldAnalytics(retentionDays: number = 30): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const analytics = await readJSONFile<Analytics>(ANALYTICS_FILE, {
      views: [],
      qrScans: [],
      deviceInfo: [],
      tableActivity: {},
      recentActivity: []
    });

    const isRecent = (timestamp: string): boolean => {
      return new Date(timestamp) > cutoffDate;
    };

    const cleanedAnalytics: Analytics = {
      views: analytics.views.filter(view => isRecent(view.timestamp)),
      qrScans: analytics.qrScans.filter(scan => isRecent(scan.timestamp)),
      deviceInfo: analytics.deviceInfo.filter(device => isRecent(device.timestamp)),
      tableActivity: analytics.tableActivity, // Keep table activity as is
      recentActivity: analytics.recentActivity.filter(activity => isRecent(activity.timestamp))
    };

    await writeJSONFile(ANALYTICS_FILE, cleanedAnalytics);
    console.log(`📊 Cleaned analytics data older than ${retentionDays} days`);
  } catch (error) {
    console.error('Failed to clean old analytics:', error);
  }
}