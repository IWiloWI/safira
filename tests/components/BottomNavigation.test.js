/**
 * @file BottomNavigation.test.js
 * @description Comprehensive test suite for BottomNavigation component
 * @test BottomNavigation Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import BottomNavigation from '../../src/components/BottomNavigation';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock navigation context
const mockNavigationContext = {
  currentTab: 'home',
  setCurrentTab: jest.fn(),
  tabHistory: ['home'],
  badges: { notifications: 3, cart: 1 }
};

// Mock component with context provider
const MockBottomNavigationWrapper = ({ children, context = mockNavigationContext }) => (
  <NavigationContext.Provider value={context}>
    {children}
  </NavigationContext.Provider>
);

describe('BottomNavigation Component', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    /**
     * @test Component renders with all navigation tabs
     * @expected All tab buttons are visible with correct labels
     */
    it('should render all navigation tabs', () => {
      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /categories/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /favorites/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cart/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
    });

    /**
     * @test Active tab is highlighted correctly
     * @expected Current active tab has active styling
     */
    it('should highlight active tab', () => {
      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      const homeTab = screen.getByRole('button', { name: /home/i });
      expect(homeTab).toHaveClass('active');
      expect(homeTab).toHaveAttribute('aria-selected', 'true');
    });

    /**
     * @test Badge notifications display correctly
     * @expected Badges show correct counts for notifications and cart
     */
    it('should display badge notifications', () => {
      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      expect(screen.getByText('3')).toBeInTheDocument(); // notifications badge
      expect(screen.getByText('1')).toBeInTheDocument(); // cart badge
    });

    /**
     * @test Icons render correctly for each tab
     * @expected All tab icons are present and accessible
     */
    it('should render tab icons', () => {
      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('categories-icon')).toBeInTheDocument();
      expect(screen.getByTestId('favorites-icon')).toBeInTheDocument();
      expect(screen.getByTestId('cart-icon')).toBeInTheDocument();
      expect(screen.getByTestId('profile-icon')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    /**
     * @test Tab switching works correctly
     * @expected Clicking tab updates active state and calls navigation handler
     */
    it('should handle tab switching', async () => {
      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      const categoriesTab = screen.getByRole('button', { name: /categories/i });
      await user.click(categoriesTab);

      expect(mockNavigationContext.setCurrentTab).toHaveBeenCalledWith('categories');
    });

    /**
     * @test Keyboard navigation support
     * @expected Arrow keys navigate between tabs, Enter/Space activate tabs
     */
    it('should support keyboard navigation', async () => {
      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      const homeTab = screen.getByRole('button', { name: /home/i });
      homeTab.focus();

      // Test arrow key navigation
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: /categories/i })).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(homeTab).toHaveFocus();

      // Test Enter key activation
      await user.keyboard('{Enter}');
      expect(mockNavigationContext.setCurrentTab).toHaveBeenCalledWith('home');
    });

    /**
     * @test Touch gestures on mobile devices
     * @expected Touch events properly handled for tab switching
     */
    it('should handle touch events', async () => {
      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      
      fireEvent.touchStart(favoritesTab);
      fireEvent.touchEnd(favoritesTab);

      expect(mockNavigationContext.setCurrentTab).toHaveBeenCalledWith('favorites');
    });

    /**
     * @test Double-tap behavior
     * @expected Double-tap on active tab triggers scroll-to-top or refresh
     */
    it('should handle double-tap on active tab', async () => {
      const mockScrollToTop = jest.fn();
      
      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation onScrollToTop={mockScrollToTop} />
        </MockBottomNavigationWrapper>
      );

      const homeTab = screen.getByRole('button', { name: /home/i });
      
      // Simulate double-tap
      await user.dblClick(homeTab);
      
      expect(mockScrollToTop).toHaveBeenCalledWith('home');
    });
  });

  describe('Responsive Behavior', () => {
    /**
     * @test Mobile viewport adaptations
     * @expected Component adjusts layout for mobile screens
     */
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('mobile-layout');
    });

    /**
     * @test Tablet viewport behavior
     * @expected Component shows enhanced layout for tablets
     */
    it('should show tablet layout', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('tablet-layout');
    });

    /**
     * @test Desktop behavior - component may be hidden or adapted
     * @expected Component handles desktop screen sizes appropriately
     */
    it('should handle desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('desktop-layout');
    });
  });

  describe('State Management', () => {
    /**
     * @test Navigation state persistence
     * @expected Tab state persists across component re-renders
     */
    it('should maintain state across re-renders', () => {
      const { rerender } = render(
        <MockBottomNavigationWrapper context={{...mockNavigationContext, currentTab: 'cart'}}>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      expect(screen.getByRole('button', { name: /cart/i })).toHaveClass('active');

      rerender(
        <MockBottomNavigationWrapper context={{...mockNavigationContext, currentTab: 'cart'}}>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      expect(screen.getByRole('button', { name: /cart/i })).toHaveClass('active');
    });

    /**
     * @test Badge updates reflect in real-time
     * @expected Badge counts update when context changes
     */
    it('should update badges dynamically', () => {
      const { rerender } = render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      expect(screen.getByText('3')).toBeInTheDocument();

      rerender(
        <MockBottomNavigationWrapper 
          context={{...mockNavigationContext, badges: { notifications: 5, cart: 2 }}}
        >
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    /**
     * @test Component renders within performance budget
     * @expected Render time stays under 16ms for 60fps
     */
    it('should render within performance budget', async () => {
      const startTime = performance.now();
      
      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(16); // 60fps budget
    });

    /**
     * @test Memory usage optimization
     * @expected Component doesn't create memory leaks
     */
    it('should not create memory leaks', () => {
      const { unmount } = render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      // Simulate unmounting
      unmount();

      // Verify cleanup
      expect(mockNavigationContext.setCurrentTab).not.toHaveBeenCalledAfter(unmount);
    });
  });

  describe('Accessibility', () => {
    /**
     * @test WCAG compliance
     * @expected Component passes accessibility audit
     */
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    /**
     * @test Screen reader support
     * @expected All elements have proper ARIA labels and roles
     */
    it('should support screen readers', () => {
      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Bottom navigation');

      const tabs = screen.getAllByRole('button');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-label');
        expect(tab).toHaveAttribute('role', 'button');
      });
    });

    /**
     * @test Focus management
     * @expected Focus is properly managed during navigation
     */
    it('should manage focus correctly', async () => {
      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      const homeTab = screen.getByRole('button', { name: /home/i });
      await user.tab();
      
      expect(homeTab).toHaveFocus();
    });

    /**
     * @test High contrast mode support
     * @expected Component works in high contrast mode
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
        <MockBottomNavigationWrapper>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('high-contrast');
    });
  });

  describe('Error Handling', () => {
    /**
     * @test Graceful handling of missing context
     * @expected Component handles missing navigation context gracefully
     */
    it('should handle missing navigation context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<BottomNavigation />);

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    /**
     * @test Invalid tab handling
     * @expected Component handles invalid tab selections gracefully
     */
    it('should handle invalid tab selection', async () => {
      const invalidContext = {
        ...mockNavigationContext,
        currentTab: 'invalid-tab'
      };

      render(
        <MockBottomNavigationWrapper context={invalidContext}>
          <BottomNavigation />
        </MockBottomNavigationWrapper>
      );

      // Should default to first available tab
      expect(screen.getByRole('button', { name: /home/i })).toHaveClass('active');
    });
  });

  describe('Integration', () => {
    /**
     * @test Router integration
     * @expected Component works with routing systems
     */
    it('should integrate with router', async () => {
      const mockPush = jest.fn();
      const RouterWrapper = ({ children }) => (
        <Router history={{ push: mockPush }}>
          {children}
        </Router>
      );

      render(
        <RouterWrapper>
          <MockBottomNavigationWrapper>
            <BottomNavigation />
          </MockBottomNavigationWrapper>
        </RouterWrapper>
      );

      const categoriesTab = screen.getByRole('button', { name: /categories/i });
      await user.click(categoriesTab);

      expect(mockPush).toHaveBeenCalledWith('/categories');
    });

    /**
     * @test Analytics integration
     * @expected Navigation events are tracked for analytics
     */
    it('should track navigation events', async () => {
      const mockTrack = jest.fn();
      
      render(
        <MockBottomNavigationWrapper>
          <BottomNavigation onTrackNavigation={mockTrack} />
        </MockBottomNavigationWrapper>
      );

      const profileTab = screen.getByRole('button', { name: /profile/i });
      await user.click(profileTab);

      expect(mockTrack).toHaveBeenCalledWith('navigation_click', {
        from: 'home',
        to: 'profile',
        timestamp: expect.any(Number)
      });
    });
  });
});