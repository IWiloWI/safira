/**
 * Accessibility utilities and helpers for WCAG 2.1 AA compliance
 * Provides reusable functions for focus management, ARIA support, and a11y features
 */

import { RefObject } from 'react';

// Focus management utilities
export const focusUtils = {
  /**
   * Trap focus within a container element
   */
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Restore focus to a previously focused element
   */
  restoreFocus: (element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      // Use setTimeout to ensure DOM updates are complete
      setTimeout(() => {
        element.focus();
      }, 0);
    }
  },

  /**
   * Move focus to the next focusable element
   */
  focusNext: (container?: HTMLElement) => {
    const focusableElements = getFocusableElements(container || document.body);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex]?.focus();
  },

  /**
   * Move focus to the previous focusable element
   */
  focusPrevious: (container?: HTMLElement) => {
    const focusableElements = getFocusableElements(container || document.body);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    const previousIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    focusableElements[previousIndex]?.focus();
  }
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement = document.body): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'iframe',
    'object',
    'embed',
    'area[href]',
    'summary'
  ].join(',');

  const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  
  return elements.filter(element => {
    // Filter out hidden elements
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      element.offsetParent !== null &&
      !element.hasAttribute('inert')
    );
  });
};

// ARIA utilities
export const ariaUtils = {
  /**
   * Generate unique ID for ARIA relationships
   */
  generateId: (prefix: string = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Announce message to screen readers via live region
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = getLiveRegion(priority);
    liveRegion.textContent = message;
    
    // Clear after announcement to allow repeat announcements
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  },

  /**
   * Set ARIA expanded state and announce change
   */
  setExpanded: (element: HTMLElement, expanded: boolean, announceChange: boolean = true) => {
    element.setAttribute('aria-expanded', expanded.toString());
    
    if (announceChange) {
      const label = element.getAttribute('aria-label') || element.textContent || 'Element';
      const state = expanded ? 'expanded' : 'collapsed';
      ariaUtils.announce(`${label} ${state}`);
    }
  },

  /**
   * Update ARIA live region content
   */
  updateLiveRegion: (content: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = getLiveRegion(priority);
    liveRegion.textContent = content;
  }
};

/**
 * Get or create ARIA live region
 */
const getLiveRegion = (priority: 'polite' | 'assertive'): HTMLElement => {
  const id = `aria-live-${priority}`;
  let liveRegion = document.getElementById(id);
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = id;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }
  
  return liveRegion;
};

// Keyboard navigation utilities
export const keyboardUtils = {
  /**
   * Handle arrow key navigation in a list or grid
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
    options: {
      horizontal?: boolean;
      vertical?: boolean;
      wrap?: boolean;
      columnsCount?: number;
    } = {}
  ): number => {
    const { horizontal = true, vertical = true, wrap = true, columnsCount } = options;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        if (horizontal) {
          newIndex = wrap ? (currentIndex + 1) % elements.length : Math.min(currentIndex + 1, elements.length - 1);
          event.preventDefault();
        }
        break;
      case 'ArrowLeft':
        if (horizontal) {
          newIndex = wrap ? (currentIndex - 1 + elements.length) % elements.length : Math.max(currentIndex - 1, 0);
          event.preventDefault();
        }
        break;
      case 'ArrowDown':
        if (vertical) {
          if (columnsCount) {
            newIndex = Math.min(currentIndex + columnsCount, elements.length - 1);
          } else {
            newIndex = wrap ? (currentIndex + 1) % elements.length : Math.min(currentIndex + 1, elements.length - 1);
          }
          event.preventDefault();
        }
        break;
      case 'ArrowUp':
        if (vertical) {
          if (columnsCount) {
            newIndex = Math.max(currentIndex - columnsCount, 0);
          } else {
            newIndex = wrap ? (currentIndex - 1 + elements.length) % elements.length : Math.max(currentIndex - 1, 0);
          }
          event.preventDefault();
        }
        break;
      case 'Home':
        newIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        newIndex = elements.length - 1;
        event.preventDefault();
        break;
    }

    if (newIndex !== currentIndex && elements[newIndex]) {
      elements[newIndex].focus();
    }

    return newIndex;
  },

  /**
   * Check if key combination matches expected pattern
   */
  isKeyMatch: (event: KeyboardEvent, pattern: string): boolean => {
    const parts = pattern.toLowerCase().split('+');
    const key = event.key.toLowerCase();
    
    const hasCtrl = parts.includes('ctrl') === (event.ctrlKey || event.metaKey);
    const hasShift = parts.includes('shift') === event.shiftKey;
    const hasAlt = parts.includes('alt') === event.altKey;
    const keyMatch = parts.includes(key) || parts.includes(event.code.toLowerCase());
    
    return hasCtrl && hasShift && hasAlt && keyMatch;
  }
};

// Screen reader utilities
export const screenReaderUtils = {
  /**
   * Check if screen reader is likely active
   */
  isScreenReaderActive: (): boolean => {
    // Check for common screen reader indicators
    return !!(
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver') ||
      window.speechSynthesis ||
      document.querySelector('[data-screen-reader]')
    );
  },

  /**
   * Create descriptive text for complex elements
   */
  createDescription: (element: HTMLElement): string => {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const ariaLabel = element.getAttribute('aria-label');
    const text = element.textContent?.trim();
    
    return ariaLabel || text || `${role || tagName} element`;
  }
};

// Color and contrast utilities
export const colorUtils = {
  /**
   * Calculate color contrast ratio
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if color combination meets WCAG contrast requirements
   */
  meetsContrastRequirement: (
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    isLargeText: boolean = false
  ): boolean => {
    const ratio = colorUtils.getContrastRatio(foreground, background);
    const requiredRatio = level === 'AAA' ? (isLargeText ? 4.5 : 7) : (isLargeText ? 3 : 4.5);
    return ratio >= requiredRatio;
  }
};

/**
 * Get relative luminance of a color
 */
const getLuminance = (color: string): number => {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Motion utilities
export const motionUtils = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get safe animation duration based on user preferences
   */
  getSafeAnimationDuration: (defaultDuration: number): number => {
    return motionUtils.prefersReducedMotion() ? 0 : defaultDuration;
  }
};

// Touch and mobile utilities
export const touchUtils = {
  /**
   * Check if touch target meets minimum size requirements (44px)
   */
  meetsTouchTargetSize: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return rect.width >= 44 && rect.height >= 44;
  },

  /**
   * Add touch-friendly padding to small elements
   */
  ensureTouchTarget: (element: HTMLElement): void => {
    if (!touchUtils.meetsTouchTargetSize(element)) {
      element.style.minWidth = '44px';
      element.style.minHeight = '44px';
      element.style.display = 'inline-flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
    }
  }
};

// Validation utilities
export const validationUtils = {
  /**
   * Validate required accessibility attributes
   */
  validateAccessibility: (element: HTMLElement): string[] => {
    const issues: string[] = [];
    const tagName = element.tagName.toLowerCase();
    
    // Check for missing alt text on images
    if (tagName === 'img' && !element.getAttribute('alt')) {
      issues.push('Image missing alt attribute');
    }
    
    // Check for missing labels on form controls
    if (['input', 'select', 'textarea'].includes(tagName)) {
      const hasLabel = element.getAttribute('aria-label') || 
                     element.getAttribute('aria-labelledby') ||
                     document.querySelector(`label[for="${element.id}"]`);
      if (!hasLabel) {
        issues.push('Form control missing label');
      }
    }
    
    // Check for missing roles on custom interactive elements
    if (element.getAttribute('tabindex') && !element.getAttribute('role')) {
      issues.push('Custom interactive element missing role');
    }
    
    return issues;
  }
};

// Export all utilities as default object
export default {
  focus: focusUtils,
  aria: ariaUtils,
  keyboard: keyboardUtils,
  screenReader: screenReaderUtils,
  color: colorUtils,
  motion: motionUtils,
  touch: touchUtils,
  validation: validationUtils,
  getFocusableElements
};