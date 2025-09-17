/**
 * Haptic Feedback Utility
 * Provides cross-platform haptic feedback using Web Vibration API
 * with fallbacks and pattern support for enhanced mobile experience
 */

import { HapticType, HapticConfig } from '../types/navigation.types';

/**
 * Vibration patterns for different haptic types
 * Patterns are defined as [vibrate, pause, vibrate, pause, ...]
 */
const HAPTIC_PATTERNS: Record<HapticType, number[]> = {
  light: [10], // Single light tap
  medium: [20], // Single medium tap
  heavy: [30], // Single heavy tap
  selection: [10, 20, 10], // Double light tap for selection
  impact: [50, 30, 50], // Double heavy tap for impact
};

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator && typeof navigator.vibrate === 'function';
}

/**
 * Check if device likely supports haptics based on user agent
 */
export function isLikelyMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Trigger haptic feedback with specified type
 */
export function triggerHaptic(
  type: HapticType,
  config: HapticConfig = { enabled: true, defaultType: 'light', patterns: {
    categoryChange: 'light',
    backNavigation: 'medium',
    quickAction: 'light',
    error: 'heavy',
    success: 'light',
  }}
): void {
  // Early return if haptics are disabled or not supported
  if (!config.enabled || !isHapticSupported()) {
    return;
  }

  const pattern = HAPTIC_PATTERNS[type] || HAPTIC_PATTERNS[config.defaultType];
  
  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

/**
 * Trigger custom vibration pattern
 */
export function triggerCustomPattern(pattern: number[]): void {
  if (!isHapticSupported()) {
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('Custom haptic pattern failed:', error);
  }
}

/**
 * Stop all vibrations
 */
export function stopHaptic(): void {
  if (!isHapticSupported()) {
    return;
  }

  try {
    navigator.vibrate(0);
  } catch (error) {
    console.warn('Stop haptic failed:', error);
  }
}

/**
 * Haptic feedback for common UI interactions
 */
export const HapticFeedback = {
  /**
   * Light tap for button presses and selections
   */
  tap: () => triggerHaptic('light'),

  /**
   * Medium feedback for navigation changes
   */
  navigate: () => triggerHaptic('medium'),

  /**
   * Heavy feedback for errors or important actions
   */
  impact: () => triggerHaptic('heavy'),

  /**
   * Selection feedback for toggles and checkboxes
   */
  select: () => triggerHaptic('selection'),

  /**
   * Success feedback for completed actions
   */
  success: () => triggerCustomPattern([10, 30, 10, 30, 10]),

  /**
   * Error feedback for failed actions
   */
  error: () => triggerCustomPattern([50, 50, 50, 50, 50]),

  /**
   * Warning feedback for caution actions
   */
  warning: () => triggerCustomPattern([30, 50, 30]),

  /**
   * Long press feedback
   */
  longPress: () => triggerCustomPattern([100]),

  /**
   * Swipe feedback
   */
  swipe: () => triggerCustomPattern([5, 20, 5]),

  /**
   * Scroll end feedback (subtle)
   */
  scrollEnd: () => triggerCustomPattern([3]),
};

/**
 * Debounced haptic feedback to prevent rapid-fire vibrations
 */
class DebouncedHaptic {
  private timers: Map<string, number> = new Map();
  private readonly defaultDelay = 100; // ms

  trigger(type: HapticType, delay: number = this.defaultDelay): void {
    const key = type;
    
    // Clear existing timer if any
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = window.setTimeout(() => {
      triggerHaptic(type);
      this.timers.delete(key);
    }, delay);

    this.timers.set(key, timer);
  }

  clear(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}

/**
 * Export singleton instance for debounced haptic feedback
 */
export const DebouncedHapticFeedback = new DebouncedHaptic();

/**
 * React hook for haptic feedback in components
 */
export function useHapticFeedback(config?: Partial<HapticConfig>) {
  const defaultConfig: HapticConfig = {
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

  const mergedConfig = { ...defaultConfig, ...config };

  return {
    /**
     * Trigger haptic feedback
     */
    trigger: (type: HapticType) => triggerHaptic(type, mergedConfig),

    /**
     * Trigger debounced haptic feedback
     */
    triggerDebounced: (type: HapticType, delay?: number) => 
      DebouncedHapticFeedback.trigger(type, delay),

    /**
     * Check if haptics are supported
     */
    isSupported: isHapticSupported(),

    /**
     * Quick access to common patterns
     */
    feedback: HapticFeedback,

    /**
     * Configuration object
     */
    config: mergedConfig,
  };
}

/**
 * Enhanced haptic feedback with context awareness
 */
export class ContextualHapticFeedback {
  private config: HapticConfig;
  private context: string = 'default';

  constructor(config: HapticConfig) {
    this.config = config;
  }

  setContext(context: string): void {
    this.context = context;
  }

  trigger(type: HapticType, intensity?: number): void {
    if (!this.config.enabled) return;

    let pattern = HAPTIC_PATTERNS[type];
    
    // Adjust intensity if provided
    if (intensity !== undefined && intensity >= 0 && intensity <= 1) {
      pattern = pattern.map(duration => Math.round(duration * intensity));
    }

    triggerCustomPattern(pattern);
  }

  triggerForAction(action: keyof HapticConfig['patterns']): void {
    const type = this.config.patterns[action];
    this.trigger(type);
  }
}

/**
 * Haptic feedback manager for the navigation system
 */
export class NavigationHapticManager {
  private feedback: ContextualHapticFeedback;
  private enabled: boolean = true;

  constructor(config: HapticConfig) {
    this.feedback = new ContextualHapticFeedback(config);
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  onCategoryChange(): void {
    if (!this.enabled) return;
    this.feedback.triggerForAction('categoryChange');
  }

  onBackNavigation(): void {
    if (!this.enabled) return;
    this.feedback.triggerForAction('backNavigation');
  }

  onQuickAction(): void {
    if (!this.enabled) return;
    this.feedback.triggerForAction('quickAction');
  }

  onError(): void {
    if (!this.enabled) return;
    this.feedback.triggerForAction('error');
  }

  onSuccess(): void {
    if (!this.enabled) return;
    this.feedback.triggerForAction('success');
  }

  onSwipeNavigation(): void {
    if (!this.enabled) return;
    HapticFeedback.swipe();
  }

  onLongPress(): void {
    if (!this.enabled) return;
    HapticFeedback.longPress();
  }
}

/**
 * Default export for convenience
 */
export default {
  trigger: triggerHaptic,
  isSupported: isHapticSupported,
  feedback: HapticFeedback,
  useHapticFeedback,
  NavigationHapticManager,
};