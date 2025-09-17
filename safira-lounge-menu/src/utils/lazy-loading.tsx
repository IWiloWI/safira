/**
 * Lazy Loading Utilities
 * 
 * Provides utilities for code splitting, lazy loading components,
 * and route-level optimizations with error boundaries and loading states.
 */

import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { bundleOptimization } from './performance';

// Loading component interface
interface LoadingComponentProps {
  /** Loading message */
  message?: string;
  /** Component name being loaded */
  componentName?: string;
  /** Show skeleton instead of spinner */
  skeleton?: boolean;
  /** Custom loading component */
  fallback?: ReactNode;
}

/**
 * Default loading component
 */
export const DefaultLoadingComponent: React.FC<LoadingComponentProps> = ({
  message = 'Loading...',
  componentName,
  skeleton = false,
  fallback
}) => {
  if (fallback) {
    return <>{fallback}</>;
  }

  if (skeleton) {
    return (
      <div style={{
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        margin: '20px',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {/* Skeleton loading bars */}
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            style={{
              height: '20px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '10px',
              width: `${100 - index * 20}%`
            }}
          />
        ))}
        <style>
          {`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      color: 'rgba(255, 255, 255, 0.7)',
      fontFamily: 'Aldrich, sans-serif',
      minHeight: '200px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255, 65, 251, 0.3)',
        borderTop: '3px solid #FF41FB',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px'
      }} />
      <div style={{ fontSize: '1rem', textAlign: 'center' }}>
        {componentName ? `Loading ${componentName}...` : message}
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

/**
 * Error boundary for lazy loaded components
 */
interface LazyErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

interface LazyErrorBoundaryProps {
  children: ReactNode;
  /** Component name for error messages */
  componentName?: string;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Custom error component */
  errorComponent?: React.ComponentType<{
    error: Error;
    retry: () => void;
    componentName?: string;
  }>;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class LazyErrorBoundary extends Component<LazyErrorBoundaryProps, LazyErrorBoundaryState> {
  constructor(props: LazyErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<LazyErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error
    console.error(`[LazyErrorBoundary] Error in ${this.props.componentName || 'component'}:`, error, errorInfo);
    
    // Call error callback
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: retryCount + 1
      });
    }
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, componentName, maxRetries = 3, errorComponent: ErrorComponent } = this.props;

    if (hasError && error) {
      if (ErrorComponent) {
        return (
          <ErrorComponent
            error={error}
            retry={this.retry}
            componentName={componentName}
          />
        );
      }

      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.8)',
          fontFamily: 'Aldrich, sans-serif',
          background: 'rgba(255, 0, 0, 0.1)',
          borderRadius: '15px',
          margin: '20px',
          border: '1px solid rgba(255, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#FF6B6B' }}>
            Failed to load {componentName || 'component'}
          </h3>
          <p style={{ fontSize: '1rem', marginBottom: '20px', color: 'rgba(255, 255, 255, 0.7)' }}>
            {error.message || 'An unexpected error occurred'}
          </p>
          {retryCount < maxRetries && (
            <button
              onClick={this.retry}
              style={{
                background: 'linear-gradient(145deg, #FF41FB, #FF1493)',
                border: 'none',
                borderRadius: '25px',
                padding: '12px 24px',
                color: 'white',
                fontFamily: 'Aldrich, sans-serif',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Retry ({maxRetries - retryCount} attempts left)
            </button>
          )}
          {retryCount >= maxRetries && (
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Please refresh the page to try again
            </p>
          )}
        </div>
      );
    }

    return children;
  }
}

/**
 * Enhanced lazy loading with error boundary and loading states
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    /** Component name for debugging */
    name?: string;
    /** Loading component */
    loadingComponent?: React.ComponentType<LoadingComponentProps>;
    /** Error component */
    errorComponent?: React.ComponentType<{
      error: Error;
      retry: () => void;
      componentName?: string;
    }>;
    /** Loading props */
    loadingProps?: LoadingComponentProps;
    /** Maximum retry attempts */
    maxRetries?: number;
    /** Preload the component */
    preload?: boolean;
    /** Callback when component loads */
    onLoad?: () => void;
    /** Callback when component fails to load */
    onError?: (error: Error) => void;
  } = {}
) {
  const {
    name = 'Component',
    loadingComponent: LoadingComponent = DefaultLoadingComponent,
    errorComponent,
    loadingProps = {},
    maxRetries = 3,
    preload = false,
    onLoad,
    onError
  } = options;

  // Preload if requested
  if (preload) {
    bundleOptimization.preloadModule(importFn);
  }

  // Create lazy component with enhanced error handling
  const LazyComponent = bundleOptimization.lazyLoad(() =>
    importFn()
      .then((module) => {
        onLoad?.();
        return module;
      })
      .catch((error) => {
        console.error(`[LazyLoading] Failed to load ${name}:`, error);
        onError?.(error);
        throw error;
      })
  );

  // Return wrapped component - don't forward ref to avoid type issues with lazy components
  const WrappedComponent: React.FC<any> = (props) => (
    <LazyErrorBoundary
      componentName={name}
      maxRetries={maxRetries}
      errorComponent={errorComponent}
      onError={onError}
    >
      <Suspense
        fallback={
          <LoadingComponent
            componentName={name}
            {...loadingProps}
          />
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  );

  WrappedComponent.displayName = `Lazy(${name})`;
  
  return WrappedComponent;
}

/**
 * Route-level lazy loading components
 */
export const LazyRoutes = {
  // Main pages
  MenuPage: createLazyComponent(
    () => import('../pages/MenuPage'),
    {
      name: 'MenuPage',
      loadingProps: { skeleton: true, componentName: 'Menu' },
      preload: true // Preload since it's a main route
    }
  ),

  AdminPage: createLazyComponent(
    () => import('../pages/AdminPage'),
    {
      name: 'AdminPage',
      loadingProps: { componentName: 'Admin Dashboard' }
    }
  ),

  HomePage: createLazyComponent(
    () => import('../pages/HomePage'),
    {
      name: 'HomePage',
      loadingProps: { skeleton: true, componentName: 'Home' },
      preload: true
    }
  ),

  TablePage: createLazyComponent(
    () => import('../pages/TablePage'),
    {
      name: 'TablePage',
      loadingProps: { componentName: 'Table Selection' }
    }
  ),

  // Menu components
  MenuPageContainer: createLazyComponent(
    () => import('../components/Menu/MenuPageContainer'),
    {
      name: 'MenuPageContainer',
      loadingProps: { skeleton: true }
    }
  ),

  ProductGrid: createLazyComponent(
    () => import('../components/Menu/ProductGrid'),
    {
      name: 'ProductGrid',
      loadingProps: { skeleton: true }
    }
  ),

  MenuProductCard: createLazyComponent(
    () => import('../components/Menu/MenuProductCard'),
    {
      name: 'MenuProductCard',
      loadingProps: { skeleton: true }
    }
  ),

  // Admin components
  AdminDashboard: createLazyComponent(
    () => import('../components/Admin/AdminDashboard'),
    {
      name: 'AdminDashboard',
      loadingProps: { componentName: 'Dashboard' }
    }
  ),

  ProductManager: createLazyComponent(
    () => import('../components/Admin/ProductManager'),
    {
      name: 'ProductManager',
      loadingProps: { componentName: 'Product Manager' }
    }
  ),

  CategoryManager: createLazyComponent(
    () => import('../components/Admin/CategoryManager'),
    {
      name: 'CategoryManager',
      loadingProps: { componentName: 'Category Manager' }
    }
  ),

  Analytics: createLazyComponent(
    () => import('../components/Admin/Analytics'),
    {
      name: 'Analytics',
      loadingProps: { componentName: 'Analytics' }
    }
  ),

  // Optimized components
  OptimizedProductGrid: createLazyComponent(
    () => import('../components/Menu/OptimizedProductGrid'),
    {
      name: 'OptimizedProductGrid',
      loadingProps: { skeleton: true },
      preload: false // Load on demand for optimization
    }
  ),

  OptimizedMenuProductCard: createLazyComponent(
    () => import('../components/Menu/OptimizedMenuProductCard'),
    {
      name: 'OptimizedMenuProductCard',
      loadingProps: { skeleton: true }
    }
  )
};

/**
 * Utility to preload specific routes
 */
export const preloadRoutes = {
  /** Preload main user-facing routes */
  preloadUserRoutes: () => {
    bundleOptimization.preloadModule(() => import('../pages/MenuPage'));
    bundleOptimization.preloadModule(() => import('../pages/HomePage'));
    bundleOptimization.preloadModule(() => import('../components/Menu/MenuPageContainer'));
  },

  /** Preload admin routes */
  preloadAdminRoutes: () => {
    bundleOptimization.preloadModule(() => import('../pages/AdminPage'));
    bundleOptimization.preloadModule(() => import('../components/Admin/AdminDashboard'));
    bundleOptimization.preloadModule(() => import('../components/Admin/ProductManager'));
  },

  /** Preload critical menu components */
  preloadMenuComponents: () => {
    bundleOptimization.preloadModule(() => import('../components/Menu/ProductGrid'));
    bundleOptimization.preloadModule(() => import('../components/Menu/MenuProductCard'));
    bundleOptimization.preloadModule(() => import('../components/Menu/CategoryNavigation'));
  }
};

/**
 * Route transition component with loading state
 */
export const RouteTransition: React.FC<{
  children: ReactNode;
  isLoading?: boolean;
  loadingComponent?: ReactNode;
}> = ({
  children,
  isLoading = false,
  loadingComponent
}) => {
  if (isLoading) {
    return (loadingComponent as React.ReactElement) || <DefaultLoadingComponent message="Loading page..." />;
  }

  return <>{children}</> as React.ReactElement;
};

/**
 * Bundle analysis utilities
 */
export const bundleAnalysis = {
  /** Log current bundle information */
  logBundleInfo: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      
      const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const totalCSSSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      
      console.group('[Bundle Analysis]');
      console.log(`Total JS: ${(totalJSSize / 1024).toFixed(2)} KB`);
      console.log(`Total CSS: ${(totalCSSSize / 1024).toFixed(2)} KB`);
      console.log(`JS Files: ${jsResources.length}`);
      console.log(`CSS Files: ${cssResources.length}`);
      console.groupEnd();
    }
  },

  /** Check for unused exports (development only) */
  checkUnusedExports: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Bundle Analysis] Unused export detection is available in production build analysis');
    }
  }
};

export default {
  createLazyComponent,
  LazyRoutes,
  preloadRoutes,
  RouteTransition,
  DefaultLoadingComponent,
  LazyErrorBoundary,
  bundleAnalysis
};