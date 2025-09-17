/**
 * @file setupTests.js
 * @description Global test setup and configuration for navigation component tests
 */

import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import 'jest-axe/extend-expect';

// Mock intersection observer
class MockIntersectionObserver {
  constructor() {
    this.observe = jest.fn();
    this.disconnect = jest.fn();
    this.unobserve = jest.fn();
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  constructor() {
    this.observe = jest.fn();
    this.disconnect = jest.fn();
    this.unobserve = jest.fn();
  }
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// Mock MutationObserver
class MockMutationObserver {
  constructor() {
    this.observe = jest.fn();
    this.disconnect = jest.fn();
  }
}

Object.defineProperty(window, 'MutationObserver', {
  writable: true,
  configurable: true,
  value: MockMutationObserver,
});

// Mock requestAnimationFrame and cancelAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: (callback) => {
    return setTimeout(callback, 16);
  },
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: (id) => {
    clearTimeout(id);
  },
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
  },
});

// Mock Web APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    getPropertyValue: jest.fn(() => ''),
    backgroundColor: 'rgb(255, 255, 255)',
    color: 'rgb(0, 0, 0)',
    fontSize: '16px',
    outline: '2px solid blue',
  })),
});

// Mock scroll methods
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(window, 'scrollBy', {
  writable: true,
  value: jest.fn(),
});

// Mock focus and blur methods
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLElement.prototype, 'focus', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLElement.prototype, 'blur', {
  writable: true,
  value: jest.fn(),
});

// Mock getBoundingClientRect
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  writable: true,
  value: jest.fn(() => ({
    width: 44,
    height: 44,
    top: 0,
    left: 0,
    bottom: 44,
    right: 44,
    x: 0,
    y: 0,
  })),
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: jest.fn(),
    readText: jest.fn(),
  },
});

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
});

// Mock network information
Object.defineProperty(navigator, 'connection', {
  writable: true,
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
  },
});

// Mock online/offline status
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock user agent
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
});

// Mock language
Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'en-US',
});

Object.defineProperty(navigator, 'languages', {
  writable: true,
  value: ['en-US', 'en'],
});

// Mock console methods for cleaner test output
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console.error in tests unless explicitly testing error states
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
  console.warn.mockRestore();
});

// Global test utilities
global.flushPromises = () => new Promise(resolve => setImmediate(resolve));

global.waitForNextTick = () => new Promise(resolve => process.nextTick(resolve));

global.waitForAnimation = () => new Promise(resolve => requestAnimationFrame(resolve));

// Mock CSS transitions and animations
global.CSS = {
  supports: jest.fn(() => true),
  escape: jest.fn(str => str),
};

// Mock URL and URLSearchParams
Object.defineProperty(window, 'URL', {
  writable: true,
  value: class MockURL {
    constructor(url) {
      this.href = url;
      this.origin = 'http://localhost:3000';
      this.pathname = '/';
      this.search = '';
      this.searchParams = new URLSearchParams();
    }
  },
});

// Silence act warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((message, ...args) => {
    if (message?.includes('Warning: An invalid form control')) return;
    if (message?.includes('Warning: ReactDOM.render is no longer supported')) return;
    if (message?.includes('Warning: `ReactDOMTestUtils.act`')) return;
    originalError.call(console, message, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
});

// Global Jest configuration
jest.setTimeout(10000); // 10 second timeout for async tests

// Mock timers configuration
jest.useFakeTimers({
  advanceTimers: true,
  doNotFake: ['performance'], // Keep performance.now() working
});

// Global cleanup after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Reset viewport
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
  });
  
  // Reset focus
  if (document.activeElement && document.activeElement !== document.body) {
    document.activeElement.blur();
  }
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export common test utilities
export const testUtils = {
  flushPromises: global.flushPromises,
  waitForNextTick: global.waitForNextTick,
  waitForAnimation: global.waitForAnimation,
  
  // Mock helpers
  mockViewport: (width, height = 768) => {
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
    
    window.dispatchEvent(new Event('resize'));
  },
  
  mockMatchMedia: (query, matches = false) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(q => ({
        matches: q === query ? matches : false,
        media: q,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  },
  
  // Time helpers
  advanceTime: (ms) => {
    jest.advanceTimersByTime(ms);
  },
  
  runAllTimers: () => {
    jest.runAllTimers();
  },
  
  runOnlyPendingTimers: () => {
    jest.runOnlyPendingTimers();
  }
};

// Add custom Jest matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  
  toHaveBeenCalledAfter(received, afterTime) {
    const calls = received.mock.calls;
    const timestamps = received.mock.timestamps || [];
    
    if (calls.length === 0) {
      return {
        message: () => `Expected function to have been called`,
        pass: false,
      };
    }
    
    const lastCallTime = Math.max(...timestamps);
    const pass = lastCallTime > afterTime;
    
    return {
      message: () =>
        pass
          ? `Expected function not to have been called after ${afterTime}`
          : `Expected function to have been called after ${afterTime}`,
      pass,
    };
  }
});