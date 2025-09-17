/**
 * Custom hook for bulk operations on products
 * Handles bulk actions like price updates, deletion, exports
 */

import { useState, useCallback } from 'react';
import { Product, BulkPriceUpdateResult, BulkOperationResult } from '../types/product.types';
import { bulkUpdateTobaccoPrice, deleteProduct, trackEvent } from '../services/api';

interface BulkPriceUpdateData {
  categoryId: string;
  newPrice: number;
  filters?: {
    brand?: string;
    availableOnly?: boolean;
  };
}

interface UseBulkOperationsReturn {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  
  // Bulk operations
  bulkUpdatePrices: (data: BulkPriceUpdateData) => Promise<BulkPriceUpdateResult>;
  bulkDeleteProducts: (products: Product[]) => Promise<BulkOperationResult>;
  bulkToggleAvailability: (products: Product[], available: boolean) => Promise<BulkOperationResult>;
  bulkExportProducts: (products: Product[], format: 'csv' | 'json' | 'excel') => Promise<void>;
  
  // Utilities
  selectAllProducts: (products: Product[]) => Product[];
  selectByCategory: (products: Product[], categoryId: string) => Product[];
  selectByBrand: (products: Product[], brand: string) => Product[];
  selectAvailable: (products: Product[]) => Product[];
  selectUnavailable: (products: Product[]) => Product[];
}

export const useBulkOperations = (): UseBulkOperationsReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Bulk update prices for products
   */
  const bulkUpdatePrices = useCallback(async (data: BulkPriceUpdateData): Promise<BulkPriceUpdateResult> => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);
      
      setProgress(50);
      const result = await bulkUpdateTobaccoPrice(data.categoryId, data.newPrice);
      
      // Track bulk price update
      try {
        await trackEvent('bulk_price_update', {
          categoryId: data.categoryId,
          newPrice: data.newPrice,
          updatedCount: result.updatedCount,
          description: `Bulk price update: ${result.updatedCount} products updated to €${data.newPrice}`
        });
      } catch (trackingError) {
        console.log('Activity tracking failed:', trackingError);
      }
      
      setProgress(100);
      return result;
    } catch (error) {
      console.error('Bulk price update failed:', error);
      setError('Failed to update prices');
      throw error;
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  /**
   * Bulk delete products
   */
  const bulkDeleteProducts = useCallback(async (products: Product[]): Promise<BulkOperationResult> => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);
      
      let successCount = 0;
      let failureCount = 0;
      const errors: Array<{ itemId: string; error: string }> = [];
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        setProgress((i / products.length) * 100);
        
        try {
          await deleteProduct(product.categoryId!, product.id);
          successCount++;
          
          // Track individual deletion
          try {
            await trackEvent('product_deleted', {
              productId: product.id,
              categoryId: product.categoryId,
              description: `Product deleted in bulk operation`
            });
          } catch (trackingError) {
            console.log('Activity tracking failed:', trackingError);
          }
        } catch (error) {
          failureCount++;
          errors.push({
            itemId: product.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      setProgress(100);
      
      const result: BulkOperationResult = {
        message: `Bulk deletion completed: ${successCount} successful, ${failureCount} failed`,
        processedCount: products.length,
        successCount,
        failureCount,
        errors: errors.length > 0 ? errors : undefined
      };
      
      return result;
    } catch (error) {
      console.error('Bulk delete failed:', error);
      setError('Failed to delete products');
      throw error;
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  /**
   * Bulk toggle availability
   */
  const bulkToggleAvailability = useCallback(async (products: Product[], available: boolean): Promise<BulkOperationResult> => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);
      
      let successCount = 0;
      let failureCount = 0;
      const errors: Array<{ itemId: string; error: string }> = [];
      
      // Import updateProduct function locally to avoid circular dependency
      const { updateProduct } = await import('../services/api');
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        setProgress((i / products.length) * 100);
        
        try {
          await updateProduct(product.categoryId!, product.id, { available });
          successCount++;
        } catch (error) {
          failureCount++;
          errors.push({
            itemId: product.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      setProgress(100);
      
      const result: BulkOperationResult = {
        message: `Bulk availability update completed: ${successCount} successful, ${failureCount} failed`,
        processedCount: products.length,
        successCount,
        failureCount,
        errors: errors.length > 0 ? errors : undefined
      };
      
      return result;
    } catch (error) {
      console.error('Bulk availability update failed:', error);
      setError('Failed to update product availability');
      throw error;
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  /**
   * Export products to various formats
   */
  const bulkExportProducts = useCallback(async (products: Product[], format: 'csv' | 'json' | 'excel') => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);
      
      let content: string;
      let mimeType: string;
      let filename: string;
      
      setProgress(25);
      
      switch (format) {
        case 'csv':
          content = generateCSV(products);
          mimeType = 'text/csv';
          filename = `products_${new Date().toISOString().split('T')[0]}.csv`;
          break;
          
        case 'json':
          content = JSON.stringify(products, null, 2);
          mimeType = 'application/json';
          filename = `products_${new Date().toISOString().split('T')[0]}.json`;
          break;
          
        case 'excel':
          // For Excel, we'll generate CSV that can be imported
          content = generateCSV(products);
          mimeType = 'application/vnd.ms-excel';
          filename = `products_${new Date().toISOString().split('T')[0]}.csv`;
          break;
          
        default:
          throw new Error('Unsupported export format');
      }
      
      setProgress(75);
      
      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setProgress(100);
      
      // Track export
      try {
        await trackEvent('product_updated', {
          format,
          productCount: products.length,
          description: `Exported ${products.length} products to ${format.toUpperCase()}`
        });
      } catch (trackingError) {
        console.log('Activity tracking failed:', trackingError);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export products');
      throw error;
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  /**
   * Generate CSV content from products
   */
  const generateCSV = (products: Product[]): string => {
    const headers = [
      'ID',
      'Name',
      'Description',
      'Price',
      'Category',
      'Brand',
      'Available',
      'Badges',
      'Created At',
      'Updated At'
    ];
    
    const rows = products.map(product => [
      product.id,
      typeof product.name === 'string' ? product.name : JSON.stringify(product.name),
      typeof product.description === 'string' ? product.description : JSON.stringify(product.description),
      product.price || '',
      product.categoryId || '',
      product.brand || '',
      product.available ? 'Yes' : 'No',
      product.badges ? Object.entries(product.badges).filter(([_, value]) => value).map(([key]) => key).join(';') : '',
      product.createdAt || '',
      product.updatedAt || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    return csvContent;
  };

  // Selection utilities
  const selectAllProducts = useCallback((products: Product[]) => products, []);
  
  const selectByCategory = useCallback((products: Product[], categoryId: string) => {
    return products.filter(product => product.categoryId === categoryId);
  }, []);
  
  const selectByBrand = useCallback((products: Product[], brand: string) => {
    return products.filter(product => product.brand === brand);
  }, []);
  
  const selectAvailable = useCallback((products: Product[]) => {
    return products.filter(product => product.available);
  }, []);
  
  const selectUnavailable = useCallback((products: Product[]) => {
    return products.filter(product => !product.available);
  }, []);

  return {
    isProcessing,
    progress,
    error,
    
    // Bulk operations
    bulkUpdatePrices,
    bulkDeleteProducts,
    bulkToggleAvailability,
    bulkExportProducts,
    
    // Utilities
    selectAllProducts,
    selectByCategory,
    selectByBrand,
    selectAvailable,
    selectUnavailable
  };
};
