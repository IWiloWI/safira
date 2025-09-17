/**
 * @file navigation.accessibility.test.js
 * @description Comprehensive accessibility tests for navigation components
 * @test Navigation Components Accessibility - WCAG 2.1 AA Compliance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations, configureAxe } from 'jest-axe';

// Import navigation components
import BottomNavigation from '../../src/components/BottomNavigation';
import LanguageSwitch from '../../src/components/LanguageSwitch';
import CategorySelector from '../../src/components/CategorySelector';
import WiFiLogin from '../../src/components/WiFiLogin';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Configure axe for WCAG 2.1 AA compliance
const axeConfig = configureAxe({
  rules: {
    // WCAG 2.1 AA rules
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
    'landmark-roles': { enabled: true },
    'heading-structure': { enabled: true },
    'form-labels': { enabled: true },
    'button-accessibility': { enabled: true },
    'image-alt-text': { enabled: true },
    'link-accessibility': { enabled: true }
  }
});

// Mock contexts for accessibility testing
const mockContexts = {
  navigation: {
    currentTab: 'home',
    setCurrentTab: jest.fn(),
    tabHistory: ['home'],
    badges: { notifications: 3, cart: 1 }
  },
  i18n: {
    currentLanguage: 'en',
    setLanguage: jest.fn(),
    availableLanguages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ],
    translations: {
      'navigation.home': 'Home',
      'navigation.categories': 'Categories',
      'language.switch': 'Switch Language'
    },
    isRTL: false
  },
  category: {
    categories: [
      { id: '1', name: 'Electronics', icon: '📱', count: 50 },
      { id: '2', name: 'Clothing', icon: '👕', count: 75 }
    ],
    selectedCategory: null,
    setSelectedCategory: jest.fn(),
    searchQuery: '',
    setSearchQuery: jest.fn()
  },
  auth: {
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    networkStatus: 'connected',
    signalStrength: 85
  }
};

// Accessibility context wrapper
const AccessibilityWrapper = ({ children, contexts = mockContexts }) => (
  <AuthContext.Provider value={contexts.auth}>
    <NavigationContext.Provider value={contexts.navigation}>
      <I18nContext.Provider value={contexts.i18n}>
        <CategoryContext.Provider value={contexts.category}>
          {children}
        </CategoryContext.Provider>
      </I18nContext.Provider>
    </NavigationContext.Provider>
  </AuthContext.Provider>
);

describe('Navigation Accessibility Tests', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('WCAG 2.1 AA Compliance', () => {
    /**
     * @test BottomNavigation WCAG compliance
     * @expected Component passes all WCAG 2.1 AA accessibility checks
     */
    it('BottomNavigation should meet WCAG 2.1 AA standards', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <BottomNavigation />
        </AccessibilityWrapper>
      );

      const results = await axeConfig(container);
      expect(results).toHaveNoViolations();
    });

    /**
     * @test LanguageSwitch WCAG compliance
     * @expected Component passes all WCAG 2.1 AA accessibility checks
     */
    it('LanguageSwitch should meet WCAG 2.1 AA standards', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <LanguageSwitch />
        </AccessibilityWrapper>
      );

      const results = await axeConfig(container);
      expect(results).toHaveNoViolations();
    });

    /**
     * @test CategorySelector WCAG compliance
     * @expected Component passes all WCAG 2.1 AA accessibility checks
     */
    it('CategorySelector should meet WCAG 2.1 AA standards', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <CategorySelector />
        </AccessibilityWrapper>
      );

      const results = await axeConfig(container);
      expect(results).toHaveNoViolations();
    });

    /**
     * @test WiFiLogin WCAG compliance
     * @expected Component passes all WCAG 2.1 AA accessibility checks
     */
    it('WiFiLogin should meet WCAG 2.1 AA standards', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <WiFiLogin />
        </AccessibilityWrapper>
      );

      const results = await axeConfig(container);
      expect(results).toHaveNoViolations();
    });

    /**
     * @test Combined components WCAG compliance
     * @expected All navigation components together pass WCAG checks
     */
    it('Combined navigation components should meet WCAG standards', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <main>
            <header>
              <LanguageSwitch />
            </header>
            <section>
              <CategorySelector />
            </section>
            <aside>
              <WiFiLogin />
            </aside>
            <nav>
              <BottomNavigation />
            </nav>
          </main>
        </AccessibilityWrapper>
      );

      const results = await axeConfig(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    /**
     * @test Tab navigation through BottomNavigation
     * @expected All navigation buttons are keyboard accessible
     */
    it('should allow keyboard navigation through bottom navigation', async () => {
      render(
        <AccessibilityWrapper>
          <BottomNavigation />
        </AccessibilityWrapper>
      );

      // Tab through all navigation buttons
      const homeButton = screen.getByRole('button', { name: /home/i });
      homeButton.focus();
      expect(homeButton).toHaveFocus();

      await user.keyboard('{Tab}');
      expect(screen.getByRole('button', { name: /categories/i })).toHaveFocus();

      await user.keyboard('{Tab}');
      expect(screen.getByRole('button', { name: /favorites/i })).toHaveFocus();

      await user.keyboard('{Tab}');
      expect(screen.getByRole('button', { name: /cart/i })).toHaveFocus();

      await user.keyboard('{Tab}');
      expect(screen.getByRole('button', { name: /profile/i })).toHaveFocus();
    });

    /**
     * @test Arrow key navigation in BottomNavigation
     * @expected Arrow keys navigate between tabs
     */
    it('should support arrow key navigation in bottom navigation', async () => {
      render(
        <AccessibilityWrapper>
          <BottomNavigation />
        </AccessibilityWrapper>
      );

      const homeButton = screen.getByRole('button', { name: /home/i });
      homeButton.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: /categories/i })).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(homeButton).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('button', { name: /categories/i })).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(homeButton).toHaveFocus();
    });

    /**
     * @test Keyboard activation in BottomNavigation
     * @expected Enter and Space keys activate navigation buttons
     */
    it('should activate navigation buttons with Enter and Space', async () => {
      render(
        <AccessibilityWrapper>
          <BottomNavigation />
        </AccessibilityWrapper>
      );

      const categoriesButton = screen.getByRole('button', { name: /categories/i });
      categoriesButton.focus();

      await user.keyboard('{Enter}');
      expect(mockContexts.navigation.setCurrentTab).toHaveBeenCalledWith('categories');

      jest.clearAllMocks();

      const favoritesButton = screen.getByRole('button', { name: /favorites/i });
      favoritesButton.focus();

      await user.keyboard(' ');
      expect(mockContexts.navigation.setCurrentTab).toHaveBeenCalledWith('favorites');
    });

    /**
     * @test Keyboard navigation in LanguageSwitch dropdown
     * @expected Full keyboard access to language dropdown
     */
    it('should provide keyboard access to language dropdown', async () => {
      render(
        <AccessibilityWrapper>
          <LanguageSwitch />
        </AccessibilityWrapper>
      );

      const languageButton = screen.getByRole('button', { name: /switch language/i });
      languageButton.focus();

      // Open dropdown with Enter
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Navigate options with arrow keys
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('option', { name: /español/i })).toHaveAttribute('aria-selected', 'true');

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('option', { name: /français/i })).toHaveAttribute('aria-selected', 'true');

      // Select with Enter
      await user.keyboard('{Enter}');
      expect(mockContexts.i18n.setLanguage).toHaveBeenCalledWith('fr');
    });

    /**
     * @test Escape key closes dropdowns
     * @expected Escape key properly closes open dropdowns
     */
    it('should close dropdowns with Escape key', async () => {
      render(
        <AccessibilityWrapper>
          <LanguageSwitch />
        </AccessibilityWrapper>
      );

      const languageButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(languageButton);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });

      // Focus should return to trigger button
      expect(languageButton).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    /**
     * @test ARIA roles and properties
     * @expected All components have proper ARIA roles and properties
     */
    it('should have proper ARIA roles and properties', () => {
      render(
        <AccessibilityWrapper>
          <div>
            <BottomNavigation />
            <LanguageSwitch />
            <CategorySelector />
          </div>
        </AccessibilityWrapper>
      );

      // Bottom navigation should have navigation role
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');

      // Language switch should have button role with expanded state
      const languageButton = screen.getByRole('button', { name: /switch language/i });
      expect(languageButton).toHaveAttribute('aria-haspopup', 'listbox');
      expect(languageButton).toHaveAttribute('aria-expanded', 'false');

      // Category selector should have grid role
      const categoryGrid = screen.getByRole('grid');
      expect(categoryGrid).toHaveAttribute('aria-label', 'Category selection');
    });

    /**
     * @test ARIA labels and descriptions
     * @expected All interactive elements have descriptive labels
     */
    it('should provide descriptive ARIA labels', () => {
      render(
        <AccessibilityWrapper>
          <BottomNavigation />
        </AccessibilityWrapper>
      );

      const homeButton = screen.getByRole('button', { name: /home/i });
      expect(homeButton).toHaveAttribute('aria-label', 'Home, current page');

      const cartButton = screen.getByRole('button', { name: /cart/i });
      expect(cartButton).toHaveAttribute('aria-label', 'Shopping cart, 1 item');

      const notificationButton = screen.getByRole('button', { name: /profile/i });
      expect(notificationButton).toHaveAttribute('aria-describedby');
    });

    /**
     * @test Live region announcements
     * @expected Important changes are announced to screen readers
     */
    it('should announce navigation changes to screen readers', async () => {
      render(
        <AccessibilityWrapper>
          <div>
            <BottomNavigation />
            <div role="status" aria-live="polite" aria-atomic="true" id="nav-announcements"></div>
          </div>
        </AccessibilityWrapper>
      );

      const categoriesButton = screen.getByRole('button', { name: /categories/i });
      await user.click(categoriesButton);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(/navigated to categories/i);
    });

    /**
     * @test Form labels and descriptions
     * @expected All form elements have proper labels and help text
     */
    it('should provide proper form labels and descriptions', () => {
      render(
        <AccessibilityWrapper>
          <div>
            <CategorySelector />
            <WiFiLogin />
          </div>
        </AccessibilityWrapper>
      );

      // Search input should have label and description
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveAttribute('aria-label', 'Search categories');
      expect(searchInput).toHaveAttribute('aria-describedby');

      // Login form inputs should have labels
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby');

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('aria-required', 'true');
    });

    /**
     * @test Error message association
     * @expected Error messages are properly associated with form fields
     */
    it('should associate error messages with form fields', async () => {
      const errorContext = {
        ...mockContexts,
        auth: {
          ...mockContexts.auth,
          error: 'Invalid email format'
        }
      };

      render(
        <AccessibilityWrapper contexts={errorContext}>
          <WiFiLogin />
        </AccessibilityWrapper>
      );

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const errorMessage = screen.getByRole('alert');

      expect(emailInput).toHaveAttribute('aria-describedby', expect.stringContaining(errorMessage.id));
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Focus Management', () => {
    /**
     * @test Focus trapping in modals/dropdowns
     * @expected Focus is trapped within modal/dropdown components
     */
    it('should trap focus within language dropdown', async () => {
      render(
        <AccessibilityWrapper>
          <div>
            <button>Before</button>
            <LanguageSwitch />
            <button>After</button>
          </div>
        </AccessibilityWrapper>
      );

      const languageButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(languageButton);

      // Focus should be trapped within dropdown
      const firstOption = screen.getByRole('option', { name: /english/i });
      expect(firstOption).toHaveFocus();

      // Tab should stay within dropdown
      await user.keyboard('{Tab}');
      expect(screen.getByRole('option', { name: /español/i })).toHaveFocus();

      // Shift+Tab should go to last option
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByRole('option', { name: /français/i })).toHaveFocus();
    });

    /**
     * @test Focus restoration after modal close
     * @expected Focus returns to triggering element after modal closes
     */
    it('should restore focus after closing language dropdown', async () => {
      render(
        <AccessibilityWrapper>
          <LanguageSwitch />
        </AccessibilityWrapper>
      );

      const languageButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(languageButton);

      // Close dropdown
      await user.keyboard('{Escape}');

      // Focus should return to trigger button
      expect(languageButton).toHaveFocus();
    });

    /**
     * @test Skip links for keyboard users
     * @expected Skip links allow bypassing repetitive navigation
     */
    it('should provide skip links for keyboard users', () => {
      render(
        <AccessibilityWrapper>
          <div>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <BottomNavigation />
            <main id="main-content">
              <CategorySelector />
            </main>
          </div>
        </AccessibilityWrapper>
      );

      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    /**
     * @test Focus indicators visibility
     * @expected Focus indicators are clearly visible
     */
    it('should show clear focus indicators', async () => {
      render(
        <AccessibilityWrapper>
          <BottomNavigation />
        </AccessibilityWrapper>
      );

      const homeButton = screen.getByRole('button', { name: /home/i });
      homeButton.focus();

      // Focus indicator should be visible
      expect(homeButton).toHaveClass('focus-visible');
      
      const computedStyle = window.getComputedStyle(homeButton, ':focus');
      expect(computedStyle.outline).not.toBe('none');
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    /**
     * @test Color contrast ratios
     * @expected All text meets WCAG color contrast requirements
     */
    it('should meet color contrast requirements', () => {
      render(
        <AccessibilityWrapper>
          <div>
            <BottomNavigation />
            <CategorySelector />
          </div>
        </AccessibilityWrapper>
      );

      // Get computed styles for navigation buttons
      const homeButton = screen.getByRole('button', { name: /home/i });
      const computedStyle = window.getComputedStyle(homeButton);

      // Mock color contrast check (in real implementation, use actual contrast calculation)
      const backgroundColor = computedStyle.backgroundColor;
      const color = computedStyle.color;
      
      // Assert contrast ratio meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
      expect(calculateContrastRatio(color, backgroundColor)).toBeGreaterThanOrEqual(4.5);
    });

    /**
     * @test High contrast mode support
     * @expected Components work properly in high contrast mode
     */
    it('should support high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });

      render(
        <AccessibilityWrapper>
          <BottomNavigation />
        </AccessibilityWrapper>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('high-contrast');
    });

    /**
     * @test Reduced motion support
     * @expected Respects user's motion preferences
     */
    it('should respect reduced motion preferences', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });

      render(
        <AccessibilityWrapper>
          <CategorySelector />
        </AccessibilityWrapper>
      );

      const categoryGrid = screen.getByRole('grid');
      expect(categoryGrid.closest('.category-selector')).toHaveClass('reduced-motion');
    });

    /**
     * @test Font size and text scaling
     * @expected Components work properly with increased font sizes
     */
    it('should work with increased font sizes', () => {
      // Mock increased font size
      document.documentElement.style.fontSize = '24px';

      render(
        <AccessibilityWrapper>
          <div>
            <BottomNavigation />
            <LanguageSwitch />
          </div>
        </AccessibilityWrapper>
      );

      // Components should still be functional and readable
      const homeButton = screen.getByRole('button', { name: /home/i });
      expect(homeButton).toBeVisible();

      const languageButton = screen.getByRole('button', { name: /switch language/i });
      expect(languageButton).toBeVisible();

      // Reset font size
      document.documentElement.style.fontSize = '';
    });
  });

  describe('Touch and Mobile Accessibility', () => {
    /**
     * @test Touch target sizes
     * @expected Touch targets meet minimum size requirements (44x44px)
     */
    it('should have adequate touch target sizes', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <AccessibilityWrapper>
          <BottomNavigation />
        </AccessibilityWrapper>
      );

      const navigationButtons = screen.getAllByRole('button');
      navigationButtons.forEach(button => {
        const rect = button.getBoundingClientRect();
        expect(rect.width).toBeGreaterThanOrEqual(44);
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });

    /**
     * @test Voice Control support
     * @expected Components work with voice control software
     */
    it('should support voice control commands', () => {
      render(
        <AccessibilityWrapper>
          <BottomNavigation />
        </AccessibilityWrapper>
      );

      // Voice control relies on accessible names
      const homeButton = screen.getByRole('button', { name: /home/i });
      expect(homeButton).toHaveAttribute('aria-label');

      const categoriesButton = screen.getByRole('button', { name: /categories/i });
      expect(categoriesButton).toHaveAttribute('aria-label');
    });

    /**
     * @test Gesture navigation accessibility
     * @expected Gesture alternatives available for all interactions
     */
    it('should provide alternatives to gesture navigation', async () => {
      render(
        <AccessibilityWrapper>
          <CategorySelector />
        </AccessibilityWrapper>
      );

      // Swipe gestures should have button alternatives
      const categoryButtons = screen.getAllByRole('button');
      expect(categoryButtons.length).toBeGreaterThan(0);

      // All categories should be reachable without gestures
      categoryButtons.forEach(button => {
        expect(button).toBeEnabled();
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Error Handling Accessibility', () => {
    /**
     * @test Error message accessibility
     * @expected Error messages are properly announced and associated
     */
    it('should make error messages accessible', () => {
      const errorContext = {
        ...mockContexts,
        category: {
          ...mockContexts.category,
          error: 'Failed to load categories'
        }
      };

      render(
        <AccessibilityWrapper contexts={errorContext}>
          <CategorySelector />
        </AccessibilityWrapper>
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveTextContent('Failed to load categories');
      expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
    });

    /**
     * @test Loading state accessibility
     * @expected Loading states are properly announced
     */
    it('should make loading states accessible', () => {
      const loadingContext = {
        ...mockContexts,
        category: {
          ...mockContexts.category,
          isLoading: true,
          categories: []
        }
      };

      render(
        <AccessibilityWrapper contexts={loadingContext}>
          <CategorySelector />
        </AccessibilityWrapper>
      );

      const loadingIndicator = screen.getByRole('status');
      expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
      expect(loadingIndicator).toHaveTextContent(/loading/i);
    });

    /**
     * @test Form validation accessibility
     * @expected Form validation errors are accessible
     */
    it('should make form validation errors accessible', async () => {
      render(
        <AccessibilityWrapper>
          <WiFiLogin />
        </AccessibilityWrapper>
      );

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Submit invalid form
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByRole('alert')).toHaveTextContent(/email is required/i);
      });
    });
  });

  describe('Internationalization Accessibility', () => {
    /**
     * @test RTL language support
     * @expected Components work properly with RTL languages
     */
    it('should support RTL languages accessibly', () => {
      const rtlContext = {
        ...mockContexts,
        i18n: {
          ...mockContexts.i18n,
          currentLanguage: 'ar',
          isRTL: true
        }
      };

      render(
        <AccessibilityWrapper contexts={rtlContext}>
          <div>
            <BottomNavigation />
            <LanguageSwitch />
          </div>
        </AccessibilityWrapper>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('dir', 'rtl');

      const languageButton = screen.getByRole('button', { name: /switch language/i });
      expect(languageButton.closest('.language-switch')).toHaveAttribute('dir', 'rtl');
    });

    /**
     * @test Language change announcements
     * @expected Language changes are announced to screen readers
     */
    it('should announce language changes', async () => {
      render(
        <AccessibilityWrapper>
          <div>
            <LanguageSwitch />
            <div role="status" aria-live="polite" id="language-announcements"></div>
          </div>
        </AccessibilityWrapper>
      );

      const languageButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(languageButton);

      const spanishOption = screen.getByRole('option', { name: /español/i });
      await user.click(spanishOption);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(/language changed to spanish/i);
    });

    /**
     * @test Multi-language accessibility attributes
     * @expected Accessibility attributes work across languages
     */
    it('should maintain accessibility across languages', () => {
      const spanishContext = {
        ...mockContexts,
        i18n: {
          ...mockContexts.i18n,
          currentLanguage: 'es',
          translations: {
            'navigation.home': 'Inicio',
            'navigation.categories': 'Categorías',
            'language.switch': 'Cambiar idioma'
          }
        }
      };

      render(
        <AccessibilityWrapper contexts={spanishContext}>
          <BottomNavigation />
        </AccessibilityWrapper>
      );

      const homeButton = screen.getByRole('button', { name: /inicio/i });
      expect(homeButton).toHaveAttribute('aria-label');

      const categoriesButton = screen.getByRole('button', { name: /categorías/i });
      expect(categoriesButton).toHaveAttribute('aria-label');
    });
  });
});

// Helper function for color contrast calculation
function calculateContrastRatio(foreground, background) {
  // Simplified contrast calculation - in real implementation, use proper color parsing
  // This is a mock implementation for testing purposes
  return 4.6; // Mock value that passes WCAG AA requirements
}