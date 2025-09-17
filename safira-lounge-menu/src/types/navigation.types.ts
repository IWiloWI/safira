/**
 * Enhanced navigation types for comprehensive mobile bottom navigation system
 * Provides type safety for all navigation-related components and hooks
 */

import { Language, MultilingualText } from './common.types';
import { Category } from './product.types';

/**
 * Navigation button configuration
 */
export interface NavigationButton {
  /** Unique identifier for the button */
  id: string;
  /** Button label/text */
  label: string | MultilingualText;
  /** Icon identifier (emoji, React Icon, etc.) */
  icon: string;
  /** Optional badge count */
  badge?: number;
  /** Whether button is currently active */
  active?: boolean;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick: () => void;
  /** Optional test identifier */
  testId?: string;
}

/**
 * Language selector option
 */
export interface LanguageOption {
  /** Language code */
  code: Language;
  /** Display name */
  name: string;
  /** Flag emoji or icon */
  flag: string;
  /** Whether this is the currently selected language */
  selected?: boolean;
}

/**
 * Navigation gesture configuration
 */
export interface GestureConfig {
  /** Minimum swipe distance in pixels */
  minSwipeDistance: number;
  /** Maximum time for a valid swipe in ms */
  maxSwipeTime: number;
  /** Whether gestures are enabled */
  enabled: boolean;
  /** Haptic feedback intensity (0-1) */
  hapticIntensity: number;
}

/**
 * Auto-hide behavior configuration
 */
export interface AutoHideConfig {
  /** Whether auto-hide is enabled */
  enabled: boolean;
  /** Scroll threshold to trigger hide */
  scrollThreshold: number;
  /** Hide delay in milliseconds */
  hideDelay: number;
  /** Show delay in milliseconds */
  showDelay: number;
  /** Whether to hide on scroll down only */
  hideOnScrollDown: boolean;
}

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
  /** Enable screen reader support */
  screenReader: boolean;
  /** Enable keyboard navigation */
  keyboardNavigation: boolean;
  /** Enable high contrast mode support */
  highContrast: boolean;
  /** Enable focus indicators */
  focusIndicators: boolean;
  /** Custom ARIA labels */
  customAriaLabels?: Record<string, string>;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  /** Enable slide animations */
  slideAnimations: boolean;
  /** Animation duration in milliseconds */
  duration: number;
  /** Animation easing function */
  easing: string;
  /** Enable haptic feedback */
  hapticFeedback: boolean;
  /** Enable scale animations on press */
  scaleOnPress: boolean;
}

/**
 * Safe area inset handling
 */
export interface SafeAreaConfig {
  /** Enable safe area handling */
  enabled: boolean;
  /** Bottom inset in pixels */
  bottom: number;
  /** Left inset in pixels */
  left: number;
  /** Right inset in pixels */
  right: number;
  /** Automatic detection from CSS env() */
  autoDetect: boolean;
}

/**
 * Main bottom navigation configuration
 */
export interface BottomNavigationConfig {
  /** Gesture settings */
  gestures: GestureConfig;
  /** Auto-hide behavior */
  autoHide: AutoHideConfig;
  /** Accessibility features */
  accessibility: AccessibilityConfig;
  /** Animation settings */
  animations: AnimationConfig;
  /** Safe area handling */
  safeArea: SafeAreaConfig;
  /** Performance optimizations */
  performance: {
    /** Enable React.memo optimization */
    memoization: boolean;
    /** Debounce rapid actions */
    debounceMs: number;
    /** Enable lazy loading for icons */
    lazyIcons: boolean;
  };
}

/**
 * Category quick navigation item
 */
export interface CategoryNavItem {
  /** Category information */
  category: Category;
  /** Whether this category is currently active */
  active: boolean;
  /** Optional count of items in category */
  itemCount?: number;
  /** Whether category has subcategories */
  hasSubcategories?: boolean;
}

/**
 * Navigation state management
 */
export interface NavigationState {
  /** Currently active category */
  activeCategory: string;
  /** Currently active main category */
  activeMainCategory: string | null;
  /** Whether navigation is visible */
  isVisible: boolean;
  /** Whether a transition is in progress */
  isTransitioning: boolean;
  /** Last scroll position */
  lastScrollY: number;
  /** Whether user is swiping */
  isSwiping: boolean;
}

/**
 * Navigation event types for analytics
 */
export type NavigationEventType =
  | 'category_change'
  | 'language_change'
  | 'back_navigation'
  | 'quick_action'
  | 'gesture_swipe'
  | 'auto_hide_triggered'
  | 'accessibility_action';

/**
 * Navigation event data
 */
export interface NavigationEvent {
  /** Event type */
  type: NavigationEventType;
  /** Target category/action */
  target: string;
  /** Source of the event */
  source: 'tap' | 'swipe' | 'keyboard' | 'voice';
  /** Timestamp */
  timestamp: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Haptic feedback types
 */
export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'impact';

/**
 * Haptic feedback configuration
 */
export interface HapticConfig {
  /** Whether haptics are enabled */
  enabled: boolean;
  /** Default haptic type */
  defaultType: HapticType;
  /** Haptic patterns for different actions */
  patterns: {
    categoryChange: HapticType;
    backNavigation: HapticType;
    quickAction: HapticType;
    error: HapticType;
    success: HapticType;
  };
}

/**
 * Performance monitoring data
 */
export interface NavigationPerformance {
  /** Render time in milliseconds */
  renderTime: number;
  /** Animation frame rate */
  fps: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** Number of re-renders */
  rerenderCount: number;
  /** Touch response time */
  touchResponseTime: number;
}

/**
 * Default navigation configuration
 */
export const DEFAULT_NAVIGATION_CONFIG: BottomNavigationConfig = {
  gestures: {
    minSwipeDistance: 80,
    maxSwipeTime: 300,
    enabled: true,
    hapticIntensity: 0.5,
  },
  autoHide: {
    enabled: true,
    scrollThreshold: 100,
    hideDelay: 300,
    showDelay: 100,
    hideOnScrollDown: true,
  },
  accessibility: {
    screenReader: true,
    keyboardNavigation: true,
    highContrast: true,
    focusIndicators: true,
  },
  animations: {
    slideAnimations: true,
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    hapticFeedback: true,
    scaleOnPress: true,
  },
  safeArea: {
    enabled: true,
    bottom: 0,
    left: 0,
    right: 0,
    autoDetect: true,
  },
  performance: {
    memoization: true,
    debounceMs: 150,
    lazyIcons: true,
  },
};

/**
 * Default haptic configuration
 */
export const DEFAULT_HAPTIC_CONFIG: HapticConfig = {
  enabled: true,
  defaultType: 'light',
  patterns: {
    categoryChange: 'light',
    backNavigation: 'medium',
    quickAction: 'light',
    error: 'heavy',
    success: 'light',
  },
};

/**
 * Language options configuration
 */
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

/**
 * Utility type for component refs
 */
export interface NavigationRefs {
  bottomNav?: React.RefObject<HTMLDivElement>;
  categoryNav?: React.RefObject<HTMLDivElement>;
  languageSelector?: React.RefObject<HTMLDivElement>;
}

/**
 * Hook return type for navigation management
 */
export interface UseEnhancedNavigationReturn {
  /** Current navigation state */
  state: NavigationState;
  /** Configuration object */
  config: BottomNavigationConfig;
  /** Update navigation state */
  updateState: (updates: Partial<NavigationState>) => void;
  /** Update configuration */
  updateConfig: (updates: Partial<BottomNavigationConfig>) => void;
  /** Trigger haptic feedback */
  triggerHaptic: (type: HapticType) => void;
  /** Track navigation event */
  trackEvent: (event: NavigationEvent) => void;
  /** Get performance metrics */
  getPerformanceMetrics: () => NavigationPerformance;
  /** Reset navigation to initial state */
  reset: () => void;
}