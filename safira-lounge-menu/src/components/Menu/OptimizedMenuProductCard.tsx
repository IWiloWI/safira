/**
 * Optimized Menu Product Card Component
 * Enhanced with advanced performance optimizations:
 * - React.memo with custom comparison
 * - Lazy image loading
 * - Memoized calculations
 * - Debounced interactions
 * - Memory leak prevention
 */

import React, { useMemo, useCallback, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Product, Language, ProductBadges } from '../../types';
import { MultilingualHelpers } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { LazyImage } from '../Common/LazyImage';
import { reactPerformance } from '../../utils/performance';

// Memoized styled components
const ProductCardContainer = styled(motion.div)<{ $interactive: boolean }>`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 20px;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: ${props => props.$interactive ? 'pointer' : 'default'};
  will-change: transform, box-shadow;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #FF41FB, #FF1493, #FF41FB);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: ${props => props.$interactive ? 'translateY(-5px)' : 'none'};
    box-shadow: 0 12px 40px rgba(255, 65, 251, 0.2);
    border-color: rgba(255, 65, 251, 0.3);
    
    &::before {
      transform: scaleX(1);
    }
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 15px;
  }
`;

const ProductImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  gap: 10px;
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0; /* Prevent flex item from overflowing */
`;

const ProductName = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const BrandName = styled.div`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: #FF41FB;
  font-weight: 600;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductDescription = styled.p`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  margin: 8px 0 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
`;

const Price = styled.div`
  font-family: 'Oswald', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #FF41FB;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const SizesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
`;

const SizeOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.85rem;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  .size-name {
    color: rgba(255, 255, 255, 0.9);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .size-price {
    color: #FF41FB;
    font-weight: 600;
    white-space: nowrap;
    margin-left: 8px;
  }
`;

const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const Badge = styled.span<{ $type: keyof ProductBadges }>`
  padding: 4px 12px;
  border-radius: 15px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  
  background: ${props => {
    switch (props.$type) {
      case 'neu': return 'linear-gradient(145deg, #4CAF50, #45a049)';
      case 'kurze_zeit': return 'linear-gradient(145deg, #FF9800, #F57C00)';
      case 'beliebt': return 'linear-gradient(145deg, #E91E63, #C2185B)';
      default: return 'linear-gradient(145deg, #9C27B0, #7B1FA2)';
    }
  }};
  
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const AvailabilityIndicator = styled.div<{ $available: boolean }>`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$available ? '#4CAF50' : '#F44336'};
  box-shadow: 0 0 10px ${props => props.$available ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)'};
  z-index: 1;
`;

const LoadingSkeleton = styled.div`
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 15px;
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

// Component interfaces
export interface OptimizedMenuProductCardProps {
  /** Product data */
  product: Product;
  /** Current language */
  language: Language;
  /** Click handler */
  onClick?: (product: Product) => void;
  /** Show badges */
  showBadges?: boolean;
  /** Show availability indicator */
  showAvailability?: boolean;
  /** Show price information */
  showPrice?: boolean;
  /** Show description */
  showDescription?: boolean;
  /** Show product image */
  showImage?: boolean;
  /** Card size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether card is interactive */
  interactive?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Enable lazy loading */
  lazyLoading?: boolean;
  /** Image optimization settings */
  imageOptimization?: {
    quality?: number;
    enableWebP?: boolean;
    sizes?: string;
  };
  /** Performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Optimized Menu Product Card Component
 * High-performance product card with advanced optimizations
 */
export const OptimizedMenuProductCard: React.FC<OptimizedMenuProductCardProps> = React.memo(({
  product,
  language,
  onClick,
  showBadges = true,
  showAvailability = true,
  showPrice = true,
  showDescription = true,
  showImage = true,
  size = 'medium',
  interactive = false,
  isLoading = false,
  lazyLoading = true,
  imageOptimization = { quality: 80, enableWebP: true },
  enablePerformanceMonitoring = false,
  className,
  testId = 'optimized-menu-product-card'
}) => {
  const { isMobile } = useResponsive();
  const clickCountRef = useRef(0);

  // Performance monitoring
  const renderTime = enablePerformanceMonitoring 
    ? reactPerformance.useRenderTime(`ProductCard-${product.id}`)
    : 0;

  // Intersection observer for performance
  const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '50px'
  });

  // Memoized product name
  const productName = useMemo(() => {
    return MultilingualHelpers.getText(product.name, language);
  }, [product.name, language]);

  // Memoized product description
  const productDescription = useMemo(() => {
    if (!product.description) return '';
    return MultilingualHelpers.getText(product.description, language);
  }, [product.description, language]);

  // Memoized price formatter
  const formatPrice = useCallback((price: number) => {
    return `${price.toFixed(2)} €`;
  }, []);

  // Memoized badge text getter
  const getBadgeText = useCallback((badgeType: keyof ProductBadges) => {
    const badgeTexts: Record<keyof ProductBadges, Record<Language, string>> = {
      neu: { de: 'Neu', da: 'Ny', en: 'New', tr: 'Yeni', it: 'Nuovo' },
      kurze_zeit: { de: 'Begrenzt', da: 'Begrænset', en: 'Limited', tr: 'Sınırlı', it: 'Limitato' },
      beliebt: { de: 'Beliebt', da: 'Populær', en: 'Popular', tr: 'Popüler', it: 'Popolare' }
    };
    
    return badgeTexts[badgeType]?.[language] || badgeTexts[badgeType]?.de || badgeType;
  }, [language]);

  // Debounced click handler
  const debouncedClick = useDebouncedCallback(
    useCallback(() => {
      clickCountRef.current += 1;
      onClick?.(product);
    }, [onClick, product]),
    150,
    { leading: true, trailing: false }
  );

  // Memoized price section
  const priceSection = useMemo(() => {
    if (!showPrice) return null;

    if (product.sizes && product.sizes.length > 0) {
      return (
        <SizesContainer>
          {product.sizes.map((sizeOption, index) => (
            <SizeOption key={index}>
              <span className="size-name">{sizeOption.size || `Option ${index + 1}`}</span>
              <span className="size-price">{formatPrice(sizeOption.price)}</span>
            </SizeOption>
          ))}
        </SizesContainer>
      );
    }

    if (product.price !== undefined) {
      return (
        <PriceSection>
          <Price>{formatPrice(product.price)}</Price>
        </PriceSection>
      );
    }

    return null;
  }, [showPrice, product.sizes, product.price, formatPrice]);

  // Memoized badges
  const badges = useMemo(() => {
    if (!showBadges || !product.badges) return null;

    const activeBadges = Object.entries(product.badges)
      .filter(([_, active]) => active)
      .map(([type]) => type as keyof ProductBadges);

    if (activeBadges.length === 0) return null;

    return (
      <BadgesContainer>
        {activeBadges.map((badgeType) => (
          <Badge key={badgeType} $type={badgeType}>
            {getBadgeText(badgeType)}
          </Badge>
        ))}
      </BadgesContainer>
    );
  }, [showBadges, product.badges, getBadgeText]);

  // Memoized animation variants
  const cardVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      y: interactive ? -5 : 0,
      transition: { duration: 0.2 }
    }
  }), [interactive]);

  // Loading skeleton
  if (isLoading) {
    return (
      <ProductCardContainer 
        $interactive={false}
        className={`${className} loading`}
        style={{ background: 'rgba(255, 255, 255, 0.05)' }}
      >
        <LoadingSkeleton style={{ height: '200px', marginBottom: '15px' }} />
        <LoadingSkeleton style={{ height: '24px', marginBottom: '8px', width: '80%' }} />
        <LoadingSkeleton style={{ height: '18px', marginBottom: '8px', width: '60%' }} />
        <LoadingSkeleton style={{ height: '16px', width: '40%' }} />
      </ProductCardContainer>
    );
  }

  return (
    <ProductCardContainer
      ref={intersectionRef}
      className={className}
      data-testid={testId}
      data-product-id={product.id}
      $interactive={interactive}
      variants={cardVariants}
      initial="hidden"
      animate={isIntersecting ? "visible" : "hidden"}
      whileHover="hover"
      onClick={interactive ? debouncedClick.callback : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Select ${productName}` : undefined}
    >
      {/* Availability indicator */}
      {showAvailability && (
        <AvailabilityIndicator $available={product.available} />
      )}
      
      {/* Product image */}
      {showImage && product.imageUrl && (
        <ProductImageContainer>
          <LazyImage
            src={product.imageUrl}
            alt={productName}
            width="100%"
            height="200px"
            objectFit="cover"
            enableWebP={imageOptimization.enableWebP}
            quality={imageOptimization.quality}
            sizes={imageOptimization.sizes}
            showShimmer
            enablePerformanceMonitoring={enablePerformanceMonitoring}
            observerOptions={{
              rootMargin: '50px',
              threshold: 0.1
            }}
          />
        </ProductImageContainer>
      )}
      
      {/* Main content */}
      <ProductHeader>
        <ProductInfo>
          {product.brand && (
            <BrandName>{product.brand}</BrandName>
          )}
          <ProductName title={productName}>{productName}</ProductName>
          
          {showDescription && productDescription && (
            <ProductDescription title={productDescription}>
              {productDescription}
            </ProductDescription>
          )}
        </ProductInfo>
        
        {!product.sizes?.length && priceSection}
      </ProductHeader>
      
      {/* Sizes with prices */}
      {product.sizes?.length && priceSection}
      
      {/* Badges */}
      {badges}

      {/* Performance indicator (development) */}
      {enablePerformanceMonitoring && renderTime > 50 && (
        <div style={{
          position: 'absolute',
          top: '5px',
          left: '5px',
          background: 'rgba(255, 0, 0, 0.8)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          zIndex: 1000
        }}>
          {renderTime.toFixed(1)}ms
        </div>
      )}
    </ProductCardContainer>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo optimization
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.language === nextProps.language &&
    prevProps.interactive === nextProps.interactive &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.showBadges === nextProps.showBadges &&
    prevProps.showAvailability === nextProps.showAvailability &&
    prevProps.showPrice === nextProps.showPrice &&
    prevProps.showDescription === nextProps.showDescription &&
    prevProps.showImage === nextProps.showImage &&
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className &&
    // Deep compare only the product data that affects rendering
    JSON.stringify({
      name: prevProps.product.name,
      description: prevProps.product.description,
      price: prevProps.product.price,
      sizes: prevProps.product.sizes,
      brand: prevProps.product.brand,
      badges: prevProps.product.badges,
      available: prevProps.product.available,
      imageUrl: prevProps.product.imageUrl
    }) === JSON.stringify({
      name: nextProps.product.name,
      description: nextProps.product.description,
      price: nextProps.product.price,
      sizes: nextProps.product.sizes,
      brand: nextProps.product.brand,
      badges: nextProps.product.badges,
      available: nextProps.product.available,
      imageUrl: nextProps.product.imageUrl
    })
  );
});

OptimizedMenuProductCard.displayName = 'OptimizedMenuProductCard';

// Export with performance monitoring HOC
export default reactPerformance.withPerformanceMonitoring(
  OptimizedMenuProductCard,
  'OptimizedMenuProductCard'
);