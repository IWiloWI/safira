const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const QRCode = require('qrcode');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const translationService = require('./services/translationService');

// Import security middleware
const { 
  securityHeaders, 
  rateLimiter, 
  authRateLimiter,
  validateLogin,
  validateProduct,
  validateCategory,
  handleValidationErrors,
  corsOptions,
  fileUploadSecurity,
  sanitizeInput,
  sanitizeHtml,
  generateCSRFToken,
  csrfProtection
} = require('./middleware/security');

// Import authentication
const { authenticate, login } = require('./middleware/auth');

const app = express();
const PORT = process.env.SERVER_PORT || 5001;

// Store connected clients for auto-refresh
const connectedClients = new Set();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Database initialization
async function initializeDatabase() {
  try {
    console.log('🔗 Connecting to MariaDB database...');
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connection established');
    
    // Create tables if they don't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name JSON,
        icon VARCHAR(10),
        description JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        category_id VARCHAR(50),
        name JSON,
        description JSON,
        price DECIMAL(10,2),
        image_url VARCHAR(255),
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('page_view', 'qr_scan', 'device_info'),
        data JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    connection.release();
    console.log('📋 Database tables initialized');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    // Don't exit - fallback to JSON files
    console.log('📄 Falling back to JSON file storage');
  }
}

// Security middleware - MUST come first
app.use(securityHeaders);
// Rate limiting but exclude events endpoint
app.use((req, res, next) => {
  if (req.path === '/api/events') {
    next();
  } else {
    rateLimiter(req, res, next);
  }
});
app.use(cors(corsOptions));

// Static file serving with security - BEFORE other middleware
app.use(express.static(path.join(__dirname, '../build')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add CSRF protection for state-changing operations (after static files)
app.use((req, res, next) => {
  // Skip CSRF for static files, events endpoint and GET requests
  if (req.url.startsWith('/static/') || req.url.startsWith('/uploads/') || 
      req.url.endsWith('.css') || req.url.endsWith('.js') || req.url.endsWith('.map') ||
      req.url.includes('manifest.json') || req.url.includes('favicon') ||
      req.url === '/api/events' || req.url === '/api/health' || 
      (req.method === 'GET' && req.url.startsWith('/api/'))) {
    next();
  } else {
    csrfProtection(req, res, next);
  }
});

// File storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  ...fileUploadSecurity
});

// Data paths
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const TOBACCO_CATALOG_FILE = path.join(DATA_DIR, 'tobacco-catalog.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Helper functions
async function readJSONFile(filePath, defaultData = {}) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeJSONFile(filePath, defaultData);
      return defaultData;
    }
    throw error;
  }
}

async function writeJSONFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// New secure login endpoint
app.post('/api/auth/login', authRateLimiter, validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Sanitize inputs
    const cleanUsername = sanitizeInput(username);
    const cleanPassword = password; // Don't sanitize password as it may contain special chars
    
    console.log('🔐 Login attempt for username:', cleanUsername);
    
    const result = await login(cleanUsername, cleanPassword);
    
    if (result.success) {
      console.log('✅ Login successful for:', cleanUsername);
      res.json({
        success: true,
        token: result.token,
        user: result.user
      });
    } else {
      console.log('❌ Login failed for:', cleanUsername);
      res.status(401).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Helper function for analytics tracking
async function trackActivity(req, type, data) {
  try {
    const timestamp = new Date().toISOString();
    const now = new Date();
    const germanTime = now.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Berlin'
    });
    
    const analytics = await readJSONFile(ANALYTICS_FILE, {
      views: [],
      qrScans: [],
      deviceInfo: [],
      tableActivity: {},
      recentActivity: []
    });
    
    const activityItem = {
      time: germanTime,
      description: data.description || `${type} event`,
      timestamp: timestamp,
      type: type,
      user: req.user?.username || 'Unknown',
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

// Auto-refresh system using Server-Sent Events
function broadcastUpdate(eventType, data) {
  console.log(`🔄 Broadcasting ${eventType} to ${connectedClients.size} clients`);
  const message = `data: ${JSON.stringify({ type: eventType, data })}\n\n`;
  
  connectedClients.forEach(client => {
    try {
      client.write(message);
    } catch (error) {
      console.log('Client disconnected, removing from list');
      connectedClients.delete(client);
    }
  });
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// CSRF token endpoint
app.get('/api/csrf', (req, res) => {
  const token = generateCSRFToken();
  res.json({ token });
});

// Server-Sent Events endpoint for auto-refresh
app.get('/api/events', (req, res) => {
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
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Auto-refresh verbunden' })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    connectedClients.delete(res);
    console.log(`📱 Client disconnected. Total clients: ${connectedClients.size}`);
  });
});

// Move product between categories
app.put('/api/products/move/:fromCategoryId/:itemId/:toCategoryId', authenticate, async (req, res) => {
  try {
    const { fromCategoryId, itemId, toCategoryId } = req.params;
    
    console.log('🔄 Moving product:', { fromCategoryId, itemId, toCategoryId });
    
    const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    
    // Find source category
    const fromCategoryIndex = products.categories.findIndex(cat => cat.id === fromCategoryId);
    if (fromCategoryIndex === -1) {
      return res.status(404).json({ error: 'Source category not found' });
    }
    
    // Find target category
    const toCategoryIndex = products.categories.findIndex(cat => cat.id === toCategoryId);
    if (toCategoryIndex === -1) {
      return res.status(404).json({ error: 'Target category not found' });
    }
    
    // Find product in source category
    const productIndex = products.categories[fromCategoryIndex].items.findIndex(item => item.id === itemId);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found in source category' });
    }
    
    // Move product
    const [product] = products.categories[fromCategoryIndex].items.splice(productIndex, 1);
    products.categories[toCategoryIndex].items.push(product);
    
    // Save changes
    await writeJSONFile(PRODUCTS_FILE, products);
    
    console.log('✅ Product moved successfully:', { 
      productName: product.name, 
      from: fromCategoryId, 
      to: toCategoryId 
    });
    
    res.json({ 
      success: true,
      data: {
        product,
        from: fromCategoryId,
        to: toCategoryId
      },
      message: 'Product moved successfully'
    });
  } catch (error) {
    console.error('Error moving product:', error);
    res.status(500).json({ error: 'Failed to move product' });
  }
});

// Tobacco Catalog API endpoints
app.get('/api/tobacco-catalog', async (req, res) => {
  try {
    const catalog = await readJSONFile(TOBACCO_CATALOG_FILE, { brands: [], tobaccos: [] });
    res.json(catalog);
  } catch (error) {
    console.error('Error fetching tobacco catalog:', error);
    res.status(500).json({ error: 'Failed to fetch tobacco catalog' });
  }
});

app.post('/api/tobacco-catalog/brands', authenticate, async (req, res) => {
  try {
    const { brand } = req.body;
    const catalog = await readJSONFile(TOBACCO_CATALOG_FILE, { brands: [], tobaccos: [] });
    
    if (!catalog.brands.includes(brand)) {
      catalog.brands.push(brand);
      catalog.brands.sort();
      await writeJSONFile(TOBACCO_CATALOG_FILE, catalog);
    }
    
    res.json({ message: 'Brand added successfully', brands: catalog.brands });
  } catch (error) {
    console.error('Error adding brand:', error);
    res.status(500).json({ error: 'Failed to add brand' });
  }
});

app.post('/api/tobacco-catalog/tobaccos', authenticate, async (req, res) => {
  try {
    const tobacco = req.body;
    const catalog = await readJSONFile(TOBACCO_CATALOG_FILE, { brands: [], tobaccos: [] });
    
    // Generate ID if not provided
    if (!tobacco.id) {
      tobacco.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    catalog.tobaccos.push(tobacco);
    await writeJSONFile(TOBACCO_CATALOG_FILE, catalog);
    
    res.json({ message: 'Tobacco added to catalog successfully', tobacco });
  } catch (error) {
    console.error('Error adding tobacco to catalog:', error);
    res.status(500).json({ error: 'Failed to add tobacco to catalog' });
  }
});

app.delete('/api/tobacco-catalog/tobaccos/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const catalog = await readJSONFile(TOBACCO_CATALOG_FILE, { brands: [], tobaccos: [] });
    
    catalog.tobaccos = catalog.tobaccos.filter(tobacco => tobacco.id !== id);
    await writeJSONFile(TOBACCO_CATALOG_FILE, catalog);
    
    res.json({ message: 'Tobacco removed from catalog successfully' });
  } catch (error) {
    console.error('Error removing tobacco from catalog:', error);
    res.status(500).json({ error: 'Failed to remove tobacco from catalog' });
  }
});

// Sync existing Shisha products to tobacco catalog
app.post('/api/tobacco-catalog/sync-products', authenticate, async (req, res) => {
  try {
    const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    const catalog = await readJSONFile(TOBACCO_CATALOG_FILE, { brands: [], tobaccos: [] });
    
    // Find shisha-standard category
    const shishaCategory = products.categories.find(cat => cat.id === 'shisha-standard');
    if (!shishaCategory) {
      return res.status(404).json({ error: 'Shisha category not found' });
    }
    
    let syncedCount = 0;
    const existingTobaccoIds = catalog.tobaccos.map(t => t.id);
    
    // Process each shisha product
    for (const product of shishaCategory.items) {
      // Skip if product already exists in catalog
      if (existingTobaccoIds.includes(product.id)) {
        continue;
      }
      
      // Extract brand from product name or use explicit brand field
      const brand = product.brand || (product.name.includes('-') ? product.name.split('-')[0].trim() : 'Unknown');
      
      // Add brand to catalog if not exists
      if (!catalog.brands.includes(brand)) {
        catalog.brands.push(brand);
      }
      
      // Add product to tobacco catalog
      const tobaccoItem = {
        id: product.id,
        name: product.name,
        description: typeof product.description === 'object' ? product.description.de : product.description,
        brand: brand,
        price: product.price
      };
      
      catalog.tobaccos.push(tobaccoItem);
      syncedCount++;
    }
    
    // Save updated catalog
    await writeJSONFile(TOBACCO_CATALOG_FILE, catalog);
    
    res.json({ 
      message: `Successfully synced ${syncedCount} products to tobacco catalog`,
      syncedCount,
      totalTobaccos: catalog.tobaccos.length 
    });
  } catch (error) {
    console.error('Error syncing products to tobacco catalog:', error);
    res.status(500).json({ error: 'Failed to sync products' });
  }
});

app.post('/api/tobacco-catalog/add-to-menu', authenticate, async (req, res) => {
  try {
    const { tobaccoId, categoryId, badges } = req.body;
    const catalog = await readJSONFile(TOBACCO_CATALOG_FILE, { brands: [], tobaccos: [] });
    const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    
    // Find tobacco in catalog
    const tobacco = catalog.tobaccos.find(t => t.id === tobaccoId);
    if (!tobacco) {
      return res.status(404).json({ error: 'Tobacco not found in catalog' });
    }
    
    // Find category
    const categoryIndex = products.categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Create product from tobacco
    const newProduct = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: tobacco.name,
      description: tobacco.description,
      price: tobacco.price,
      available: true,
      badges: badges || { neu: false, kurze_zeit: false, beliebt: false },
      brand: tobacco.brand // Add brand information to the product
    };
    
    products.categories[categoryIndex].items.push(newProduct);
    await writeJSONFile(PRODUCTS_FILE, products);
    
    // Track activity
    await trackActivity(req, 'product_added_from_catalog', {
      productId: newProduct.id,
      productName: typeof tobacco.name === 'string' ? tobacco.name : tobacco.name.de || 'Unbekannt',
      categoryId: categoryId,
      brand: tobacco.brand,
      description: `Produkt "${typeof tobacco.name === 'string' ? tobacco.name : tobacco.name.de || 'Unbekannt'}" aus Tabak-Katalog hinzugefügt`
    });
    
    res.json({ message: 'Tobacco added to menu successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding tobacco to menu:', error);
    res.status(500).json({ error: 'Failed to add tobacco to menu' });
  }
});

// Translation endpoints
app.post('/api/translate', authenticate, async (req, res) => {
  try {
    const { text, targetLanguages } = req.body;
    
    if (!translationService.isConfigured()) {
      return res.status(503).json({ error: 'Translation service not configured. Please add OpenAI API key to .env file.' });
    }
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text parameter is required and must be a string' });
    }
    
    const translations = await translationService.translateText(text, targetLanguages);
    res.json({ translations });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
});

app.post('/api/translate/product', authenticate, async (req, res) => {
  try {
    const { product } = req.body;
    
    if (!translationService.isConfigured()) {
      return res.status(503).json({ error: 'Translation service not configured. Please add OpenAI API key to .env file.' });
    }
    
    if (!product || typeof product !== 'object') {
      return res.status(400).json({ error: 'Product parameter is required and must be an object' });
    }
    
    const translatedProduct = await translationService.autoTranslateProduct(product);
    res.json({ product: translatedProduct });
  } catch (error) {
    console.error('Product translation error:', error);
    res.status(500).json({ error: 'Product translation failed', details: error.message });
  }
});

// Bulk price update for shisha tobacco products
app.post('/api/products/bulk-price-update', authenticate, async (req, res) => {
  try {
    const { categoryId, newPrice } = req.body;
    
    if (!categoryId || !newPrice || newPrice <= 0) {
      return res.status(400).json({ error: 'Category ID and valid price are required' });
    }

    const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    const categoryIndex = products.categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let updatedCount = 0;
    products.categories[categoryIndex].items.forEach(product => {
      if (product.brand) { // Only update products that have a brand (tobacco products)
        product.price = newPrice;
        updatedCount++;
      }
    });

    await writeJSONFile(PRODUCTS_FILE, products);
    
    // Track activity
    await trackActivity(req, 'bulk_price_update', {
      categoryId: categoryId,
      newPrice: newPrice,
      updatedCount: updatedCount,
      description: `Massenpreis-Update für ${updatedCount} Tabak-Produkte auf ${newPrice}€`
    });
    
    // Broadcast update to all connected clients
    broadcastUpdate('bulk_price_updated', {
      categoryId,
      newPrice,
      updatedCount,
      message: `${updatedCount} Tabak-Preise auf ${newPrice}€ aktualisiert`
    });
    
    res.json({ 
      message: 'Bulk price update successful',
      updatedCount,
      newPrice 
    });
  } catch (error) {
    console.error('Error updating prices:', error);
    res.status(500).json({ error: 'Failed to update prices' });
  }
});

app.get('/api/translate/status', (req, res) => {
  res.json({ 
    configured: translationService.isConfigured(),
    message: translationService.isConfigured() 
      ? 'Translation service is ready' 
      : 'OpenAI API key not configured'
  });
});

// Manual translation editing
app.put('/api/products/:categoryId/items/:itemId/translations', authenticate, async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;
    const { field, translations } = req.body; // field: 'name' or 'description', translations: { de: '', da: '', en: '' }
    
    console.log('🔄 Updating translations:', { categoryId, itemId, field, translations });
    
    if (!field || !translations) {
      return res.status(400).json({ error: 'Field and translations are required' });
    }
    
    if (!['name', 'description'].includes(field)) {
      return res.status(400).json({ error: 'Field must be name or description' });
    }
    
    const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    const categoryIndex = products.categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const productIndex = products.categories[categoryIndex].items.findIndex(item => item.id === itemId);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update the specific field with new translations
    products.categories[categoryIndex].items[productIndex][field] = translations;
    
    await writeJSONFile(PRODUCTS_FILE, products);
    
    const updatedProduct = products.categories[categoryIndex].items[productIndex];
    
    console.log('✅ Translations updated successfully:', { 
      productName: updatedProduct.name, 
      field, 
      updatedTranslations: translations 
    });
    
    res.json({ 
      success: true,
      data: { product: updatedProduct },
      message: 'Translations updated successfully'
    });
  } catch (error) {
    console.error('Error updating translations:', error);
    res.status(500).json({ error: 'Failed to update translations' });
  }
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple authentication for demo
    if (username === 'admin' && password === 'safira2024') {
      const token = Buffer.from(`${username}:${password}:${Date.now()}`).toString('base64');
      res.json({ 
        token, 
        user: { username: 'admin' },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    // Try database first
    try {
      const [categories] = await pool.execute('SELECT * FROM categories ORDER BY id');
      const [products] = await pool.execute('SELECT * FROM products ORDER BY category_id, name');
      
      // Transform database data to match frontend format
      const formattedCategories = categories.map(cat => {
        const categoryProducts = products.filter(p => p.category_id === cat.id);
        return {
          id: cat.id,
          name: typeof cat.name === 'string' ? JSON.parse(cat.name) : cat.name,
          icon: cat.icon,
          description: cat.description ? (typeof cat.description === 'string' ? JSON.parse(cat.description) : cat.description) : null,
          items: categoryProducts.map(p => ({
            id: p.id,
            name: typeof p.name === 'string' ? JSON.parse(p.name) : p.name,
            description: p.description ? (typeof p.description === 'string' ? JSON.parse(p.description) : p.description) : null,
            price: parseFloat(p.price),
            imageUrl: p.image_url,
            available: Boolean(p.available)
          }))
        };
      });
      
      res.json({ categories: formattedCategories });
    } catch (dbError) {
      console.log('Database query failed, falling back to JSON:', dbError.message);
      // Fallback to JSON file
      const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
      res.json(products);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.put('/api/products', authenticate, async (req, res) => {
  try {
    const products = req.body;
    await writeJSONFile(PRODUCTS_FILE, products);
    res.json({ message: 'Products updated successfully', products });
  } catch (error) {
    console.error('Error updating products:', error);
    res.status(500).json({ error: 'Failed to update products' });
  }
});

// Individual product operations
app.post('/api/products/:categoryId/items', authenticate, async (req, res) => {
  try {
    const { categoryId } = req.params;
    let newItem = req.body;
    
    // Extract translation options from request body
    const translationOptions = newItem.translationOptions || null;
    delete newItem.translationOptions; // Remove from product data
    
    console.log('🆕 Adding new product:', { 
      categoryId, 
      name: newItem.name, 
      translationOptions 
    });
    
    // Auto-translate if OpenAI is configured and text fields are strings
    if (translationService.isConfigured()) {
      console.log('🤖 Auto-translating new product...');
      try {
        newItem = await translationService.autoTranslateProduct(newItem, categoryId, translationOptions);
        console.log('✅ Auto-translation completed successfully');
      } catch (translationError) {
        console.error('⚠️ Auto-translation failed, using original product:', translationError.message);
        // Verwende das ursprüngliche Produkt ohne Übersetzung
      }
    } else {
      console.log('⚠️ Translation service not configured, skipping auto-translation');
    }
    
    const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    const categoryIndex = products.categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    newItem.id = Date.now().toString();
    products.categories[categoryIndex].items.push(newItem);
    
    // Speichere in Datenbank/JSON
    await writeJSONFile(PRODUCTS_FILE, products);
    
    console.log('💾 Product saved to database:', { 
      id: newItem.id, 
      name: newItem.name, 
      hasTranslations: typeof newItem.name === 'object' || typeof newItem.description === 'object' 
    });
    
    // Broadcast update to all connected clients
    broadcastUpdate('product_added', {
      categoryId,
      product: newItem,
      message: 'Neues Produkt hinzugefügt'
    });

    res.json({ 
      success: true,
      data: {
        product: newItem,
        translations: translationService.isConfigured() ? 'Enabled' : 'Disabled'
      },
      message: 'Product added successfully'
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.put('/api/products/:categoryId/items/:itemId', authenticate, async (req, res) => {
  try {
    console.log('🔄 UPDATE REQUEST:', {
      categoryId: req.params.categoryId,
      itemId: req.params.itemId,
      body: req.body,
      headers: req.headers.authorization ? 'Token present' : 'No token'
    });
    
    const { categoryId, itemId } = req.params;
    const updatedItem = req.body;
    
    const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    const category = products.categories.find(cat => cat.id === categoryId);
    
    if (!category) {
      console.log('❌ Category not found:', categoryId);
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const itemIndex = category.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      console.log('❌ Product not found:', itemId, 'in category:', categoryId);
      console.log('Available products:', category.items.map(item => item.id));
      return res.status(404).json({ error: 'Product not found' });
    }
    
    category.items[itemIndex] = { ...category.items[itemIndex], ...updatedItem };
    
    await writeJSONFile(PRODUCTS_FILE, products);
    console.log('✅ Product updated successfully:', category.items[itemIndex]);
    
    // Broadcast update to all connected clients
    broadcastUpdate('product_updated', {
      categoryId,
      product: category.items[itemIndex],
      message: 'Produkt aktualisiert'
    });
    
    res.json({ success: true, data: { product: category.items[itemIndex] }, message: 'Product updated successfully' });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:categoryId/items/:itemId', authenticate, async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;
    
    const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    const category = products.categories.find(cat => cat.id === categoryId);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const itemIndex = category.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const deletedItem = category.items.splice(itemIndex, 1)[0];
    
    await writeJSONFile(PRODUCTS_FILE, products);
    
    // Broadcast update to all connected clients
    broadcastUpdate('product_deleted', {
      categoryId,
      product: deletedItem,
      message: 'Produkt gelöscht'
    });
    
    res.json({ message: 'Product deleted successfully', product: deletedItem });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Category Management APIs
app.post('/api/categories', authenticate, async (req, res) => {
  try {
    console.log('📁 CREATE CATEGORY REQUEST:', req.body);
    
    const newCategory = req.body;
    
    if (!newCategory.id || !newCategory.name) {
      return res.status(400).json({ error: 'Category ID and name are required' });
    }
    
    const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    
    // Check if category already exists
    const existingCategory = products.categories.find(cat => cat.id === newCategory.id);
    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this ID already exists' });
    }
    
    // Add new category
    products.categories.push(newCategory);
    await writeJSONFile(PRODUCTS_FILE, products);
    
    console.log('📁 Category created successfully:', newCategory.id);
    
    // Broadcast update
    broadcastUpdate('category_added', {
      category: newCategory,
      message: 'Neue Kategorie hinzugefügt'
    });
    
    res.json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:categoryId', authenticate, async (req, res) => {
  try {
    console.log('📁 UPDATE CATEGORY REQUEST:', {
      categoryId: req.params.categoryId,
      body: req.body
    });
    
    const { categoryId } = req.params;
    const updatedCategory = req.body;
    
    const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    const categoryIndex = products.categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Preserve items when updating category
    updatedCategory.items = products.categories[categoryIndex].items || [];
    products.categories[categoryIndex] = updatedCategory;
    
    await writeJSONFile(PRODUCTS_FILE, products);
    
    console.log('📁 Category updated successfully:', categoryId);
    
    // Broadcast update
    broadcastUpdate('category_updated', {
      category: updatedCategory,
      message: 'Kategorie aktualisiert'
    });
    
    res.json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:categoryId', authenticate, async (req, res) => {
  try {
    console.log('📁 DELETE CATEGORY REQUEST:', req.params.categoryId);
    
    const { categoryId } = req.params;
    
    const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    const categoryIndex = products.categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const deletedCategory = products.categories[categoryIndex];
    
    // Check if category has products
    if (deletedCategory.items && deletedCategory.items.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with products. Please delete all products first.' 
      });
    }
    
    products.categories.splice(categoryIndex, 1);
    await writeJSONFile(PRODUCTS_FILE, products);
    
    console.log('📁 Category deleted successfully:', categoryId);
    
    // Broadcast update
    broadcastUpdate('category_deleted', {
      categoryId,
      message: 'Kategorie gelöscht'
    });
    
    res.json({ message: 'Category deleted successfully', category: deletedCategory });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// QR Code generation
app.post('/api/qr/generate', authenticate, async (req, res) => {
  try {
    const { tableId, baseUrl } = req.body;
    
    if (!tableId) {
      return res.status(400).json({ error: 'Table ID is required' });
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
    
    res.json({ 
      qrCode, 
      url, 
      tableId,
      message: 'QR code generated successfully' 
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Analytics API
app.get('/api/analytics', authenticate, async (req, res) => {
  try {
    console.log('📊 Analytics request received');
    const analytics = await readJSONFile(ANALYTICS_FILE, {
      views: [],
      qrScans: [],
      deviceInfo: [],
      tableActivity: {},
      recentActivity: []
    });
    console.log('📊 Analytics data loaded');
    
    // Calculate aggregated data
    const totalViews = analytics.views.length;
    const totalQRScans = analytics.qrScans.length;
    
    console.log('📊 Starting date calculations');
    // Group by date for trends
    const today = new Date().toDateString();
    const todayViews = analytics.views.filter(view => 
      new Date(view.timestamp).toDateString() === today
    ).length;
    
    console.log('📊 Preparing response');
    const response = {
      totalViews,
      totalQRScans,
      todayViews,
      deviceInfo: analytics.deviceInfo,
      tableActivity: analytics.tableActivity,
      recentActivity: analytics.recentActivity || []
    };
    
    console.log('📊 Sending analytics response:', { 
      totalViews, 
      totalQRScans, 
      recentActivityCount: (analytics.recentActivity || []).length 
    });
    res.json(response);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.post('/api/analytics/track', authenticate, async (req, res) => {
  try {
    const { type, data } = req.body;
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    
    const analytics = await readJSONFile(ANALYTICS_FILE, {
      views: [],
      qrScans: [],
      deviceInfo: [],
      tableActivity: {},
      recentActivity: []
    });
    
    const trackingData = {
      timestamp,
      ip,
      userAgent: req.get('User-Agent'),
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
        analytics.deviceInfo.push(trackingData);
        break;
      case 'product_availability_changed':
      case 'product_created':
      case 'product_updated':
      case 'product_deleted':
      case 'bulk_price_update':
        // Add to recent activity with German time
        const now = new Date();
        const germanTime = now.toLocaleTimeString('de-DE', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Europe/Berlin'
        });
        
        const activityItem = {
          time: germanTime,
          description: data.description || `${type} event`,
          timestamp: timestamp,
          type: type,
          user: req.user?.username || 'Unknown',
          data: data
        };
        
        analytics.recentActivity.unshift(activityItem);
        
        // Keep only the last 10 activities
        analytics.recentActivity = analytics.recentActivity.slice(0, 10);
        break;
    }
    
    await writeJSONFile(ANALYTICS_FILE, analytics);
    res.json({ message: 'Analytics data recorded' });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    res.status(500).json({ error: 'Failed to track analytics' });
  }
});

// File upload
app.post('/api/upload', authenticate, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      message: 'File uploaded successfully', 
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Configuration
app.get('/api/config', async (req, res) => {
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
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

app.put('/api/config', authenticate, async (req, res) => {
  try {
    const config = req.body;
    await writeJSONFile(CONFIG_FILE, config);
    res.json({ message: 'Configuration updated successfully', config });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Specific routes for our custom menu pages
app.get('/menu/menus', (req, res) => {
  console.log('📄 Serving Safira Menüs page');
  res.sendFile(path.join(__dirname, '../build', 'menu.html'));
});

app.get('/menu/shisha', (req, res) => {
  console.log('📄 Serving Shisha page');
  res.sendFile(path.join(__dirname, '../build', 'menu', 'shisha.html'));
});

app.get('/menu/drinks', (req, res) => {
  console.log('📄 Serving Drinks page');
  res.sendFile(path.join(__dirname, '../build', 'menu', 'drinks.html'));
});

app.get('/menu/snacks', (req, res) => {
  console.log('📄 Serving Snacks page');
  res.sendFile(path.join(__dirname, '../build', 'menu', 'snacks.html'));
});

// Root route - serve our custom index.html with correct Safira layout
app.get('/', (req, res) => {
  console.log('📄 Serving custom Safira main page');
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Serve React app for all other non-API routes (must be AFTER all API routes)
app.get('*', (req, res) => {
  // Don't serve React app for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  console.log(`📄 Serving React app for: ${req.path}`);
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Migrate JSON data to database
async function migrateJSONToDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Check if database is empty
    const [existingCategories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    if (existingCategories[0].count > 0) {
      console.log('📋 Database already has data, skipping migration');
      connection.release();
      return;
    }
    
    console.log('🔄 Migrating JSON data to database...');
    
    // Read JSON data
    const jsonData = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    
    for (const category of jsonData.categories) {
      // Insert category
      await connection.execute(
        'INSERT INTO categories (id, name, icon, description) VALUES (?, ?, ?, ?)',
        [
          category.id,
          JSON.stringify(category.name),
          category.icon,
          category.description ? JSON.stringify(category.description) : null
        ]
      );
      
      // Insert products for this category
      for (const item of category.items || []) {
        await connection.execute(
          'INSERT INTO products (id, category_id, name, description, price, image_url, available) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            item.id || `${category.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            category.id,
            JSON.stringify(item.name),
            item.description ? JSON.stringify(item.description) : null,
            item.price,
            item.imageUrl || null,
            item.available !== false
          ]
        );
      }
    }
    
    connection.release();
    console.log('✅ JSON data migrated to database successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

// Initialize server
async function startServer() {
  try {
    await ensureDataDir();
    await initializeDatabase();
    
    // Initialize with sample data if products file doesn't exist
    try {
      await fs.access(PRODUCTS_FILE);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📄 Initializing with sample data...');
        const sampleProducts = require('../src/data/products.json');
        await writeJSONFile(PRODUCTS_FILE, sampleProducts);
      }
    }
    
    // Try to migrate JSON data to database
    await migrateJSONToDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      const networkIP = process.env.NETWORK_IP || 'localhost';
      console.log(`🚀 Safira Lounge API Server running on port ${PORT}`);
      console.log(`📱 Local access: http://localhost:${PORT}`);
      console.log(`🌐 Network access: http://${networkIP}:${PORT}`);
      console.log(`🔧 API endpoints available at http://${networkIP}:${PORT}/api`);
      console.log(`🗄️  Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
      console.log(`🔐 Security: JWT Auth, Rate Limiting, CSRF Protection enabled`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});


// Start the server
startServer();