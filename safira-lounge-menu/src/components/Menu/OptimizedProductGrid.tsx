/**
 * Optimized Product Grid Component
 * Enhanced version with advanced performance optimizations:
 * - React.memo with deep comparison
 * - useMemo for expensive calculations
 * - useCallback for event handlers
 * - Virtual scrolling support
 * - Debounced interactions
 * - Memory leak prevention
 */

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuProductCard } from './MenuProductCard';
import { MenuLoading } from './MenuLoading';
import { VirtualList } from '../Common/VirtualList';
import { LazyImage } from '../Common/LazyImage';
import { Product, Language } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { reactPerformance, performanceMonitor } from '../../utils/performance';

// Styled components (memoized to prevent recreation)
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${props => props.$gap}px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: ${props => Math.max(15, props.$gap - 5)}px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const VirtualGridContainer = styled.div<{ $height: string }>`
  height: ${props => props.$height};
  width: 100%;
`;

const ProductCardWrapper = styled(motion.div)`
  height: 100%;
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

const PerformanceIndicator = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-family: monospace;
  z-index: 10000;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: none;
`;

// Component interfaces
export interface OptimizedProductGridProps {
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
    itemHeight?: number;
  };
  /** Product click handler */
  onProductClick?: (product: Product) => void;
  /** Load more functionality */
  loadMore?: {
    hasMore: boolean;
    onLoadMore: () => void;
    isLoading: boolean;
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
  viewMode?: 'grid' | 'list' | 'virtual';
  /** View mode change handler */
  onViewModeChange?: (mode: 'grid' | 'list' | 'virtual') => void;
  /** Virtual scrolling configuration */
  virtualScrolling?: {
    enabled: boolean;
    itemHeight: number;
    containerHeight: string;
    overscan?: number;
  };
  /** Performance monitoring */
  performanceMonitoring?: {
    enabled: boolean;
    showIndicator?: boolean;
    logMetrics?: boolean;
  };
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Memoized Product Card Component
 * Prevents unnecessary re-renders when parent updates
 */
const MemoizedProductCard = React.memo<{
  product: Product;
  language: Language;
  onClick?: (product: Product) => void;
  style?: React.CSSProperties;
  index: number;
}>(({ product, language, onClick, style, index }) => {
  // Use performance monitoring
  const renderTime = reactPerformance.useRenderTime(`ProductCard-${index}`);
  
  // Memoized click handler to prevent recreation
  const handleClick = useCallback(() => {
    onClick?.(product);
  }, [onClick, product]);

  return (
    <ProductCardWrapper style={style}>
      <MenuProductCard
        product={product}
        language={language}
        onClick={handleClick}
        interactive={!!onClick}
      />
    </ProductCardWrapper>
  );
}, (prevProps, nextProps) => {
  // Deep comparison for memo optimization
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.language === nextProps.language &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.index === nextProps.index &&
    JSON.stringify(prevProps.product) === JSON.stringify(nextProps.product)
  );
});

MemoizedProductCard.displayName = 'MemoizedProductCard';

/**
 * Optimized Product Grid Component
 * High-performance grid with virtual scrolling and advanced optimizations
 */
export const OptimizedProductGrid: React.FC<OptimizedProductGridProps> = React.memo(({
  products,
  language,
  isLoading = false,
  error = null,
  emptyMessage,
  emptyIcon = '🍽️',
  layout = {},
  onProductClick,
  loadMore,
  showControls = false,
  sortOptions,
  viewMode = 'grid',
  onViewModeChange,
  virtualScrolling = { enabled: false, itemHeight: 400, containerHeight: '70vh' },
  performanceMonitoring = { enabled: false, showIndicator: false, logMetrics: false },
  className,
  testId = 'optimized-product-grid'
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(performance.now());

  // Layout configuration with responsive defaults
  const {
    columns = isMobile ? 1 : isTablet ? 2 : 3,
    gap = 20,
    minItemWidth = 280,
    itemHeight = 400
  } = layout;

  // Performance monitoring
  useEffect(() => {
    renderCountRef.current += 1;
    
    if (performanceMonitoring.enabled) {
      const renderTime = performance.now() - lastRenderTime.current;
      const metrics = performanceMonitor.getCurrentMetrics();
      
      setPerformanceMetrics({
        renderCount: renderCountRef.current,
        renderTime: renderTime.toFixed(2),
        productsCount: products.length,
        memoryUsage: (metrics.memoryUsage / 1024 / 1024).toFixed(2)
      });

      if (performanceMonitoring.logMetrics) {
        console.log(`[OptimizedProductGrid] Render #${renderCountRef.current}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          productsCount: products.length,
          memoryUsage: `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`
        });
      }
    }
    
    lastRenderTime.current = performance.now();
  });

  // Memoized localization function
  const getText = useCallback((key: string) => {
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
      loading: {
        de: 'Lädt...',
        da: 'Indlæser...',
        en: 'Loading...',
        tr: 'Yükleniyor...',
        it: 'Caricamento...'
      }
    };
    
    return texts[key]?.[language] || texts[key]?.de || key;
  }, [language]);

  // Memoized sorted products with performance optimization
  const sortedProducts = useMemo(() => {
    if (!sortOptions || products.length === 0) return products;
    
    const startTime = performance.now();
    const { field, direction } = sortOptions;
    
    const sorted = [...products].sort((a, b) => {
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

    if (performanceMonitoring.logMetrics) {
      const sortTime = performance.now() - startTime;
      console.log(`[OptimizedProductGrid] Sort time: ${sortTime.toFixed(2)}ms for ${products.length} products`);
    }

    return sorted;
  }, [products, sortOptions, language, performanceMonitoring.logMetrics]);

  // Debounced product click handler
  const debouncedProductClick = useDebouncedCallback(
    useCallback((product: Product) => {
      onProductClick?.(product);
    }, [onProductClick]),
    150,
    { leading: true, trailing: false }
  );

  // Memoized product card renderer for virtual list
  const renderVirtualItem = useCallback((product: Product, index: number, style: React.CSSProperties) => {
    return (
      <MemoizedProductCard
        key={product.id}
        product={product}
        language={language}
        onClick={debouncedProductClick.callback}
        style={style}
        index={index}
      />
    );
  }, [language, debouncedProductClick.callback]);

  // Memoized animation variants
  const animationVariants = useMemo(() => ({
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
          delayChildren: 0.1
        }
      }
    },
    item: {
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      }
    }
  }), []);

  // Intersection observer for lazy loading
  const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Memoized empty state
  const emptyState = useMemo(() => (
    <EmptyState
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>
        {emptyIcon}
      </div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>
        {getText('noProducts')}
      </h3>
      <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '400px', lineHeight: 1.5 }}>
        {emptyMessage || getText('noProductsMessage')}
      </p>
    </EmptyState>
  ), [emptyIcon, getText, emptyMessage]);

  // Memory leak prevention
  useEffect(() => {
    return () => {
      debouncedProductClick.cancel();
    };
  }, [debouncedProductClick]);

  // Loading state
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

  // Error state
  if (error) {
    return (
      <GridContainer className={className} data-testid={testId}>
        <EmptyState>
          <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>⚠️</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Error
          </h3>
          <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            {error}
          </p>
        </EmptyState>
      </GridContainer>
    );
  }

  // Empty state
  if (sortedProducts.length === 0) {
    return (
      <GridContainer className={className} data-testid={testId}>
        {emptyState}
      </GridContainer>
    );
  }

  // Virtual scrolling mode
  if (viewMode === 'virtual' && virtualScrolling.enabled) {
    return (
      <GridContainer className={className} data-testid={testId}>
        <VirtualGridContainer $height={virtualScrolling.containerHeight}>
          <VirtualList
            items={sortedProducts}
            itemHeight={virtualScrolling.itemHeight}
            height={virtualScrolling.containerHeight}
            overscan={virtualScrolling.overscan || 5}
            renderItem={renderVirtualItem}
            enableInfiniteScroll={!!loadMore}
            onLoadMore={loadMore?.onLoadMore}
            isLoading={loadMore?.isLoading || false}
            enablePerformanceMonitoring={performanceMonitoring.enabled}
          />
        </VirtualGridContainer>
        
        {/* Performance indicator */}
        {performanceMonitoring.showIndicator && performanceMetrics && (
          <PerformanceIndicator $visible={true}>
            Renders: {performanceMetrics.renderCount} | 
            Time: {performanceMetrics.renderTime}ms | 
            Items: {performanceMetrics.productsCount} |
            Memory: {performanceMetrics.memoryUsage}MB
          </PerformanceIndicator>
        )}
      </GridContainer>
    );
  }

  // Standard grid mode with optimizations
  return (
    <GridContainer 
      className={className} 
      data-testid={testId}
      ref={intersectionRef}
    >
      <Grid
        $columns={columns}
        $gap={gap}
        variants={animationVariants.container}
        initial="hidden"
        animate={isIntersecting ? "visible" : "hidden"}
      >
        <AnimatePresence mode="popLayout">
          {sortedProducts.map((product, index) => (
            <motion.div
              key={`${product.id}-${index}`}
              variants={animationVariants.item}
              layout
            >
              <MemoizedProductCard
                product={product}
                language={language}
                onClick={debouncedProductClick.callback}
                index={index}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Grid>

      {/* Performance indicator */}
      {performanceMonitoring.showIndicator && performanceMetrics && (
        <PerformanceIndicator $visible={true}>
          Renders: {performanceMetrics.renderCount} | 
          Time: {performanceMetrics.renderTime}ms | 
          Items: {performanceMetrics.productsCount} |
          Memory: {performanceMetrics.memoryUsage}MB
        </PerformanceIndicator>
      )}
    </GridContainer>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  const productsChanged = 
    prevProps.products.length !== nextProps.products.length ||
    prevProps.products.some((product, index) => 
      product.id !== nextProps.products[index]?.id ||
      JSON.stringify(product) !== JSON.stringify(nextProps.products[index])
    );

  return (
    !productsChanged &&
    prevProps.language === nextProps.language &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.error === nextProps.error &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.className === nextProps.className &&
    JSON.stringify(prevProps.layout) === JSON.stringify(nextProps.layout) &&
    JSON.stringify(prevProps.sortOptions) === JSON.stringify(nextProps.sortOptions)
  );
});

OptimizedProductGrid.displayName = 'OptimizedProductGrid';

// Export with performance monitoring HOC
export default reactPerformance.withPerformanceMonitoring(
  OptimizedProductGrid,
  'OptimizedProductGrid'
);