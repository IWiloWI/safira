/**
 * Product Grid Component
 * Displays products in a responsive grid layout with animations
 */

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuProductCard } from './MenuProductCard';
import { MenuLoading } from './MenuLoading';
import { Product, Language } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';

// Styled components
const GridContainer = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    padding: 0 15px;
  }
`;

const Grid = styled(motion.div)<{ $columns: number; $gap: number }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const EmptyState = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Aldrich', sans-serif;
  min-height: 300px;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.8);
`;

const EmptyMessage = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  max-width: 400px;
  line-height: 1.5;
`;

const LoadMoreButton = styled(motion.button)`
  background: linear-gradient(145deg, rgba(255, 65, 251, 0.8), rgba(255, 20, 147, 0.8));
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  margin: 30px auto;
  display: block;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 65, 251, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 65, 251, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultsInfo = styled(motion.div)`
  text-align: center;
  margin-bottom: 20px;
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const GridControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 5px;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active 
    ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
    : 'transparent'
  };
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
      : 'rgba(255, 255, 255, 0.1)'
    };
  }
`;

const SortSelect = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px 12px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  
  option {
    background: #1a1a1a;
    color: white;
  }
`;

// Component interfaces
export interface ProductGridProps {
  /** Products to display */
  products: Product[];
  /** Current language */
  language: Language;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state icon */
  emptyIcon?: string;
  /** Grid layout configuration */
  layout?: {
    columns?: number;
    gap?: number;
    minItemWidth?: number;
  };
  /** Product click handler */
  onProductClick?: (product: Product) => void;
  /** Load more functionality */
  loadMore?: {
    hasMore: boolean;
    onLoadMore: () => void;
    isLoading: boolean;
  };
  /** Pagination */
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  /** Show grid controls */
  showControls?: boolean;
  /** Sort options */
  sortOptions?: {
    field: 'name' | 'price' | 'brand';
    direction: 'asc' | 'desc';
    onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  };
  /** View mode */
  viewMode?: 'grid' | 'list';
  /** View mode change handler */
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  /** Items per page for virtual scrolling */
  itemsPerPage?: number;
  /** Virtual scrolling enabled */
  virtualScrolling?: boolean;
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Product Grid Component
 * Displays products in a responsive grid with advanced features
 */
export const ProductGrid: React.FC<ProductGridProps> = React.memo(({
  products,
  language,
  isLoading = false,
  error = null,
  emptyMessage,
  emptyIcon = '🍽️',
  layout = {},
  onProductClick,
  loadMore,
  pagination,
  showControls = false,
  sortOptions,
  viewMode = 'grid',
  onViewModeChange,
  itemsPerPage = 50,
  virtualScrolling = false,
  className,
  testId = 'product-grid'
}) => {
  const { isMobile, isTablet } = useResponsive();
  
  const {
    columns = isMobile ? 1 : isTablet ? 2 : 3,
    gap = 20,
    minItemWidth = 280
  } = layout;

  /**
   * Get localized text
   */
  const getText = (key: string) => {
    const texts: Record<string, Record<Language, string>> = {
      noProducts: {
        de: 'Keine Produkte gefunden',
        da: 'Ingen produkter fundet',
        en: 'No products found',
        tr: 'Ürün bulunamadı',
        it: 'Nessun prodotto trovato'
      },
      noProductsMessage: {
        de: 'Es sind derzeit keine Produkte in dieser Kategorie verfügbar.',
        da: 'Der er i øjeblikket ingen produkter tilgængelige i denne kategori.',
        en: 'There are currently no products available in this category.',
        tr: 'Bu kategoride şu anda mevcut ürün bulunmamaktadır.',
        it: 'Al momento non ci sono prodotti disponibili in questa categoria.'
      },
      loadMore: {
        de: 'Mehr laden',
        da: 'Indlæs flere',
        en: 'Load more',
        tr: 'Daha fazla yükle',
        it: 'Carica di più'
      },
      loading: {
        de: 'Lädt...',
        da: 'Indlæser...',
        en: 'Loading...',
        tr: 'Yükleniyor...',
        it: 'Caricamento...'
      },
      resultsCount: {
        de: 'Ergebnisse',
        da: 'resultater',
        en: 'results',
        tr: 'sonuç',
        it: 'risultati'
      },
      sortBy: {
        de: 'Sortieren nach',
        da: 'Sortér efter',
        en: 'Sort by',
        tr: 'Sırala',
        it: 'Ordina per'
      },
      sortName: {
        de: 'Name',
        da: 'Navn',
        en: 'Name',
        tr: 'İsim',
        it: 'Nome'
      },
      sortPrice: {
        de: 'Preis',
        da: 'Pris',
        en: 'Price',
        tr: 'Fiyat',
        it: 'Prezzo'
      },
      sortBrand: {
        de: 'Marke',
        da: 'Mærke',
        en: 'Brand',
        tr: 'Marka',
        it: 'Marca'
      }
    };
    
    return texts[key]?.[language] || texts[key]?.de || key;
  };

  /**
   * Sort products based on current sort options
   */
  const sortedProducts = useMemo(() => {
    if (!sortOptions) return products;
    
    const { field, direction } = sortOptions;
    
    return [...products].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;
      
      switch (field) {
        case 'name':
          valueA = typeof a.name === 'string' ? a.name : a.name[language] || a.name.de || '';
          valueB = typeof b.name === 'string' ? b.name : b.name[language] || b.name.de || '';
          break;
        case 'price':
          valueA = a.price || (a.sizes?.[0]?.price) || 0;
          valueB = b.price || (b.sizes?.[0]?.price) || 0;
          break;
        case 'brand':
          valueA = a.brand || '';
          valueB = b.brand || '';
          break;
        default:
          return 0;
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB);
        return direction === 'asc' ? comparison : -comparison;
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      return 0;
    });
  }, [products, sortOptions, language]);

  /**
   * Paginated products for virtual scrolling
   */
  const displayedProducts = useMemo(() => {
    if (!virtualScrolling) return sortedProducts;
    
    const startIndex = 0;
    const endIndex = itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, virtualScrolling, itemsPerPage]);

  /**
   * Animation variants
   */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  /**
   * Render grid controls
   */
  const renderControls = () => {
    if (!showControls) return null;
    
    return (
      <GridControls>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* View mode toggle */}
          {onViewModeChange && (
            <ViewToggle>
              <ViewButton
                $active={viewMode === 'grid'}
                onClick={() => onViewModeChange('grid')}
                aria-label="Grid view"
              >
                ⊞
              </ViewButton>
              <ViewButton
                $active={viewMode === 'list'}
                onClick={() => onViewModeChange('list')}
                aria-label="List view"
              >
                ☰
              </ViewButton>
            </ViewToggle>
          )}
          
          {/* Sort selector */}
          {sortOptions && (
            <SortSelect
              value={`${sortOptions.field}-${sortOptions.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                sortOptions.onSortChange(field, direction as 'asc' | 'desc');
              }}
            >
              <option value={`name-asc`}>{getText('sortName')} A-Z</option>
              <option value={`name-desc`}>{getText('sortName')} Z-A</option>
              <option value={`price-asc`}>{getText('sortPrice')} ↑</option>
              <option value={`price-desc`}>{getText('sortPrice')} ↓</option>
              <option value={`brand-asc`}>{getText('sortBrand')} A-Z</option>
              <option value={`brand-desc`}>{getText('sortBrand')} Z-A</option>
            </SortSelect>
          )}
        </div>
      </GridControls>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <EmptyState
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <EmptyIcon>{emptyIcon}</EmptyIcon>
      <EmptyTitle>{getText('noProducts')}</EmptyTitle>
      <EmptyMessage>
        {emptyMessage || getText('noProductsMessage')}
      </EmptyMessage>
    </EmptyState>
  );

  /**
   * Render loading state
   */
  if (isLoading && products.length === 0) {
    return (
      <GridContainer className={className} data-testid={testId}>
        <MenuLoading 
          type="skeleton" 
          showProductSkeleton 
          skeletonCount={6}
          text={getText('loading')}
        />
      </GridContainer>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <GridContainer className={className} data-testid={testId}>
        <EmptyState>
          <EmptyIcon>⚠️</EmptyIcon>
          <EmptyTitle>Error</EmptyTitle>
          <EmptyMessage>{error}</EmptyMessage>
        </EmptyState>
      </GridContainer>
    );
  }

  /**
   * Render empty state
   */
  if (products.length === 0) {
    return (
      <GridContainer className={className} data-testid={testId}>
        {renderEmptyState()}
      </GridContainer>
    );
  }

  return (
    <GridContainer className={className} data-testid={testId}>
      {renderControls()}
      
      <Grid
        $columns={columns}
        $gap={gap}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {displayedProducts.map((product, index) => (
            <motion.div
              key={`${product.id}-${index}`}
              variants={itemVariants}
              layout
            >
              <MenuProductCard
                product={product}
                language={language}
                onClick={onProductClick}
                interactive={!!onProductClick}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Grid>
      
      {/* Load more button */}
      {loadMore && loadMore.hasMore && (
        <LoadMoreButton
          onClick={loadMore.onLoadMore}
          disabled={loadMore.isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loadMore.isLoading ? getText('loading') : getText('loadMore')}
        </LoadMoreButton>
      )}
    </GridContainer>
  );
});

/**
 * Default export
 */
export default ProductGrid;