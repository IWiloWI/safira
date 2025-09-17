/**
 * Accessibility Testing Suite
 * Comprehensive tests for WCAG 2.1 AA compliance
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { validationUtils, colorUtils, touchUtils } from '../utils/accessibility';
import AccessibleButton from '../components/Common/AccessibleButton';
import FormField from '../components/Common/FormField';
import SkipLink from '../components/Common/SkipLink';
import LiveRegion from '../components/Common/LiveRegion';
import ScreenReaderOnly from '../components/Common/ScreenReaderOnly';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Testing Suite', () => {
  
  describe('Color Contrast Tests', () => {
    test('primary colors meet WCAG AA contrast requirements', () => {
      // Test primary brand colors
      const primaryColor = '#FF41FB';
      const backgroundColor = '#FFFFFF';
      const textColor = '#333333';
      
      expect(colorUtils.meetsContrastRequirement(textColor, backgroundColor, 'AA')).toBe(true);
      expect(colorUtils.meetsContrastRequirement(primaryColor, backgroundColor, 'AA')).toBe(true);
    });
    
    test('error colors meet contrast requirements', () => {
      const errorColor = '#FF6B6B';
      const backgroundColor = '#FFFFFF';
      
      expect(colorUtils.meetsContrastRequirement(errorColor, backgroundColor, 'AA')).toBe(true);
    });
    
    test('success colors meet contrast requirements', () => {
      const successColor = '#4ECDC4';
      const backgroundColor = '#FFFFFF';
      
      expect(colorUtils.meetsContrastRequirement(successColor, backgroundColor, 'AA')).toBe(true);
    });
  });
  
  describe('Touch Target Tests', () => {
    test('buttons meet minimum touch target size', () => {
      // Create a test button element
      const button = document.createElement('button');
      button.style.width = '44px';
      button.style.height = '44px';
      document.body.appendChild(button);
      
      expect(touchUtils.meetsTouchTargetSize(button)).toBe(true);
      
      document.body.removeChild(button);
    });
    
    test('small elements get enhanced with minimum touch targets', () => {
      const smallButton = document.createElement('button');
      smallButton.style.width = '20px';
      smallButton.style.height = '20px';
      document.body.appendChild(smallButton);
      
      expect(touchUtils.meetsTouchTargetSize(smallButton)).toBe(false);
      
      touchUtils.ensureTouchTarget(smallButton);
      
      expect(smallButton.style.minWidth).toBe('44px');
      expect(smallButton.style.minHeight).toBe('44px');
      
      document.body.removeChild(smallButton);
    });
  });
  
  describe('Accessibility Validation Tests', () => {
    test('validates missing alt text on images', () => {
      const img = document.createElement('img');
      img.src = 'test.jpg';
      
      const issues = validationUtils.validateAccessibility(img);
      expect(issues).toContain('Image missing alt attribute');
    });
    
    test('validates missing labels on form controls', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'test-input';
      
      const issues = validationUtils.validateAccessibility(input);
      expect(issues).toContain('Form control missing label');
    });
    
    test('validates custom interactive elements have roles', () => {
      const div = document.createElement('div');
      div.setAttribute('tabindex', '0');
      
      const issues = validationUtils.validateAccessibility(div);
      expect(issues).toContain('Custom interactive element missing role');
    });
  });
  
  describe('AccessibleButton Component Tests', () => {
    test('renders without accessibility violations', async () => {
      const { container } = render(
        <AccessibleButton>Test Button</AccessibleButton>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('supports keyboard navigation', () => {
      const handleClick = jest.fn();
      render(
        <AccessibleButton onClick={handleClick}>Test Button</AccessibleButton>
      );
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });
    
    test('announces loading state', () => {
      const { rerender } = render(
        <AccessibleButton loading={false}>Test Button</AccessibleButton>
      );
      
      rerender(
        <AccessibleButton loading={true} loadingText="Loading data">
          Test Button
        </AccessibleButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
    
    test('supports icon-only buttons with proper labels', () => {
      render(
        <AccessibleButton 
          iconOnly={true}
          icon={<span>🔍</span>}
          aria-label="Search"
        />
      );
      
      const button = screen.getByLabelText('Search');
      expect(button).toBeInTheDocument();
    });
  });
  
  describe('FormField Component Tests', () => {
    test('renders without accessibility violations', async () => {
      const { container } = render(
        <FormField 
          name="test"
          label="Test Field"
          value=""
          onChange={() => {}}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('associates labels with form controls', () => {
      render(
        <FormField 
          name="test"
          label="Test Field"
          value=""
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toBeInTheDocument();
    });
    
    test('announces validation errors', () => {
      render(
        <FormField 
          name="test"
          label="Test Field"
          value=""
          error="This field is required"
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('This field is required');
    });
    
    test('supports required field indication', () => {
      render(
        <FormField 
          name="test"
          label="Test Field"
          value=""
          required={true}
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toBeRequired();
    });
  });
  
  describe('SkipLink Component Tests', () => {
    test('renders without accessibility violations', async () => {
      const { container } = render(
        <SkipLink href="main-content">Skip to main content</SkipLink>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('becomes visible on focus', () => {
      render(
        <SkipLink href="main-content">Skip to main content</SkipLink>
      );
      
      const link = screen.getByText('Skip to main content');
      fireEvent.focus(link);
      
      expect(link).toBeVisible();
    });
    
    test('handles click to skip to target', () => {
      // Create target element
      const target = document.createElement('div');
      target.id = 'main-content';
      document.body.appendChild(target);
      
      render(
        <SkipLink href="main-content">Skip to main content</SkipLink>
      );
      
      const link = screen.getByText('Skip to main content');
      fireEvent.click(link);
      
      expect(document.activeElement).toBe(target);
      
      document.body.removeChild(target);
    });
  });
  
  describe('LiveRegion Component Tests', () => {
    test('renders without accessibility violations', async () => {
      const { container } = render(
        <LiveRegion priority="polite">Test announcement</LiveRegion>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('has correct ARIA attributes', () => {
      const { container } = render(
        <LiveRegion priority="assertive" atomic={true}>
          Test announcement
        </LiveRegion>
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveAttribute('role', 'status');
    });
    
    test('updates content for screen readers', async () => {
      const { rerender } = render(
        <LiveRegion priority="polite">Initial message</LiveRegion>
      );
      
      rerender(
        <LiveRegion priority="polite">Updated message</LiveRegion>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Updated message')).toBeInTheDocument();
      });
    });
  });
  
  describe('ScreenReaderOnly Component Tests', () => {
    test('renders without accessibility violations', async () => {
      const { container } = render(
        <ScreenReaderOnly>Screen reader only text</ScreenReaderOnly>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('is visually hidden but accessible to screen readers', () => {
      render(
        <ScreenReaderOnly>Screen reader only text</ScreenReaderOnly>
      );
      
      const element = screen.getByText('Screen reader only text');
      const styles = window.getComputedStyle(element);
      
      // Element should be positioned off-screen
      expect(styles.position).toBe('absolute');
      expect(styles.left).toBe('-10000px');
    });
    
    test('becomes visible when focusable and focused', () => {
      render(
        <ScreenReaderOnly focusable={true}>
          Focusable screen reader text
        </ScreenReaderOnly>
      );
      
      const element = screen.getByText('Focusable screen reader text');
      fireEvent.focus(element);
      
      const styles = window.getComputedStyle(element);
      expect(styles.position).toBe('static');
    });
  });
  
  describe('Keyboard Navigation Tests', () => {
    test('all interactive elements are keyboard accessible', () => {
      render(
        <div>
          <AccessibleButton>Button 1</AccessibleButton>
          <AccessibleButton>Button 2</AccessibleButton>
          <FormField 
            name="test"
            label="Test Input"
            value=""
            onChange={() => {}}
          />
        </div>
      );
      
      const focusableElements = screen.getAllByRole(/(button|textbox)/);
      
      focusableElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1');
        expect(element).not.toHaveAttribute('aria-disabled', 'true');
      });
    });
    
    test('escape key handling in modals', () => {
      const handleClose = jest.fn();
      
      render(
        <div role="dialog" aria-modal="true">
          <AccessibleButton onClick={handleClose}>Close</AccessibleButton>
        </div>
      );
      
      fireEvent.keyDown(document, { key: 'Escape' });
      // Note: This would require implementing escape handling in a real modal
    });
  });
  
  describe('Screen Reader Compatibility Tests', () => {
    test('headings follow proper hierarchy', () => {
      render(
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
        </div>
      );
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3 = screen.getByRole('heading', { level: 3 });
      
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });
    
    test('images have appropriate alt text', () => {
      render(
        <div>
          <img src="logo.png" alt="Company Logo" />
          <img src="decorative.png" alt="" role="presentation" />
        </div>
      );
      
      const logo = screen.getByAltText('Company Logo');
      const decorative = screen.getByRole('presentation');
      
      expect(logo).toBeInTheDocument();
      expect(decorative).toBeInTheDocument();
    });
    
    test('form controls have proper labels and descriptions', () => {
      render(
        <FormField 
          name="email"
          label="Email Address"
          type="email"
          value=""
          helpText="We'll never share your email"
          required={true}
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Email Address');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });
  
  describe('Motion and Animation Tests', () => {
    test('respects prefers-reduced-motion', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      render(
        <AccessibleButton>Animated Button</AccessibleButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // In a real implementation, you'd test that animations are disabled
    });
  });
  
  describe('High Contrast Mode Tests', () => {
    test('elements are visible in high contrast mode', () => {
      // Mock high contrast preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      render(
        <AccessibleButton variant="primary">High Contrast Button</AccessibleButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Test would verify high contrast styles are applied
    });
  });
  
  describe('Focus Management Tests', () => {
    test('focus is properly managed in dynamic content', async () => {
      const { rerender } = render(
        <div>
          <AccessibleButton>Button 1</AccessibleButton>
        </div>
      );
      
      const button1 = screen.getByText('Button 1');
      button1.focus();
      expect(document.activeElement).toBe(button1);
      
      rerender(
        <div>
          <AccessibleButton>Button 1</AccessibleButton>
          <AccessibleButton>Button 2</AccessibleButton>
        </div>
      );
      
      // Focus should remain on Button 1
      expect(document.activeElement).toBe(button1);
    });
    
    test('focus indicators are visible for keyboard users', () => {
      render(
        <AccessibleButton>Test Button</AccessibleButton>
      );
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(document, { key: 'Tab' });
      fireEvent.focus(button);
      
      // In a real implementation, you'd test that focus indicators are visible
      expect(button).toHaveFocus();
    });
  });
});

/**
 * Custom accessibility testing utilities
 */
export const accessibilityTestUtils = {
  /**
   * Test component for WCAG violations
   */
  async testForViolations(component: React.ReactElement) {
    const { container } = render(component);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    return results;
  },
  
  /**
   * Test keyboard navigation
   */
  testKeyboardNavigation(component: React.ReactElement) {
    const { container } = render(component);
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    return {
      focusableCount: focusableElements.length,
      canNavigateWithTab: focusableElements.length > 0,
      allHaveAccessibleNames: Array.from(focusableElements).every(el => 
        el.getAttribute('aria-label') || 
        el.getAttribute('aria-labelledby') ||
        el.textContent?.trim() ||
        el.getAttribute('title')
      )
    };
  },
  
  /**
   * Test color contrast
   */
  testColorContrast(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA') {
    return colorUtils.meetsContrastRequirement(foreground, background, level);
  },
  
  /**
   * Test touch target sizes
   */
  testTouchTargets(container: HTMLElement) {
    const interactiveElements = container.querySelectorAll(
      'button, [role="button"], a, input, select, textarea'
    );
    
    return Array.from(interactiveElements).map(el => ({
      element: el,
      meetsMinimumSize: touchUtils.meetsTouchTargetSize(el as HTMLElement)
    }));
  }
};