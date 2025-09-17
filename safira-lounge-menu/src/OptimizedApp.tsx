/**
 * Optimized App Component
 * Enhanced with performance optimizations:
 * - Lazy loading for all routes
 * - React.memo for context providers
 * - Preloading strategies
 * - Performance monitoring
 * - Memory leak prevention
 * - Bundle optimization
 */

import React, { useEffect, useMemo, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import './styles/globals.css';
import './i18n/config';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import { 
  LazyRoutes, 
  preloadRoutes, 
  RouteTransition, 
  DefaultLoadingComponent,
  bundleAnalysis 
} from './utils/lazy-loading';
import { 
  performanceMonitor, 
  reactPerformance,
  measurePerformance 
} from './utils/performance';
import { useDebouncedCallback } from './hooks/useDebounce';

// Styled components
const AppContainer = styled.div`
  min-height: 100vh;
  height: 100vh;
  position: relative;
  background: #000;
  
  /* Mobile viewport fixes */
  @supports (-webkit-touch-callout: none) {
    /* iOS Safari */
    height: -webkit-fill-available;
    min-height: -webkit-fill-available;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  height: 100vh;
  
  @supports (-webkit-touch-callout: none) {
    height: -webkit-fill-available;
    min-height: -webkit-fill-available;
  }
`;

const PerformanceOverlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-family: monospace;
  z-index: 10000;
  opacity: ${props => props.$visible ? 0.8 : 0};
  transition: opacity 0.3s ease;
  pointer-events: none;
  max-width: 300px;
`;

// Performance monitoring component
const PerformanceMonitor: React.FC<{ enabled: boolean }> = React.memo(({ enabled }) => {
  const [metrics, setMetrics] = React.useState<any>(null);
  
  const updateMetrics = useDebouncedCallback(
    React.useCallback(() => {
      if (enabled) {
        const currentMetrics = performanceMonitor.getCurrentMetrics();
        setMetrics({
          memory: (currentMetrics.memoryUsage / 1024 / 1024).toFixed(2),
          domNodes: currentMetrics.domNodes,
          renderTime: currentMetrics.renderTime.toFixed(2),
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }, [enabled]),
    1000
  );

  React.useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(updateMetrics.callback, 2000);
    updateMetrics.callback(); // Initial call

    return () => {
      clearInterval(interval);
      updateMetrics.cancel();
    };
  }, [enabled, updateMetrics]);

  if (!enabled || !metrics) return null;

  return (
    <PerformanceOverlay $visible={enabled}>
      <div>Memory: {metrics.memory}MB</div>
      <div>DOM Nodes: {metrics.domNodes}</div>
      <div>Render: {metrics.renderTime}ms</div>
      <div>Updated: {metrics.timestamp}</div>
    </PerformanceOverlay>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

// Memoized providers
const MemoizedLanguageProvider = React.memo(LanguageProvider);
const MemoizedAuthProvider = React.memo(AuthProvider);

// Route components with error boundaries
const RouteWithErrorBoundary: React.FC<{
  element: React.ReactElement;
  path?: string;
}> = React.memo(({ element, path }) => (
  <ErrorBoundary>
    <Suspense fallback={<DefaultLoadingComponent componentName={`Route ${path}`} skeleton />}>
      {element}
    </Suspense>
  </ErrorBoundary>
));

RouteWithErrorBoundary.displayName = 'RouteWithErrorBoundary';

/**
 * Optimized App Component
 */
const OptimizedApp: React.FC = () => {
  // Performance monitoring flag (can be controlled via environment or local storage)
  const showPerformanceMonitor = useMemo(() => {
    return process.env.NODE_ENV === 'development' || 
           localStorage.getItem('performance-monitor') === 'true';
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    console.log('[OptimizedApp] Initializing...');

    // Preload critical routes
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadRoutes.preloadUserRoutes();
        console.log('[OptimizedApp] User routes preloaded');
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        preloadRoutes.preloadUserRoutes();
      }, 100);
    }

    // Log bundle information in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        bundleAnalysis.logBundleInfo();
      }, 1000);
    }

    const initTime = performance.now() - startTime;
    console.log(`[OptimizedApp] Initialized in ${initTime.toFixed(2)}ms`);
  }, []);

  // Memory leak prevention
  useEffect(() => {
    const handleBeforeUnload = () => {
      performanceMonitor.destroy();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      performanceMonitor.destroy();
    };
  }, []);

  // Memoized route configuration
  const routes = useMemo(() => [
    {
      path: '/',
      element: <Navigate to="/menu" replace />
    },
    {
      path: '/menu',
      element: <LazyRoutes.MenuPage />,
      preload: true
    },
    {
      path: '/menu/:category',
      element: <LazyRoutes.MenuPage />,
      preload: true
    },
    {
      path: '/admin/*',
      element: <LazyRoutes.AdminPage />
    },
    {
      path: '/table/:tableId',
      element: <LazyRoutes.TablePage />
    }
  ], []);

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MemoizedLanguageProvider>
          <MemoizedAuthProvider>
            <AppContainer>
              <ContentWrapper>
                <ErrorBoundary>
                  <Suspense fallback={<DefaultLoadingComponent message="Loading application..." skeleton />}>
                    <Routes>
                      {routes.map((route, index) => (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={
                            <RouteWithErrorBoundary
                              element={route.element}
                              path={route.path}
                            />
                          }
                        />
                      ))}
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </ContentWrapper>
              
              {/* Performance overlay */}
              <PerformanceMonitor enabled={showPerformanceMonitor} />
            </AppContainer>
          </MemoizedAuthProvider>
        </MemoizedLanguageProvider>
      </Router>
    </ErrorBoundary>
  );
};

// Export with performance monitoring
export default reactPerformance.withPerformanceMonitoring(
  measurePerformance.measureFunction(OptimizedApp, 'OptimizedApp'),
  'OptimizedApp'
);