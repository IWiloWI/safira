/**
 * useVirtualScroll Hook
 * 
 * Provides virtual scrolling functionality for efficiently rendering
 * large lists by only rendering visible items.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedCallback } from './useDebounce';

/**
 * Options for virtual scrolling
 */
export interface VirtualScrollOptions {
  /** Height of each item in pixels */
  itemHeight: number;
  /** Total number of items */
  itemCount: number;
  /** Container height in pixels */
  containerHeight: number;
  /** Number of items to render outside visible area (for smoother scrolling) */
  overscan?: number;
  /** Whether to enable horizontal scrolling */
  horizontal?: boolean;
  /** Scroll behavior when programmatically scrolling */
  scrollBehavior?: ScrollBehavior;
  /** Callback when scroll position changes */
  onScroll?: (scrollTop: number) => void;
  /** Debounce delay for scroll events */
  scrollDebounce?: number;
}

/**
 * Virtual item data
 */
export interface VirtualItem {
  /** Index of the item */
  index: number;
  /** Start position of the item */
  start: number;
  /** End position of the item */
  end: number;
  /** Size of the item */
  size: number;
  /** Whether the item is visible */
  isVisible: boolean;
}

/**
 * Virtual scroll state
 */
export interface VirtualScrollState {
  /** Current scroll offset */
  scrollOffset: number;
  /** Visible range start index */
  startIndex: number;
  /** Visible range end index */
  endIndex: number;
  /** Virtual items to render */
  virtualItems: VirtualItem[];
  /** Total size of all items */
  totalSize: number;
  /** Viewport size */
  viewportSize: number;
}

/**
 * Return type for the virtual scroll hook
 */
export interface VirtualScrollReturn extends VirtualScrollState {
  /** Ref for the container element */
  containerRef: (element: HTMLElement | null) => void;
  /** Ref for the scroll element */
  scrollElementRef: (element: HTMLElement | null) => void;
  /** Scroll to a specific item */
  scrollToItem: (index: number, align?: 'start' | 'center' | 'end' | 'auto') => void;
  /** Scroll to a specific offset */
  scrollToOffset: (offset: number) => void;
  /** Get the size of an item */
  getItemSize: (index: number) => number;
  /** Get the offset of an item */
  getItemOffset: (index: number) => number;
  /** Whether the list is scrolling */
  isScrolling: boolean;
  /** Manually trigger scroll event */
  triggerScroll: () => void;
}

/**
 * Hook for virtual scrolling
 * 
 * @param options - Virtual scroll options
 * @returns Virtual scroll state and functions
 */
export function useVirtualScroll(options: VirtualScrollOptions): VirtualScrollReturn {
  const {
    itemHeight,
    itemCount,
    containerHeight,
    overscan = 5,
    horizontal = false,
    scrollBehavior = 'smooth',
    onScroll,
    scrollDebounce = 16
  } = options;

  const [scrollOffset, setScrollOffset] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [viewportSize, setViewportSize] = useState(containerHeight);

  const containerRef = useRef<HTMLElement | null>(null);
  const scrollElementRef = useRef<HTMLElement | null>(null);
  const scrollingTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate total size
  const totalSize = useMemo(() => {
    return itemCount * itemHeight;
  }, [itemCount, itemHeight]);

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    if (itemCount === 0) {
      return { startIndex: 0, endIndex: 0 };
    }

    const start = Math.floor(scrollOffset / itemHeight);
    const visibleItemCount = Math.ceil(viewportSize / itemHeight);
    const end = Math.min(itemCount - 1, start + visibleItemCount);

    return {
      startIndex: Math.max(0, start - overscan),
      endIndex: Math.min(itemCount - 1, end + overscan)
    };
  }, [scrollOffset, itemHeight, viewportSize, itemCount, overscan]);

  // Generate virtual items
  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = [];

    for (let i = startIndex; i <= endIndex; i++) {
      const start = i * itemHeight;
      const size = itemHeight;
      const end = start + size;
      const isVisible = i >= Math.floor(scrollOffset / itemHeight) && 
                       i <= Math.floor((scrollOffset + viewportSize) / itemHeight);

      items.push({
        index: i,
        start,
        end,
        size,
        isVisible
      });
    }

    return items;
  }, [startIndex, endIndex, itemHeight, scrollOffset, viewportSize]);

  // Debounced scroll handler
  const debouncedScrollHandler = useDebouncedCallback(
    (offset: number) => {
      setScrollOffset(offset);
      onScroll?.(offset);
      setIsScrolling(false);
    },
    scrollDebounce
  );

  // Handle scroll events
  const handleScroll = useCallback((event: Event) => {
    const element = event.target as HTMLElement;
    const offset = horizontal ? element.scrollLeft : element.scrollTop;
    
    setIsScrolling(true);
    
    // Clear existing timeout
    if (scrollingTimeoutRef.current) {
      clearTimeout(scrollingTimeoutRef.current);
    }

    // Set immediate scroll offset for responsiveness
    setScrollOffset(offset);
    
    // Debounced callback for performance
    debouncedScrollHandler.callback(offset);

    // Set timeout to end scrolling state
    scrollingTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [horizontal, debouncedScrollHandler]);

  // Container ref callback
  const containerRefCallback = useCallback((element: HTMLElement | null) => {
    if (containerRef.current && scrollElementRef.current) {
      scrollElementRef.current.removeEventListener('scroll', handleScroll);
    }

    containerRef.current = element;

    if (element) {
      const scrollElement = element.closest('[data-scroll-container]') || element;
      scrollElementRef.current = scrollElement as HTMLElement;
      
      // Update viewport size
      const size = horizontal ? element.clientWidth : element.clientHeight;
      setViewportSize(size);

      // Add scroll listener
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    }
  }, [handleScroll, horizontal]);

  // Scroll element ref callback
  const scrollElementRefCallback = useCallback((element: HTMLElement | null) => {
    if (scrollElementRef.current) {
      scrollElementRef.current.removeEventListener('scroll', handleScroll);
    }

    scrollElementRef.current = element;

    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true });
    }
  }, [handleScroll]);

  // Scroll to item function
  const scrollToItem = useCallback(
    (index: number, align: 'start' | 'center' | 'end' | 'auto' = 'auto') => {
      if (!scrollElementRef.current || index < 0 || index >= itemCount) {
        return;
      }

      const itemOffset = index * itemHeight;
      let scrollToOffset = itemOffset;

      if (align === 'center') {
        scrollToOffset = itemOffset - viewportSize / 2 + itemHeight / 2;
      } else if (align === 'end') {
        scrollToOffset = itemOffset - viewportSize + itemHeight;
      } else if (align === 'auto') {
        const currentStart = scrollOffset;
        const currentEnd = scrollOffset + viewportSize;
        const itemStart = itemOffset;
        const itemEnd = itemOffset + itemHeight;

        if (itemStart < currentStart) {
          scrollToOffset = itemStart;
        } else if (itemEnd > currentEnd) {
          scrollToOffset = itemEnd - viewportSize;
        } else {
          return; // Item is already visible
        }
      }

      // Clamp to valid range
      scrollToOffset = Math.max(0, Math.min(scrollToOffset, totalSize - viewportSize));

      if (horizontal) {
        scrollElementRef.current.scrollTo({
          left: scrollToOffset,
          behavior: scrollBehavior
        });
      } else {
        scrollElementRef.current.scrollTo({
          top: scrollToOffset,
          behavior: scrollBehavior
        });
      }
    },
    [itemCount, itemHeight, viewportSize, scrollOffset, totalSize, horizontal, scrollBehavior]
  );

  // Scroll to offset function
  const scrollToOffset = useCallback(
    (offset: number) => {
      if (!scrollElementRef.current) return;

      const clampedOffset = Math.max(0, Math.min(offset, totalSize - viewportSize));

      if (horizontal) {
        scrollElementRef.current.scrollTo({
          left: clampedOffset,
          behavior: scrollBehavior
        });
      } else {
        scrollElementRef.current.scrollTo({
          top: clampedOffset,
          behavior: scrollBehavior
        });
      }
    },
    [totalSize, viewportSize, horizontal, scrollBehavior]
  );

  // Get item size function
  const getItemSize = useCallback((index: number) => {
    return itemHeight;
  }, [itemHeight]);

  // Get item offset function
  const getItemOffset = useCallback((index: number) => {
    return index * itemHeight;
  }, [itemHeight]);

  // Trigger scroll manually
  const triggerScroll = useCallback(() => {
    if (scrollElementRef.current) {
      const offset = horizontal 
        ? scrollElementRef.current.scrollLeft 
        : scrollElementRef.current.scrollTop;
      handleScroll({ target: scrollElementRef.current } as unknown as Event);
    }
  }, [horizontal, handleScroll]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const size = horizontal 
          ? containerRef.current.clientWidth 
          : containerRef.current.clientHeight;
        setViewportSize(size);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [horizontal]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollElementRef.current) {
        scrollElementRef.current.removeEventListener('scroll', handleScroll);
      }
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
      debouncedScrollHandler.cancel();
    };
  }, [handleScroll, debouncedScrollHandler]);

  return {
    // State
    scrollOffset,
    startIndex,
    endIndex,
    virtualItems,
    totalSize,
    viewportSize,
    isScrolling,

    // Refs
    containerRef: containerRefCallback,
    scrollElementRef: scrollElementRefCallback,

    // Functions
    scrollToItem,
    scrollToOffset,
    getItemSize,
    getItemOffset,
    triggerScroll
  };
}

/**
 * Hook for virtual grid scrolling (2D virtualization)
 */
export interface VirtualGridOptions {
  /** Width of each item */
  itemWidth: number;
  /** Height of each item */
  itemHeight: number;
  /** Number of columns */
  columnCount: number;
  /** Number of rows */
  rowCount: number;
  /** Container width */
  containerWidth: number;
  /** Container height */
  containerHeight: number;
  /** Overscan for rows and columns */
  overscan?: number;
}

export function useVirtualGrid(options: VirtualGridOptions) {
  const {
    itemWidth,
    itemHeight,
    columnCount,
    rowCount,
    containerWidth,
    containerHeight,
    overscan = 2
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const totalWidth = columnCount * itemWidth;
  const totalHeight = rowCount * itemHeight;

  // Calculate visible range
  const { startRowIndex, endRowIndex, startColumnIndex, endColumnIndex } = useMemo(() => {
    const startRow = Math.floor(scrollTop / itemHeight);
    const endRow = Math.min(rowCount - 1, startRow + Math.ceil(containerHeight / itemHeight));
    
    const startCol = Math.floor(scrollLeft / itemWidth);
    const endCol = Math.min(columnCount - 1, startCol + Math.ceil(containerWidth / itemWidth));

    return {
      startRowIndex: Math.max(0, startRow - overscan),
      endRowIndex: Math.min(rowCount - 1, endRow + overscan),
      startColumnIndex: Math.max(0, startCol - overscan),
      endColumnIndex: Math.min(columnCount - 1, endCol + overscan)
    };
  }, [scrollTop, scrollLeft, itemHeight, itemWidth, containerHeight, containerWidth, rowCount, columnCount, overscan]);

  // Generate virtual items
  const virtualItems = useMemo(() => {
    const items: Array<VirtualItem & { columnIndex: number; rowIndex: number }> = [];

    for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex++) {
      for (let columnIndex = startColumnIndex; columnIndex <= endColumnIndex; columnIndex++) {
        const index = rowIndex * columnCount + columnIndex;
        const start = rowIndex * itemHeight;
        const left = columnIndex * itemWidth;

        items.push({
          index,
          rowIndex,
          columnIndex,
          start,
          end: start + itemHeight,
          size: itemHeight,
          isVisible: true
        });
      }
    }

    return items;
  }, [startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, columnCount, itemHeight, itemWidth]);

  return {
    scrollTop,
    scrollLeft,
    totalWidth,
    totalHeight,
    startRowIndex,
    endRowIndex,
    startColumnIndex,
    endColumnIndex,
    virtualItems,
    setScrollTop,
    setScrollLeft
  };
}

export default useVirtualScroll;