import { Router } from 'express';
import { 
  AuthenticatedRequest, 
  AnalyticsTrackRequest,
  AnalyticsResponse
} from '@/types/api';
import { authenticate } from '@/middleware/auth';
import { sendSuccess, sendError, asyncHandler } from '@/utils/responseUtils';
import { 
  trackActivity, 
  getClientIP, 
  getUserAgent, 
  parseDeviceInfo,
  calculateAnalyticsAggregations
} from '@/utils/analytics';
import { readJSONFile, writeJSONFile } from '@/utils/fileUtils';
import { Analytics } from '@/types/database';
import path from 'path';

const router = Router();
const ANALYTICS_FILE = path.join(__dirname, '../../data/analytics.json');

/**
 * Get analytics data
 */
router.get('/', 
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      console.log('📊 Analytics request received');
      const analytics = await readJSONFile<Analytics>(ANALYTICS_FILE, {
        views: [],
        qrScans: [],
        deviceInfo: [],
        tableActivity: {},
        recentActivity: []
      });
      console.log('📊 Analytics data loaded');
      
      // Calculate aggregated data
      const aggregations = calculateAnalyticsAggregations(analytics);
      
      console.log('📊 Preparing response');
      const response: AnalyticsResponse = {
        ...aggregations,
        deviceInfo: analytics.deviceInfo,
        tableActivity: analytics.tableActivity,
        recentActivity: analytics.recentActivity || []
      };
      
      console.log('📊 Sending analytics response:', { 
        totalViews: aggregations.totalViews, 
        totalQRScans: aggregations.totalQRScans, 
        recentActivityCount: (analytics.recentActivity || []).length 
      });
      
      sendSuccess(res, response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      sendError(res, 'Failed to fetch analytics');
    }
  })
);

/**
 * Track analytics event
 */
router.post('/track', 
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest & { body: AnalyticsTrackRequest }, res) => {
    try {
      const { type, data } = req.body;
      const timestamp = new Date().toISOString();
      const ip = getClientIP(req);
      const userAgent = getUserAgent(req);
      
      const analytics = await readJSONFile<Analytics>(ANALYTICS_FILE, {
        views: [],
        qrScans: [],
        deviceInfo: [],
        tableActivity: {},
        recentActivity: []
      });
      
      const trackingData = {
        timestamp,
        ip,
        userAgent,
        ...data
      };
      
      switch (type) {
        case 'page_view':
          analytics.views.push(trackingData);
          break;
          
        case 'qr_scan':
          analytics.qrScans.push(trackingData);
          if (data.tableId) {
            analytics.tableActivity[data.tableId] = (analytics.tableActivity[data.tableId] || 0) + 1;
          }
          break;
          
        case 'device_info':
          // Parse device information
          const deviceInfo = parseDeviceInfo(userAgent);
          analytics.deviceInfo.push({
            ...trackingData,
            device: {
              ...deviceInfo,
              screen: data.screen || undefined
            }
          });
          break;
          
        case 'product_availability_changed':
        case 'product_created':
        case 'product_updated':
        case 'product_deleted':
        case 'bulk_price_update':
          // These events are handled by trackActivity utility
          await trackActivity(req, type, data);
          break;
          
        default:
          console.warn('Unknown analytics event type:', type);
      }
      
      await writeJSONFile(ANALYTICS_FILE, analytics);
      sendSuccess(res, undefined, 'Analytics data recorded');
    } catch (error) {
      console.error('Error tracking analytics:', error);
      sendError(res, 'Failed to track analytics');
    }
  })
);

export default router;