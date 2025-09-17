/**
 * @file testHelpers.js
 * @description Utility functions and helpers for navigation component testing
 */

import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  preferences: {
    language: 'en',
    theme: 'light'
  },
  ...overrides
});

export const createMockCategory = (overrides = {}) => ({
  id: '1',
  name: 'Test Category',
  icon: '📦',
  count: 10,
  subcategories: [],
  ...overrides
});

export const createMockWiFiNetwork = (overrides = {}) => ({
  ssid: 'TestNetwork',
  signalStrength: 75,
  secured: false,
  connected: false,
  ...overrides
});

// Context factory functions
export const createMockNavigationContext = (overrides = {}) => ({
  currentTab: 'home',
  setCurrentTab: jest.fn(),
  tabHistory: ['home'],
  badges: { notifications: 0, cart: 0 },
  ...overrides
});

export const createMockI18nContext = (overrides = {}) => ({
  currentLanguage: 'en',
  setLanguage: jest.fn(),
  availableLanguages: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ],
  translations: {},
  isLoading: false,
  isRTL: false,
  error: null,
  ...overrides
});

export const createMockCategoryContext = (overrides = {}) => ({
  categories: [
    createMockCategory({ id: '1', name: 'Electronics', icon: '📱' }),
    createMockCategory({ id: '2', name: 'Clothing', icon: '👕' })
  ],
  selectedCategory: null,
  selectedSubcategory: null,
  setSelectedCategory: jest.fn(),
  setSelectedSubcategory: jest.fn(),
  searchQuery: '',
  setSearchQuery: jest.fn(),
  isLoading: false,
  error: null,
  viewMode: 'grid',
  setViewMode: jest.fn(),
  ...overrides
});

export const createMockAuthContext = (overrides = {}) => ({
  isAuthenticated: false,
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  resetPassword: jest.fn(),
  isLoading: false,
  error: null,
  networkStatus: 'connected',
  signalStrength: 85,
  ssid: 'TestWiFi',
  ...overrides
});

// Test wrapper components
export const NavigationTestWrapper = ({ 
  children, 
  navigationContext = createMockNavigationContext(),
  i18nContext = createMockI18nContext(),
  categoryContext = createMockCategoryContext(),
  authContext = createMockAuthContext(),
  router = true,
  initialRoute = '/'
}) => {
  const content = (
    <AuthContext.Provider value={authContext}>
      <NavigationContext.Provider value={navigationContext}>
        <I18nContext.Provider value={i18nContext}>
          <CategoryContext.Provider value={categoryContext}>
            {children}
          </CategoryContext.Provider>
        </I18nContext.Provider>
      </NavigationContext.Provider>
    </AuthContext.Provider>
  );

  if (router) {
    return (
      <MemoryRouter initialEntries={[initialRoute]}>
        {content}
      </MemoryRouter>
    );
  }

  return content;
};

// Custom render function with default providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    navigationContext,
    i18nContext,
    categoryContext,
    authContext,
    router,
    initialRoute,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <NavigationTestWrapper
      navigationContext={navigationContext}
      i18nContext={i18nContext}
      categoryContext={categoryContext}
      authContext={authContext}
      router={router}
      initialRoute={initialRoute}
    >
      {children}
    </NavigationTestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Performance testing utilities
export const measureRenderTime = (renderFunction) => {
  const start = performance.now();
  const result = renderFunction();
  const end = performance.now();
  
  return {
    result,
    renderTime: end - start
  };
};

export const measureAsyncOperation = async (asyncFunction) => {
  const start = performance.now();
  const result = await asyncFunction();
  const end = performance.now();
  
  return {
    result,
    operationTime: end - start
  };
};

// Accessibility testing utilities
export const createAxeConfig = (rules = {}) => ({
  rules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
    'landmark-roles': { enabled: true },
    'heading-structure': { enabled: true },
    'form-labels': { enabled: true },
    'button-accessibility': { enabled: true },
    'image-alt-text': { enabled: true },
    'link-accessibility': { enabled: true },
    ...rules
  }
});

export const getAccessibilityViolations = async (element, config = createAxeConfig()) => {
  const { axe } = await import('jest-axe');
  const configuredAxe = axe.configure ? axe.configure(config) : axe;
  return await configuredAxe(element);
};

// Mock environment utilities
export const mockViewport = (width, height = 800) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

export const mockMediaQuery = (query, matches = true) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(q => ({
      matches: q === query ? matches : false,
      media: q,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });
};

export const mockGeolocation = () => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  };

  Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  });

  return mockGeolocation;
};

export const mockLocalStorage = () => {
  const store = {};
  const mockStorage = {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true
  });

  return mockStorage;
};

export const mockSessionStorage = () => {
  const store = {};
  const mockStorage = {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: mockStorage,
    writable: true
  });

  return mockStorage;
};

// Network and connectivity mocks
export const mockNetworkStatus = (online = true) => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: online,
  });
};

export const mockConnectionType = (type = '4g') => {
  Object.defineProperty(navigator, 'connection', {
    writable: true,
    value: {
      effectiveType: type,
      downlink: type === '4g' ? 10 : 1,
      rtt: type === '4g' ? 50 : 200
    }
  });
};

// Touch and gesture mocking
export const createTouchEvent = (type, touches = []) => {
  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: touches.map(touch => ({
      clientX: touch.x || 0,
      clientY: touch.y || 0,
      identifier: touch.id || 0,
      ...touch
    }))
  });
};

export const simulateSwipe = (element, direction = 'left', distance = 100) => {
  const startX = direction === 'left' ? distance : 0;
  const endX = direction === 'left' ? 0 : distance;
  
  const touchStart = createTouchEvent('touchstart', [{ x: startX, y: 0, id: 0 }]);
  const touchMove = createTouchEvent('touchmove', [{ x: endX, y: 0, id: 0 }]);
  const touchEnd = createTouchEvent('touchend', []);
  
  element.dispatchEvent(touchStart);
  element.dispatchEvent(touchMove);
  element.dispatchEvent(touchEnd);
};

// Test data generators
export const generateCategories = (count = 5) => {
  return Array.from({ length: count }, (_, index) => createMockCategory({
    id: `cat-${index}`,
    name: `Category ${index}`,
    count: Math.floor(Math.random() * 100),
    subcategories: Array.from({ length: 3 }, (_, subIndex) => ({
      id: `sub-${index}-${subIndex}`,
      name: `Subcategory ${subIndex}`,
      count: Math.floor(Math.random() * 50)
    }))
  }));
};

export const generateLanguages = (count = 3) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];
  
  return languages.slice(0, count);
};

// Custom matchers
export const customMatchers = {
  toHaveBeenCalledAfter: (received, afterFn) => {
    const receivedCalls = received.mock.calls;
    const afterCalls = afterFn.mock.calls;
    
    if (receivedCalls.length === 0) {
      return {
        message: () => `Expected function to have been called`,
        pass: false
      };
    }
    
    const lastReceivedCall = received.mock.timestamps[received.mock.timestamps.length - 1];
    const lastAfterCall = afterFn.mock.timestamps ? afterFn.mock.timestamps[afterFn.mock.timestamps.length - 1] : 0;
    
    const pass = lastReceivedCall > lastAfterCall;
    
    return {
      message: () => 
        pass 
          ? `Expected function not to have been called after ${afterFn.getMockName()}`
          : `Expected function to have been called after ${afterFn.getMockName()}`,
      pass
    };
  }
};

// Test lifecycle utilities
export const setupTestEnvironment = () => {
  // Mock all necessary APIs
  mockLocalStorage();
  mockSessionStorage();
  mockNetworkStatus(true);
  mockViewport(1024);
  
  // Mock timers
  jest.useFakeTimers();
  
  return {
    cleanup: () => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    }
  };
};

export const teardownTestEnvironment = () => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();
};