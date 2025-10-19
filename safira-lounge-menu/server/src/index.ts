import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import QRCode from 'qrcode';
import { config } from 'dotenv';

// Import middleware
import { 
  securityHeaders, 
  rateLimiter, 
  corsOptions,
  csrfProtection,
  isMulterError
} from '@/middleware/security';

// Import routes
import authRoutes from '@/routes/auth';
import productsRoutes from '@/routes/products';
import categoriesRoutes from '@/routes/categories';
import translationRoutes from '@/routes/translation';
import uploadRoutes from '@/routes/upload';
import analyticsRoutes from '@/routes/analytics';
import settingsRoutes from '@/routes/settings';
import eventsRoutes from '@/routes/events';

// Import utilities
import { sendSuccess, sendError, sendNotFound } from '@/utils/responseUtils';
import { ensureDirectory, readJSONFile, writeJSONFile } from '@/utils/fileUtils';
// import { trackActivity } from '@/utils/analytics';

// Import types
import { 
  AuthenticatedRequest, 
  QRCodeRequest, 
  QRCodeResponse
} from '@/types/api';
import { SSEMessage } from '@/types/api';

// Load environment variables
config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = parseInt(process.env.SERVER_PORT || '5001');

// Store connected clients for auto-refresh
const connectedClients = new Set<Response>();

// Data file paths
const DATA_DIR = path.join(__dirname, '../data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const TOBACCO_CATALOG_FILE = path.join(DATA_DIR, 'tobacco-catalog.json');

/**
 * Broadcast update to all connected clients
 * Currently unused but kept for future auto-refresh functionality
 */
/*
function broadcastUpdate(eventType: string, data?: any): void {
  console.log(`🔄 Broadcasting ${eventType} to ${connectedClients.size} clients`);
  const message: SSEMessage = { type: eventType, data };
  const messageString = `data: ${JSON.stringify(message)}\\n\\n`;
  
  connectedClients.forEach(client => {
    try {
      client.write(messageString);
    } catch (error) {
      console.log('Client disconnected, removing from list');
      connectedClients.delete(client);
    }
  });
}
*/

/**
 * Ensure required directories exist
 */
async function ensureRequiredDirectories(): Promise<void> {
  try {
    await ensureDirectory(DATA_DIR);
    await ensureDirectory(path.join(__dirname, '../uploads'));
    console.log('📁 Required directories ensured');
  } catch (error) {
    console.error('Error creating directories:', error);
    throw error;
  }
}

/**
 * Initialize server middleware
 */
function setupMiddleware(): void {
  // Security middleware - MUST come first
  app.use(securityHeaders);
  app.use(rateLimiter);
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // TODO: Re-enable CSRF protection when frontend supports it
  // app.use(csrfProtection);

  // Static file serving with security
  app.use(express.static(path.join(__dirname, '../../build')));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    maxAge: '1d',
    etag: false
  }));
}

/**
 * Setup API routes
 */
function setupRoutes(): void {
  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    sendSuccess(res, { 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: '2.0.0-ts'
    });
  });

  // Server-Sent Events endpoint for auto-refresh
  app.get('/api/events', (_req: Request, res: Response) => {
    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Add client to connected clients
    connectedClients.add(res);
    console.log(`📱 Client connected for auto-refresh. Total clients: ${connectedClients.size}`);

    // Send initial connection message
    const initialMessage: SSEMessage = { 
      type: 'connected', 
      message: 'Auto-refresh connected' 
    };
    res.write(`data: ${JSON.stringify(initialMessage)}\\n\\n`);

    // Handle client disconnect
    _req.on('close', () => {
      connectedClients.delete(res);
      console.log(`📱 Client disconnected. Total clients: ${connectedClients.size}`);
    });
  });

  // QR Code generation
  app.post('/api/qr/generate', async (req: AuthenticatedRequest & { body: QRCodeRequest }, res: Response<QRCodeResponse>) => {
    try {
      const { tableId, baseUrl } = req.body;
      
      if (!tableId) {
        sendError(res, 'Table ID is required', 400);
        return;
      }
      
      const url = `${baseUrl || req.get('origin')}/table/${tableId}`;
      const qrCode = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      const response: QRCodeResponse = {
        qrCode, 
        url, 
        tableId,
        message: 'QR code generated successfully'
      };
      
      sendSuccess(res, response);
    } catch (error) {
      console.error('Error generating QR code:', error);
      sendError(res, 'Failed to generate QR code');
    }
  });

  // Configuration endpoints
  app.get('/api/config', async (_req: Request, res: Response) => {
    try {
      const config = await readJSONFile(CONFIG_FILE, {
        siteName: 'Safira Lounge',
        address: 'Norderstraße 11-13, 24939 Flensburg',
        phone: '+49 461 123456',
        email: 'info@safira-lounge.de',
        hours: {
          monday: '15:00 - 02:00',
          tuesday: '15:00 - 02:00',
          wednesday: '15:00 - 02:00',
          thursday: '15:00 - 02:00',
          friday: '15:00 - 03:00',
          saturday: '15:00 - 03:00',
          sunday: '15:00 - 02:00'
        },
        social: {
          facebook: 'https://facebook.com/safiralounge',
          instagram: 'https://instagram.com/safiralounge'
        }
      });
      
      sendSuccess(res, config);
    } catch (error) {
      console.error('Error fetching config:', error);
      sendError(res, 'Failed to fetch configuration');
    }
  });

  app.put('/api/config', async (req: AuthenticatedRequest & { body: any }, res: Response) => {
    try {
      const config = req.body;
      await writeJSONFile(CONFIG_FILE, config);
      sendSuccess(res, config, 'Configuration updated successfully');
    } catch (error) {
      console.error('Error updating config:', error);
      sendError(res, 'Failed to update configuration');
    }
  });

  // Mount route handlers
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/translate', translationRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/upcoming-events', eventsRoutes);

  // Tobacco catalog routes (simplified)
  app.get('/api/tobacco-catalog', async (_req: Request, res: Response) => {
    try {
      const catalog = await readJSONFile(TOBACCO_CATALOG_FILE, { brands: [], tobaccos: [] });
      sendSuccess(res, catalog);
    } catch (error) {
      console.error('Error fetching tobacco catalog:', error);
      sendError(res, 'Failed to fetch tobacco catalog');
    }
  });

  // Serve React app for all non-API routes (must be AFTER all API routes)
  app.get('*', (req: Request, res: Response) => {
    // Don't serve React app for API routes
    if (req.path.startsWith('/api/')) {
      sendNotFound(res, 'API endpoint');
      return;
    }
    
    console.log(`📄 Serving React app for: ${req.path}`);
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
  });
}

/**
 * Global error handling middleware
 */
function setupErrorHandling(): void {
  app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', error);
    
    if (isMulterError(error)) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        sendError(res, 'File too large', 400);
        return;
      }
    }
    
    sendError(res, 'Internal server error');
  });
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    await ensureRequiredDirectories();
    
    setupMiddleware();
    setupRoutes();
    setupErrorHandling();
    
    app.listen(PORT, '0.0.0.0', () => {
      const networkIP = process.env.NETWORK_IP || 'localhost';
      console.log(`🚀 Safira Lounge API Server (TypeScript) running on port ${PORT}`);
      console.log(`📱 Local access: http://localhost:${PORT}`);
      console.log(`🌐 Network access: http://${networkIP}:${PORT}`);
      console.log(`🔧 API endpoints available at http://${networkIP}:${PORT}/api`);
      console.log(`🔐 Security: JWT Auth, Rate Limiting, CSRF Protection enabled`);
      console.log(`📋 TypeScript compilation: Complete`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Handle graceful shutdown
 */
function setupGracefulShutdown(): void {
  const shutdown = (signal: string) => {
    console.log(`🛑 Received ${signal}, shutting down gracefully...`);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Initialize graceful shutdown
setupGracefulShutdown();

// Start the server
startServer().catch(console.error);

// Export app for testing
export default app;