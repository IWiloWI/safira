/**
 * @file navigation.integration.test.js
 * @description End-to-end integration tests for navigation components
 * @test Navigation System Integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { axe, toHaveNoViolations } from 'jest-axe';

// Import navigation components
import BottomNavigation from '../../src/components/BottomNavigation';
import LanguageSwitch from '../../src/components/LanguageSwitch';
import CategorySelector from '../../src/components/CategorySelector';
import WiFiLogin from '../../src/components/WiFiLogin';
import App from '../../src/App';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock contexts and services
const mockNavigationContext = {
  currentTab: 'home',
  setCurrentTab: jest.fn(),
  tabHistory: ['home'],
  badges: { notifications: 2, cart: 0 }
};

const mockI18nContext = {
  currentLanguage: 'en',
  setLanguage: jest.fn(),
  availableLanguages: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ],
  translations: {},
  isLoading: false,
  isRTL: false
};

const mockCategoryContext = {
  categories: [
    { id: '1', name: 'Electronics', icon: '📱', count: 50 },
    { id: '2', name: 'Clothing', icon: '👕', count: 75 }
  ],
  selectedCategory: null,
  setSelectedCategory: jest.fn(),
  searchQuery: '',
  setSearchQuery: jest.fn(),
  isLoading: false
};

const mockAuthContext = {
  isAuthenticated: false,
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  networkStatus: 'connected',
  signalStrength: 85
};

// Full app wrapper with all contexts
const IntegratedAppWrapper = ({ 
  children, 
  initialRoute = '/',
  history = createMemoryHistory({ initialEntries: [initialRoute] })
}) => (
  <Router history={history}>
    <AuthContext.Provider value={mockAuthContext}>
      <NavigationContext.Provider value={mockNavigationContext}>
        <I18nContext.Provider value={mockI18nContext}>
          <CategoryContext.Provider value={mockCategoryContext}>
            {children}
          </CategoryContext.Provider>
        </I18nContext.Provider>
      </NavigationContext.Provider>
    </AuthContext.Provider>
  </Router>
);

describe('Navigation Integration Tests', () => {
  let user;
  let history;

  beforeEach(() => {
    user = userEvent.setup();
    history = createMemoryHistory({ initialEntries: ['/'] });
    jest.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Full App Navigation Flow', () => {
    /**
     * @test Complete user journey through app
     * @expected User can navigate through all major screens
     */
    it('should handle complete user navigation journey', async () => {
      render(
        <IntegratedAppWrapper history={history}>
          <App />
        </IntegratedAppWrapper>
      );

      // Start on home screen
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /home/i })).toHaveClass('active');

      // Navigate to categories
      const categoriesTab = screen.getByRole('button', { name: /categories/i });
      await user.click(categoriesTab);

      expect(mockNavigationContext.setCurrentTab).toHaveBeenCalledWith('categories');
      expect(history.location.pathname).toBe('/categories');

      // Select a category
      const electronicsCategory = screen.getByText('Electronics');
      await user.click(electronicsCategory);

      expect(mockCategoryContext.setSelectedCategory).toHaveBeenCalledWith('1');

      // Navigate to favorites
      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      await user.click(favoritesTab);

      expect(mockNavigationContext.setCurrentTab).toHaveBeenCalledWith('favorites');
      expect(history.location.pathname).toBe('/favorites');

      // Check profile section
      const profileTab = screen.getByRole('button', { name: /profile/i });
      await user.click(profileTab);

      expect(mockNavigationContext.setCurrentTab).toHaveBeenCalledWith('profile');
      expect(history.location.pathname).toBe('/profile');
    });

    /**
     * @test Language switching affects entire app
     * @expected Language change updates all components
     */
    it('should update app language globally', async () => {
      render(
        <IntegratedAppWrapper>
          <App />
        </IntegratedAppWrapper>
      );

      // Find language switcher
      const languageButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(languageButton);

      // Select Spanish
      const spanishOption = screen.getByText('Español');
      await user.click(spanishOption);

      expect(mockI18nContext.setLanguage).toHaveBeenCalledWith('es');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('preferredLanguage', 'es');
    });

    /**
     * @test Deep linking navigation
     * @expected App handles direct URL navigation correctly
     */
    it('should handle deep linking', () => {
      const deepLinkHistory = createMemoryHistory({ 
        initialEntries: ['/categories/electronics'] 
      });

      render(
        <IntegratedAppWrapper history={deepLinkHistory}>
          <App />
        </IntegratedAppWrapper>
      );

      // Should navigate to categories and select electronics
      expect(screen.getByRole('button', { name: /categories/i })).toHaveClass('active');
      expect(deepLinkHistory.location.pathname).toBe('/categories/electronics');
    });
  });

  describe('Component Interaction Tests', () => {
    /**
     * @test BottomNavigation and CategorySelector integration
     * @expected Navigation updates reflect in category display
     */
    it('should integrate bottom navigation with category selector', async () => {
      render(
        <IntegratedAppWrapper>
          <div>
            <CategorySelector />
            <BottomNavigation />
          </div>
        </IntegratedAppWrapper>
      );

      // Navigate to categories tab
      const categoriesTab = screen.getByRole('button', { name: /categories/i });
      await user.click(categoriesTab);

      // Category selector should be active
      expect(screen.getByRole('grid')).toBeInTheDocument();

      // Select a category
      const clothingCategory = screen.getByText('Clothing');
      await user.click(clothingCategory);

      // Should update navigation context
      expect(mockCategoryContext.setSelectedCategory).toHaveBeenCalledWith('2');
    });

    /**
     * @test Language switch affects category names
     * @expected Category names update when language changes
     */
    it('should update category names with language change', async () => {
      const spanishContext = {
        ...mockI18nContext,
        currentLanguage: 'es',
        translations: {
          'category.electronics': 'Electrónicos',
          'category.clothing': 'Ropa'
        }
      };

      render(
        <IntegratedAppWrapper>
          <I18nContext.Provider value={spanishContext}>
            <div>
              <LanguageSwitch />
              <CategorySelector />
            </div>
          </I18nContext.Provider>
        </IntegratedAppWrapper>
      );

      // Categories should show in Spanish
      expect(screen.getByText('Electrónicos')).toBeInTheDocument();
      expect(screen.getByText('Ropa')).toBeInTheDocument();
    });

    /**
     * @test WiFi login integration with navigation
     * @expected Login state affects navigation availability
     */
    it('should restrict navigation when not authenticated', async () => {
      const unauthenticatedContext = {
        ...mockAuthContext,
        isAuthenticated: false
      };

      render(
        <IntegratedAppWrapper>
          <AuthContext.Provider value={unauthenticatedContext}>
            <div>
              <WiFiLogin />
              <BottomNavigation />
            </div>
          </AuthContext.Provider>
        </IntegratedAppWrapper>
      );

      // Some tabs should be disabled
      const profileTab = screen.getByRole('button', { name: /profile/i });
      expect(profileTab).toBeDisabled();

      // Login should enable navigation
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(signInButton);

      expect(mockAuthContext.login).toHaveBeenCalled();
    });
  });

  describe('State Management Integration', () => {
    /**
     * @test Navigation state persistence
     * @expected Navigation state persists across component re-renders
     */
    it('should persist navigation state', async () => {
      const { rerender } = render(
        <IntegratedAppWrapper>
          <BottomNavigation />
        </IntegratedAppWrapper>
      );

      // Navigate to categories
      const categoriesTab = screen.getByRole('button', { name: /categories/i });
      await user.click(categoriesTab);

      // Update context to reflect navigation
      const updatedContext = {
        ...mockNavigationContext,
        currentTab: 'categories'
      };

      rerender(
        <IntegratedAppWrapper>
          <NavigationContext.Provider value={updatedContext}>
            <BottomNavigation />
          </NavigationContext.Provider>
        </IntegratedAppWrapper>
      );

      // Categories tab should still be active
      expect(screen.getByRole('button', { name: /categories/i })).toHaveClass('active');
    });

    /**
     * @test Search state integration
     * @expected Search queries persist across navigation
     */
    it('should maintain search state during navigation', async () => {
      const searchContext = {
        ...mockCategoryContext,
        searchQuery: 'electronics'
      };

      render(
        <IntegratedAppWrapper>
          <CategoryContext.Provider value={searchContext}>
            <div>
              <CategorySelector />
              <BottomNavigation />
            </div>
          </CategoryContext.Provider>
        </IntegratedAppWrapper>
      );

      // Search query should be preserved
      const searchInput = screen.getByDisplayValue('electronics');
      expect(searchInput).toBeInTheDocument();

      // Navigate away and back
      const homeTab = screen.getByRole('button', { name: /home/i });
      await user.click(homeTab);

      const categoriesTab = screen.getByRole('button', { name: /categories/i });
      await user.click(categoriesTab);

      // Search should still be there
      expect(screen.getByDisplayValue('electronics')).toBeInTheDocument();
    });

    /**
     * @test Multi-language state consistency
     * @expected Language preference maintained across sessions
     */
    it('should maintain language consistency', async () => {
      window.localStorage.getItem.mockReturnValue('es');

      render(
        <IntegratedAppWrapper>
          <div>
            <LanguageSwitch />
            <BottomNavigation />
            <CategorySelector />
          </div>
        </IntegratedAppWrapper>
      );

      // Should restore Spanish language
      expect(mockI18nContext.setLanguage).toHaveBeenCalledWith('es');
    });
  });

  describe('URL Synchronization', () => {
    /**
     * @test URL updates with navigation changes
     * @expected Browser URL stays synchronized with navigation state
     */
    it('should sync URL with navigation state', async () => {
      render(
        <IntegratedAppWrapper history={history}>
          <div>
            <BottomNavigation />
            <CategorySelector />
          </div>
        </IntegratedAppWrapper>
      );

      // Navigate to favorites
      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      await user.click(favoritesTab);

      expect(history.location.pathname).toBe('/favorites');

      // Navigate to categories and select one
      const categoriesTab = screen.getByRole('button', { name: /categories/i });
      await user.click(categoriesTab);

      const electronicsCategory = screen.getByText('Electronics');
      await user.click(electronicsCategory);

      expect(history.location.pathname).toBe('/categories');
      expect(history.location.search).toContain('category=1');
    });

    /**
     * @test Browser back/forward navigation
     * @expected Browser navigation updates component state
     */
    it('should handle browser back/forward navigation', async () => {
      render(
        <IntegratedAppWrapper history={history}>
          <BottomNavigation />
        </IntegratedAppWrapper>
      );

      // Navigate through tabs
      const categoriesTab = screen.getByRole('button', { name: /categories/i });
      await user.click(categoriesTab);

      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      await user.click(favoritesTab);

      expect(history.location.pathname).toBe('/favorites');

      // Use browser back
      history.goBack();
      expect(history.location.pathname).toBe('/categories');

      // Use browser forward
      history.goForward();
      expect(history.location.pathname).toBe('/favorites');
    });

    /**
     * @test Query parameter persistence
     * @expected Search and filter parameters persist in URL
     */
    it('should persist query parameters', async () => {
      render(
        <IntegratedAppWrapper history={history}>
          <div>
            <CategorySelector />
            <LanguageSwitch />
          </div>
        </IntegratedAppWrapper>
      );

      // Set search query
      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.type(searchInput, 'phone');

      // Change language
      const languageButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(languageButton);
      
      const spanishOption = screen.getByText('Español');
      await user.click(spanishOption);

      // URL should contain both parameters
      await waitFor(() => {
        expect(history.location.search).toContain('q=phone');
        expect(history.location.search).toContain('lang=es');
      });
    });
  });

  describe('Performance Integration', () => {
    /**
     * @test Lazy loading navigation performance
     * @expected Navigation components load efficiently
     */
    it('should load navigation components efficiently', async () => {
      const startTime = performance.now();

      render(
        <IntegratedAppWrapper>
          <div>
            <BottomNavigation />
            <LanguageSwitch />
            <CategorySelector />
          </div>
        </IntegratedAppWrapper>
      );

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(100); // Should load quickly
    });

    /**
     * @test Navigation transition performance
     * @expected Smooth transitions between navigation states
     */
    it('should handle navigation transitions smoothly', async () => {
      render(
        <IntegratedAppWrapper>
          <BottomNavigation />
        </IntegratedAppWrapper>
      );

      const startTime = performance.now();

      // Rapid navigation between tabs
      const tabs = ['categories', 'favorites', 'cart', 'profile', 'home'];
      
      for (const tab of tabs) {
        const tabButton = screen.getByRole('button', { name: new RegExp(tab, 'i') });
        await user.click(tabButton);
      }

      const endTime = performance.now();
      const transitionTime = endTime - startTime;

      expect(transitionTime).toBeLessThan(500); // All transitions under 500ms
    });

    /**
     * @test Memory usage during navigation
     * @expected No memory leaks during navigation
     */
    it('should not create memory leaks', () => {
      const { unmount } = render(
        <IntegratedAppWrapper>
          <div>
            <BottomNavigation />
            <LanguageSwitch />
            <CategorySelector />
            <WiFiLogin />
          </div>
        </IntegratedAppWrapper>
      );

      // Unmount components
      unmount();

      // Verify cleanup - context methods should not be called after unmount
      expect(mockNavigationContext.setCurrentTab).not.toHaveBeenCalledAfter(unmount);
    });
  });

  describe('Error Handling Integration', () => {
    /**
     * @test Error boundary integration
     * @expected Errors in one component don't crash entire navigation
     */
    it('should handle component errors gracefully', () => {
      const ThrowingComponent = () => {
        throw new Error('Test error');
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <IntegratedAppWrapper>
          <ErrorBoundary>
            <div>
              <BottomNavigation />
              <ThrowingComponent />
              <LanguageSwitch />
            </div>
          </ErrorBoundary>
        </IntegratedAppWrapper>
      );

      // Navigation should still work
      expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /switch language/i })).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    /**
     * @test Network error handling across components
     * @expected Network errors are handled consistently
     */
    it('should handle network errors consistently', async () => {
      const networkErrorContext = {
        ...mockAuthContext,
        networkStatus: 'disconnected',
        error: 'Network connection lost'
      };

      render(
        <IntegratedAppWrapper>
          <AuthContext.Provider value={networkErrorContext}>
            <div>
              <WiFiLogin />
              <BottomNavigation />
              <CategorySelector />
            </div>
          </AuthContext.Provider>
        </IntegratedAppWrapper>
      );

      // Should show network error indicators
      expect(screen.getByRole('alert')).toHaveTextContent(/network connection lost/i);
      
      // Navigation should be partially disabled
      const profileTab = screen.getByRole('button', { name: /profile/i });
      expect(profileTab).toBeDisabled();
    });

    /**
     * @test Fallback state integration
     * @expected Components show appropriate fallbacks when data unavailable
     */
    it('should show appropriate fallbacks', () => {
      const fallbackContexts = {
        categories: { ...mockCategoryContext, categories: [], isLoading: false },
        auth: { ...mockAuthContext, networkStatus: 'disconnected' },
        i18n: { ...mockI18nContext, availableLanguages: [], error: 'Translation service unavailable' }
      };

      render(
        <IntegratedAppWrapper>
          <AuthContext.Provider value={fallbackContexts.auth}>
            <I18nContext.Provider value={fallbackContexts.i18n}>
              <CategoryContext.Provider value={fallbackContexts.categories}>
                <div>
                  <WiFiLogin />
                  <LanguageSwitch />
                  <CategorySelector />
                  <BottomNavigation />
                </div>
              </CategoryContext.Provider>
            </I18nContext.Provider>
          </AuthContext.Provider>
        </IntegratedAppWrapper>
      );

      // Should show fallback content
      expect(screen.getByText(/network connection lost/i)).toBeInTheDocument();
      expect(screen.getByText(/no categories available/i)).toBeInTheDocument();
      expect(screen.getByText(/translation service unavailable/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    /**
     * @test End-to-end accessibility compliance
     * @expected Entire navigation system passes accessibility audit
     */
    it('should have no accessibility violations across components', async () => {
      const { container } = render(
        <IntegratedAppWrapper>
          <div>
            <BottomNavigation />
            <LanguageSwitch />
            <CategorySelector />
          </div>
        </IntegratedAppWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    /**
     * @test Cross-component focus management
     * @expected Focus moves logically between navigation components
     */
    it('should manage focus across components', async () => {
      render(
        <IntegratedAppWrapper>
          <div>
            <LanguageSwitch />
            <CategorySelector />
            <BottomNavigation />
          </div>
        </IntegratedAppWrapper>
      );

      // Start with language switcher
      const languageButton = screen.getByRole('button', { name: /switch language/i });
      languageButton.focus();
      expect(languageButton).toHaveFocus();

      // Tab to category search
      await user.tab();
      expect(screen.getByPlaceholderText(/search categories/i)).toHaveFocus();

      // Tab to first category
      await user.tab();
      expect(screen.getByText('Electronics').closest('button')).toHaveFocus();

      // Tab to bottom navigation
      await user.tab({ shift: false }); // Skip other categories
      expect(screen.getByRole('button', { name: /home/i })).toHaveFocus();
    });

    /**
     * @test Screen reader announcements integration
     * @expected Screen reader announcements coordinate between components
     */
    it('should coordinate screen reader announcements', async () => {
      render(
        <IntegratedAppWrapper>
          <div>
            <BottomNavigation />
            <CategorySelector />
          </div>
        </IntegratedAppWrapper>
      );

      // Navigate to categories
      const categoriesTab = screen.getByRole('button', { name: /categories/i });
      await user.click(categoriesTab);

      // Should announce navigation change
      expect(screen.getByRole('status')).toHaveTextContent(/categories selected/i);

      // Select a category
      const electronicsCategory = screen.getByText('Electronics');
      await user.click(electronicsCategory);

      // Should announce category selection
      expect(screen.getByRole('status')).toHaveTextContent(/electronics category selected/i);
    });
  });
});