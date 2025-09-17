import { Router } from 'express';
import {
  AuthenticatedRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '@/types/api';
import { Category } from '@/types/database';
import { authenticate } from '@/middleware/auth';
import { validateCategory, handleValidationErrors } from '@/middleware/security';
import { sendSuccess, sendError, sendNotFound, sendBadRequest, asyncHandler } from '@/utils/responseUtils';
import { trackActivity } from '@/utils/analytics';
import { readJSONFile, writeJSONFile } from '@/utils/fileUtils';
import path from 'path';

const router = Router();
const PRODUCTS_FILE = path.join(__dirname, '../../data/products.json');

/**
 * Create new category
 */
router.post('/', 
  authenticate, 
  validateCategory, 
  handleValidationErrors,
  asyncHandler(async (req: AuthenticatedRequest & { body: CreateCategoryRequest }, res: any) => {
    try {
      console.log('📁 CREATE CATEGORY REQUEST:', req.body);
      
      const newCategory = req.body;
      
      if (!newCategory.id || !newCategory.name) {
        sendBadRequest(res, 'Category ID and name are required');
        return;
      }
      
      const products = await readJSONFile<{ categories: Category[] }>(PRODUCTS_FILE, { categories: [] });
      
      // Check if category already exists
      const existingCategory = products.categories.find((cat) => cat.id === newCategory.id);
      if (existingCategory) {
        sendBadRequest(res, 'Category with this ID already exists');
        return;
      }
      
      // Add new category with empty items array
      const categoryWithItems = { ...newCategory, items: [] } as Category;
      products.categories.push(categoryWithItems);
      await writeJSONFile(PRODUCTS_FILE, products);
      
      console.log('📁 Category created successfully:', newCategory.id);
      
      // Track activity
      await trackActivity(req, 'category_created', {
        categoryId: newCategory.id,
        categoryName: typeof newCategory.name === 'string' ? 
          newCategory.name : 
          newCategory.name.de || 'Unknown',
        description: `Category "${typeof newCategory.name === 'string' ? 
          newCategory.name : 
          newCategory.name.de || 'Unknown'}" created`
      });
      
      sendSuccess(res, categoryWithItems, 'Category created successfully', 201);
    } catch (error) {
      console.error('Error creating category:', error);
      sendError(res, 'Failed to create category');
    }
  })
);

/**
 * Update category
 */
router.put('/:categoryId', 
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest & { body: UpdateCategoryRequest }, res: any) => {
    try {
      console.log('📁 UPDATE CATEGORY REQUEST:', {
        categoryId: req.params.categoryId,
        body: req.body
      });
      
      const { categoryId } = req.params;
      const updatedCategory = req.body;
      
      const products = await readJSONFile<{ categories: Category[] }>(PRODUCTS_FILE, { categories: [] });
      const categoryIndex = products.categories.findIndex((cat) => cat.id === categoryId);
      
      if (categoryIndex === -1) {
        sendNotFound(res, 'Category');
        return;
      }
      
      // Preserve items when updating category
      updatedCategory.items = products.categories[categoryIndex].items || [];
      products.categories[categoryIndex] = updatedCategory;
      
      await writeJSONFile(PRODUCTS_FILE, products);
      
      console.log('📁 Category updated successfully:', categoryId);
      
      // Track activity
      await trackActivity(req, 'category_updated', {
        categoryId: categoryId,
        categoryName: typeof updatedCategory.name === 'string' ? 
          updatedCategory.name : 
          updatedCategory.name.de || 'Unknown',
        description: `Category "${typeof updatedCategory.name === 'string' ? 
          updatedCategory.name : 
          updatedCategory.name.de || 'Unknown'}" updated`
      });
      
      sendSuccess(res, updatedCategory, 'Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      sendError(res, 'Failed to update category');
    }
  })
);

/**
 * Delete category
 */
router.delete('/:categoryId', 
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    try {
      console.log('📁 DELETE CATEGORY REQUEST:', req.params.categoryId);
      
      const { categoryId } = req.params;
      
      const products = await readJSONFile<{ categories: Category[] }>(PRODUCTS_FILE, { categories: [] });
      const categoryIndex = products.categories.findIndex((cat) => cat.id === categoryId);
      
      if (categoryIndex === -1) {
        sendNotFound(res, 'Category');
        return;
      }
      
      const deletedCategory = products.categories[categoryIndex];
      
      // Check if category has products
      if (!deletedCategory.items) {
        deletedCategory.items = [];
      }
      if (deletedCategory.items.length > 0) {
        sendBadRequest(res, 'Cannot delete category with products. Please delete all products first.');
        return;
      }
      
      products.categories.splice(categoryIndex, 1);
      await writeJSONFile(PRODUCTS_FILE, products);
      
      console.log('📁 Category deleted successfully:', categoryId);
      
      // Track activity
      await trackActivity(req, 'category_deleted', {
        categoryId: categoryId,
        categoryName: typeof deletedCategory.name === 'string' ? 
          deletedCategory.name : 
          deletedCategory.name.de || 'Unknown',
        description: `Category "${typeof deletedCategory.name === 'string' ? 
          deletedCategory.name : 
          deletedCategory.name.de || 'Unknown'}" deleted`
      });
      
      sendSuccess(res, deletedCategory, 'Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      sendError(res, 'Failed to delete category');
    }
  })
);

export default router;