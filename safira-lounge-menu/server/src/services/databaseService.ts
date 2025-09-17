import mysql from 'mysql2/promise';
import { 
  DatabasePool, 
  DatabaseConnection, 
  Category, 
  Product, 
  MultilingualText,
  DatabaseCategory,
  DatabaseProduct
} from '@/types/database';

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

class DatabaseService {
  private pool: mysql.Pool | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'safira_lounge',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
  }

  /**
   * Initialize database connection pool
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🔗 Connecting to MariaDB database...');
      
      this.pool = mysql.createPool(this.config);
      
      // Test connection
      const connection = await this.pool.getConnection();
      console.log('✅ Database connection established');
      
      await this.createTables(connection);
      connection.release();
      
      console.log('📋 Database tables initialized');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database tables if they don't exist
   */
  private async createTables(connection: mysql.PoolConnection): Promise<void> {
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
  }

  /**
   * Get all categories with their products
   */
  public async getCategories(): Promise<Category[]> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    try {
      const [categories] = await this.pool.execute('SELECT * FROM categories ORDER BY id');
      const [products] = await this.pool.execute('SELECT * FROM products ORDER BY category_id, name');
      
      // Transform database data to match frontend format
      return (categories as DatabaseCategory[]).map(cat => {
        const categoryProducts = (products as DatabaseProduct[]).filter(p => p.category_id === cat.id);
        return {
          id: cat.id,
          name: this.parseJsonField(cat.name),
          icon: cat.icon,
          description: cat.description ? this.parseJsonField(cat.description) : undefined,
          items: categoryProducts.map(p => this.transformDatabaseProduct(p))
        };
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  public async createCategory(category: Omit<Category, 'items'>): Promise<void> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    try {
      await this.pool.execute(
        'INSERT INTO categories (id, name, icon, description) VALUES (?, ?, ?, ?)',
        [
          category.id,
          JSON.stringify(category.name),
          category.icon,
          category.description ? JSON.stringify(category.description) : null
        ]
      );
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update a category
   */
  public async updateCategory(categoryId: string, updates: Partial<Omit<Category, 'id' | 'items'>>): Promise<void> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const setParts: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      setParts.push('name = ?');
      values.push(JSON.stringify(updates.name));
    }

    if (updates.icon !== undefined) {
      setParts.push('icon = ?');
      values.push(updates.icon);
    }

    if (updates.description !== undefined) {
      setParts.push('description = ?');
      values.push(updates.description ? JSON.stringify(updates.description) : null);
    }

    if (setParts.length === 0) {
      return; // No updates to apply
    }

    values.push(categoryId);

    try {
      await this.pool.execute(
        `UPDATE categories SET ${setParts.join(', ')} WHERE id = ?`,
        values
      );
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete a category
   */
  public async deleteCategory(categoryId: string): Promise<void> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    try {
      await this.pool.execute('DELETE FROM categories WHERE id = ?', [categoryId]);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  public async createProduct(categoryId: string, product: Omit<Product, 'id'>): Promise<string> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const productId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      await this.pool.execute(
        'INSERT INTO products (id, category_id, name, description, price, image_url, available) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          productId,
          categoryId,
          JSON.stringify(product.name),
          product.description ? JSON.stringify(product.description) : null,
          product.price,
          product.imageUrl || null,
          product.available !== false
        ]
      );

      return productId;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update a product
   */
  public async updateProduct(productId: string, updates: Partial<Omit<Product, 'id'>>): Promise<void> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const setParts: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      setParts.push('name = ?');
      values.push(JSON.stringify(updates.name));
    }

    if (updates.description !== undefined) {
      setParts.push('description = ?');
      values.push(updates.description ? JSON.stringify(updates.description) : null);
    }

    if (updates.price !== undefined) {
      setParts.push('price = ?');
      values.push(updates.price);
    }

    if (updates.imageUrl !== undefined) {
      setParts.push('image_url = ?');
      values.push(updates.imageUrl);
    }

    if (updates.available !== undefined) {
      setParts.push('available = ?');
      values.push(updates.available);
    }

    if (setParts.length === 0) {
      return; // No updates to apply
    }

    values.push(productId);

    try {
      await this.pool.execute(
        `UPDATE products SET ${setParts.join(', ')} WHERE id = ?`,
        values
      );
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete a product
   */
  public async deleteProduct(productId: string): Promise<void> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    try {
      await this.pool.execute('DELETE FROM products WHERE id = ?', [productId]);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Move product between categories
   */
  public async moveProduct(productId: string, newCategoryId: string): Promise<void> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    try {
      await this.pool.execute(
        'UPDATE products SET category_id = ? WHERE id = ?',
        [newCategoryId, productId]
      );
    } catch (error) {
      console.error('Error moving product:', error);
      throw error;
    }
  }

  /**
   * Update all product prices in a category (bulk operation)
   */
  public async bulkUpdatePrices(categoryId: string, newPrice: number): Promise<number> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    try {
      const [result] = await this.pool.execute(
        'UPDATE products SET price = ? WHERE category_id = ?',
        [newPrice, categoryId]
      ) as mysql.ResultSetHeader[];

      return result.affectedRows || 0;
    } catch (error) {
      console.error('Error bulk updating prices:', error);
      throw error;
    }
  }

  /**
   * Get database pool for direct access
   */
  public getPool(): mysql.Pool {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }
    return this.pool;
  }

  /**
   * Helper method to parse JSON fields from database
   */
  private parseJsonField(field: any): MultilingualText {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        // If parsing fails, assume it's a simple string and wrap in multilingual format
        return { de: field };
      }
    }
    return field as MultilingualText;
  }

  /**
   * Transform database product to application format
   */
  private transformDatabaseProduct(dbProduct: DatabaseProduct): Product {
    return {
      id: dbProduct.id,
      name: this.parseJsonField(dbProduct.name),
      description: dbProduct.description ? this.parseJsonField(dbProduct.description) : undefined,
      price: parseFloat(dbProduct.price.toString()),
      imageUrl: dbProduct.image_url || undefined,
      available: Boolean(dbProduct.available)
    };
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('📦 Database connection closed');
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;