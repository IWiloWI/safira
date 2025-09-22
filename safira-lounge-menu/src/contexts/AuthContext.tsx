import React, { createContext, useContext, useState, useEffect } from 'react';
import SessionWarning from '../components/Common/SessionWarning';
import { useSessionManagement } from '../hooks/useSessionManagement';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
  sessionState: {
    isActive: boolean;
    expiresAt: Date | null;
    minutesRemaining: number | null;
    isWarningShown: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Session management configuration
  const sessionConfig = {
    tokenExpirationMinutes: 15,
    warningMinutes: 5,
    refreshThresholdMinutes: 2,
    enableActivityTracking: true,
    enableConcurrentSessionDetection: true,
    onSessionExpired: () => {
      console.log('🔐 Session expired - automatic logout');
      performLogout();
    },
    onSessionWarning: (minutesRemaining: number) => {
      console.log(`⚠️ Session expiring in ${minutesRemaining} minutes`);
      setShowSessionWarning(true);
    },
    onLogout: () => {
      console.log('👋 Session ended');
      setShowSessionWarning(false);
    }
  };

  // Initialize session management
  const sessionManagement = useSessionManagement(sessionConfig, { isAuthenticated, token });

  // Perform logout with cleanup
  const performLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setShowSessionWarning(false);
    console.log('👋 User logged out');
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('adminUser');
    
    if (savedToken && savedUser) {
      try {
        // Verify token is still valid (basic check)
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid stored user data:', error);
        performLogout();
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://test.safira-lounge.de/safira-api-fixed.php';
      const response = await fetch(`${API_URL}?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if ((data.success && data.data?.token) || (data.token && data.user)) {
        const jwtToken = data.data?.token || data.token;
        const userData = data.data?.user || data.user;

        // Store in localStorage (in production, consider using secure httpOnly cookies)
        localStorage.setItem('adminToken', jwtToken);
        localStorage.setItem('adminUser', JSON.stringify(userData));

        setToken(jwtToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('✅ Login successful');
        return true;
      } else {
        console.error('❌ Login failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  };

  // Handle session extension
  const handleExtendSession = async (): Promise<void> => {
    const success = await sessionManagement.extendSession();
    if (success) {
      setShowSessionWarning(false);
      console.log('✅ Session extended successfully');
    } else {
      console.log('❌ Failed to extend session');
      // Keep warning open for user to try again or logout
    }
  };

  // Handle session warning dismiss
  const handleDismissWarning = () => {
    setShowSessionWarning(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout: performLogout, 
      token,
      sessionState: {
        isActive: sessionManagement.isActive,
        expiresAt: sessionManagement.expiresAt,
        minutesRemaining: sessionManagement.minutesRemaining,
        isWarningShown: sessionManagement.isWarningShown
      }
    }}>
      {children}
      
      {/* Session Warning Modal */}
      <SessionWarning
        isVisible={showSessionWarning && isAuthenticated}
        onExtend={handleExtendSession}
        onLogout={performLogout}
        onClose={handleDismissWarning}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};