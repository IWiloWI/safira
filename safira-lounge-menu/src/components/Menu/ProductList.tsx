import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import PageLayout from '../Layout/PageLayout';

const NoProductsMessage = styled(motion.div)`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Aldrich', sans-serif;
  font-size: 1.2rem;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.3;
`;

interface Product {
  id: string;
  name: string | { [key: string]: string };
  description?: string | { [key: string]: string };
  price?: number;
  sizes?: { size: string; price: number }[];
  available: boolean;
  categoryId?: string;
  badges?: {
    neu: boolean;
    kurze_zeit: boolean;
    beliebt: boolean;
  };
}

interface ProductListProps {
  products: Product[];
  language: string;
  categoryName?: string;
  showControls?: boolean;
  onBack?: () => void;
  setLanguage?: (lang: 'de' | 'da' | 'en') => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  subcategoryTabs?: React.ReactNode;
  customContent?: React.ReactNode;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  language, 
  categoryName, 
  showControls,
  onBack,
  setLanguage,
  searchQuery,
  setSearchQuery,
  subcategoryTabs,
  customContent
}) => {
  // If custom content is provided, just render it directly in PageLayout
  if (customContent) {
    return (
      <PageLayout
        title={categoryName || ''}
        showBackButton={showControls && !!onBack}
        backButtonPath="/menu"
        onBackClick={onBack}
        showLanguageSelector={showControls && !!setLanguage}
        showSearch={showControls && !!setSearchQuery}
        searchQuery={searchQuery || ''}
        onSearchChange={setSearchQuery}
        categories={subcategoryTabs}
      >
        {customContent}
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={categoryName || ''}
      showBackButton={showControls && !!onBack}
      backButtonPath="/menu"
      onBackClick={onBack}
      showLanguageSelector={showControls && !!setLanguage}
      showSearch={showControls && !!setSearchQuery}
      searchQuery={searchQuery || ''}
      onSearchChange={setSearchQuery}
      categories={subcategoryTabs}
    >
      {products.length === 0 ? (
        <NoProductsMessage
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <EmptyIcon>🔍</EmptyIcon>
          <p>Keine Produkte gefunden</p>
        </NoProductsMessage>
      ) : (
        products.map((product, index) => (
          <ProductCard
            key={`${product.categoryId}-${product.id}`}
            product={product}
            language={language}
            index={index}
          />
        ))
      )}
    </PageLayout>
  );
};

export default ProductList;