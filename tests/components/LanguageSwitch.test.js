/**
 * @file LanguageSwitch.test.js
 * @description Comprehensive test suite for LanguageSwitch component
 * @test LanguageSwitch Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import LanguageSwitch from '../../src/components/LanguageSwitch';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock i18n context
const mockI18nContext = {
  currentLanguage: 'en',
  setLanguage: jest.fn(),
  availableLanguages: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ],
  translations: {
    'language.switch': 'Switch Language',
    'language.current': 'Current Language',
    'language.select': 'Select Language'
  },
  isLoading: false,
  isRTL: false
};

// Mock component wrapper
const MockLanguageSwitchWrapper = ({ children, context = mockI18nContext }) => (
  <I18nContext.Provider value={context}>
    {children}
  </I18nContext.Provider>
);

describe('LanguageSwitch Component', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    /**
     * @test Component renders with current language displayed
     * @expected Current language button shows correct flag and name
     */
    it('should render current language selector', () => {
      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      expect(screen.getByRole('button', { name: /switch language/i })).toBeInTheDocument();
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    /**
     * @test Dropdown menu shows all available languages
     * @expected Language dropdown contains all available language options
     */
    it('should show all available languages in dropdown', async () => {
      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const toggleButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Español')).toBeInTheDocument();
        expect(screen.getByText('Français')).toBeInTheDocument();
        expect(screen.getByText('Deutsch')).toBeInTheDocument();
        expect(screen.getByText('Italiano')).toBeInTheDocument();
      });
    });

    /**
     * @test Loading state display
     * @expected Shows loading indicator during language changes
     */
    it('should show loading state', () => {
      const loadingContext = { ...mockI18nContext, isLoading: true };

      render(
        <MockLanguageSwitchWrapper context={loadingContext}>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });

    /**
     * @test RTL language support
     * @expected Component adjusts layout for RTL languages
     */
    it('should support RTL languages', () => {
      const rtlContext = { ...mockI18nContext, isRTL: true, currentLanguage: 'ar' };

      render(
        <MockLanguageSwitchWrapper context={rtlContext}>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const container = screen.getByRole('button').closest('.language-switch');
      expect(container).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('User Interactions', () => {
    /**
     * @test Language selection functionality
     * @expected Selecting a language triggers language change
     */
    it('should handle language selection', async () => {
      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const toggleButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(toggleButton);

      const spanishOption = screen.getByText('Español');
      await user.click(spanishOption);

      expect(mockI18nContext.setLanguage).toHaveBeenCalledWith('es');
    });

    /**
     * @test Keyboard navigation in dropdown
     * @expected Arrow keys navigate language options, Enter selects
     */
    it('should support keyboard navigation', async () => {
      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const toggleButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(toggleButton);

      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Español')).toHaveClass('highlighted');

      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Français')).toHaveClass('highlighted');

      await user.keyboard('{ArrowUp}');
      expect(screen.getByText('Español')).toHaveClass('highlighted');

      // Select with Enter
      await user.keyboard('{Enter}');
      expect(mockI18nContext.setLanguage).toHaveBeenCalledWith('es');
    });

    /**
     * @test Dropdown closes on outside click
     * @expected Clicking outside dropdown closes the menu
     */
    it('should close dropdown on outside click', async () => {
      render(
        <div>
          <MockLanguageSwitchWrapper>
            <LanguageSwitch />
          </MockLanguageSwitchWrapper>
          <div data-testid="outside-element">Outside</div>
        </div>
      );

      const toggleButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(toggleButton);

      expect(screen.getByText('Español')).toBeInTheDocument();

      const outsideElement = screen.getByTestId('outside-element');
      await user.click(outsideElement);

      await waitFor(() => {
        expect(screen.queryByText('Español')).not.toBeInTheDocument();
      });
    });

    /**
     * @test Escape key closes dropdown
     * @expected Pressing Escape closes the language dropdown
     */
    it('should close dropdown with Escape key', async () => {
      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const toggleButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(toggleButton);

      expect(screen.getByText('Español')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Español')).not.toBeInTheDocument();
      });
    });

    /**
     * @test Touch interactions on mobile
     * @expected Touch events properly trigger language selection
     */
    it('should handle touch interactions', async () => {
      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const toggleButton = screen.getByRole('button', { name: /switch language/i });
      fireEvent.touchStart(toggleButton);
      fireEvent.touchEnd(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Español')).toBeInTheDocument();
      });

      const frenchOption = screen.getByText('Français');
      fireEvent.touchStart(frenchOption);
      fireEvent.touchEnd(frenchOption);

      expect(mockI18nContext.setLanguage).toHaveBeenCalledWith('fr');
    });
  });

  describe('Persistence', () => {
    /**
     * @test Language preference persistence
     * @expected Selected language is saved to localStorage
     */
    it('should persist language selection', async () => {
      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const toggleButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(toggleButton);

      const germanOption = screen.getByText('Deutsch');
      await user.click(germanOption);

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'preferredLanguage',
        'de'
      );
    });

    /**
     * @test Language restoration from storage
     * @expected Component restores language from localStorage on mount
     */
    it('should restore language from localStorage', () => {
      window.localStorage.getItem.mockReturnValue('fr');

      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      expect(mockI18nContext.setLanguage).toHaveBeenCalledWith('fr');
    });

    /**
     * @test Browser language detection
     * @expected Component detects and sets browser language if no preference exists
     */
    it('should detect browser language', () => {
      // Mock browser language
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'es-ES',
      });

      window.localStorage.getItem.mockReturnValue(null);

      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch autoDetect={true} />
        </MockLanguageSwitchWrapper>
      );

      expect(mockI18nContext.setLanguage).toHaveBeenCalledWith('es');
    });
  });

  describe('Responsive Design', () => {
    /**
     * @test Mobile dropdown behavior
     * @expected Dropdown adapts to mobile screen constraints
     */
    it('should adapt dropdown for mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const container = screen.getByRole('button').closest('.language-switch');
      expect(container).toHaveClass('mobile-layout');
    });

    /**
     * @test Tablet layout adjustments
     * @expected Component shows enhanced layout for tablets
     */
    it('should show tablet optimized layout', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const container = screen.getByRole('button').closest('.language-switch');
      expect(container).toHaveClass('tablet-layout');
    });
  });

  describe('Performance', () => {
    /**
     * @test Dropdown rendering performance
     * @expected Language dropdown renders quickly
     */
    it('should render dropdown efficiently', async () => {
      const startTime = performance.now();

      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const toggleButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(toggleButton);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(50); // Should be fast
    });

    /**
     * @test Language change performance
     * @expected Language switching completes quickly
     */
    it('should switch languages efficiently', async () => {
      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const startTime = performance.now();

      const toggleButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(toggleButton);

      const italianOption = screen.getByText('Italiano');
      await user.click(italianOption);

      const endTime = performance.now();
      const switchTime = endTime - startTime;

      expect(switchTime).toBeLessThan(100);
    });

    /**
     * @test Memory cleanup on unmount
     * @expected Component properly cleans up event listeners
     */
    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('Accessibility', () => {
    /**
     * @test WCAG compliance
     * @expected Component passes accessibility audit
     */
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    /**
     * @test Screen reader announcements
     * @expected Language changes are announced to screen readers
     */
    it('should announce language changes', async () => {
      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const toggleButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(toggleButton);

      const spanishOption = screen.getByText('Español');
      await user.click(spanishOption);

      // Check for aria-live region update
      expect(screen.getByRole('status')).toHaveTextContent(
        'Language changed to Spanish'
      );
    });

    /**
     * @test Focus management
     * @expected Focus returns to trigger after selection
     */
    it('should manage focus correctly', async () => {
      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const toggleButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(toggleButton);

      const germanOption = screen.getByText('Deutsch');
      await user.click(germanOption);

      await waitFor(() => {
        expect(toggleButton).toHaveFocus();
      });
    });

    /**
     * @test High contrast mode support
     * @expected Component works in high contrast mode
     */
    it('should support high contrast mode', () => {
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
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      const container = screen.getByRole('button').closest('.language-switch');
      expect(container).toHaveClass('high-contrast');
    });
  });

  describe('Error Handling', () => {
    /**
     * @test Invalid language code handling
     * @expected Component handles invalid language codes gracefully
     */
    it('should handle invalid language codes', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      // Simulate invalid language selection
      mockI18nContext.setLanguage('invalid-code');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid language code: invalid-code'
      );

      consoleSpy.mockRestore();
    });

    /**
     * @test Network failure handling
     * @expected Component handles translation loading failures
     */
    it('should handle translation loading failures', () => {
      const errorContext = {
        ...mockI18nContext,
        error: 'Failed to load translations',
        isLoading: false
      };

      render(
        <MockLanguageSwitchWrapper context={errorContext}>
          <LanguageSwitch />
        </MockLanguageSwitchWrapper>
      );

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Failed to load translations'
      );
    });

    /**
     * @test Fallback language behavior
     * @expected Component falls back to default language on errors
     */
    it('should fallback to default language', () => {
      const fallbackContext = {
        ...mockI18nContext,
        currentLanguage: null
      };

      render(
        <MockLanguageSwitchWrapper context={fallbackContext}>
          <LanguageSwitch fallbackLanguage="en" />
        </MockLanguageSwitchWrapper>
      );

      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    /**
     * @test i18n library integration
     * @expected Component integrates with i18n libraries
     */
    it('should integrate with i18n libraries', () => {
      const mockI18n = {
        changeLanguage: jest.fn(),
        language: 'en',
        languages: ['en', 'es', 'fr']
      };

      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch i18nInstance={mockI18n} />
        </MockLanguageSwitchWrapper>
      );

      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('en');
    });

    /**
     * @test URL parameter synchronization
     * @expected Language selection updates URL parameters
     */
    it('should sync with URL parameters', async () => {
      const mockPushState = jest.spyOn(window.history, 'pushState').mockImplementation();

      render(
        <MockLanguageSwitchWrapper>
          <LanguageSwitch syncWithURL={true} />
        </MockLanguageSwitchWrapper>
      );

      const toggleButton = screen.getByRole('button', { name: /switch language/i });
      await user.click(toggleButton);

      const frenchOption = screen.getByText('Français');
      await user.click(frenchOption);

      expect(mockPushState).toHaveBeenCalledWith(
        null,
        '',
        expect.stringContaining('lang=fr')
      );

      mockPushState.mockRestore();
    });
  });
});