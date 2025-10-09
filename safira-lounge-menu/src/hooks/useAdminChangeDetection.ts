/**
 * Admin Change Detection Hook
 * Detects when admin makes changes and auto-refreshes customer views
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseAdminChangeDetectionOptions {
  /** Polling interval in milliseconds (default: 5000 = 5 seconds for instant refresh) */
  interval?: number;
  /** Enable/disable change detection */
  enabled?: boolean;
  /** Callback before refresh */
  onChangeDetected?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Custom hook to detect admin changes and refresh customer views
 *
 * @example
 * useAdminChangeDetection({
 *   interval: 30000, // Check every 30 seconds
 *   enabled: !isAdminPage, // Only on customer pages
 *   onChangeDetected: () => console.log('Refreshing...')
 * });
 */
export const useAdminChangeDetection = ({
  interval = 5000, // 5 seconds default for instant refresh
  enabled = true,
  onChangeDetected,
  onError
}: UseAdminChangeDetectionOptions = {}) => {
  const lastHashRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const isCheckingRef = useRef(false);
  const onChangeDetectedRef = useRef(onChangeDetected);
  const onErrorRef = useRef(onError);

  // Keep refs up to date
  useEffect(() => {
    onChangeDetectedRef.current = onChangeDetected;
    onErrorRef.current = onError;
  }, [onChangeDetected, onError]);

  /**
   * Check if data has changed by comparing response hash
   */
  const checkForChanges = useCallback(async () => {
    // Skip if already checking
    if (isCheckingRef.current) return;

    try {
      isCheckingRef.current = true;

      const API_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';

      // Fetch minimal data to check for changes
      const response = await fetch(`${API_URL}?action=version_check`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Version check failed: ${response.status}`);
      }

      const data = await response.json();

      // Create hash from response to detect changes
      // If API doesn't support version_check, use full products response
      const contentHash = data.hash || data.lastModified || JSON.stringify(data).substring(0, 100);

      // First run - store initial hash
      if (lastHashRef.current === null) {
        lastHashRef.current = contentHash;
        console.log('[AdminChangeDetection] Initial hash stored');
        return;
      }

      // Compare with previous hash
      if (contentHash !== lastHashRef.current) {
        console.log('[AdminChangeDetection] 🔄 Changes detected! Refreshing page...');
        lastHashRef.current = contentHash;

        // Call callback if provided (using ref)
        onChangeDetectedRef.current?.();

        // Show user-friendly notification before reload
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Menü aktualisiert', {
            body: 'Neue Änderungen verfügbar. Seite wird neu geladen...',
            icon: '/images/safira_logo_120w.webp'
          });
        }

        // Instant reload (no delay for instant refresh)
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error('[AdminChangeDetection] Error checking for changes:', error);
      onErrorRef.current?.(error as Error);
    } finally {
      isCheckingRef.current = false;
    }
  }, []); // No dependencies - uses refs for callbacks

  /**
   * Force manual check
   */
  const forceCheck = useCallback(() => {
    console.log('[AdminChangeDetection] Manual check triggered');
    checkForChanges();
  }, [checkForChanges]);

  // Start/stop polling - ONLY runs once on mount
  useEffect(() => {
    if (!enabled) return;

    console.log(`[AdminChangeDetection] Started polling (interval: ${interval}ms)`);

    // Initial check
    checkForChanges();

    // Set up interval
    const pollInterval = setInterval(checkForChanges, interval);
    intervalRef.current = pollInterval;

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
        console.log('[AdminChangeDetection] Stopped polling');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run only once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    forceCheck,
    isEnabled: enabled
  };
};
