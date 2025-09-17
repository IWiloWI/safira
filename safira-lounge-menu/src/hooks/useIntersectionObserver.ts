/**
 * useIntersectionObserver Hook
 * 
 * Provides intersection observer functionality for lazy loading,
 * infinite scrolling, and viewport-based animations.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Options for the intersection observer
 */
export interface IntersectionObserverOptions {
  /** Root element for intersection */
  root?: Element | null;
  /** Root margin for intersection */
  rootMargin?: string;
  /** Threshold(s) for intersection */
  threshold?: number | number[];
  /** Whether to only trigger once */
  triggerOnce?: boolean;
  /** Initial intersection state */
  initialIsIntersecting?: boolean;
  /** Callback when intersection changes */
  onIntersectionChange?: (entry: IntersectionObserverEntry) => void;
}

/**
 * Return type for the intersection observer hook
 */
export interface IntersectionObserverReturn {
  /** Ref to attach to the element */
  ref: (node: Element | null) => void;
  /** Whether the element is intersecting */
  isIntersecting: boolean;
  /** The intersection entry */
  entry?: IntersectionObserverEntry;
  /** Manually trigger intersection check */
  trigger: () => void;
  /** Reset the intersection state */
  reset: () => void;
}

/**
 * Hook for intersection observer functionality
 * 
 * @param options - Intersection observer options
 * @returns Object with ref, intersection state, and utility functions
 */
export function useIntersectionObserver(
  options: IntersectionObserverOptions = {}
): IntersectionObserverReturn {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = false,
    initialIsIntersecting = false,
    onIntersectionChange
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [hasTriggered, setHasTriggered] = useState(false);
  
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [intersectionEntry] = entries;
      
      if (!intersectionEntry) return;

      setEntry(intersectionEntry);
      setIsIntersecting(intersectionEntry.isIntersecting);

      if (intersectionEntry.isIntersecting && triggerOnce && !hasTriggered) {
        setHasTriggered(true);
      }

      onIntersectionChange?.(intersectionEntry);

      // Disconnect if triggerOnce and has triggered
      if (triggerOnce && intersectionEntry.isIntersecting && observerRef.current) {
        observerRef.current.disconnect();
      }
    },
    [triggerOnce, hasTriggered, onIntersectionChange]
  );

  const ref = useCallback(
    (node: Element | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // Reset triggered state if element changes
      if (elementRef.current !== node) {
        setHasTriggered(false);
      }

      elementRef.current = node;

      // Don't observe if triggerOnce and already triggered
      if (triggerOnce && hasTriggered) {
        return;
      }

      if (node && typeof IntersectionObserver !== 'undefined') {
        observerRef.current = new IntersectionObserver(handleIntersection, {
          root,
          rootMargin,
          threshold
        });

        observerRef.current.observe(node);
      }
    },
    [root, rootMargin, threshold, triggerOnce, hasTriggered, handleIntersection]
  );

  const trigger = useCallback(() => {
    if (elementRef.current && observerRef.current) {
      // Force a check by temporarily disconnecting and reconnecting
      observerRef.current.unobserve(elementRef.current);
      observerRef.current.observe(elementRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    setIsIntersecting(initialIsIntersecting);
    setEntry(undefined);
    setHasTriggered(false);
  }, [initialIsIntersecting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    ref,
    isIntersecting,
    entry,
    trigger,
    reset
  };
}

/**
 * Hook for lazy loading images
 * 
 * @param src - Image source URL
 * @param options - Intersection observer options
 * @returns Object with image loading state and ref
 */
export function useLazyImage(
  src: string,
  options: IntersectionObserverOptions = {}
) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { ref, isIntersecting } = useIntersectionObserver({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  });

  useEffect(() => {
    if (isIntersecting && src && !imageSrc) {
      setIsLoading(true);
      setError(null);

      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        setIsLoading(false);
      };

      img.onerror = () => {
        setError('Failed to load image');
        setIsLoading(false);
      };

      img.src = src;
    }
  }, [isIntersecting, src, imageSrc]);

  return {
    ref,
    imageSrc,
    isLoaded,
    isLoading,
    error,
    isIntersecting
  };
}

/**
 * Hook for infinite scrolling
 * 
 * @param callback - Function to call when reaching threshold
 * @param options - Intersection observer options
 * @returns Object with ref and loading state
 */
export function useInfiniteScroll(
  callback: () => void | Promise<void>,
  options: IntersectionObserverOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 1.0,
    rootMargin: '100px',
    ...options,
    onIntersectionChange: async (entry) => {
      if (entry.isIntersecting && !isLoading) {
        setIsLoading(true);
        try {
          await callbackRef.current();
        } catch (error) {
          console.error('Infinite scroll callback error:', error);
        } finally {
          setIsLoading(false);
        }
      }
      options.onIntersectionChange?.(entry);
    }
  });

  return {
    ref,
    isLoading,
    isIntersecting
  };
}

/**
 * Hook for viewport-based animations
 * 
 * @param options - Intersection observer options
 * @returns Object with ref, visibility state, and animation helpers
 */
export function useViewportAnimation(
  options: IntersectionObserverOptions = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const { ref, isIntersecting, entry } = useIntersectionObserver({
    threshold: 0.2,
    triggerOnce: true,
    ...options,
    onIntersectionChange: (intersectionEntry) => {
      setIsVisible(intersectionEntry.isIntersecting);
      if (intersectionEntry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
      }
      options.onIntersectionChange?.(intersectionEntry);
    }
  });

  const animationProps = {
    'data-animate': isVisible,
    'data-has-animated': hasAnimated,
    style: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease'
    }
  };

  return {
    ref,
    isVisible,
    hasAnimated,
    isIntersecting,
    entry,
    animationProps
  };
}

/**
 * Hook for tracking multiple elements
 * 
 * @param options - Intersection observer options
 * @returns Object with functions to observe elements and intersection states
 */
export function useMultipleIntersectionObserver(
  options: IntersectionObserverOptions = {}
) {
  const [intersections, setIntersections] = useState(new Map<Element, boolean>());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const newIntersections = new Map(intersections);
      
      entries.forEach(entry => {
        newIntersections.set(entry.target, entry.isIntersecting);
        options.onIntersectionChange?.(entry);
      });

      setIntersections(newIntersections);
    },
    [intersections, options]
  );

  useEffect(() => {
    if (typeof IntersectionObserver !== 'undefined') {
      observerRef.current = new IntersectionObserver(handleIntersection, {
        root: options.root || null,
        rootMargin: options.rootMargin || '0px',
        threshold: options.threshold || 0
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, options.root, options.rootMargin, options.threshold]);

  const observe = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
      setIntersections(prev => {
        const next = new Map(prev);
        next.delete(element);
        return next;
      });
    }
  }, []);

  const isIntersecting = useCallback((element: Element) => {
    return intersections.get(element) || false;
  }, [intersections]);

  return {
    observe,
    unobserve,
    isIntersecting,
    intersections
  };
}

/**
 * Hook for sticky positioning detection
 * 
 * @param options - Intersection observer options
 * @returns Object with ref and sticky state
 */
export function useStickyDetection(
  options: IntersectionObserverOptions = {}
) {
  const [isSticky, setIsSticky] = useState(false);
  
  const { ref } = useIntersectionObserver({
    threshold: 1.0,
    rootMargin: '-1px 0px 0px 0px',
    ...options,
    onIntersectionChange: (entry) => {
      setIsSticky(!entry.isIntersecting);
      options.onIntersectionChange?.(entry);
    }
  });

  return {
    ref,
    isSticky
  };
}

export default useIntersectionObserver;