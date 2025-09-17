/**
 * Custom hook for responsive design and mobile detection
 * Handles viewport dimensions, breakpoints, and touch device detection
 */

import { useState, useEffect, useCallback } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointConfig {
  xs: number;  // 0px
  sm: number;  // 640px
  md: number;  // 768px
  lg: number;  // 1024px
  xl: number;  // 1280px
  '2xl': number; // 1536px
}

export interface UseResponsiveOptions {
  /** Custom breakpoint configuration */
  breakpoints?: Partial<BreakpointConfig>;
  /** Debounce delay for resize events */
  debounceDelay?: number;
}

export interface UseResponsiveReturn {
  /** Current viewport width */
  width: number;
  /** Current viewport height */
  height: number;
  /** Current breakpoint */
  breakpoint: Breakpoint;
  /** Whether device is mobile (touch-enabled) */
  isMobile: boolean;
  /** Whether device is tablet */
  isTablet: boolean;
  /** Whether device is desktop */
  isDesktop: boolean;
  /** Whether screen is portrait orientation */
  isPortrait: boolean;
  /** Whether screen is landscape orientation */
  isLandscape: boolean;
  /** Check if current breakpoint matches */
  isBreakpoint: (bp: Breakpoint) => boolean;
  /** Check if current breakpoint is at least the specified one */
  isAtLeast: (bp: Breakpoint) => boolean;
  /** Check if current breakpoint is below the specified one */
  isBelow: (bp: Breakpoint) => boolean;
  /** Device pixel ratio */
  pixelRatio: number;
  /** Whether device supports touch */
  hasTouchSupport: boolean;
}

const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

/**
 * Hook for responsive design utilities
 */
export function useResponsive(options: UseResponsiveOptions = {}): UseResponsiveReturn {
  const { 
    breakpoints = DEFAULT_BREAKPOINTS, 
    debounceDelay = 100 
  } = options;

  const mergedBreakpoints = { ...DEFAULT_BREAKPOINTS, ...breakpoints };

  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  }));

  const [pixelRatio, setPixelRatio] = useState(() => 
    typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  );

  /**
   * Get current breakpoint based on width
   */
  const getCurrentBreakpoint = useCallback((width: number): Breakpoint => {
    if (width >= mergedBreakpoints['2xl']) return '2xl';
    if (width >= mergedBreakpoints.xl) return 'xl';
    if (width >= mergedBreakpoints.lg) return 'lg';
    if (width >= mergedBreakpoints.md) return 'md';
    if (width >= mergedBreakpoints.sm) return 'sm';
    return 'xs';
  }, [mergedBreakpoints]);

  /**
   * Detect if device has touch support
   */
  const hasTouchSupport = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );

  /**
   * Update dimensions
   */
  const updateDimensions = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });
    setPixelRatio(window.devicePixelRatio || 1);
  }, []);

  /**
   * Debounced resize handler
   */
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, debounceDelay);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateDimensions, debounceDelay]);

  const breakpoint = getCurrentBreakpoint(dimensions.width);
  const isPortrait = dimensions.height > dimensions.width;
  const isLandscape = !isPortrait;

  // Device type detection
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';

  /**
   * Check if current breakpoint matches
   */
  const isBreakpoint = useCallback((bp: Breakpoint): boolean => {
    return breakpoint === bp;
  }, [breakpoint]);

  /**
   * Check if current breakpoint is at least the specified one
   */
  const isAtLeast = useCallback((bp: Breakpoint): boolean => {
    const currentBpValue = mergedBreakpoints[breakpoint];
    const targetBpValue = mergedBreakpoints[bp];
    return currentBpValue >= targetBpValue;
  }, [breakpoint, mergedBreakpoints]);

  /**
   * Check if current breakpoint is below the specified one
   */
  const isBelow = useCallback((bp: Breakpoint): boolean => {
    const currentBpValue = mergedBreakpoints[breakpoint];
    const targetBpValue = mergedBreakpoints[bp];
    return currentBpValue < targetBpValue;
  }, [breakpoint, mergedBreakpoints]);

  return {
    width: dimensions.width,
    height: dimensions.height,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
    isBreakpoint,
    isAtLeast,
    isBelow,
    pixelRatio,
    hasTouchSupport
  };
}

/**
 * Default export for convenience
 */
export default useResponsive;