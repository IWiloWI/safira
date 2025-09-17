/**
 * VirtualList Component
 * 
 * High-performance virtual scrolling component for rendering large lists
 * efficiently by only rendering visible items.
 */

import React, { useCallback, useMemo, memo, ReactNode, CSSProperties } from 'react';
import styled from 'styled-components';
import { useVirtualScroll, VirtualItem } from '../../hooks/useVirtualScroll';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

// Styled components
const ListContainer = styled.div<{
  $width?: string | number;
  $height?: string | number;
}>`
  position: relative;
  overflow: auto;
  
  ${props => props.$width && `width: ${typeof props.$width === 'number' ? `${props.$width}px` : props.$width};`}
  ${props => props.$height && `height: ${typeof props.$height === 'number' ? `${props.$height}px` : props.$height};`}
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.5);
    }
  }
`;

const ListContent = styled.div<{
  $totalSize: number;
  $horizontal?: boolean;
}>`
  position: relative;
  
  ${props => props.$horizontal ? `
    width: ${props.$totalSize}px;
    height: 100%;
  ` : `
    width: 100%;
    height: ${props.$totalSize}px;
  `}
`;

const ListItem = styled.div<{
  $start: number;
  $size: number;
  $horizontal?: boolean;
}>`
  position: absolute;
  
  ${props => props.$horizontal ? `
    left: ${props.$start}px;
    width: ${props.$size}px;
    height: 100%;
    top: 0;
  ` : `
    top: ${props.$start}px;
    height: ${props.$size}px;
    width: 100%;
    left: 0;
  `}
`;

const LoadingIndicator = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  z-index: 100;
`;

const ScrollTopButton = styled.button<{ $visible: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(233, 30, 99, 0.9);
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'scale(1)' : 'scale(0.8)'};
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
  
  &:hover {
    background: rgba(233, 30, 99, 1);
    transform: scale(1.1);
  }
`;

// Component interfaces
export interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Height of each item in pixels */
  itemHeight: number;
  /** Container width */
  width?: string | number;
  /** Container height */
  height: string | number;
  /** Number of items to render outside visible area */
  overscan?: number;
  /** Whether to enable horizontal scrolling */
  horizontal?: boolean;
  /** Render function for each item */
  renderItem: (item: T, index: number, style: CSSProperties) => ReactNode;
  /** Optional render function for loading state */
  renderLoading?: () => ReactNode;
  /** Optional render function for empty state */
  renderEmpty?: () => ReactNode;
  /** CSS class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
  /** Whether the list is loading more items */
  isLoading?: boolean;
  /** Whether to show scroll to top button */
  showScrollToTop?: boolean;
  /** Scroll to top threshold */
  scrollToTopThreshold?: number;
  /** Enable infinite scrolling */
  enableInfiniteScroll?: boolean;
  /** Callback when reaching end of list */
  onLoadMore?: () => void;
  /** Loading threshold for infinite scroll */
  loadMoreThreshold?: number;
  /** Callback when scroll position changes */
  onScroll?: (scrollTop: number) => void;
  /** Initial scroll position */
  initialScrollOffset?: number;
  /** Scroll behavior for programmatic scrolling */
  scrollBehavior?: ScrollBehavior;
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Test ID for testing */
  testId?: string;
}

/**
 * VirtualList Component
 * 
 * Efficiently renders large lists by virtualizing items outside the viewport.
 * Supports both vertical and horizontal scrolling, infinite loading, and
 * performance optimizations.
 */
export function VirtualList<T>({
  items,
  itemHeight,
  width,
  height,
  overscan = 5,
  horizontal = false,
  renderItem,
  renderLoading,
  renderEmpty,
  className,
  style,
  isLoading = false,
  showScrollToTop = true,
  scrollToTopThreshold = 200,
  enableInfiniteScroll = false,
  onLoadMore,
  loadMoreThreshold = 3,
  onScroll,
  initialScrollOffset = 0,
  scrollBehavior = 'smooth',
  enablePerformanceMonitoring = false,
  testId = 'virtual-list'
}: VirtualListProps<T>) {
  const containerHeight = typeof height === 'number' ? height : parseInt(height as string);
  
  // Virtual scrolling hook
  const {
    containerRef,
    scrollElementRef,
    virtualItems,
    totalSize,
    scrollOffset,
    scrollToItem,
    scrollToOffset,
    isScrolling
  } = useVirtualScroll({
    itemHeight,
    itemCount: items.length,
    containerHeight,
    overscan,
    horizontal,
    scrollBehavior,
    onScroll,
    scrollDebounce: 16
  });

  // Infinite scroll detector
  const { ref: infiniteScrollRef } = useIntersectionObserver({
    threshold: 1.0,
    rootMargin: `${loadMoreThreshold * itemHeight}px`,
    onIntersectionChange: (entry) => {
      if (entry.isIntersecting && enableInfiniteScroll && !isLoading && onLoadMore) {
        onLoadMore();
      }
    }
  });

  // Memoized render function
  const renderVirtualItem = useCallback((virtualItem: VirtualItem) => {
    const item = items[virtualItem.index];
    if (!item) return null;

    const itemStyle: CSSProperties = {
      position: 'absolute',
      [horizontal ? 'left' : 'top']: virtualItem.start,
      [horizontal ? 'width' : 'height']: virtualItem.size,
      [horizontal ? 'height' : 'width']: '100%'
    };

    return (
      <ListItem
        key={virtualItem.index}
        $start={virtualItem.start}
        $size={virtualItem.size}
        $horizontal={horizontal}
      >
        {renderItem(item, virtualItem.index, itemStyle)}
      </ListItem>
    );
  }, [items, renderItem, horizontal]);

  // Memoized virtual items rendering
  const virtualItemsElements = useMemo(() => {
    if (enablePerformanceMonitoring) {
      const startTime = performance.now();
      const elements = virtualItems.map(renderVirtualItem);
      const endTime = performance.now();
      console.log(`[VirtualList] Rendered ${virtualItems.length} items in ${(endTime - startTime).toFixed(2)}ms`);
      return elements;
    }
    return virtualItems.map(renderVirtualItem);
  }, [virtualItems, renderVirtualItem, enablePerformanceMonitoring]);

  // Scroll to top functionality
  const handleScrollToTop = useCallback(() => {
    scrollToOffset(0);
  }, [scrollToOffset]);

  // Show scroll to top button
  const showScrollButton = showScrollToTop && scrollOffset > scrollToTopThreshold;

  // Handle empty state
  if (items.length === 0) {
    return (
      <ListContainer 
        $width={width} 
        $height={height} 
        className={className}
        style={style}
        data-testid={testId}
      >
        {renderEmpty ? renderEmpty() : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#666',
            fontSize: '1.1rem'
          }}>
            No items to display
          </div>
        )}
      </ListContainer>
    );
  }

  return (
    <ListContainer
      ref={(element) => {
        containerRef(element);
        scrollElementRef(element);
      }}
      $width={width}
      $height={height}
      className={className}
      style={style}
      data-testid={testId}
      data-scroll-container
    >
      <ListContent 
        $totalSize={totalSize} 
        $horizontal={horizontal}
      >
        {/* Virtual Items */}
        {virtualItemsElements}
        
        {/* Infinite Scroll Trigger */}
        {enableInfiniteScroll && items.length > 0 && (
          <div
            ref={infiniteScrollRef}
            style={{
              position: 'absolute',
              [horizontal ? 'left' : 'top']: totalSize - (loadMoreThreshold * itemHeight),
              [horizontal ? 'width' : 'height']: 1,
              [horizontal ? 'height' : 'width']: 1,
              pointerEvents: 'none'
            }}
          />
        )}
      </ListContent>

      {/* Loading Indicator */}
      {isLoading && (
        <LoadingIndicator>
          {renderLoading ? renderLoading() : (
            <>
              <span>Loading...</span>
              <div style={{ 
                display: 'inline-block', 
                marginLeft: '8px',
                animation: 'spin 1s linear infinite'
              }}>
                ⟳
              </div>
            </>
          )}
        </LoadingIndicator>
      )}

      {/* Scroll to Top Button */}
      <ScrollTopButton
        $visible={showScrollButton}
        onClick={handleScrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        ↑
      </ScrollTopButton>

      {/* Performance Indicator (Development) */}
      {enablePerformanceMonitoring && isScrolling && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(255, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          zIndex: 1000
        }}>
          Scrolling... ({virtualItems.length} items rendered)
        </div>
      )}
    </ListContainer>
  );
}

/**
 * Memoized VirtualList to prevent unnecessary re-renders
 */
export const MemoizedVirtualList = memo(VirtualList) as typeof VirtualList;

/**
 * Hook for managing virtual list state
 */
export function useVirtualListState<T>(initialItems: T[] = []) {
  const [items, setItems] = React.useState<T[]>(initialItems);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);

  const addItems = useCallback((newItems: T[]) => {
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const prependItems = useCallback((newItems: T[]) => {
    setItems(prev => [...newItems, ...prev]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index: number, newItem: T) => {
    setItems(prev => prev.map((item, i) => i === index ? newItem : item));
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const loadMore = useCallback(async (loadFunction: () => Promise<T[]>) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newItems = await loadFunction();
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        addItems(newItems);
      }
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, addItems]);

  return {
    items,
    isLoading,
    hasMore,
    setItems,
    addItems,
    prependItems,
    removeItem,
    updateItem,
    clearItems,
    loadMore,
    setIsLoading,
    setHasMore
  };
}

export default VirtualList;