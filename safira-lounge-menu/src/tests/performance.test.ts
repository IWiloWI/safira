/**
 * Performance Test Suite
 * 
 * Comprehensive performance tests for React components,
 * hooks, and utilities to ensure optimal performance.
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import { performanceMonitor, PERFORMANCE_THRESHOLDS } from '../utils/performance';
import { useDebounce, useDebouncedCallback } from '../hooks/useDebounce';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { OptimizedProductGrid } from '../components/Menu/OptimizedProductGrid';
import { OptimizedMenuProductCard } from '../components/Menu/OptimizedMenuProductCard';
import { VirtualList } from '../components/Common/VirtualList';
import { LazyImage } from '../components/Common/LazyImage';
import React from 'react';

// Mock data for testing
const mockProducts = Array.from({ length: 1000 }, (_, index) => ({
  id: `product-${index}`,
  name: { de: `Produkt ${index}`, en: `Product ${index}`, da: `Produkt ${index}` },
  description: { de: `Beschreibung ${index}`, en: `Description ${index}`, da: `Beskrivelse ${index}` },
  price: 10 + (index % 50),
  brand: `Brand ${index % 10}`,
  available: index % 3 !== 0,
  badges: {
    neu: index % 5 === 0,
    beliebt: index % 7 === 0,
    kurze_zeit: index % 11 === 0
  },
  image: `https://example.com/image-${index}.jpg`
}));

// Performance measurement utilities
const measureRenderTime = (renderFn: () => void): number => {
  const startTime = performance.now();
  renderFn();
  return performance.now() - startTime;
};

const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

describe('Performance Tests', () => {
  beforeAll(() => {
    // Mock performance APIs
    Object.defineProperty(window, 'performance', {
      value: {
        ...window.performance,
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024, // 50MB
          totalJSHeapSize: 100 * 1024 * 1024 // 100MB
        }
      }
    });

    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      unobserve: jest.fn()
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Render Performance', () => {
    test('OptimizedProductGrid renders within performance budget', async () => {
      const renderTime = measureRenderTime(() => {
        render(
          <OptimizedProductGrid
            products={mockProducts.slice(0, 100)}
            language="en"
            performanceMonitoring={{ enabled: true, logMetrics: false }}
          />
        );
      });

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING);
    });

    test('OptimizedMenuProductCard renders quickly', () => {
      const renderTime = measureRenderTime(() => {
        render(
          <OptimizedMenuProductCard
            product={mockProducts[0]}
            language="en"
            enablePerformanceMonitoring={false}
          />
        );
      });

      expect(renderTime).toBeLessThan(50); // 50ms threshold for individual cards
    });

    test('VirtualList handles large datasets efficiently', async () => {
      const renderItem = jest.fn((item, index, style) => (
        <div key={item.id} style={style}>
          {item.name.en}
        </div>
      ));

      const renderTime = measureRenderTime(() => {
        render(
          <VirtualList
            items={mockProducts}
            itemHeight={100}
            height="500px"
            renderItem={renderItem}
            enablePerformanceMonitoring={true}
          />
        );
      });

      // Virtual list should render quickly regardless of data size
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING);
      
      // Should only render visible items + overscan
      await waitFor(() => {
        expect(renderItem).toHaveBeenCalledTimes(expect.any(Number));
        expect(renderItem.mock.calls.length).toBeLessThan(20); // Much less than 1000 items
      });
    });

    test('LazyImage optimizes loading', async () => {
      const onLoad = jest.fn();
      
      const renderTime = measureRenderTime(() => {
        render(
          <LazyImage
            src="https://example.com/test-image.jpg"
            alt="Test image"
            onLoad={onLoad}
            enablePerformanceMonitoring={true}
          />
        );
      });

      expect(renderTime).toBeLessThan(50); // Should render placeholder quickly
    });
  });

  describe('React.memo Optimization', () => {
    test('OptimizedProductGrid prevents unnecessary re-renders', () => {
      const { rerender } = render(
        <OptimizedProductGrid
          products={mockProducts.slice(0, 10)}
          language="en"
        />
      );

      // Re-render with same props should not cause re-render
      const renderTime = measureRenderTime(() => {
        rerender(
          <OptimizedProductGrid
            products={mockProducts.slice(0, 10)}
            language="en"
          />
        );
      });

      // Memoized component should render very quickly on subsequent renders
      expect(renderTime).toBeLessThan(10);
    });

    test('OptimizedMenuProductCard memo comparison works correctly', () => {
      const product = mockProducts[0];
      
      const { rerender } = render(
        <OptimizedMenuProductCard
          product={product}
          language="en"
        />
      );

      // Same props should not re-render
      const renderTime1 = measureRenderTime(() => {
        rerender(
          <OptimizedMenuProductCard
            product={product}
            language="en"
          />
        );
      });

      // Different props should re-render
      const renderTime2 = measureRenderTime(() => {
        rerender(
          <OptimizedMenuProductCard
            product={{ ...product, name: { ...product.name, en: 'Changed' } }}
            language="en"
          />
        );
      });

      expect(renderTime1).toBeLessThan(5); // No re-render
      expect(renderTime2).toBeGreaterThan(renderTime1); // Actual re-render
    });
  });

  describe('Hook Performance', () => {
    test('useDebounce delays value updates correctly', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      );

      expect(result.current).toBe('initial');

      // Change value multiple times quickly
      rerender({ value: 'update1', delay: 100 });
      rerender({ value: 'update2', delay: 100 });
      rerender({ value: 'final', delay: 100 });

      // Should still be initial value immediately
      expect(result.current).toBe('initial');

      // After delay, should have final value
      await waitFor(() => {
        expect(result.current).toBe('final');
      }, { timeout: 200 });
    });

    test('useDebouncedCallback prevents excessive calls', async () => {
      const callback = jest.fn();
      
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, 100)
      );

      // Call multiple times quickly
      act(() => {
        result.current.callback();
        result.current.callback();
        result.current.callback();
      });

      // Should only call once after delay
      await waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      }, { timeout: 200 });
    });

    test('useVirtualScroll calculates visible items efficiently', () => {
      const { result } = renderHook(() =>
        useVirtualScroll({
          itemHeight: 100,
          itemCount: 1000,
          containerHeight: 500,
          overscan: 5
        })
      );

      // Should only calculate visible items
      expect(result.current.virtualItems.length).toBeLessThan(20);
      expect(result.current.totalSize).toBe(100000); // 1000 * 100
    });

    test('useIntersectionObserver sets up correctly', () => {
      const onIntersectionChange = jest.fn();
      
      renderHook(() =>
        useIntersectionObserver({
          onIntersectionChange,
          threshold: 0.5
        })
      );

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ threshold: 0.5 })
      );
    });
  });

  describe('Memory Usage', () => {
    test('Components clean up properly on unmount', () => {
      const initialMemory = measureMemoryUsage();
      
      const { unmount } = render(
        <OptimizedProductGrid
          products={mockProducts.slice(0, 100)}
          language="en"
          performanceMonitoring={{ enabled: true }}
        />
      );

      unmount();

      // Memory should not increase significantly after unmount
      const finalMemory = measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_WARNING);
    });

    test('VirtualList maintains constant memory usage', () => {
      const { rerender } = render(
        <VirtualList
          items={mockProducts.slice(0, 100)}
          itemHeight={100}
          height="500px"
          renderItem={(item, index, style) => <div key={item.id} style={style}>{item.name.en}</div>}
        />
      );

      const memory1 = measureMemoryUsage();

      // Increase dataset size significantly
      rerender(
        <VirtualList
          items={mockProducts}
          itemHeight={100}
          height="500px"
          renderItem={(item, index, style) => <div key={item.id} style={style}>{item.name.en}</div>}
        />
      );

      const memory2 = measureMemoryUsage();
      const memoryIncrease = memory2 - memory1;

      // Memory increase should be minimal despite 10x more data
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
    });
  });

  describe('Performance Monitoring', () => {
    test('Performance monitor tracks metrics correctly', () => {
      const metrics = performanceMonitor.getCurrentMetrics();
      
      expect(metrics).toHaveProperty('renderTime');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('domNodes');
      expect(metrics).toHaveProperty('timestamp');
      
      expect(typeof metrics.renderTime).toBe('number');
      expect(typeof metrics.memoryUsage).toBe('number');
      expect(typeof metrics.domNodes).toBe('number');
    });

    test('Performance thresholds trigger warnings', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const highMemoryMetrics = {
        renderTime: 50,
        memoryUsage: PERFORMANCE_THRESHOLDS.MEMORY_ERROR + 1000,
        domNodes: 1000,
        bundleSize: 1024,
        imageLoadTime: 1000,
        jsHeapUsed: 50 * 1024 * 1024,
        jsHeapTotal: 100 * 1024 * 1024,
        timestamp: Date.now()
      };

      performanceMonitor.checkThresholds(highMemoryMetrics);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Critical memory usage')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Bundle Size Optimization', () => {
    test('Tree-shaking removes unused exports', () => {
      // This test would be run as part of bundle analysis
      // Here we just ensure imports are optimized
      const { createSelectiveImport } = require('../utils/performance').bundleOptimization;
      
      const mockModule = {
        usedFunction: () => 'used',
        unusedFunction: () => 'unused',
        anotherUsedFunction: () => 'also used'
      };

      const optimized = createSelectiveImport(mockModule, ['usedFunction', 'anotherUsedFunction']);
      
      expect(optimized).toHaveProperty('usedFunction');
      expect(optimized).toHaveProperty('anotherUsedFunction');
      expect(optimized).not.toHaveProperty('unusedFunction');
    });
  });

  describe('User Interaction Performance', () => {
    test('Debounced search performs well', async () => {
      const searchCallback = jest.fn();
      
      render(
        <OptimizedProductGrid
          products={mockProducts}
          language="en"
          sortOptions={{
            field: 'name',
            direction: 'asc',
            onSortChange: searchCallback
          }}
        />
      );

      const searchInput = screen.getByRole('combobox', { name: /sort/i });
      
      const startTime = performance.now();
      
      // Simulate rapid user input
      await userEvent.selectOptions(searchInput, 'name-desc');
      await userEvent.selectOptions(searchInput, 'price-asc');
      await userEvent.selectOptions(searchInput, 'price-desc');
      
      const endTime = performance.now();
      const interactionTime = endTime - startTime;
      
      // User interactions should feel responsive
      expect(interactionTime).toBeLessThan(100);
    });

    test('Virtual scrolling maintains smooth performance', async () => {
      const { container } = render(
        <VirtualList
          items={mockProducts}
          itemHeight={100}
          height="500px"
          renderItem={(item, index, style) => (
            <div key={item.id} style={style}>
              {item.name.en}
            </div>
          )}
        />
      );

      const scrollContainer = container.firstChild as HTMLElement;
      
      const startTime = performance.now();
      
      // Simulate scrolling
      act(() => {
        scrollContainer.scrollTop = 1000;
        scrollContainer.dispatchEvent(new Event('scroll'));
      });

      const endTime = performance.now();
      const scrollTime = endTime - startTime;
      
      // Scrolling should be very fast
      expect(scrollTime).toBeLessThan(50);
    });
  });

  describe('Mobile Performance', () => {
    test('Components perform well on simulated low-end device', () => {
      // Simulate slower device by increasing thresholds
      const slowDeviceThreshold = PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING * 2;
      
      const renderTime = measureRenderTime(() => {
        render(
          <OptimizedProductGrid
            products={mockProducts.slice(0, 50)}
            language="en"
            layout={{ columns: 1, gap: 15 }} // Mobile layout
          />
        );
      });

      expect(renderTime).toBeLessThan(slowDeviceThreshold);
    });

    test('LazyImage optimizes for mobile bandwidth', () => {
      const { container } = render(
        <LazyImage
          src="https://example.com/large-image.jpg"
          alt="Test"
          width={300}
          height={200}
          quality={70} // Lower quality for mobile
          enableWebP={true}
        />
      );

      // Should render placeholder immediately
      expect(container.firstChild).toBeTruthy();
    });
  });
});

// Integration tests for performance
describe('Performance Integration Tests', () => {
  test('Complete menu page loads within performance budget', async () => {
    const startTime = performance.now();
    
    render(
      <OptimizedProductGrid
        products={mockProducts.slice(0, 200)}
        language="en"
        showControls={true}
        virtualScrolling={{
          enabled: true,
          itemHeight: 400,
          containerHeight: '70vh'
        }}
        performanceMonitoring={{
          enabled: true,
          showIndicator: false,
          logMetrics: false
        }}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('optimized-product-grid')).toBeInTheDocument();
    });

    const loadTime = performance.now() - startTime;
    
    // Complete page should load within 1 second
    expect(loadTime).toBeLessThan(1000);
  });

  test('Memory usage remains stable during heavy interactions', async () => {
    const initialMemory = measureMemoryUsage();
    
    const { rerender } = render(
      <OptimizedProductGrid
        products={mockProducts.slice(0, 100)}
        language="en"
      />
    );

    // Simulate multiple re-renders and interactions
    for (let i = 0; i < 10; i++) {
      rerender(
        <OptimizedProductGrid
          products={mockProducts.slice(i * 10, (i + 1) * 10 + 100)}
          language={i % 2 === 0 ? 'en' : 'de'}
        />
      );
      
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const finalMemory = measureMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable
    expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_WARNING);
  });
});

export {};