/**
 * Home Search Results Component
 * Displays search results grouped by category on the home page
 */

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const ResultsContainer = styled(motion.div)`
  width: 100%;
  max-width: 900px;
  margin: 0 auto 40px;
  padding: 0 20px;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: rgba(255, 65, 251, 0.1);
  border: 1px solid rgba(255, 65, 251, 0.3);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const ResultsCount = styled.span`
  font-family: 'Aldrich', sans-serif;
  color: white;
  font-size: 1rem;
`;

const ClearButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 65, 251, 0.5);
  border-radius: 20px;
  padding: 8px 16px;
  color: #FF41FB;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 65, 251, 0.2);
    border-color: #FF41FB;
  }
`;

const CategoryGroup = styled(motion.div)`
  margin-bottom: 30px;
`;

const CategoryLabel = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: #FF41FB;
  text-transform: uppercase;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(255, 65, 251, 0.3);
`;

const SubcategoryLabel = styled.h4`
  font-family: 'Aldrich', sans-serif;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 15px 0 10px;
  padding-left: 10px;
  border-left: 3px solid rgba(255, 65, 251, 0.5);
`;

const ProductList = styled.div`
  display: grid;
  gap: 15px;
`;

const ProductItem = styled(motion.div)`
  background: rgba(255, 65, 251, 0.05);
  border: 1px solid rgba(255, 65, 251, 0.2);
  border-radius: 15px;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 65, 251, 0.1);
    border-color: rgba(255, 65, 251, 0.4);
    transform: translateX(5px);
  }
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-family: 'Aldrich', sans-serif;
  color: white;
  font-size: 1.1rem;
  margin-bottom: 5px;
`;

const ProductDescription = styled.div`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ProductPrice = styled.div`
  font-family: 'Aldrich', sans-serif;
  color: #FF41FB;
  font-size: 1.2rem;
  font-weight: bold;
  margin-left: 15px;
  white-space: nowrap;
`;

const NoResults = styled(motion.div)`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Aldrich', sans-serif;
  font-size: 1.1rem;
`;

interface HomeSearchResultsProps {
  searchQuery: string;
  products: Product[];
  onClearSearch: () => void;
  getProductName: (name: any, language?: string) => string;
  getProductDescription: (description: any, language?: string) => string;
}

const HomeSearchResults: React.FC<HomeSearchResultsProps> = ({
  searchQuery,
  products,
  onClearSearch,
  getProductName,
  getProductDescription
}) => {
  const { language } = useLanguage();

  /**
   * Group products by category and subcategory
   */
  const groupedProducts = useMemo(() => {
    const groups: Record<string, Record<string, Product[]>> = {};

    products.forEach(product => {
      // Get category name (use categoryName if available, otherwise use categoryId)
      const categoryName = (product as any).categoryName
        ? getProductName((product as any).categoryName, language)
        : product.categoryId || 'Andere';

      // Get subcategory name if available
      const subcategoryName = (product as any).subcategoryName
        ? getProductName((product as any).subcategoryName, language)
        : 'Allgemein';

      if (!groups[categoryName]) {
        groups[categoryName] = {};
      }

      if (!groups[categoryName][subcategoryName]) {
        groups[categoryName][subcategoryName] = [];
      }

      groups[categoryName][subcategoryName].push(product);
    });

    return groups;
  }, [products, language, getProductName]);

  /**
   * Format product price
   */
  const formatPrice = (product: Product): string => {
    if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      const prices = product.sizes.map(s => `${s.price}€`).join(' / ');
      return prices;
    }
    return product.price ? `${product.price}€` : '';
  };

  if (!searchQuery) {
    return null;
  }

  return (
    <AnimatePresence>
      <ResultsContainer
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <ResultsHeader>
          <ResultsCount>
            {products.length} {products.length === 1 ? 'Ergebnis' : 'Ergebnisse'} gefunden
          </ResultsCount>
          <ClearButton onClick={onClearSearch}>
            Suche löschen
          </ClearButton>
        </ResultsHeader>

        {products.length === 0 ? (
          <NoResults
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Keine Produkte gefunden für "{searchQuery}"
          </NoResults>
        ) : (
          Object.entries(groupedProducts).map(([categoryName, subcategories]) => (
            <CategoryGroup
              key={categoryName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CategoryLabel>{categoryName}</CategoryLabel>
              {Object.entries(subcategories).map(([subcategoryName, subcategoryProducts]) => (
                <div key={subcategoryName}>
                  {subcategoryName !== 'Allgemein' && (
                    <SubcategoryLabel>{subcategoryName}</SubcategoryLabel>
                  )}
                  <ProductList>
                    {subcategoryProducts.map((product, index) => (
                      <ProductItem
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ProductInfo>
                          <ProductName>
                            {getProductName(product.name, language)}
                          </ProductName>
                          {product.description && (
                            <ProductDescription>
                              {getProductDescription(product.description, language)}
                            </ProductDescription>
                          )}
                        </ProductInfo>
                        {formatPrice(product) && (
                          <ProductPrice>{formatPrice(product)}</ProductPrice>
                        )}
                      </ProductItem>
                    ))}
                  </ProductList>
                </div>
              ))}
            </CategoryGroup>
          ))
        )}
      </ResultsContainer>
    </AnimatePresence>
  );
};

export default HomeSearchResults;
