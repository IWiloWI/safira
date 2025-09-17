/**
 * @file CategorySelector.test.js
 * @description Comprehensive test suite for CategorySelector component
 * @test CategorySelector Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import CategorySelector from '../../src/components/CategorySelector';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock category data
const mockCategories = [
  {
    id: '1',
    name: 'Electronics',
    icon: '📱',
    subcategories: [
      { id: '1-1', name: 'Smartphones', count: 45 },
      { id: '1-2', name: 'Laptops', count: 23 },
      { id: '1-3', name: 'Tablets', count: 18 }
    ],
    count: 86
  },
  {
    id: '2',
    name: 'Clothing',
    icon: '👕',
    subcategories: [
      { id: '2-1', name: 'Men', count: 67 },
      { id: '2-2', name: 'Women', count: 92 },
      { id: '2-3', name: 'Kids', count: 34 }
    ],
    count: 193
  },
  {
    id: '3',
    name: 'Home & Garden',
    icon: '🏠',
    subcategories: [
      { id: '3-1', name: 'Furniture', count: 28 },
      { id: '3-2', name: 'Decor', count: 41 },
      { id: '3-3', name: 'Garden', count: 19 }
    ],
    count: 88
  },
  {
    id: '4',
    name: 'Sports',
    icon: '⚽',
    subcategories: [
      { id: '4-1', name: 'Fitness', count: 32 },
      { id: '4-2', name: 'Outdoor', count: 24 }
    ],
    count: 56
  }
];

// Mock category context
const mockCategoryContext = {
  categories: mockCategories,
  selectedCategory: null,
  selectedSubcategory: null,
  setSelectedCategory: jest.fn(),
  setSelectedSubcategory: jest.fn(),
  searchQuery: '',
  setSearchQuery: jest.fn(),
  isLoading: false,
  error: null,
  viewMode: 'grid',
  setViewMode: jest.fn()
};

// Mock component wrapper
const MockCategorySelectorWrapper = ({ children, context = mockCategoryContext }) => (
  <CategoryContext.Provider value={context}>
    {children}
  </CategoryContext.Provider>
);

describe('CategorySelector Component', () => {
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
     * @test Component renders all categories
     * @expected All main categories are displayed with icons and names
     */
    it('should render all categories', () => {
      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('Home & Garden')).toBeInTheDocument();
      expect(screen.getByText('Sports')).toBeInTheDocument();

      // Check icons
      expect(screen.getByText('📱')).toBeInTheDocument();
      expect(screen.getByText('👕')).toBeInTheDocument();
      expect(screen.getByText('🏠')).toBeInTheDocument();
      expect(screen.getByText('⚽')).toBeInTheDocument();
    });

    /**
     * @test Category counts display correctly
     * @expected Each category shows item count
     */
    it('should display category counts', () => {
      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      expect(screen.getByText('86 items')).toBeInTheDocument();
      expect(screen.getByText('193 items')).toBeInTheDocument();
      expect(screen.getByText('88 items')).toBeInTheDocument();
      expect(screen.getByText('56 items')).toBeInTheDocument();
    });

    /**
     * @test Grid and list view modes
     * @expected Component supports different view modes
     */
    it('should support grid and list view modes', () => {
      const { rerender } = render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      expect(screen.getByRole('grid')).toHaveClass('grid-view');

      rerender(
        <MockCategorySelectorWrapper context={{...mockCategoryContext, viewMode: 'list'}}>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      expect(screen.getByRole('list')).toHaveClass('list-view');
    });

    /**
     * @test Search input is present and functional
     * @expected Search input allows category filtering
     */
    it('should render search input', () => {
      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'search');
    });

    /**
     * @test Loading state display
     * @expected Shows loading indicator when categories are loading
     */
    it('should show loading state', () => {
      const loadingContext = { ...mockCategoryContext, isLoading: true, categories: [] };

      render(
        <MockCategorySelectorWrapper context={loadingContext}>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText(/loading categories/i)).toBeInTheDocument();
    });

    /**
     * @test Error state handling
     * @expected Shows error message when category loading fails
     */
    it('should show error state', () => {
      const errorContext = {
        ...mockCategoryContext,
        error: 'Failed to load categories',
        categories: []
      };

      render(
        <MockCategorySelectorWrapper context={errorContext}>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load categories');
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    /**
     * @test Category selection functionality
     * @expected Clicking category triggers selection handler
     */
    it('should handle category selection', async () => {
      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const electronicsCategory = screen.getByText('Electronics').closest('button');
      await user.click(electronicsCategory);

      expect(mockCategoryContext.setSelectedCategory).toHaveBeenCalledWith('1');
    });

    /**
     * @test Subcategory expansion and selection
     * @expected Categories expand to show subcategories
     */
    it('should expand and show subcategories', async () => {
      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const clothingCategory = screen.getByText('Clothing').closest('button');
      await user.click(clothingCategory);

      await waitFor(() => {
        expect(screen.getByText('Men')).toBeInTheDocument();
        expect(screen.getByText('Women')).toBeInTheDocument();
        expect(screen.getByText('Kids')).toBeInTheDocument();
      });

      // Test subcategory selection
      const womenSubcategory = screen.getByText('Women');
      await user.click(womenSubcategory);

      expect(mockCategoryContext.setSelectedSubcategory).toHaveBeenCalledWith('2-2');
    });

    /**
     * @test Search functionality
     * @expected Search filters categories by name
     */
    it('should filter categories by search', async () => {
      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.type(searchInput, 'clothing');

      expect(mockCategoryContext.setSearchQuery).toHaveBeenCalledWith('clothing');

      // Mock filtered results
      const filteredContext = {
        ...mockCategoryContext,
        searchQuery: 'clothing',
        categories: [mockCategories[1]] // Only clothing category
      };

      const { rerender } = render(
        <MockCategorySelectorWrapper context={filteredContext}>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
    });

    /**
     * @test View mode toggle
     * @expected Toggling between grid and list views
     */
    it('should toggle view modes', async () => {
      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const listViewButton = screen.getByRole('button', { name: /list view/i });
      await user.click(listViewButton);

      expect(mockCategoryContext.setViewMode).toHaveBeenCalledWith('list');
    });

    /**
     * @test Keyboard navigation support
     * @expected Arrow keys navigate categories, Enter selects
     */
    it('should support keyboard navigation', async () => {
      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const firstCategory = screen.getByText('Electronics').closest('button');
      firstCategory.focus();

      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Clothing').closest('button')).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Home & Garden').closest('button')).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(screen.getByText('Clothing').closest('button')).toHaveFocus();

      // Select with Enter
      await user.keyboard('{Enter}');
      expect(mockCategoryContext.setSelectedCategory).toHaveBeenCalledWith('2');
    });

    /**
     * @test Touch gestures for mobile
     * @expected Touch events properly handled on mobile devices
     */
    it('should handle touch gestures', async () => {
      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const homeGardenCategory = screen.getByText('Home & Garden').closest('button');
      
      fireEvent.touchStart(homeGardenCategory);
      fireEvent.touchEnd(homeGardenCategory);

      expect(mockCategoryContext.setSelectedCategory).toHaveBeenCalledWith('3');
    });

    /**
     * @test Category clearing functionality
     * @expected Clear button resets category selection
     */
    it('should clear category selection', async () => {
      const selectedContext = {
        ...mockCategoryContext,
        selectedCategory: '1',
        selectedSubcategory: '1-1'
      };

      render(
        <MockCategorySelectorWrapper context={selectedContext}>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const clearButton = screen.getByRole('button', { name: /clear selection/i });
      await user.click(clearButton);

      expect(mockCategoryContext.setSelectedCategory).toHaveBeenCalledWith(null);
      expect(mockCategoryContext.setSelectedSubcategory).toHaveBeenCalledWith(null);
    });
  });

  describe('Responsive Design', () => {
    /**
     * @test Mobile layout adaptations
     * @expected Component adapts layout for mobile screens
     */
    it('should adapt to mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const container = screen.getByRole('grid').closest('.category-selector');
      expect(container).toHaveClass('mobile-layout');
    });

    /**
     * @test Tablet layout optimizations
     * @expected Component shows enhanced layout for tablets
     */
    it('should optimize for tablet layout', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const container = screen.getByRole('grid').closest('.category-selector');
      expect(container).toHaveClass('tablet-layout');
    });

    /**
     * @test Desktop layout features
     * @expected Component shows full featured desktop layout
     */
    it('should show full desktop layout', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const container = screen.getByRole('grid').closest('.category-selector');
      expect(container).toHaveClass('desktop-layout');
    });
  });

  describe('Performance', () => {
    /**
     * @test Large category list performance
     * @expected Component handles many categories efficiently
     */
    it('should handle large category lists efficiently', async () => {
      // Generate large category list
      const largeCategories = Array.from({ length: 100 }, (_, i) => ({
        id: `cat-${i}`,
        name: `Category ${i}`,
        icon: '📦',
        count: Math.floor(Math.random() * 100),
        subcategories: []
      }));

      const largeContext = {
        ...mockCategoryContext,
        categories: largeCategories
      };

      const startTime = performance.now();

      render(
        <MockCategorySelectorWrapper context={largeContext}>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100); // Should render quickly even with many items
    });

    /**
     * @test Search performance with debouncing
     * @expected Search input is debounced for performance
     */
    it('should debounce search input', async () => {
      jest.useFakeTimers();

      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      
      await user.type(searchInput, 'test');

      // Should not call setSearchQuery immediately
      expect(mockCategoryContext.setSearchQuery).not.toHaveBeenCalled();

      // Fast forward timers
      jest.advanceTimersByTime(300);

      expect(mockCategoryContext.setSearchQuery).toHaveBeenCalledWith('test');

      jest.useRealTimers();
    });

    /**
     * @test Virtual scrolling for large lists
     * @expected Long category lists use virtual scrolling
     */
    it('should implement virtual scrolling for long lists', () => {
      const manyCategories = Array.from({ length: 500 }, (_, i) => ({
        id: `cat-${i}`,
        name: `Category ${i}`,
        icon: '📦',
        count: i,
        subcategories: []
      }));

      const manyContext = {
        ...mockCategoryContext,
        categories: manyCategories
      };

      render(
        <MockCategorySelectorWrapper context={manyContext}>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      // Should only render visible items
      const renderedItems = screen.getAllByRole('button');
      expect(renderedItems.length).toBeLessThan(50); // Virtual scrolling active
    });
  });

  describe('Accessibility', () => {
    /**
     * @test WCAG compliance
     * @expected Component passes accessibility audit
     */
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    /**
     * @test Screen reader support
     * @expected All elements have proper ARIA labels and descriptions
     */
    it('should support screen readers', () => {
      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const categoryGrid = screen.getByRole('grid');
      expect(categoryGrid).toHaveAttribute('aria-label', 'Category selection');

      const categories = screen.getAllByRole('gridcell');
      categories.forEach((category, index) => {
        expect(category).toHaveAttribute('aria-labelledby');
        expect(category).toHaveAttribute('aria-describedby');
      });
    });

    /**
     * @test Focus management during navigation
     * @expected Focus is properly managed during category navigation
     */
    it('should manage focus correctly', async () => {
      render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.click(searchInput);
      expect(searchInput).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Electronics').closest('button')).toHaveFocus();
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
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const container = screen.getByRole('grid').closest('.category-selector');
      expect(container).toHaveClass('high-contrast');
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
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      const container = screen.getByRole('grid').closest('.category-selector');
      expect(container).toHaveClass('reduced-motion');
    });
  });

  describe('Data Management', () => {
    /**
     * @test Category data validation
     * @expected Component validates category data structure
     */
    it('should validate category data', () => {
      const invalidCategories = [
        { id: '1', name: 'Valid Category', icon: '📱', count: 10 },
        { name: 'Invalid - No ID', icon: '👕', count: 5 }, // Missing ID
        { id: '3', icon: '🏠', count: 8 }, // Missing name
      ];

      const invalidContext = {
        ...mockCategoryContext,
        categories: invalidCategories
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(
        <MockCategorySelectorWrapper context={invalidContext}>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid category data:', expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    /**
     * @test Dynamic category updates
     * @expected Component updates when category data changes
     */
    it('should update when categories change', () => {
      const { rerender } = render(
        <MockCategorySelectorWrapper>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      expect(screen.getByText('Electronics')).toBeInTheDocument();

      const updatedCategories = [
        {
          id: '5',
          name: 'Books',
          icon: '📚',
          count: 150,
          subcategories: []
        }
      ];

      rerender(
        <MockCategorySelectorWrapper 
          context={{...mockCategoryContext, categories: updatedCategories}}
        >
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      expect(screen.getByText('Books')).toBeInTheDocument();
      expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
    });

    /**
     * @test Empty state handling
     * @expected Shows appropriate message when no categories available
     */
    it('should handle empty category list', () => {
      const emptyContext = {
        ...mockCategoryContext,
        categories: [],
        isLoading: false
      };

      render(
        <MockCategorySelectorWrapper context={emptyContext}>
          <CategorySelector />
        </MockCategorySelectorWrapper>
      );

      expect(screen.getByText(/no categories available/i)).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    /**
     * @test URL parameter synchronization
     * @expected Category selection updates URL parameters
     */
    it('should sync with URL parameters', async () => {
      const mockPushState = jest.spyOn(window.history, 'pushState').mockImplementation();

      render(
        <MockCategorySelectorWrapper>
          <CategorySelector syncWithURL={true} />
        </MockCategorySelectorWrapper>
      );

      const sportsCategory = screen.getByText('Sports').closest('button');
      await user.click(sportsCategory);

      expect(mockPushState).toHaveBeenCalledWith(
        null,
        '',
        expect.stringContaining('category=4')
      );

      mockPushState.mockRestore();
    });

    /**
     * @test Analytics tracking
     * @expected Category selections are tracked for analytics
     */
    it('should track category selections', async () => {
      const mockTrack = jest.fn();

      render(
        <MockCategorySelectorWrapper>
          <CategorySelector onTrackSelection={mockTrack} />
        </MockCategorySelectorWrapper>
      );

      const electronicsCategory = screen.getByText('Electronics').closest('button');
      await user.click(electronicsCategory);

      expect(mockTrack).toHaveBeenCalledWith('category_selected', {
        categoryId: '1',
        categoryName: 'Electronics',
        timestamp: expect.any(Number)
      });
    });

    /**
     * @test Filter integration
     * @expected Category selection integrates with global filter state
     */
    it('should integrate with global filters', async () => {
      const mockUpdateFilters = jest.fn();

      render(
        <MockCategorySelectorWrapper>
          <CategorySelector onFilterUpdate={mockUpdateFilters} />
        </MockCategorySelectorWrapper>
      );

      const clothingCategory = screen.getByText('Clothing').closest('button');
      await user.click(clothingCategory);

      expect(mockUpdateFilters).toHaveBeenCalledWith({
        category: '2',
        subcategory: null
      });
    });
  });
});