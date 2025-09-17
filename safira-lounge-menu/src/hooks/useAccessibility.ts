/**
 * Accessibility state management hook
 * Provides centralized accessibility state and preferences management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ariaUtils, motionUtils, screenReaderUtils } from '../utils/accessibility';

interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  screenReaderActive: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
}

interface AccessibilityState extends AccessibilityPreferences {
  announcements: string[];
  focusedElementId: string | null;
  lastAnnouncementTime: number;
}

interface UseAccessibilityReturn {
  // State
  accessibility: AccessibilityState;
  
  // Actions
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  setFocusedElement: (elementId: string | null) => void;
  updatePreferences: (preferences: Partial<AccessibilityPreferences>) => void;
  clearAnnouncements: () => void;
  
  // Utilities
  isReducedMotion: boolean;
  isHighContrast: boolean;
  isScreenReaderActive: boolean;
  shouldShowFocusRing: boolean;
}

const defaultPreferences: AccessibilityPreferences = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  screenReaderActive: false,
  keyboardNavigation: false,
  focusVisible: false
};

/**
 * Hook for managing accessibility state and preferences
 */
export const useAccessibility = (): UseAccessibilityReturn => {
  const [accessibility, setAccessibility] = useState<AccessibilityState>({
    ...defaultPreferences,
    announcements: [],
    focusedElementId: null,
    lastAnnouncementTime: 0
  });
  
  const announcementTimeoutRef = useRef<NodeJS.Timeout>();
  const preferencesRef = useRef<AccessibilityPreferences>(defaultPreferences);

  // Initialize accessibility preferences from system/user settings
  useEffect(() => {
    const detectPreferences = () => {
      const preferences: AccessibilityPreferences = {
        reducedMotion: motionUtils.prefersReducedMotion(),
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        fontSize: getFontSizePreference(),
        screenReaderActive: screenReaderUtils.isScreenReaderActive(),
        keyboardNavigation: false, // Will be detected on first keyboard interaction
        focusVisible: false
      };
      
      preferencesRef.current = preferences;
      setAccessibility(prev => ({ ...prev, ...preferences }));
    };

    detectPreferences();

    // Listen for preference changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)')
    ];

    const handleMediaChange = () => detectPreferences();
    mediaQueries.forEach(mq => mq.addEventListener('change', handleMediaChange));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', handleMediaChange));
    };
  }, []);

  // Detect keyboard navigation
  useEffect(() => {
    let keyboardUsed = false;
    let mouseUsed = false;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        keyboardUsed = true;
        if (!mouseUsed) {
          setAccessibility(prev => ({
            ...prev,
            keyboardNavigation: true,
            focusVisible: true
          }));
        }
      }
    };

    const handleMousedown = () => {
      mouseUsed = true;
      if (keyboardUsed) {
        setAccessibility(prev => ({
          ...prev,
          focusVisible: false
        }));
      }
    };

    const handleFocusin = () => {
      if (keyboardUsed && !mouseUsed) {
        setAccessibility(prev => ({
          ...prev,
          focusVisible: true
        }));
      }
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousedown', handleMousedown);
    document.addEventListener('focusin', handleFocusin);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleMousedown);
      document.removeEventListener('focusin', handleFocusin);
    };
  }, []);

  // Store preferences in localStorage
  useEffect(() => {
    const storedPrefs = localStorage.getItem('accessibility-preferences');
    if (storedPrefs) {
      try {
        const parsed = JSON.parse(storedPrefs);
        setAccessibility(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to parse stored accessibility preferences:', error);
      }
    }
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const now = Date.now();
    
    // Prevent spam announcements
    if (now - accessibility.lastAnnouncementTime < 500) {
      return;
    }

    // Add to announcements list
    setAccessibility(prev => ({
      ...prev,
      announcements: [...prev.announcements.slice(-4), message], // Keep last 5 announcements
      lastAnnouncementTime: now
    }));

    // Use ARIA live region
    ariaUtils.announce(message, priority);

    // Clear announcement after timeout
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }
    
    announcementTimeoutRef.current = setTimeout(() => {
      setAccessibility(prev => ({
        ...prev,
        announcements: prev.announcements.filter(a => a !== message)
      }));
    }, 5000);
  }, [accessibility.lastAnnouncementTime]);

  const setFocusedElement = useCallback((elementId: string | null) => {
    setAccessibility(prev => ({
      ...prev,
      focusedElementId: elementId
    }));
  }, []);

  const updatePreferences = useCallback((preferences: Partial<AccessibilityPreferences>) => {
    const newPreferences = { ...preferencesRef.current, ...preferences };
    preferencesRef.current = newPreferences;
    
    setAccessibility(prev => ({ ...prev, ...preferences }));
    
    // Store in localStorage
    localStorage.setItem('accessibility-preferences', JSON.stringify(newPreferences));
    
    // Announce significant changes
    if (preferences.highContrast !== undefined) {
      announce(`High contrast mode ${preferences.highContrast ? 'enabled' : 'disabled'}`);
    }
    if (preferences.reducedMotion !== undefined) {
      announce(`Reduced motion ${preferences.reducedMotion ? 'enabled' : 'disabled'}`);
    }
    if (preferences.fontSize) {
      announce(`Font size changed to ${preferences.fontSize}`);
    }
  }, [announce]);

  const clearAnnouncements = useCallback(() => {
    setAccessibility(prev => ({
      ...prev,
      announcements: []
    }));
    
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  return {
    accessibility,
    announce,
    setFocusedElement,
    updatePreferences,
    clearAnnouncements,
    isReducedMotion: accessibility.reducedMotion,
    isHighContrast: accessibility.highContrast,
    isScreenReaderActive: accessibility.screenReaderActive,
    shouldShowFocusRing: accessibility.focusVisible
  };
};

/**
 * Detect user's font size preference
 */
const getFontSizePreference = (): AccessibilityPreferences['fontSize'] => {
  const rootFontSize = parseInt(window.getComputedStyle(document.documentElement).fontSize);
  
  if (rootFontSize >= 20) return 'extra-large';
  if (rootFontSize >= 18) return 'large';
  if (rootFontSize <= 14) return 'small';
  return 'medium';
};

export default useAccessibility;