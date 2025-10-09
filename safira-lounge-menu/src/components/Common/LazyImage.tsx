/**
 * LazyImage Component
 * 
 * Optimized image loading component with progressive loading,
 * WebP support, placeholder handling, and performance monitoring.
 */

import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useLazyImage } from '../../hooks/useIntersectionObserver';
import { imageOptimization } from '../../utils/performance';

// Loading animation
const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

// Fade in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Styled components
const ImageContainer = styled.div<{
  $width?: string | number;
  $height?: string | number;
  $aspectRatio?: string;
  $borderRadius?: string;
}>`
  position: relative;
  display: inline-block;
  overflow: hidden;
  
  ${props => props.$width && css`
    width: ${typeof props.$width === 'number' ? `${props.$width}px` : props.$width};
  `}
  
  ${props => props.$height && css`
    height: ${typeof props.$height === 'number' ? `${props.$height}px` : props.$height};
  `}
  
  ${props => props.$aspectRatio && css`
    aspect-ratio: ${props.$aspectRatio};
  `}
  
  ${props => props.$borderRadius && css`
    border-radius: ${props.$borderRadius};
  `}
`;

const PlaceholderContainer = styled.div<{ $showShimmer: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.$showShimmer && css`
    background: linear-gradient(
      -90deg,
      #f0f0f0 0%,
      #f8f8f8 50%,
      #f0f0f0 100%
    );
    background-size: 400px 100%;
    animation: ${shimmer} 1.2s ease-in-out infinite;
  `}
`;

const Image = styled.img<{
  $isLoaded: boolean;
  $objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}>`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  transition: opacity 0.3s ease;
  
  ${props => props.$isLoaded ? css`
    opacity: 1;
    animation: ${fadeIn} 0.3s ease;
  ` : css`
    opacity: 0;
  `}
`;

const ErrorContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c62828;
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
  
  &::before {
    content: '🖼️';
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
`;

const ProgressBar = styled.div<{ $progress: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: rgba(255, 65, 251, 0.8);
  width: ${props => props.$progress}%;
  transition: width 0.2s ease;
`;

// Component interfaces
export interface LazyImageProps {
  /** Image source URL */
  src: string;
  /** Alternative text */
  alt: string;
  /** Image width */
  width?: string | number;
  /** Image height */
  height?: string | number;
  /** Aspect ratio (e.g., "16/9", "1/1") */
  aspectRatio?: string;
  /** Border radius */
  borderRadius?: string;
  /** Object fit property */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Placeholder component or URL */
  placeholder?: React.ReactNode | string;
  /** Show shimmer loading effect */
  showShimmer?: boolean;
  /** Show loading progress */
  showProgress?: boolean;
  /** Enable WebP optimization */
  enableWebP?: boolean;
  /** Image quality (1-100) */
  quality?: number;
  /** Responsive image sizes attribute */
  sizes?: string;
  /** Use optimized responsive images */
  useResponsive?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode;
  /** Intersection observer options */
  observerOptions?: {
    rootMargin?: string;
    threshold?: number;
  };
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: string) => void;
  /** Callback when loading starts */
  onLoadStart?: () => void;
  /** Callback for loading progress */
  onProgress?: (progress: number) => void;
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Preload priority for LCP optimization */
  fetchpriority?: 'high' | 'low' | 'auto';
  /** Decode hint */
  decoding?: 'sync' | 'async' | 'auto';
  /** Loading strategy */
  loading?: 'lazy' | 'eager';
}

/**
 * LazyImage Component
 * 
 * High-performance image component with lazy loading, progressive enhancement,
 * and comprehensive optimization features.
 */
export const LazyImage: React.FC<LazyImageProps> = memo(({
  src,
  alt,
  width,
  height,
  aspectRatio,
  borderRadius,
  objectFit = 'cover',
  placeholder,
  showShimmer = true,
  showProgress = false,
  enableWebP = true,
  quality = 80,
  sizes,
  className,
  loadingComponent,
  errorComponent,
  observerOptions = {},
  onLoad,
  onError,
  onLoadStart,
  onProgress,
  enablePerformanceMonitoring = true,
  fetchpriority = 'auto',
  decoding = 'async',
  loading = 'lazy'
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isWebPSupported, setIsWebPSupported] = useState<boolean | null>(null);
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const loadStartTime = useRef<number>(0);

  // Intersection observer for lazy loading
  const {
    ref,
    imageSrc,
    isLoaded,
    isLoading,
    error,
    isIntersecting
  } = useLazyImage(src, {
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px',
    ...observerOptions
  });

  // Check WebP support
  useEffect(() => {
    if (enableWebP) {
      imageOptimization.isWebPSupported().then(setIsWebPSupported);
    }
  }, [enableWebP]);

  // Generate optimized source
  useEffect(() => {
    if (src) {
      const widthNum = typeof width === 'number' ? width : 
                     typeof width === 'string' ? parseInt(width) : undefined;
      const heightNum = typeof height === 'number' ? height : 
                       typeof height === 'string' ? parseInt(height) : undefined;

      const optimized = imageOptimization.getOptimizedSrc(src, {
        width: widthNum,
        height: heightNum,
        quality,
        format: enableWebP && isWebPSupported ? 'webp' : undefined
      });

      setOptimizedSrc(optimized);
    }
  }, [src, width, height, quality, enableWebP, isWebPSupported]);

  // Handle loading start
  useEffect(() => {
    if (isLoading && enablePerformanceMonitoring) {
      loadStartTime.current = performance.now();
      onLoadStart?.();
    }
  }, [isLoading, enablePerformanceMonitoring, onLoadStart]);

  // Handle load completion
  useEffect(() => {
    if (isLoaded) {
      if (enablePerformanceMonitoring && loadStartTime.current > 0) {
        const loadTime = performance.now() - loadStartTime.current;
        console.log(`[LazyImage] Load time: ${loadTime.toFixed(2)}ms for ${src}`);
      }
      onLoad?.();
    }
  }, [isLoaded, enablePerformanceMonitoring, src, onLoad]);

  // Handle error
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Simulate loading progress (for demonstration)
  useEffect(() => {
    if (isLoading && showProgress) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          const next = prev + Math.random() * 20;
          if (next >= 90) {
            clearInterval(interval);
            return 90;
          }
          onProgress?.(next);
          return next;
        });
      }, 100);

      return () => clearInterval(interval);
    } else if (isLoaded) {
      setLoadingProgress(100);
      onProgress?.(100);
    }
  }, [isLoading, isLoaded, showProgress, onProgress]);

  /**
   * Render placeholder content
   */
  const renderPlaceholder = () => {
    if (placeholder) {
      if (typeof placeholder === 'string') {
        return <img src={placeholder} alt="" style={{ width: '100%', height: '100%', objectFit }} loading="lazy" />;
      }
      return placeholder;
    }

    return (
      <PlaceholderContainer $showShimmer={showShimmer}>
        {!showShimmer && '🖼️'}
      </PlaceholderContainer>
    );
  };

  /**
   * Render loading component
   */
  const renderLoading = () => {
    if (loadingComponent) {
      return loadingComponent;
    }

    return (
      <>
        {renderPlaceholder()}
        {showProgress && (
          <ProgressBar $progress={loadingProgress} />
        )}
      </>
    );
  };

  /**
   * Render error component
   */
  const renderError = () => {
    if (errorComponent) {
      return errorComponent;
    }

    return (
      <ErrorContainer>
        <div>Failed to load image</div>
        {error && <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{error}</div>}
      </ErrorContainer>
    );
  };

  /**
   * Create responsive srcSet
   */
  const createSrcSet = () => {
    if (!enableWebP || !isWebPSupported) return undefined;

    const widthNum = typeof width === 'number' ? width : 
                    typeof width === 'string' ? parseInt(width) : undefined;

    if (!widthNum) return undefined;

    const breakpoints = [0.5, 1, 1.5, 2].map(scale => Math.round(widthNum * scale));
    
    return breakpoints
      .map(w => `${imageOptimization.getOptimizedSrc(src, { width: w, format: 'webp', quality })} ${w}w`)
      .join(', ');
  };

  return (
    <ImageContainer
      ref={ref}
      className={className}
      $width={width}
      $height={height}
      $aspectRatio={aspectRatio}
      $borderRadius={borderRadius}
    >
      {/* Loading State */}
      {(isLoading || !isIntersecting) && renderLoading()}

      {/* Error State */}
      {error && renderError()}

      {/* Loaded Image */}
      {imageSrc && (
        <Image
          src={optimizedSrc || imageSrc}
          srcSet={createSrcSet()}
          sizes={sizes}
          alt={alt}
          $isLoaded={isLoaded}
          $objectFit={objectFit}
          decoding={decoding}
          loading={loading}
          fetchPriority={fetchpriority}
          onLoad={() => {
            // Image load event
          }}
          onError={() => {
            // Image error event
          }}
        />
      )}
    </ImageContainer>
  );
});

LazyImage.displayName = 'LazyImage';

/**
 * Higher-order component for adding lazy loading to any image
 */
export const withLazyLoading = <P extends { src: string; alt: string }>(
  ImageComponent: React.ComponentType<P>
) => {
  const LazyImageWrapper = React.forwardRef<HTMLImageElement, P>((props, ref) => {
    const { ref: observerRef, isIntersecting } = useLazyImage(props.src);

    return (
      <div ref={observerRef}>
        {isIntersecting && <ImageComponent {...props as any} />}
      </div>
    );
  });

  LazyImageWrapper.displayName = `withLazyLoading(${ImageComponent.displayName || ImageComponent.name})`;
  return LazyImageWrapper;
};

/**
 * Utility function to preload images
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Utility function to preload multiple images
 */
export const preloadImages = async (sources: string[]): Promise<void[]> => {
  return Promise.all(sources.map(preloadImage));
};

export default LazyImage;