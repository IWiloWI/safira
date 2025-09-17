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
import { Category, Product } from '@/types/database';
import { authenticate } from '@/middleware/auth';
import { validateProduct, handleValidationErrors } from '@/middleware/security';
import { sendSuccess, sendError, sendNotFound, asyncHandler } from '@/utils/responseUtils';
import { trackActivity } from '@/utils/analytics';
import { readJSONFile, writeJSONFile } from '@/utils/fileUtils';
import translationService from '@/services/translationService';
import path from 'path';

const router = Router();
const PRODUCTS_FILE = path.join(__dirname, '../../data/products.json');

interface ProductsData {
  categories: Category[];
}

/**
 * Get all products with categories
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const products = await readJSONFile<ProductsData>(PRODUCTS_FILE, { categories: [] });
    const response: ProductsResponse = products;
    sendSuccess(res, response);
  } catch (error) {
    console.error('Error fetching products:', error);
    sendError(res, 'Failed to fetch products');
  }
}));

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
      const newItem = req.body;

      console.log('✅ Adding product with data:', {
        categoryId,
        requestBody: newItem,
        translationServiceConfigured: translationService.isConfigured()
      });

      // Auto-translate if translation service is configured
      if (translationService.isConfigured()) {
        console.log('🌍 Auto-translating product fields...');
        try {
          const fieldsToTranslate = [];

          // Check if name needs translation
          if (typeof newItem.name === 'string') {
            fieldsToTranslate.push({
              key: 'name',
              value: newItem.name,
              currentField: newItem.name
            });
          }

          // Check if description needs translation
          if (typeof newItem.description === 'string') {
            fieldsToTranslate.push({
              key: 'description',
              value: newItem.description,
              currentField: newItem.description
            });
          }

          // Translate all fields
          for (const field of fieldsToTranslate) {
            const translated = await translationService.translateText(field.currentField, ['da', 'en']);
            (newItem as any)[field.key] = translated;
            console.log(`✅ Translated ${field.key}:`, translated);
          }
        } catch (translationError) {
          console.error('⚠️ Translation failed (continuing without translation):', translationError);
        }
      } else {
        console.log('⚠️ Translation service not configured, skipping auto-translation');
      }

      const products = await readJSONFile<ProductsData>(PRODUCTS_FILE, { categories: [] });
      const categoryIndex = products.categories.findIndex((cat) => cat.id === categoryId);

      if (categoryIndex === -1) {
        sendNotFound(res, 'Category');
        return;
      }

      const category = products.categories[categoryIndex];
      if (!category.items) {
        category.items = [];
      }

      newItem.id = Date.now().toString();
      category.items.push(newItem);

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

      const products = await readJSONFile<ProductsData>(PRODUCTS_FILE, { categories: [] });
      const category = products.categories.find((cat) => cat.id === categoryId);

      if (!category) {
        console.log('❌ Category not found:', categoryId);
        sendNotFound(res, 'Category');
        return;
      }

      if (!category.items) {
        category.items = [];
      }

      const itemIndex = category.items.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) {
        console.log('❌ Product not found:', itemId, 'in category:', categoryId);
        console.log('Available products:', category.items.map((item) => item.id));
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

      const products = await readJSONFile<ProductsData>(PRODUCTS_FILE, { categories: [] });
      const category = products.categories.find((cat) => cat.id === categoryId);

      if (!category) {
        sendNotFound(res, 'Category');
        return;
      }

      if (!category.items) {
        category.items = [];
      }

      const itemIndex = category.items.findIndex((item) => item.id === itemId);
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

      sendSuccess(res, { product: deletedItem }, 'Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      sendError(res, 'Failed to delete product');
    }
  })
);

/**
 * Move product to different category
 */
router.put('/move/:itemId',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest & { body: { fromCategoryId: string; toCategoryId: string } }, res) => {
    try {
      const { itemId } = req.params;
      const { fromCategoryId, toCategoryId } = req.body;

      const products = await readJSONFile<ProductsData>(PRODUCTS_FILE, { categories: [] });

      // Check if both categories exist
      const fromCategoryIndex = products.categories.findIndex((cat) => cat.id === fromCategoryId);
      const toCategoryIndex = products.categories.findIndex((cat) => cat.id === toCategoryId);

      if (fromCategoryIndex === -1 || toCategoryIndex === -1) {
        sendNotFound(res, 'One or both categories');
        return;
      }

      const sourceCategory = products.categories[fromCategoryIndex];
      const targetCategory = products.categories[toCategoryIndex];

      if (!sourceCategory.items) {
        sourceCategory.items = [];
      }

      if (!targetCategory.items) {
        targetCategory.items = [];
      }

      // Find product in source category
      const productIndex = sourceCategory.items.findIndex((item) => item.id === itemId);
      if (productIndex === -1) {
        sendNotFound(res, 'Product in source category');
        return;
      }

      // Move product
      const [product] = sourceCategory.items.splice(productIndex, 1);
      targetCategory.items.push(product);

      // Save changes
      await writeJSONFile(PRODUCTS_FILE, products);

      // Track activity
      await trackActivity(req, 'product_moved', {
        productId: itemId,
        productName: typeof product.name === 'string' ?
          product.name :
          product.name.de || 'Unknown',
        fromCategoryId,
        toCategoryId,
        description: `Product "${typeof product.name === 'string' ?
          product.name :
          product.name.de || 'Unknown'}" moved from category ${fromCategoryId} to ${toCategoryId}`
      });

      sendSuccess(res, {
        product,
        fromCategory: fromCategoryId,
        toCategory: toCategoryId
      }, 'Product moved successfully');
    } catch (error) {
      console.error('Error moving product:', error);
      sendError(res, 'Failed to move product');
    }
  })
);

/**
 * Update product field with translations
 */
router.put('/:categoryId/items/:itemId/translate',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest & { body: TranslationFieldUpdateRequest }, res) => {
    try {
      const { categoryId, itemId } = req.params;
      const { field, translations } = req.body;

      const products = await readJSONFile<ProductsData>(PRODUCTS_FILE, { categories: [] });
      const categoryIndex = products.categories.findIndex((cat) => cat.id === categoryId);

      if (categoryIndex === -1) {
        sendNotFound(res, 'Category');
        return;
      }

      const category = products.categories[categoryIndex];
      if (!category.items) {
        category.items = [];
      }

      const productIndex = category.items.findIndex((item) => item.id === itemId);
      if (productIndex === -1) {
        sendNotFound(res, 'Product');
        return;
      }

      // Create multilingual field
      const fieldKey = field as keyof Product;
      const translatedField = {
        de: translations.de,
        da: translations.da,
        en: translations.en
      };

      (category.items[productIndex] as any)[fieldKey] = translatedField;

      await writeJSONFile(PRODUCTS_FILE, products);

      // Track activity
      await trackActivity(req, 'product_translated', {
        productId: itemId,
        field,
        languages: Object.keys(translations),
        description: `Product field "${field}" translated`
      });

      sendSuccess(res, { product: category.items[productIndex] });
    } catch (error) {
      console.error('Error updating translations:', error);
      sendError(res, 'Failed to update translations');
    }
  })
);

/**
 * Bulk update prices for a category (tobacco products)
 */
router.put('/:categoryId/bulk-price',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest & { body: BulkPriceUpdateRequest }, res) => {
    try {
      const { categoryId } = req.params;
      const { newPrice } = req.body;

      const products = await readJSONFile<ProductsData>(PRODUCTS_FILE, { categories: [] });
      const categoryIndex = products.categories.findIndex((cat) => cat.id === categoryId);

      if (categoryIndex === -1) {
        sendNotFound(res, 'Category');
        return;
      }

      const category = products.categories[categoryIndex];
      if (!category.items) {
        category.items = [];
      }

      let updatedCount = 0;
      category.items.forEach((product) => {
        if ((product as any).brand) { // Only update products that have a brand (tobacco products)
          product.price = newPrice;
          updatedCount++;
        }
      });

      await writeJSONFile(PRODUCTS_FILE, products);

      // Track activity
      await trackActivity(req, 'bulk_price_update', {
        categoryId,
        newPrice,
        updatedCount,
        description: `Updated prices for ${updatedCount} products in category`
      });

      const response: BulkPriceUpdateResponse = {
        updatedCount,
        newPrice,
        message: `Successfully updated ${updatedCount} product prices`
      };

      sendSuccess(res, response, `Successfully updated ${updatedCount} product prices`);
    } catch (error) {
      console.error('Error updating bulk prices:', error);
      sendError(res, 'Failed to update product prices');
    }
  })
);

export default router;