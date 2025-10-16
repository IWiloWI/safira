import React, { useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import MenuProductCard from './MenuProductCard';

const SearchResultsContainer = styled(motion.div)`
  width: 90vw;
  max-width: 900px;
  margin: 0 auto 40px;
  padding: 0 20px;

  @media (max-width: 768px) {
    width: 90vw;
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 15px 20px;
  background: rgba(255, 65, 251, 0.1);
  border: 1px solid rgba(255, 65, 251, 0.3);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const ResultsCount = styled.h3`
  font-family: 'Aldrich', sans-serif;
  color: white;
  font-size: clamp(0.9rem, 2.5vw, 1.2rem);
  margin: 0;
`;

const ClearButton = styled.button`
  background: linear-gradient(145deg, rgba(255, 65, 251, 0.2), rgba(255, 65, 251, 0.1));
  border: 1px solid rgba(255, 65, 251, 0.4);
  border-radius: 20px;
  padding: 8px 20px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: clamp(0.75rem, 2vw, 0.9rem);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(145deg, rgba(255, 65, 251, 0.3), rgba(255, 65, 251, 0.2));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 65, 251, 0.3);
  }
`;

const CategorySection = styled(motion.div)`
  margin-bottom: 30px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryHeader = styled.div`
  margin-bottom: 15px;
`;

const CategoryTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  color: white;
  text-transform: uppercase;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(255, 65, 251, 0.3);
`;

const ProductsList = styled.div`
  display: grid;
  gap: 15px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Aldrich', sans-serif;
`;

const EmptyIcon = styled.div`
  font-size: clamp(3rem, 8vw, 4rem);
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  margin: 0;
`;

interface MenuSearchResultsProps {
  products: Product[];
  searchQuery: string;
  onClear: () => void;
  getCategoryName: (product: Product) => string;
  onProductClick?: (product: Product) => void;
}

interface CategoryGroup {
  categoryName: string;
  products: Product[];
}

const MenuSearchResults: React.FC<MenuSearchResultsProps> = ({
  products,
  searchQuery,
  onClear,
  getCategoryName,
  onProductClick
}) => {
  const { language } = useLanguage();

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups: Record<string, CategoryGroup> = {};

    products.forEach(product => {
      const categoryName = getCategoryName(product);

      if (!groups[categoryName]) {
        groups[categoryName] = {
          categoryName,
          products: []
        };
      }

      groups[categoryName].products.push(product);
    });

    return Object.values(groups).sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName)
    );
  }, [products, getCategoryName]);

  if (products.length === 0) {
    return (
      <SearchResultsContainer
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <ResultsHeader>
          <ResultsCount>Keine Ergebnisse für "{searchQuery}"</ResultsCount>
          <ClearButton onClick={onClear}>Suche löschen</ClearButton>
        </ResultsHeader>
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyText>
            Keine Produkte gefunden. Versuchen Sie es mit anderen Suchbegriffen.
          </EmptyText>
        </EmptyState>
      </SearchResultsContainer>
    );
  }

  return (
    <SearchResultsContainer
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <ResultsHeader>
        <ResultsCount>{products.length} Ergebnisse für "{searchQuery}"</ResultsCount>
        <ClearButton onClick={onClear}>Suche löschen</ClearButton>
      </ResultsHeader>

      {groupedProducts.map((group, groupIndex) => (
        <CategorySection
          key={group.categoryName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: groupIndex * 0.1 }}
        >
          <CategoryHeader>
            <CategoryTitle>{group.categoryName}</CategoryTitle>
          </CategoryHeader>

          <ProductsList>
            {group.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MenuProductCard
                  product={product}
                  language={language}
                  onClick={onProductClick}
                  interactive={!!onProductClick}
                />
              </motion.div>
            ))}
          </ProductsList>
        </CategorySection>
      ))}
    </SearchResultsContainer>
  );
};

export default MenuSearchResults;
