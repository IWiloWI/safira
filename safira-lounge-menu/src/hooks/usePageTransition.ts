/**
 * Hook for managing page transitions
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UsePageTransitionOptions {
  /** Minimum loading time in ms */
  minLoadTime?: number;
  /** Enable transition animations */
  enabled?: boolean;
}

export const usePageTransition = (options: UsePageTransitionOptions = {}) => {
  const {
    minLoadTime = 500,
    enabled = true
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!enabled) return;

    // Start loading animation
    setIsLoading(true);

    // Ensure minimum loading time for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [location.pathname, minLoadTime, enabled]);

  return { isLoading };
};

export default usePageTransition;
