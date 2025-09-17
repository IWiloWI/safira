import { Router } from 'express';
import { 
  AuthenticatedRequest, 
  CreateProductRequest,
  UpdateProductRequest,
  ProductsResponse,
  TranslationFieldUpdateRequest,
  BulkPriceUpdateRequest,
  BulkPriceUpdateResponse
} from '@/types/api';
import { authenticate } from '@/middleware/auth';
import { validateProduct, handleValidationErrors } from '@/middleware/security';
import { sendSuccess, sendError, sendNotFound, asyncHandler } from '@/utils/responseUtils';
import { trackActivity } from '@/utils/analytics';
import { readJSONFile, writeJSONFile } from '@/utils/fileUtils';
import translationService from '@/services/translationService';
import path from 'path';

const router = Router();
const PRODUCTS_FILE = path.join(__dirname, '../../data/products.json');

/**
 * Get all products with categories
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
    const response: ProductsResponse = products;
    sendSuccess(res, response);
  } catch (error) {
    console.error('Error fetching products:', error);
    sendError(res, 'Failed to fetch products');
  }
}));

/**
 * Update all products
 */
router.put('/', 
  authenticate, 
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const products = req.body;
      await writeJSONFile(PRODUCTS_FILE, products);
      sendSuccess(res, products, 'Products updated successfully');
    } catch (error) {
      console.error('Error updating products:', error);
      sendError(res, 'Failed to update products');
    }
  })
);

/**
 * Add new product to category
 */
router.post('/:categoryId/items', 
  authenticate, 
  validateProduct, 
  handleValidationErrors,
  asyncHandler(async (req: AuthenticatedRequest & { body: CreateProductRequest }, res: any) => {
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
          console.error('⚠️ Auto-translation failed, using original product:', translationError);
        }
      } else {
        console.log('⚠️ Translation service not configured, skipping auto-translation');
      }
      
      const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
      const categoryIndex = products.categories.findIndex((cat: any) => cat.id === categoryId);
      
      if (categoryIndex === -1) {
        sendNotFound(res, 'Category');
        return;
      }
      
      newItem.id = Date.now().toString();
      products.categories[categoryIndex].items.push(newItem);
      
      await writeJSONFile(PRODUCTS_FILE, products);
      
      console.log('💾 Product saved to database:', { 
        id: newItem.id, 
        name: newItem.name, 
        hasTranslations: typeof newItem.name === 'object' || typeof newItem.description === 'object' 
      });
      
      // Track activity
      await trackActivity(req, 'product_added', {
        productId: newItem.id,
        productName: typeof newItem.name === 'string' ? newItem.name : newItem.name.de || 'Unknown',
        categoryId: categoryId,
        description: `Product "${typeof newItem.name === 'string' ? newItem.name : newItem.name.de || 'Unknown'}" added`
      });

      sendSuccess(res, {
        product: newItem,
        translations: translationService.isConfigured() ? 'Enabled' : 'Disabled'
      }, 'Product added successfully', 201);
    } catch (error) {
      console.error('Error adding product:', error);
      sendError(res, 'Failed to add product');
    }
  })
);

/**
 * Update product
 */
router.put('/:categoryId/items/:itemId', 
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest & { body: UpdateProductRequest }, res) => {
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
      const category = products.categories.find((cat: any) => cat.id === categoryId);
      
      if (!category) {
        console.log('❌ Category not found:', categoryId);
        sendNotFound(res, 'Category');
        return;
      }
      
      const itemIndex = category.items.findIndex((item: any) => item.id === itemId);
      if (itemIndex === -1) {
        console.log('❌ Product not found:', itemId, 'in category:', categoryId);
        console.log('Available products:', category.items.map((item: any) => item.id));
        sendNotFound(res, 'Product');
        return;
      }
      
      category.items[itemIndex] = { ...category.items[itemIndex], ...updatedItem };
      
      await writeJSONFile(PRODUCTS_FILE, products);
      console.log('✅ Product updated successfully:', category.items[itemIndex]);
      
      // Track activity
      await trackActivity(req, 'product_updated', {
        productId: itemId,
        productName: typeof category.items[itemIndex].name === 'string' ? 
          category.items[itemIndex].name : 
          category.items[itemIndex].name.de || 'Unknown',
        categoryId: categoryId,
        description: `Product "${typeof category.items[itemIndex].name === 'string' ? 
          category.items[itemIndex].name : 
          category.items[itemIndex].name.de || 'Unknown'}" updated`
      });
      
      sendSuccess(res, { product: category.items[itemIndex] }, 'Product updated successfully');
    } catch (error) {
      console.error('❌ Error updating product:', error);
      sendError(res, 'Failed to update product');
    }
  })
);

/**
 * Delete product
 */
router.delete('/:categoryId/items/:itemId', 
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const { categoryId, itemId } = req.params;
      
      const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
      const category = products.categories.find((cat: any) => cat.id === categoryId);
      
      if (!category) {
        sendNotFound(res, 'Category');
        return;
      }
      
      const itemIndex = category.items.findIndex((item: any) => item.id === itemId);
      if (itemIndex === -1) {
        sendNotFound(res, 'Product');
        return;
      }
      
      const deletedItem = category.items.splice(itemIndex, 1)[0];
      
      await writeJSONFile(PRODUCTS_FILE, products);
      
      // Track activity
      await trackActivity(req, 'product_deleted', {
        productId: itemId,
        productName: typeof deletedItem.name === 'string' ? 
          deletedItem.name : 
          deletedItem.name.de || 'Unknown',
        categoryId: categoryId,
        description: `Product "${typeof deletedItem.name === 'string' ? 
          deletedItem.name : 
          deletedItem.name.de || 'Unknown'}" deleted`
      });
      
      sendSuccess(res, deletedItem, 'Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      sendError(res, 'Failed to delete product');
    }
  })
);

/**
 * Move product between categories
 */
router.put('/move/:fromCategoryId/:itemId/:toCategoryId', 
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const { fromCategoryId, itemId, toCategoryId } = req.params;
      
      console.log('🔄 Moving product:', { fromCategoryId, itemId, toCategoryId });
      
      const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
      
      // Find source category
      const fromCategoryIndex = products.categories.findIndex((cat: any) => cat.id === fromCategoryId);
      if (fromCategoryIndex === -1) {
        sendNotFound(res, 'Source category');
        return;
      }
      
      // Find target category
      const toCategoryIndex = products.categories.findIndex((cat: any) => cat.id === toCategoryId);
      if (toCategoryIndex === -1) {
        sendNotFound(res, 'Target category');
        return;
      }
      
      // Find product in source category
      const productIndex = products.categories[fromCategoryIndex].items.findIndex((item: any) => item.id === itemId);
      if (productIndex === -1) {
        sendNotFound(res, 'Product in source category');
        return;
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
      
      sendSuccess(res, {
        product,
        from: fromCategoryId,
        to: toCategoryId
      }, 'Product moved successfully');
    } catch (error) {
      console.error('Error moving product:', error);
      sendError(res, 'Failed to move product');
    }
  })
);

/**
 * Update product translations
 */
router.put('/:categoryId/items/:itemId/translations', 
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest & { body: TranslationFieldUpdateRequest }, res) => {
    try {
      const { categoryId, itemId } = req.params;
      const { field, translations } = req.body;
      
      console.log('🔄 Updating translations:', { categoryId, itemId, field, translations });
      
      if (!field || !translations) {
        sendError(res, 'Field and translations are required', 400);
        return;
      }
      
      if (!['name', 'description'].includes(field)) {
        sendError(res, 'Field must be name or description', 400);
        return;
      }
      
      const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
      const categoryIndex = products.categories.findIndex((cat: any) => cat.id === categoryId);
      
      if (categoryIndex === -1) {
        sendNotFound(res, 'Category');
        return;
      }
      
      const productIndex = products.categories[categoryIndex].items.findIndex((item: any) => item.id === itemId);
      if (productIndex === -1) {
        sendNotFound(res, 'Product');
        return;
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
      
      sendSuccess(res, { product: updatedProduct }, 'Translations updated successfully');
    } catch (error) {
      console.error('Error updating translations:', error);
      sendError(res, 'Failed to update translations');
    }
  })
);

/**
 * Bulk price update for category products
 */
router.post('/bulk-price-update', 
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest & { body: BulkPriceUpdateRequest }, res) => {
    try {
      const { categoryId, newPrice } = req.body;
      
      if (!categoryId || !newPrice || newPrice <= 0) {
        sendError(res, 'Category ID and valid price are required', 400);
        return;
      }

      const products = await readJSONFile(PRODUCTS_FILE, { categories: [] });
      const categoryIndex = products.categories.findIndex((cat: any) => cat.id === categoryId);
      
      if (categoryIndex === -1) {
        sendNotFound(res, 'Category');
        return;
      }

      let updatedCount = 0;
      products.categories[categoryIndex].items.forEach((product: any) => {
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
        description: `Bulk price update for ${updatedCount} tobacco products to ${newPrice}€`
      });
      
      const response: BulkPriceUpdateResponse = {
        message: 'Bulk price update successful',
        updatedCount,
        newPrice 
      };
      
      sendSuccess(res, response);
    } catch (error) {
      console.error('Error updating prices:', error);
      sendError(res, 'Failed to update prices');
    }
  })
);

export default router;