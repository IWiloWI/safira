/**
 * Custom hook for swipe navigation functionality
 * Handles touch gestures for category navigation in mobile devices
 */

import { useState, useCallback } from 'react';

export interface UseSwipeNavigationOptions {
  /** Minimum distance for a valid swipe */
  minSwipeDistance?: number;
  /** Available categories for navigation */
  categories: string[];
  /** Current active category */
  activeCategory: string;
  /** Callback when category changes */
  onCategoryChange: (categoryId: string) => void;
  /** Whether swipe navigation is enabled */
  enabled?: boolean;
  /** Transition delay to prevent rapid swipes */
  transitionDelay?: number;
}

export interface UseSwipeNavigationReturn {
  /** Touch start handler */
  onTouchStart: (e: React.TouchEvent) => void;
  /** Touch move handler */
  onTouchMove: (e: React.TouchEvent) => void;
  /** Touch end handler */
  onTouchEnd: () => void;
  /** Whether transition is in progress */
  isTransitioning: boolean;
  /** Reset transition state */
  resetTransition: () => void;
}

/**
 * Hook for swipe navigation between categories
 */
export function useSwipeNavigation(options: UseSwipeNavigationOptions): UseSwipeNavigationReturn {
  const {
    minSwipeDistance = 50,
    categories,
    activeCategory,
    onCategoryChange,
    enabled = true,
    transitionDelay = 500
  } = options;

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
   * Check if target element should be ignored for swipe
   */
  const shouldIgnoreTouch = useCallback((target: HTMLElement): boolean => {
    // Ignore touches on interactive elements
    const isInteractive = target.closest('button, a, input, select, textarea') ||
                         target.closest('[data-tab-container="true"]') ||
                         target.closest('[data-tab-button="true"]') ||
                         target.tagName === 'BUTTON';
    
    return !!isInteractive;
  }, []);

  /**
   * Handle touch start
   */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    
    const target = e.target as HTMLElement;
    if (shouldIgnoreTouch(target)) return;
    
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, [enabled, shouldIgnoreTouch]);

  /**
   * Handle touch move
   */
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    
    const target = e.target as HTMLElement;
    if (shouldIgnoreTouch(target)) return;
    
    setTouchEnd(e.targetTouches[0].clientX);
  }, [enabled, shouldIgnoreTouch]);

  /**
   * Handle touch end
   */
  const onTouchEnd = useCallback(() => {
    if (!enabled || !touchStart || !touchEnd || isTransitioning) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = categories.findIndex(cat => cat === activeCategory);
      
      if (isLeftSwipe && currentIndex < categories.length - 1) {
        // Swipe left = next category
        setIsTransitioning(true);
        onCategoryChange(categories[currentIndex + 1]);
        setTimeout(() => setIsTransitioning(false), transitionDelay);
      } else if (isRightSwipe && currentIndex > 0) {
        // Swipe right = previous category
        setIsTransitioning(true);
        onCategoryChange(categories[currentIndex - 1]);
        setTimeout(() => setIsTransitioning(false), transitionDelay);
      }
    }
    
    // Reset touch positions
    setTouchStart(null);
    setTouchEnd(null);
  }, [
    enabled,
    touchStart,
    touchEnd,
    isTransitioning,
    minSwipeDistance,
    categories,
    activeCategory,
    onCategoryChange,
    transitionDelay
  ]);

  /**
   * Reset transition state manually
   */
  const resetTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isTransitioning,
    resetTransition
  };
}

/**
 * Default export for convenience
 */
export default useSwipeNavigation;