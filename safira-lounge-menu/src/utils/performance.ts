/**
 * Performance Monitoring and Optimization Utilities
 * 
 * Provides comprehensive performance monitoring, optimization helpers,
 * and React-specific performance utilities for the Safira Lounge Menu.
 */

import React, { RefObject, useCallback, useEffect, useRef } from 'react';

// Performance metrics interface
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  domNodes: number;
  bundleSize: number;
  imageLoadTime: number;
  jsHeapUsed: number;
  jsHeapTotal: number;
  timestamp: number;
}

// Web Vitals metrics
export interface WebVitals {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

// Performance budget thresholds
export const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME_WARNING: 100, // ms
  RENDER_TIME_ERROR: 200, // ms
  MEMORY_WARNING: 50 * 1024 * 1024, // 50MB
  MEMORY_ERROR: 100 * 1024 * 1024, // 100MB
  BUNDLE_SIZE_WARNING: 1024 * 1024, // 1MB
  BUNDLE_SIZE_ERROR: 2 * 1024 * 1024, // 2MB
  IMAGE_LOAD_WARNING: 2000, // ms
  IMAGE_LOAD_ERROR: 5000, // ms
} as const;

/**
 * Performance Monitor Class
 * Tracks various performance metrics and provides warnings
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private warnings: string[] = [];

  constructor() {
    this.initializeObservers();
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Long task observer
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              this.addWarning(`Long task detected: ${entry.duration}ms`);
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }

      // Navigation timing observer
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.trackNavigationMetrics(navEntry);
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        console.warn('Navigation observer not supported');
      }
    }
  }

  /**
   * Track navigation metrics
   */
  private trackNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics = {
      FCP: this.getFirstContentfulPaint(),
      LCP: this.getLargestContentfulPaint(),
      FID: 0, // Will be updated by event listeners
      CLS: this.getCumulativeLayoutShift(),
      TTFB: entry.responseStart - entry.requestStart,
    };

    if (metrics.TTFB > 600) {
      this.addWarning(`Slow TTFB: ${metrics.TTFB}ms`);
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    const now = performance.now();
    const memory = this.getMemoryUsage();
    
    return {
      renderTime: this.getLastRenderTime(),
      memoryUsage: memory.usedJSHeapSize,
      domNodes: document.querySelectorAll('*').length,
      bundleSize: this.getBundleSize(),
      imageLoadTime: this.getAverageImageLoadTime(),
      jsHeapUsed: memory.usedJSHeapSize,
      jsHeapTotal: memory.totalJSHeapSize,
      timestamp: now,
    };
  }

  /**
   * Get memory usage information
   */
  private getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return { usedJSHeapSize: 0, totalJSHeapSize: 0 };
  }

  /**
   * Get last render time from performance timeline
   */
  private getLastRenderTime(): number {
    const paintEntries = performance.getEntriesByType('paint');
    if (paintEntries.length > 0) {
      return paintEntries[paintEntries.length - 1].duration;
    }
    return 0;
  }

  /**
   * Estimate bundle size from resource timing
   */
  private getBundleSize(): number {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources
      .filter(resource => resource.name.includes('.js'))
      .reduce((total, resource) => total + (resource.transferSize || 0), 0);
  }

  /**
   * Get average image load time
   */
  private getAverageImageLoadTime(): number {
    const images = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const imageResources = images.filter(resource => 
      resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    );
    
    if (imageResources.length === 0) return 0;
    
    const totalTime = imageResources.reduce((sum, img) => sum + img.duration, 0);
    return totalTime / imageResources.length;
  }

  /**
   * Get First Contentful Paint
   */
  private getFirstContentfulPaint(): number {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  /**
   * Get Largest Contentful Paint
   */
  private getLargestContentfulPaint(): number {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } else {
        resolve(0);
      }
    }) as any;
  }

  /**
   * Get Cumulative Layout Shift
   */
  private getCumulativeLayoutShift(): number {
    let clsValue = 0;
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
    return clsValue;
  }

  /**
   * Add performance warning
   */
  private addWarning(warning: string): void {
    this.warnings.push(`${new Date().toISOString()}: ${warning}`);
    console.warn(`[Performance] ${warning}`);
  }

  /**
   * Get all warnings
   */
  getWarnings(): string[] {
    return [...this.warnings];
  }

  /**
   * Clear warnings
   */
  clearWarnings(): void {
    this.warnings = [];
  }

  /**
   * Check if metrics exceed thresholds
   */
  checkThresholds(metrics: PerformanceMetrics): void {
    if (metrics.renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_ERROR) {
      this.addWarning(`Critical render time: ${metrics.renderTime}ms`);
    } else if (metrics.renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING) {
      this.addWarning(`Slow render time: ${metrics.renderTime}ms`);
    }

    if (metrics.memoryUsage > PERFORMANCE_THRESHOLDS.MEMORY_ERROR) {
      this.addWarning(`Critical memory usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    } else if (metrics.memoryUsage > PERFORMANCE_THRESHOLDS.MEMORY_WARNING) {
      this.addWarning(`High memory usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance measurement utilities
 */
export const measurePerformance = {
  /**
   * Measure function execution time
   */
  measureFunction: <T extends (...args: any[]) => any>(
    fn: T,
    name?: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      if (name) {
        console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }) as T;
  },

  /**
   * Measure async function execution time
   */
  measureAsyncFunction: <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name?: string
  ): T => {
    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      
      if (name) {
        console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }) as T;
  },

  /**
   * Start performance mark
   */
  startMark: (name: string): void => {
    performance.mark(`${name}-start`);
  },

  /**
   * End performance mark and measure
   */
  endMark: (name: string): number => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    return measure.duration;
  },

  /**
   * Clear performance marks
   */
  clearMarks: (name?: string): void => {
    if (name) {
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
    } else {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
};

/**
 * React-specific performance utilities
 */
export const reactPerformance = {
  /**
   * Higher-order component for performance monitoring
   */
  withPerformanceMonitoring: <P extends object>(
    Component: React.ComponentType<P>,
    componentName?: string
  ) => {
    const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
      const renderStartTime = useRef<number>(0);
      const name = componentName || Component.displayName || Component.name;

      useEffect(() => {
        renderStartTime.current = performance.now();
      });

      useEffect(() => {
        const renderTime = performance.now() - renderStartTime.current;
        if (renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING) {
          console.warn(`[Performance] Slow render in ${name}: ${renderTime.toFixed(2)}ms`);
        }
      });

      return React.createElement(Component, { ...props, ref } as any);
    });

    WrappedComponent.displayName = `withPerformanceMonitoring(${name})`;
    return WrappedComponent;
  },

  /**
   * Hook for measuring component render time
   */
  useRenderTime: (componentName: string) => {
    const renderStartTime = useRef<number>(0);
    const previousRenderTime = useRef<number>(0);

    useEffect(() => {
      renderStartTime.current = performance.now();
    });

    useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;
      previousRenderTime.current = renderTime;
      
      if (renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING) {
        console.warn(`[Performance] Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    });

    return previousRenderTime.current;
  },

  /**
   * Hook for detecting memory leaks
   */
  useMemoryLeak: (componentName: string) => {
    const initialMemory = useRef<number>(0);

    useEffect(() => {
      const memory = performanceMonitor.getCurrentMetrics().memoryUsage;
      initialMemory.current = memory;

      return () => {
        const currentMemory = performanceMonitor.getCurrentMetrics().memoryUsage;
        const memoryDiff = currentMemory - initialMemory.current;
        
        if (memoryDiff > PERFORMANCE_THRESHOLDS.MEMORY_WARNING) {
          console.warn(`[Performance] Potential memory leak in ${componentName}: +${(memoryDiff / 1024 / 1024).toFixed(2)}MB`);
        }
      };
    }, [componentName]);
  }
};

/**
 * Bundle optimization utilities
 */
export const bundleOptimization = {
  /**
   * Lazy load module with error handling
   */
  lazyLoad: <T extends { default: React.ComponentType<any> }>(importFn: () => Promise<T>) => {
    return React.lazy(() =>
      importFn().catch((error) => {
        console.error('[Performance] Lazy loading failed:', error);
        // Return a fallback component
        return { default: () => React.createElement('div', null, 'Loading failed') } as unknown as T;
      })
    );
  },

  /**
   * Preload module for better performance
   */
  preloadModule: (importFn: () => Promise<any>) => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFn().catch(() => {
          // Silently fail preloading
        });
      });
    }
  },

  /**
   * Tree-shake unused imports
   */
  createSelectiveImport: <T extends Record<string, any>>(
    module: T,
    usedKeys: (keyof T)[]
  ): Partial<T> => {
    const result: Partial<T> = {};
    usedKeys.forEach(key => {
      if (key in module) {
        result[key] = module[key];
      }
    });
    return result;
  }
};

/**
 * Image optimization utilities
 */
export const imageOptimization = {
  /**
   * Check if WebP is supported
   */
  isWebPSupported: (): Promise<boolean> => {
    return new Promise((resolve) => {
      const webp = new Image();
      webp.onload = webp.onerror = () => {
        resolve(webp.height === 2);
      };
      webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  },

  /**
   * Get optimized image source
   */
  getOptimizedSrc: (src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}) => {
    // This would integrate with your image optimization service
    const { width, height, quality = 80, format } = options;
    let optimizedSrc = src;

    // Add query parameters for optimization
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality !== 80) params.set('q', quality.toString());
    if (format) params.set('f', format);

    if (params.toString()) {
      optimizedSrc += (src.includes('?') ? '&' : '?') + params.toString();
    }

    return optimizedSrc;
  },

  /**
   * Create responsive image sources
   */
  createResponsiveSources: (src: string, breakpoints: number[] = [320, 640, 1024, 1440]) => {
    return breakpoints.map(width => ({
      srcSet: imageOptimization.getOptimizedSrc(src, { width }),
      media: `(max-width: ${width}px)`
    }));
  }
};

/**
 * Export everything for easy access
 */
export default {
  PerformanceMonitor,
  performanceMonitor,
  measurePerformance,
  reactPerformance,
  bundleOptimization,
  imageOptimization,
  PERFORMANCE_THRESHOLDS
};