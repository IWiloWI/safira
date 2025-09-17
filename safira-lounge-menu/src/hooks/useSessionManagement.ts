/**
 * Comprehensive session management hook for secure user authentication
 * Handles token lifecycle, automatic logout, and session security
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Session configuration
interface SessionConfig {
  // Token expiration time in minutes (default: 15)
  tokenExpirationMinutes?: number;
  
  // Warning time before expiration in minutes (default: 5)
  warningMinutes?: number;
  
  // Auto-refresh token when this many minutes remain (default: 2)
  refreshThresholdMinutes?: number;
  
  // Enable activity tracking to extend session
  enableActivityTracking?: boolean;
  
  // Activities that count as "user activity"
  trackedActivities?: string[];
  
  // Enable concurrent session detection
  enableConcurrentSessionDetection?: boolean;
  
  // Custom logout callback
  onLogout?: () => void;
  
  // Custom session expired callback
  onSessionExpired?: () => void;
  
  // Custom session warning callback
  onSessionWarning?: (minutesRemaining: number) => void;
}

// Session state
interface SessionState {
  isActive: boolean;
  expiresAt: Date | null;
  lastActivity: Date | null;
  minutesRemaining: number | null;
  isWarningShown: boolean;
  isRefreshing: boolean;
  sessionId: string | null;
}

// Default configuration
const DEFAULT_CONFIG: Required<SessionConfig> = {
  tokenExpirationMinutes: 15,
  warningMinutes: 5,
  refreshThresholdMinutes: 2,
  enableActivityTracking: true,
  trackedActivities: [
    'click', 
    'keydown', 
    'scroll', 
    'touchstart', 
    'mousemove'
  ],
  enableConcurrentSessionDetection: true,
  onLogout: () => {},
  onSessionExpired: () => {},
  onSessionWarning: () => {}
};

/**
 * Session management hook with automatic logout and token refresh
 */
export function useSessionManagement(
  config: SessionConfig = {},
  authState?: { isAuthenticated: boolean; token: string | null }
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Session state
  const [sessionState, setSessionState] = useState<SessionState>(() => ({
    isActive: false,
    expiresAt: null,
    lastActivity: null,
    minutesRemaining: null,
    isWarningShown: false,
    isRefreshing: false,
    sessionId: null
  }));

  // Refs for cleanup and persistence
  const activityListeners = useRef<(() => void)[]>([]);
  const sessionTimer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  /**
   * Parse JWT token to get expiration time
   */
  const parseTokenExpiration = useCallback((jwtToken: string): Date | null => {
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      if (payload.exp) {
        return new Date(payload.exp * 1000);
      }
      // Fallback: assume 15 minutes from now if no exp claim
      return new Date(Date.now() + finalConfig.tokenExpirationMinutes * 60 * 1000);
    } catch (error) {
      console.error('Failed to parse token expiration:', error);
      return null;
    }
  }, [finalConfig.tokenExpirationMinutes]);

  /**
   * Generate unique session ID
   */
  const generateSessionId = useCallback((): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Update last activity timestamp
   */
  const updateActivity = useCallback(() => {
    const now = new Date();
    setSessionState(prev => ({ ...prev, lastActivity: now }));
    
    // Store in localStorage for cross-tab detection
    localStorage.setItem('lastActivity', now.toISOString());
  }, []);

  /**
   * Calculate minutes remaining until expiration
   */
  const calculateMinutesRemaining = useCallback((expiresAt: Date | null): number | null => {
    if (!expiresAt) return null;
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }, []);

  /**
   * Check if session should be refreshed
   */
  const shouldRefreshToken = useCallback((minutesRemaining: number | null): boolean => {
    if (minutesRemaining === null) return false;
    return minutesRemaining <= finalConfig.refreshThresholdMinutes && minutesRemaining > 0;
  }, [finalConfig.refreshThresholdMinutes]);

  /**
   * Check if warning should be shown
   */
  const shouldShowWarning = useCallback((minutesRemaining: number | null): boolean => {
    if (minutesRemaining === null) return false;
    return minutesRemaining <= finalConfig.warningMinutes && minutesRemaining > 0;
  }, [finalConfig.warningMinutes]);

  /**
   * Perform session logout
   */
  const performLogout = useCallback((reason: 'user' | 'expired' | 'concurrent' = 'user') => {
    console.log(`🚪 Session logout - Reason: ${reason}`);
    
    // Clear all timers
    [sessionTimer, warningTimer, refreshTimer, sessionCheckInterval].forEach(timer => {
      if (timer.current) {
        clearTimeout(timer.current);
        clearInterval(timer.current);
        timer.current = null;
      }
    });

    // Remove activity listeners
    activityListeners.current.forEach(removeListener => removeListener());
    activityListeners.current = [];

    // Clear session storage
    localStorage.removeItem('sessionId');
    localStorage.removeItem('lastActivity');

    // Update state
    setSessionState({
      isActive: false,
      expiresAt: null,
      lastActivity: null,
      minutesRemaining: null,
      isWarningShown: false,
      isRefreshing: false,
      sessionId: null
    });

    // Call appropriate callback
    if (reason === 'expired') {
      finalConfig.onSessionExpired();
    } else {
      finalConfig.onLogout();
    }

    // Logout handled by config callbacks
  }, [finalConfig]);

  /**
   * Attempt to refresh the session token
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const currentToken = localStorage.getItem('adminToken');
    if (!currentToken || sessionState.isRefreshing) return false;

    setSessionState(prev => ({ ...prev, isRefreshing: true }));

    try {
      console.log('🔄 Attempting session refresh...');
      
      // In a real implementation, you would call a refresh endpoint
      // For now, we'll simulate a successful refresh
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.token) {
          // Update token in auth context would happen here
          // For now, we'll just extend the current session
          const newExpiresAt = new Date(Date.now() + finalConfig.tokenExpirationMinutes * 60 * 1000);
          
          setSessionState(prev => ({
            ...prev,
            expiresAt: newExpiresAt,
            isRefreshing: false,
            isWarningShown: false
          }));

          console.log('✅ Session refreshed successfully');
          return true;
        }
      }

      console.log('❌ Session refresh failed');
      setSessionState(prev => ({ ...prev, isRefreshing: false }));
      return false;
    } catch (error) {
      console.error('Session refresh error:', error);
      setSessionState(prev => ({ ...prev, isRefreshing: false }));
      return false;
    }
  }, [sessionState.isRefreshing, finalConfig.tokenExpirationMinutes]);

  /**
   * Check for concurrent sessions
   */
  const checkConcurrentSession = useCallback(() => {
    if (!finalConfig.enableConcurrentSessionDetection || !sessionState.sessionId) return;

    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId && storedSessionId !== sessionState.sessionId) {
      console.warn('🚨 Concurrent session detected');
      performLogout('concurrent');
    }
  }, [finalConfig.enableConcurrentSessionDetection, sessionState.sessionId, performLogout]);

  /**
   * Initialize session when user logs in
   */
  const initializeSession = useCallback(() => {
    if (!authState?.isAuthenticated || !authState?.token) return;

    const expiresAt = parseTokenExpiration(authState.token);
    if (!expiresAt) {
      console.error('Could not parse token expiration');
      return;
    }

    const sessionId = generateSessionId();
    const now = new Date();

    // Store session info
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('lastActivity', now.toISOString());

    // Update state
    setSessionState({
      isActive: true,
      expiresAt,
      lastActivity: now,
      minutesRemaining: calculateMinutesRemaining(expiresAt),
      isWarningShown: false,
      isRefreshing: false,
      sessionId
    });

    console.log('🔑 Session initialized', { expiresAt, sessionId });
  }, [authState?.isAuthenticated, authState?.token, parseTokenExpiration, generateSessionId, calculateMinutesRemaining]);

  /**
   * Session monitoring loop
   */
  const monitorSession = useCallback(() => {
    if (!sessionState.isActive || !sessionState.expiresAt) return;

    const minutesRemaining = calculateMinutesRemaining(sessionState.expiresAt);
    
    // Update minutes remaining
    setSessionState(prev => ({ ...prev, minutesRemaining }));

    // Check if session expired
    if (minutesRemaining !== null && minutesRemaining <= 0) {
      performLogout('expired');
      return;
    }

    // Check if we should refresh the token
    if (shouldRefreshToken(minutesRemaining)) {
      refreshSession();
      return;
    }

    // Check if we should show warning
    if (shouldShowWarning(minutesRemaining) && !sessionState.isWarningShown) {
      setSessionState(prev => ({ ...prev, isWarningShown: true }));
      finalConfig.onSessionWarning(minutesRemaining || 0);
    }

    // Check for concurrent sessions
    checkConcurrentSession();
  }, [
    sessionState.isActive,
    sessionState.expiresAt,
    sessionState.isWarningShown,
    calculateMinutesRemaining,
    performLogout,
    shouldRefreshToken,
    shouldShowWarning,
    refreshSession,
    checkConcurrentSession,
    finalConfig
  ]);

  /**
   * Setup activity tracking
   */
  const setupActivityTracking = useCallback(() => {
    if (!finalConfig.enableActivityTracking) return;

    const handleActivity = () => updateActivity();

    // Add event listeners for tracked activities
    finalConfig.trackedActivities.forEach(activity => {
      document.addEventListener(activity, handleActivity, { passive: true });
      
      // Store cleanup function
      activityListeners.current.push(() => {
        document.removeEventListener(activity, handleActivity);
      });
    });

    // Track visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    activityListeners.current.push(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });

  }, [finalConfig.enableActivityTracking, finalConfig.trackedActivities, updateActivity]);

  /**
   * Manual session extension
   */
  const extendSession = useCallback(async (): Promise<boolean> => {
    if (!sessionState.isActive) return false;
    
    updateActivity();
    return await refreshSession();
  }, [sessionState.isActive, updateActivity, refreshSession]);

  /**
   * Manual logout with cleanup
   */
  const manualLogout = useCallback(() => {
    performLogout('user');
  }, [performLogout]);

  // Initialize session when authentication changes
  useEffect(() => {
    if (authState?.isAuthenticated && authState?.token) {
      initializeSession();
      setupActivityTracking();
    } else {
      performLogout('user');
    }
  }, [authState?.isAuthenticated, authState?.token]); // Don't include functions in deps to avoid loops

  // Start session monitoring
  useEffect(() => {
    if (sessionState.isActive) {
      // Run immediately
      monitorSession();
      
      // Then every minute
      sessionCheckInterval.current = setInterval(monitorSession, 60000);

      return () => {
        if (sessionCheckInterval.current) {
          clearInterval(sessionCheckInterval.current);
        }
      };
    }
  }, [sessionState.isActive]); // Depend only on isActive to avoid loops

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      [sessionTimer, warningTimer, refreshTimer, sessionCheckInterval].forEach(timer => {
        if (timer.current) {
          clearTimeout(timer.current);
          clearInterval(timer.current);
        }
      });
      
      activityListeners.current.forEach(removeListener => removeListener());
    };
  }, []);

  return {
    // Session state
    isActive: sessionState.isActive,
    expiresAt: sessionState.expiresAt,
    lastActivity: sessionState.lastActivity,
    minutesRemaining: sessionState.minutesRemaining,
    isWarningShown: sessionState.isWarningShown,
    isRefreshing: sessionState.isRefreshing,
    sessionId: sessionState.sessionId,

    // Actions
    extendSession,
    refreshSession,
    logout: manualLogout,
    updateActivity,

    // Computed properties
    isExpiringSoon: sessionState.minutesRemaining !== null && 
                   sessionState.minutesRemaining <= finalConfig.warningMinutes,
    shouldRefresh: sessionState.minutesRemaining !== null && 
                  shouldRefreshToken(sessionState.minutesRemaining)
  };
}