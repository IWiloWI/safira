/**
 * useDebounce Hook
 * 
 * Provides debouncing functionality to improve performance by delaying
 * function execution until after a specified delay has passed since
 * the last invocation.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Options for the debounce hook
 */
interface DebounceOptions {
  /** Whether to execute on the leading edge of the timeout */
  leading?: boolean;
  /** Whether to execute on the trailing edge of the timeout */
  trailing?: boolean;
  /** Maximum time the function is allowed to be delayed */
  maxWait?: number;
}

/**
 * Hook that debounces a value
 * 
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear timeout if value changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that debounces a callback function
 * 
 * @param callback - The function to debounce
 * @param delay - Debounce delay in milliseconds
 * @param options - Additional debounce options
 * @returns Object with debounced function and utility methods
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: DebounceOptions = {}
) {
  const {
    leading = false,
    trailing = true,
    maxWait
  } = options;

  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);
  const leadingRef = useRef<boolean>(false);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const invokeFunc = useCallback((args: Parameters<T>) => {
    const time = Date.now();
    lastInvokeTimeRef.current = time;
    leadingRef.current = false;
    return callbackRef.current(...args);
  }, []);

  const shouldInvoke = useCallback((time: number) => {
    const timeSinceLastCall = time - lastCallTimeRef.current;
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (
      lastCallTimeRef.current === 0 ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const trailingEdge = useCallback((args: Parameters<T>) => {
    timeoutRef.current = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastCallTimeRef.current > 0) {
      return invokeFunc(args);
    }
    leadingRef.current = false;
    return undefined;
  }, [trailing, invokeFunc]);

  const timerExpired = useCallback((args: Parameters<T>) => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(args);
    }
    // Restart the timer.
    timeoutRef.current = setTimeout(
      () => timerExpired(args),
      delay - (time - lastCallTimeRef.current)
    );
  }, [shouldInvoke, trailingEdge, delay]);

  const leadingEdge = useCallback((args: Parameters<T>) => {
    // Reset any `maxWait` timer.
    lastInvokeTimeRef.current = Date.now();
    // Start the timer for the trailing edge.
    timeoutRef.current = setTimeout(() => timerExpired(args), delay);

    // Invoke the leading edge.
    return leading && !leadingRef.current ? invokeFunc(args) : undefined;
  }, [leading, invokeFunc, timerExpired, delay]);

  const debouncedFunction = useCallback((...args: Parameters<T>) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastCallTimeRef.current = time;

    if (isInvoking) {
      if (timeoutRef.current === undefined) {
        leadingRef.current = true;
        return leadingEdge(args);
      }
      if (maxWait !== undefined) {
        // Handle invocations in a tight loop.
        timeoutRef.current = setTimeout(() => timerExpired(args), delay);
        maxTimeoutRef.current = setTimeout(() => invokeFunc(args), maxWait);
        return leading && leadingRef.current ? invokeFunc(args) : undefined;
      }
    }
    if (timeoutRef.current === undefined) {
      timeoutRef.current = setTimeout(() => timerExpired(args), delay);
    }
    return undefined;
  }, [shouldInvoke, leadingEdge, timerExpired, invokeFunc, delay, maxWait, leading]);

  const cancel = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxTimeoutRef.current !== undefined) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
    }
    lastInvokeTimeRef.current = 0;
    lastCallTimeRef.current = 0;
    leadingRef.current = false;
  }, []);

  const flush = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current !== undefined) {
      return trailingEdge(args);
    }
    return undefined;
  }, [trailingEdge]);

  const pending = useCallback(() => {
    return timeoutRef.current !== undefined;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    /** The debounced function */
    callback: debouncedFunction,
    /** Cancel pending invocations */
    cancel,
    /** Immediately invoke pending invocations */
    flush,
    /** Check if there are pending invocations */
    pending
  };
}

/**
 * Hook for debounced search functionality
 * 
 * @param searchTerm - The search term to debounce
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns Object with debounced search term and search state
 */
export function useDebouncedSearch(searchTerm: string, delay: number = 300) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return {
    /** The debounced search term */
    debouncedSearchTerm,
    /** Whether a search is currently being debounced */
    isSearching,
    /** Whether there is an active search */
    hasSearch: Boolean(debouncedSearchTerm.trim())
  };
}

/**
 * Hook for debounced API calls
 * 
 * @param apiCall - The API function to call
 * @param dependencies - Dependencies that trigger the API call
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 * @returns Object with loading state and data
 */
export function useDebouncedApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[],
  delay: number = 500
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const debouncedApiCall = useDebouncedCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    delay,
    { leading: false, trailing: true }
  );

  useEffect(() => {
    debouncedApiCall.callback();
    
    // Cleanup on unmount or dependency change
    return () => {
      debouncedApiCall.cancel();
    };
  }, dependencies);

  return {
    /** The API response data */
    data,
    /** Whether the API call is in progress */
    loading,
    /** Any error that occurred */
    error,
    /** Manually trigger the API call */
    trigger: debouncedApiCall.callback,
    /** Cancel pending API call */
    cancel: debouncedApiCall.cancel
  };
}

/**
 * Hook for debounced scroll handling
 * 
 * @param callback - Function to call on scroll
 * @param delay - Debounce delay in milliseconds (default: 100ms)
 * @param element - Element to attach scroll listener (default: window)
 */
export function useDebouncedScroll(
  callback: (event: Event) => void,
  delay: number = 100,
  element?: HTMLElement | Window
) {
  const debouncedCallback = useDebouncedCallback(callback, delay);

  useEffect(() => {
    const targetElement = element || window;
    
    const handleScroll = (event: Event) => {
      debouncedCallback.callback(event);
    };

    targetElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      targetElement.removeEventListener('scroll', handleScroll);
      debouncedCallback.cancel();
    };
  }, [debouncedCallback, element]);
}

/**
 * Hook for debounced resize handling
 * 
 * @param callback - Function to call on resize
 * @param delay - Debounce delay in milliseconds (default: 250ms)
 */
export function useDebouncedResize(
  callback: (event: Event) => void,
  delay: number = 250
) {
  const debouncedCallback = useDebouncedCallback(callback, delay);

  useEffect(() => {
    const handleResize = (event: Event) => {
      debouncedCallback.callback(event);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);
}

/**
 * Hook for debounced form input validation
 * 
 * @param value - The input value to validate
 * @param validator - Validation function
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns Object with validation state
 */
export function useDebouncedValidation<T>(
  value: T,
  validator: (value: T) => boolean | Promise<boolean>,
  delay: number = 300
) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const debouncedValidator = useDebouncedCallback(
    async (val: T) => {
      setIsValidating(true);
      try {
        const result = await validator(val);
        setIsValid(result);
      } catch {
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    },
    delay
  );

  useEffect(() => {
    if (value !== null && value !== undefined && value !== '') {
      debouncedValidator.callback(value);
    } else {
      setIsValid(null);
      setIsValidating(false);
    }
  }, [value, debouncedValidator]);

  return {
    /** Whether the value is valid */
    isValid,
    /** Whether validation is in progress */
    isValidating,
    /** Whether validation has been attempted */
    hasValidated: isValid !== null
  };
}

export default useDebounce;