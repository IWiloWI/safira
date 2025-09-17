/**
 * Focus management hook
 * Provides advanced focus control including focus trapping, restoration, and monitoring
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { focusUtils, getFocusableElements } from '../utils/accessibility';

interface FocusManagementOptions {
  // Focus trapping
  trapFocus?: boolean;
  restoreFocus?: boolean;
  
  // Container
  containerRef?: React.RefObject<HTMLElement>;
  
  // Initial focus
  initialFocusRef?: React.RefObject<HTMLElement>;
  autoFocus?: boolean;
  
  // Focus monitoring
  onFocusEnter?: (element: HTMLElement) => void;
  onFocusLeave?: (element: HTMLElement) => void;
  onFocusChange?: (element: HTMLElement | null) => void;
  
  // Escape handling
  onEscape?: () => void;
  
  // Activation
  enabled?: boolean;
}

interface UseFocusManagementReturn {
  // State
  isActive: boolean;
  currentFocus: HTMLElement | null;
  focusableElements: HTMLElement[];
  
  // Actions
  activate: () => void;
  deactivate: () => void;
  focusFirst: () => void;
  focusLast: () => void;
  restorePreviousFocus: () => void;
  
  // Utilities
  refreshFocusableElements: () => void;
  isFocusTrapped: boolean;
}

/**
 * Hook for managing focus in complex components like modals, menus, and forms
 */
export const useFocusManagement = ({
  trapFocus = false,
  restoreFocus = true,
  containerRef,
  initialFocusRef,
  autoFocus = false,
  onFocusEnter,
  onFocusLeave,
  onFocusChange,
  onEscape,
  enabled = true
}: FocusManagementOptions = {}): UseFocusManagementReturn => {
  const [isActive, setIsActive] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<HTMLElement | null>(null);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const cleanupFocusTrapRef = useRef<(() => void) | null>(null);
  const containerElementRef = useRef<HTMLElement | null>(null);
  const isInitializedRef = useRef(false);

  // Get container element
  const getContainer = useCallback(() => {
    if (containerRef?.current) {
      return containerRef.current;
    }
    return containerElementRef.current || document.body;
  }, [containerRef]);

  // Refresh focusable elements
  const refreshFocusableElements = useCallback(() => {
    const container = getContainer();
    if (!container) return;

    const elements = getFocusableElements(container);
    setFocusableElements(elements);
  }, [getContainer]);

  // Focus first element
  const focusFirst = useCallback(() => {
    const elements = focusableElements.length > 0 ? focusableElements : getFocusableElements(getContainer());
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [focusableElements, getContainer]);

  // Focus last element
  const focusLast = useCallback(() => {
    const elements = focusableElements.length > 0 ? focusableElements : getFocusableElements(getContainer());
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  }, [focusableElements, getContainer]);

  // Restore previous focus
  const restorePreviousFocus = useCallback(() => {
    if (restoreFocus && previousFocusRef.current) {
      focusUtils.restoreFocus(previousFocusRef.current);
      previousFocusRef.current = null;
    }
  }, [restoreFocus]);

  // Activate focus management
  const activate = useCallback(() => {
    if (!enabled || isActive) return;

    const container = getContainer();
    if (!container) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    // Refresh focusable elements
    refreshFocusableElements();
    
    // Set up focus trap
    if (trapFocus) {
      cleanupFocusTrapRef.current = focusUtils.trapFocus(container);
    }
    
    // Focus initial element
    if (autoFocus) {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        focusFirst();
      }
    }
    
    setIsActive(true);
    
    // Call focus enter callback
    if (onFocusEnter && container) {
      onFocusEnter(container);
    }
  }, [enabled, isActive, getContainer, trapFocus, autoFocus, initialFocusRef, focusFirst, refreshFocusableElements, onFocusEnter]);

  // Deactivate focus management
  const deactivate = useCallback(() => {
    if (!isActive) return;

    const container = getContainer();
    
    // Clean up focus trap
    if (cleanupFocusTrapRef.current) {
      cleanupFocusTrapRef.current();
      cleanupFocusTrapRef.current = null;
    }
    
    // Restore previous focus
    restorePreviousFocus();
    
    setIsActive(false);
    setCurrentFocus(null);
    
    // Call focus leave callback
    if (onFocusLeave && container) {
      onFocusLeave(container);
    }
  }, [isActive, getContainer, restorePreviousFocus, onFocusLeave]);

  // Handle focus changes
  const handleFocusChange = useCallback((event: FocusEvent) => {
    if (!isActive) return;

    const target = event.target as HTMLElement;
    const container = getContainer();
    
    // Check if focus is within our container
    if (container && container.contains(target)) {
      setCurrentFocus(target);
      if (onFocusChange) {
        onFocusChange(target);
      }
    } else if (trapFocus) {
      // Focus escaped the container - bring it back
      event.preventDefault();
      focusFirst();
    }
  }, [isActive, getContainer, trapFocus, focusFirst, onFocusChange]);

  // Handle keydown events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !enabled) return;

    if (event.key === 'Escape' && onEscape) {
      onEscape();
      event.preventDefault();
    }
  }, [isActive, enabled, onEscape]);

  // Set up event listeners
  useEffect(() => {
    if (!isActive) return;

    document.addEventListener('focusin', handleFocusChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('focusin', handleFocusChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, handleFocusChange, handleKeyDown]);

  // Set up mutation observer for dynamic content
  useEffect(() => {
    if (!isActive) return;

    const container = getContainer();
    if (!container) return;

    const observer = new MutationObserver(() => {
      refreshFocusableElements();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex', 'disabled', 'hidden', 'aria-hidden']
    });

    return () => {
      observer.disconnect();
    };
  }, [isActive, getContainer, refreshFocusableElements]);

  // Auto-activate on mount if enabled
  useEffect(() => {
    if (enabled && autoFocus && !isInitializedRef.current) {
      isInitializedRef.current = true;
      activate();
    }
  }, [enabled, autoFocus, activate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupFocusTrapRef.current) {
        cleanupFocusTrapRef.current();
      }
      if (restoreFocus && previousFocusRef.current) {
        focusUtils.restoreFocus(previousFocusRef.current);
      }
    };
  }, [restoreFocus]);

  return {
    isActive,
    currentFocus,
    focusableElements,
    activate,
    deactivate,
    focusFirst,
    focusLast,
    restorePreviousFocus,
    refreshFocusableElements,
    isFocusTrapped: trapFocus && isActive
  };
};

export default useFocusManagement;