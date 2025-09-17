/**
 * Keyboard navigation hook
 * Provides comprehensive keyboard navigation support for complex components
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { keyboardUtils, getFocusableElements } from '../utils/accessibility';

interface KeyboardNavigationOptions {
  // Container element or ref
  containerRef?: React.RefObject<HTMLElement>;
  
  // Navigation behavior
  horizontal?: boolean;
  vertical?: boolean;
  wrap?: boolean;
  
  // Grid navigation
  isGrid?: boolean;
  columnsCount?: number;
  
  // Custom key handlers
  onEscape?: () => void;
  onEnter?: (activeIndex: number, element: HTMLElement) => void;
  onSpace?: (activeIndex: number, element: HTMLElement) => void;
  
  // Element selection
  customFocusableSelector?: string;
  skipElements?: (element: HTMLElement) => boolean;
  
  // Activation
  enabled?: boolean;
  activateOnMount?: boolean;
}

interface UseKeyboardNavigationReturn {
  // State
  activeIndex: number;
  focusableElements: HTMLElement[];
  
  // Actions
  setActiveIndex: (index: number) => void;
  focusElement: (index: number) => void;
  focusFirst: () => void;
  focusLast: () => void;
  focusNext: () => void;
  focusPrevious: () => void;
  
  // Utilities
  refreshElements: () => void;
  isNavigationActive: boolean;
}

/**
 * Hook for implementing keyboard navigation in lists, grids, and menus
 */
export const useKeyboardNavigation = ({
  containerRef,
  horizontal = true,
  vertical = true,
  wrap = true,
  isGrid = false,
  columnsCount,
  onEscape,
  onEnter,
  onSpace,
  customFocusableSelector,
  skipElements,
  enabled = true,
  activateOnMount = false
}: KeyboardNavigationOptions = {}): UseKeyboardNavigationReturn => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const [isNavigationActive, setIsNavigationActive] = useState(false);
  
  const containerElementRef = useRef<HTMLElement | null>(null);
  const initialFocusRef = useRef<HTMLElement | null>(null);

  // Get container element
  const getContainer = useCallback(() => {
    if (containerRef?.current) {
      return containerRef.current;
    }
    return containerElementRef.current || document.body;
  }, [containerRef]);

  // Refresh focusable elements
  const refreshElements = useCallback(() => {
    const container = getContainer();
    if (!container) return;

    let elements: HTMLElement[];
    
    if (customFocusableSelector) {
      elements = Array.from(container.querySelectorAll(customFocusableSelector));
    } else {
      elements = getFocusableElements(container);
    }

    // Apply skip filter
    if (skipElements) {
      elements = elements.filter(el => !skipElements(el));
    }

    setFocusableElements(elements);
    
    // Update active index if current element is no longer available
    if (activeIndex >= elements.length) {
      setActiveIndex(elements.length > 0 ? 0 : -1);
    }
  }, [getContainer, customFocusableSelector, skipElements, activeIndex]);

  // Focus element by index
  const focusElement = useCallback((index: number) => {
    if (index >= 0 && index < focusableElements.length) {
      const element = focusableElements[index];
      element.focus();
      setActiveIndex(index);
      setIsNavigationActive(true);
    }
  }, [focusableElements]);

  // Navigation actions
  const focusFirst = useCallback(() => {
    focusElement(0);
  }, [focusElement]);

  const focusLast = useCallback(() => {
    focusElement(focusableElements.length - 1);
  }, [focusElement, focusableElements.length]);

  const focusNext = useCallback(() => {
    const nextIndex = wrap 
      ? (activeIndex + 1) % focusableElements.length 
      : Math.min(activeIndex + 1, focusableElements.length - 1);
    focusElement(nextIndex);
  }, [activeIndex, focusableElements.length, wrap, focusElement]);

  const focusPrevious = useCallback(() => {
    const previousIndex = wrap 
      ? (activeIndex - 1 + focusableElements.length) % focusableElements.length 
      : Math.max(activeIndex - 1, 0);
    focusElement(previousIndex);
  }, [activeIndex, focusableElements.length, wrap, focusElement]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || focusableElements.length === 0) return;

    const currentElement = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(currentElement);
    
    // Update active index based on current focus
    if (currentIndex !== -1 && currentIndex !== activeIndex) {
      setActiveIndex(currentIndex);
    }

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          onEscape();
          event.preventDefault();
        }
        break;
        
      case 'Enter':
        if (onEnter && currentIndex !== -1) {
          onEnter(currentIndex, focusableElements[currentIndex]);
          event.preventDefault();
        }
        break;
        
      case ' ': // Space
        if (onSpace && currentIndex !== -1) {
          onSpace(currentIndex, focusableElements[currentIndex]);
          event.preventDefault();
        }
        break;
        
      case 'ArrowRight':
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        if (currentIndex !== -1) {
          const newIndex = keyboardUtils.handleArrowNavigation(
            event,
            focusableElements,
            currentIndex,
            {
              horizontal,
              vertical,
              wrap,
              columnsCount: isGrid ? columnsCount : undefined
            }
          );
          
          if (newIndex !== currentIndex) {
            setActiveIndex(newIndex);
            setIsNavigationActive(true);
          }
        }
        break;
        
      case 'Tab':
        // Let tab work normally but track navigation state
        setIsNavigationActive(true);
        break;
    }
  }, [enabled, focusableElements, activeIndex, horizontal, vertical, wrap, isGrid, columnsCount, onEscape, onEnter, onSpace]);

  // Handle focus events
  const handleFocus = useCallback((event: FocusEvent) => {
    if (!enabled) return;
    
    const target = event.target as HTMLElement;
    const index = focusableElements.indexOf(target);
    
    if (index !== -1) {
      setActiveIndex(index);
      setIsNavigationActive(true);
    }
  }, [enabled, focusableElements]);

  const handleBlur = useCallback((event: FocusEvent) => {
    // Only deactivate if focus is leaving the container entirely
    const container = getContainer();
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    if (!container || !relatedTarget || !container.contains(relatedTarget)) {
      setIsNavigationActive(false);
      setActiveIndex(-1);
    }
  }, [getContainer]);

  // Set up event listeners
  useEffect(() => {
    const container = getContainer();
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusin', handleFocus);
    container.addEventListener('focusout', handleBlur);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusin', handleFocus);
      container.removeEventListener('focusout', handleBlur);
    };
  }, [handleKeyDown, handleFocus, handleBlur, getContainer]);

  // Refresh elements when container changes
  useEffect(() => {
    refreshElements();
  }, [refreshElements]);

  // Set up mutation observer to watch for DOM changes
  useEffect(() => {
    const container = getContainer();
    if (!container) return;

    const observer = new MutationObserver(() => {
      refreshElements();
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
  }, [getContainer, refreshElements]);

  // Activate on mount if requested
  useEffect(() => {
    if (activateOnMount && focusableElements.length > 0) {
      // Store initial focus to restore later
      initialFocusRef.current = document.activeElement as HTMLElement;
      focusFirst();
    }
  }, [activateOnMount, focusableElements.length, focusFirst]);

  // Custom setActiveIndex with bounds checking
  const setActiveIndexSafe = useCallback((index: number) => {
    const clampedIndex = Math.max(-1, Math.min(index, focusableElements.length - 1));
    setActiveIndex(clampedIndex);
  }, [focusableElements.length]);

  return {
    activeIndex,
    focusableElements,
    setActiveIndex: setActiveIndexSafe,
    focusElement,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    refreshElements,
    isNavigationActive
  };
};

export default useKeyboardNavigation;