/**
 * Menu Product Card Component
 * Simple list item matching original HTML structure
 */

import React from 'react';
import styled from 'styled-components';
import { Product, Language } from '../../types';
import { MultilingualHelpers } from '../../types';

// Simple list item styles matching original HTML
const ProductListItem = styled.div`
  opacity: 1;
  transform: none;
  transform-origin: 50% 50% 0px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ProductContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
`;

const ProductName = styled.h3`
  font-family: 'Aldrich', sans-serif;
  color: white;
  margin: 0;
  font-size: 1rem;
  font-weight: normal;
`;

const ProductPrice = styled.div`
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
  margin-left: 20px;
`;

const ProductDescription = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-top: 5px;
  font-family: 'Aldrich', sans-serif;
`;

// Component interfaces
export interface MenuProductCardProps {
  /** Product data */
  product: Product;
  /** Current language */
  language: Language;
  /** Click handler */
  onClick?: (product: Product) => void;
  /** Whether card is interactive */
  interactive?: boolean;
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Menu Product Card Component
 * Simple list item display matching original design
 */
export const MenuProductCard: React.FC<MenuProductCardProps> = React.memo(({
  product,
  language,
  onClick,
  interactive = true,
  className,
  testId = 'menu-product-card'
}) => {
  /**
   * Get product name in current language
   */
  const getProductName = () => {
    return MultilingualHelpers.getText(product.name, language);
  };

  /**
   * Get product description in current language
   */
  const getProductDescription = () => {
    if (!product.description) return '';
    return MultilingualHelpers.getText(product.description, language);
  };

  /**
   * Format price
   */
  const formatPrice = (price?: number) => {
    if (!price || price === 0) return '0.00 €';
    return `${price.toFixed(2)} €`;
  };

  /**
   * Handle click
   */
  const handleClick = () => {
    if (interactive && onClick) {
      onClick(product);
    }
  };

  return (
    <ProductListItem
      className={className}
      data-testid={testId}
      data-product-id={product.id}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <ProductContent>
        <ProductName>
          {getProductName()}
        </ProductName>
        <ProductPrice>
          {formatPrice(product.price)}
        </ProductPrice>
      </ProductContent>
      
      {getProductDescription() && (
        <ProductDescription>
          {getProductDescription()}
        </ProductDescription>
      )}
    </ProductListItem>
  );
});

/**
 * Default export
 */
export default MenuProductCard;