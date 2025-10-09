import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface KioskSettings {
  enabled: boolean;
  inactivityTimeout: number; // minutes
  adminPin: string;
  showExitButton: boolean;
  autoRefresh: boolean;
  lockNavigation: boolean;
}

interface KioskContextType {
  isKioskMode: boolean;
  settings: KioskSettings;
  isLocked: boolean;
  inactivityTime: number;
  enableKioskMode: () => void;
  disableKioskMode: (pin?: string) => boolean;
  updateSettings: (settings: Partial<KioskSettings>) => void;
  resetInactivity: () => void;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => void;
  isFullscreen: boolean;
}

const KioskContext = createContext<KioskContextType | undefined>(undefined);

const DEFAULT_SETTINGS: KioskSettings = {
  enabled: false,
  inactivityTimeout: 5, // 5 minutes default
  adminPin: '1234',
  showExitButton: true,
  autoRefresh: true,
  lockNavigation: true,
};

export const KioskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<KioskSettings>(() => {
    const saved = localStorage.getItem('kioskSettings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [isKioskMode, setIsKioskMode] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [inactivityTime, setInactivityTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityCountRef = useRef(0);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('kioskSettings', JSON.stringify(settings));
  }, [settings]);

  // Check fullscreen status
  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    return () => document.removeEventListener('fullscreenchange', checkFullscreen);
  }, []);

  // Inactivity timer
  const resetInactivity = useCallback(() => {
    inactivityCountRef.current = 0;
    setInactivityTime(0);
  }, []);

  useEffect(() => {
    if (!isKioskMode || !settings.enabled || !settings.autoRefresh) {
      return;
    }

    // Reset inactivity on user interaction
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetInactivity();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Inactivity counter (every second)
    const interval = setInterval(() => {
      inactivityCountRef.current += 1;
      setInactivityTime(inactivityCountRef.current);

      // Check if timeout reached
      if (inactivityCountRef.current >= settings.inactivityTimeout * 60) {
        console.log('[Kiosk] Inactivity timeout reached, reloading...');
        window.location.href = '/menu'; // Reset to home
        window.location.reload();
      }
    }, 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, [isKioskMode, settings, resetInactivity]);

  // Fullscreen methods
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      }
    } catch (error) {
      console.error('[Kiosk] Failed to enter fullscreen:', error);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  // Enable Kiosk Mode
  const enableKioskMode = useCallback(async () => {
    console.log('[Kiosk] Enabling kiosk mode...');
    setIsKioskMode(true);
    setIsLocked(true);

    // Enter fullscreen
    await enterFullscreen();

    // Lock navigation if enabled
    if (settings.lockNavigation) {
      // Push a dummy state to prevent back navigation
      window.history.pushState(null, '', window.location.href);

      window.addEventListener('popstate', preventBackNavigation);
    }

    // Reset inactivity
    resetInactivity();
  }, [settings, enterFullscreen, resetInactivity]);

  // Prevent back navigation
  const preventBackNavigation = useCallback((e: PopStateEvent) => {
    if (isLocked) {
      window.history.pushState(null, '', window.location.href);
    }
  }, [isLocked]);

  // Disable Kiosk Mode
  const disableKioskMode = useCallback((pin?: string) => {
    // Check PIN if provided
    if (pin && pin !== settings.adminPin) {
      console.log('[Kiosk] Invalid PIN');
      return false;
    }

    console.log('[Kiosk] Disabling kiosk mode...');
    setIsKioskMode(false);
    setIsLocked(false);

    // Exit fullscreen
    exitFullscreen();

    // Remove navigation lock
    window.removeEventListener('popstate', preventBackNavigation);

    // Clear inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    return true;
  }, [settings, exitFullscreen, preventBackNavigation]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<KioskSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Prevent context menu in kiosk mode
  useEffect(() => {
    if (!isKioskMode) return;

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [isKioskMode]);

  // Prevent text selection in kiosk mode
  useEffect(() => {
    if (isKioskMode) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    } else {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }
  }, [isKioskMode]);

  return (
    <KioskContext.Provider
      value={{
        isKioskMode,
        settings,
        isLocked,
        inactivityTime,
        enableKioskMode,
        disableKioskMode,
        updateSettings,
        resetInactivity,
        enterFullscreen,
        exitFullscreen,
        isFullscreen,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
};

export const useKiosk = () => {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error('useKiosk must be used within KioskProvider');
  }
  return context;
};
