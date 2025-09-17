/**
 * ProductManager - Refactored with improved architecture
 * Now uses the new ProductManagerContainer component with modern patterns
 */

import React from 'react';
import ProductManagerContainer from './ProductManagerContainer';

/**
 * ProductManager component - Simple wrapper for the refactored container
 * Maintains backward compatibility while using the new modular architecture
 */
const ProductManager: React.FC = () => {
  return <ProductManagerContainer />;
};

export default ProductManager;