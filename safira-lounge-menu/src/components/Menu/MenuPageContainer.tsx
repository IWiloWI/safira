/**
 * Menu Page Container Component
 * Main orchestration component that coordinates all menu functionality
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMenu } from '../../hooks/useMenu';
import { useMenuNavigation } from '../../hooks/useMenuNavigation';
import { useMenuSearch } from '../../hooks/useMenuSearch';
import { useResponsive } from '../../hooks/useResponsive';
import { useAdminChangeDetection } from '../../hooks/useAdminChangeDetection';
import { MenuHeader } from './MenuHeader';
import VideoBackground from '../Common/VideoBackground';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductGrid } from './ProductGrid';
import { MenuFilters, FilterOptions } from './MenuFilters';
import { MenuLoading } from './MenuLoading';
import { MenuMobileNav } from './MenuMobileNav';
import ProductList from './ProductList';
import SubcategoryTabs from './SubcategoryTabs';
import { BottomNavigation } from '../Common/BottomNavigation';
import MenuSearchResults from './MenuSearchResults';
import UpcomingEvents from './UpcomingEvents';
import { Product, Category, MainCategory, MultilingualText } from '../../types';
import { Event } from '../../types/event.types';
import productsData from '../../data/products.json';

// Styled components
const PageContainer = styled.div`
  min-height: 100vh;
  height: 100vh;
  padding: 0;
  width: 100%;
  background: #000;
  position: relative;
  z-index: 10;
  overflow-y: auto;
  
  /* Mobile viewport fixes */
  @supports (-webkit-touch-callout: none) {
    /* iOS Safari */
    height: -webkit-fill-available;
    min-height: -webkit-fill-available;
  }
`;

const ContentContainer = styled(motion.div)`
  width: 100%;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  padding-bottom: 100px;
`;


const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  max-width: 300px;
  display: flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &::before {
    content: '🔄';
    font-size: 1.2rem;
  }
`;

// Component interfaces
export interface MenuPageContainerProps {
  /** Initial category from URL */
  initialCategory?: string;
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Menu Page Container Component
 * Coordinates all menu functionality with clean separation of concerns
 */
export const MenuPageContainer: React.FC<MenuPageContainerProps> = React.memo(({
  initialCategory,
  className,
  testId = 'menu-page-container'
}) => {
  const languageContext = useLanguage();
  const { language, setLanguage } = languageContext;
  const { isMobile } = useResponsive();

  // Auto-refresh when admin makes changes - INSTANT MODE
  useAdminChangeDetection({
    interval: 5000, // Check every 5 seconds for instant refresh
    enabled: true, // Always enabled on customer pages
    onChangeDetected: () => {
      console.log('📡 Admin changes detected, reloading menu...');
    }
  });

  // Filter state for category pages
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: ''
  });

  // Separate global search state for main menu page
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Subcategory filter state (separate from navigation)
  // Empty string means "show all", specific ID means filter by that subcategory
  const [activeSubcategoryFilter, setActiveSubcategoryFilter] = useState<string>('');

  // Events state
  const [events, setEvents] = useState<Event[]>([]);

  /**
   * Initialize menu data
   */
  const {
    categories,
    isLoading,
    error,
    refreshNotification,
    apiProducts,
    clearRefreshNotification
  } = useMenu({
    language,
    initialCategory,
    autoRefresh: true
  });

  /**
   * Main categories configuration - dynamically loaded from database
   */
  const mainCategories: Record<string, MainCategory> = useMemo(() => {
    const mainCats: Record<string, MainCategory> = {};

    // Filter and sort categories to find main categories in correct order
    categories
      ?.filter(cat => cat.isMainCategory === true)
      ?.sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
      ?.forEach((cat, index) => {
        // Convert FlexibleText to MultilingualText
        const categoryName: MultilingualText = typeof cat.name === 'string' 
          ? { de: cat.name, da: cat.name, en: cat.name, tr: cat.name, it: cat.name }
          : {
              de: cat.name.de || '',
              da: cat.name.da || cat.name.de || '',
              en: cat.name.en || cat.name.de || '',
              tr: cat.name.tr || cat.name.de || '',
              it: cat.name.it || cat.name.de || ''
            };
        
        mainCats[cat.id] = {
          id: cat.id,
          name: categoryName,
          image: cat.image || '/images/placeholder-category.jpg',
          categoryIds: [],
          order: index + 1,
          sortOrder: cat.sortOrder || 999,
          enabled: true
        };
      });
    
    // Add default placeholder if no main categories exist
    if (Object.keys(mainCats).length === 0) {
      mainCats['placeholder'] = {
        id: 'placeholder',
        name: { de: 'Keine Kategorien', da: 'Ingen kategorier', en: 'No categories', tr: 'Kategori yok', it: 'Nessuna categoria' },
        image: '/images/placeholder-category.jpg',
        categoryIds: [],
        order: 1,
        sortOrder: 1,
        enabled: true
      };
    }
    
    return mainCats;
  }, [categories]);

  /**
   * Helper function to get category IDs for a main category
   */
  const getCategoryIdsForMainCategory = useCallback((mainCategoryKey: string): string[] => {
    const dataSource = apiProducts || productsData;
    const allCategories = (dataSource as any).categories || [];
    
    // Filter categories where parentPage matches the main category ID
    const filteredCategories = allCategories.filter((cat: any) => {
      // If category has parentPage that matches mainCategoryKey, it's a subcategory
      return cat.parentPage === mainCategoryKey;
    });
    
    return filteredCategories.map((cat: any) => cat.id);
  }, [apiProducts]);

  /**
   * Update main categories with their category IDs
   */
  const enhancedMainCategories = useMemo(() => {
    const enhanced = { ...mainCategories };
    Object.keys(enhanced).forEach(key => {
      enhanced[key].categoryIds = getCategoryIdsForMainCategory(key);
    });
    return enhanced;
  }, [mainCategories, getCategoryIdsForMainCategory]);

  /**
   * Initialize navigation
   */
  const {
    selectedMainCategory,
    selectedCategory,
    category,
    handleMainCategoryChange,
    handleCategoryChange,
    handleBack,
    resetToMainMenu,
    getCurrentCategory,
    getCurrentCategories
  } = useMenuNavigation({
    mainCategories: enhancedMainCategories,
    categories,
    getCategoryIdsForMainCategory
  });

  // Auto-select first subcategory when main category changes
  useEffect(() => {
    if (!selectedMainCategory) {
      setActiveSubcategoryFilter('');
      setGlobalSearchQuery(''); // Clear global search when returning to main menu
      return;
    }

    // Clear global search when entering a category
    setGlobalSearchQuery('');

    // Find the main category and get its first subcategory
    const mainCategory = categories.find(cat => cat.id === selectedMainCategory && cat.isMainCategory === true);
    if (mainCategory && mainCategory.subcategories && mainCategory.subcategories.length > 0) {
      const firstSubcategory = mainCategory.subcategories[0];
      const subcategoryId = `subcat_${firstSubcategory.id}`;
      console.log('[MenuPageContainer] Auto-selecting first subcategory:', subcategoryId);
      setActiveSubcategoryFilter(subcategoryId);
    } else {
      // No subcategories, use empty filter
      setActiveSubcategoryFilter('');
    }
  }, [selectedMainCategory, categories]);

  /**
   * Get all products for search (calculated before useMenuSearch)
   */
  const searchableProducts = useMemo(() => {
    // If no category is selected, search across ALL categories
    if (!selectedMainCategory) {
      let allProducts: Product[] = [];

      categories.forEach(cat => {
        // Add products from main category
        if (cat.items) {
          allProducts = allProducts.concat(cat.items);
        }

        // Add products from subcategories
        if (cat.subcategories) {
          cat.subcategories.forEach(subcat => {
            if (subcat.items) {
              allProducts = allProducts.concat(subcat.items);
            }
          });
        }
      });

      return allProducts;
    }

    // Find the main category using selectedMainCategory
    const mainCategory = categories.find(cat => cat.id === selectedMainCategory && cat.isMainCategory === true);
    if (!mainCategory) return [];

    // Collect all products from main category and its subcategories
    let allProducts: Product[] = [...(mainCategory.items || [])];

    if (mainCategory.subcategories) {
      mainCategory.subcategories.forEach(subcat => {
        if (subcat.items) {
          allProducts = allProducts.concat(subcat.items);
        }
      });
    }

    return allProducts;
  }, [selectedMainCategory, categories]);

  /**
   * Initialize search and filtering
   */
  const {
    searchQuery,
    setSearchQuery,
    filteredProducts,
    clearSearch,
    hasActiveSearch,
    resultsCount
  } = useMenuSearch({
    products: searchableProducts, // Use actual products from current category
    language,
    selectedMainCategory,
    selectedCategory,
    mainCategories: enhancedMainCategories,
    categories,
    initialSearchQuery: filters.searchQuery
  });

  /**
   * Handle filter changes
   */
  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setSearchQuery(newFilters.searchQuery);
  }, [setSearchQuery]);

  /**
   * Handle subcategory filter change (filter only, no URL navigation)
   */
  const handleSubcategoryFilterChange = useCallback((subcategoryId: string) => {
    console.log('[MenuPageContainer] 🎬 Tab clicked - Subcategory filter changing from:', activeSubcategoryFilter, 'to:', subcategoryId);
    setActiveSubcategoryFilter(subcategoryId);
    // Don't change navigation state - this is just filtering
    // Video background will be handled by updated backgroundCategory logic
    console.log('[MenuPageContainer] 🎬 Tab change will trigger background video update');
  }, [activeSubcategoryFilter]);

  /**
   * Handle product click
   */
  const handleProductClick = useCallback((product: Product) => {
    console.log('Product clicked:', product);
    // Could open product detail modal, add to cart, etc.
  }, []);

  /**
   * Handle event click
   */
  const handleEventClick = useCallback((event: Event) => {
    console.log('Event clicked:', event);
    // Open event link if available
    if (event.link) {
      window.open(event.link, '_blank', 'noopener,noreferrer');
    }
  }, []);

  /**
   * Get current page background category using database IDs
   * Priority: Subcategory ID > Main Category ID > fallback
   */
  const backgroundCategory = useMemo(() => {
    console.log('[MenuPageContainer] backgroundCategory calculation:', {
      selectedMainCategory,
      activeSubcategoryFilter,
      categories: categories.length
    });

    if (selectedMainCategory === 'menus') {
      console.log('[MenuPageContainer] Using home video for menus');
      return 'home'; // Use home video for menus overview page
    }

    // If no main category is selected, use home
    if (!selectedMainCategory) {
      console.log('[MenuPageContainer] No main category, using home');
      return 'home';
    }

    // PRIORITY 1: Subcategory ID (if active subcategory filter)
    if (activeSubcategoryFilter && activeSubcategoryFilter !== '') {
      // Use activeSubcategoryFilter directly (it already has subcat_ prefix)
      console.log('[MenuPageContainer] 🎬 Using SUBCATEGORY ID for video (direct):', activeSubcategoryFilter);
      return activeSubcategoryFilter; // Use activeSubcategoryFilter directly (subcat_8, subcat_9, etc.)
    }

    // PRIORITY 2: Main Category ID (no subcategory active)
    const mainCategory = categories.find(cat => cat.id === selectedMainCategory && cat.isMainCategory === true);

    if (mainCategory && mainCategory.id) {
      console.log('[MenuPageContainer] 🎬 Using MAIN CATEGORY ID for video:', mainCategory.id);
      return mainCategory.id.toString(); // Use actual database main category ID
    }

    // PRIORITY 3: Fallback to selectedMainCategory
    console.log('[MenuPageContainer] 🎬 Fallback to selectedMainCategory:', selectedMainCategory);
    return selectedMainCategory;
  }, [selectedMainCategory, activeSubcategoryFilter, categories]);

  /**
   * Get all products from current main category including subcategories
   */
  const allMainCategoryProducts = useMemo(() => {
    if (!selectedMainCategory) return [];

    // Find the main category using selectedMainCategory (now contains actual API ID)
    const mainCategory = categories.find(cat => cat.id === selectedMainCategory && cat.isMainCategory === true);
    if (!mainCategory) {
      console.warn('[MenuPageContainer] Could not find main category for ID:', selectedMainCategory);
      return [];
    }

    // Collect all products from main category and its subcategories
    // Filter out unavailable products (available === false)
    let allProducts: Product[] = (mainCategory.items || [])
      .filter(product => product.available !== false);

    if (mainCategory.subcategories) {
      mainCategory.subcategories.forEach(subcat => {
        if (subcat.items) {
          // Add subcategory ID to products for filtering and filter out unavailable products
          const subcatProducts = subcat.items
            .filter(product => product.available !== false)
            .map(product => ({
              ...product,
              subcategoryId: subcat.id,
              subcategoryName: subcat.name
            }));
          allProducts = allProducts.concat(subcatProducts);
        }
      });
    }

    return allProducts;
  }, [selectedMainCategory, categories]);

  /**
   * Filter products by active subcategory filter AND search query
   */
  const subcategoryFilteredProducts = useMemo(() => {
    let products = allMainCategoryProducts;

    // First apply subcategory filter
    if (selectedMainCategory && activeSubcategoryFilter !== '') {
      const subcategoryId = activeSubcategoryFilter.replace('subcat_', '');
      console.log('[MenuPageContainer] Filtering by subcategory ID:', subcategoryId);

      products = products.filter(product => {
        const hasSubcategoryId = (product as any).subcategoryId === subcategoryId;
        return hasSubcategoryId;
      });
    }

    // Then apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      products = products.filter(product => {
        // Search in product name
        const name = typeof product.name === 'string'
          ? product.name
          : product.name[language] || product.name['de'];

        // Search in product description
        const description = product.description
          ? (typeof product.description === 'string'
            ? product.description
            : product.description[language] || product.description['de'] || '')
          : '';

        // Search in brand
        const brand = product.brand || '';

        // Search in ingredients
        const productAny = product as any;
        const ingredients = productAny.ingredients
          ? (typeof productAny.ingredients === 'string'
            ? productAny.ingredients
            : productAny.ingredients[language] || productAny.ingredients['de'] || '')
          : '';

        // Combine all searchable text
        const searchableText = `${name} ${description} ${brand} ${ingredients}`.toLowerCase();

        return searchableText.includes(searchLower);
      });
    }

    return products;
  }, [allMainCategoryProducts, selectedMainCategory, activeSubcategoryFilter, searchQuery, language]);

  /**
   * Get available brands for filtering
   */
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    subcategoryFilteredProducts.forEach(product => {
      if (product.brand) {
        brands.add(product.brand);
      }
    });
    return Array.from(brands).sort();
  }, [subcategoryFilteredProducts]);

  /**
   * Get current categories for filtering
   */
  const currentCategories = getCurrentCategories();
  const availableCategories = useMemo(() => {
    return currentCategories.map(cat => ({
      id: cat.id,
      name: typeof cat.name === 'string' ? cat.name : cat.name[language] || cat.name.de
    }));
  }, [currentCategories, language]);

  /**
   * Get global search results (all products across all categories)
   */
  const globalSearchResults = useMemo(() => {
    if (!globalSearchQuery || globalSearchQuery.trim().length === 0) {
      return [];
    }

    let allProducts: Product[] = [];

    // Collect all products from all categories and subcategories
    categories.forEach(cat => {
      if (cat.items) {
        const productsWithCategory = cat.items
          .filter(p => p.available !== false)
          .map(p => ({ ...p, categoryId: cat.id, categoryName: cat.name }));
        allProducts = allProducts.concat(productsWithCategory);
      }
      if (cat.subcategories) {
        cat.subcategories.forEach(subcat => {
          if (subcat.items) {
            const productsWithCategory = subcat.items
              .filter(p => p.available !== false)
              .map(p => ({ ...p, categoryId: subcat.id, categoryName: subcat.name }));
            allProducts = allProducts.concat(productsWithCategory);
          }
        });
      }
    });

    // Filter products by search query
    const searchLower = globalSearchQuery.toLowerCase();
    return allProducts.filter(product => {
      const name = typeof product.name === 'string'
        ? product.name
        : product.name[language] || product.name['de'];

      const description = product.description
        ? (typeof product.description === 'string'
          ? product.description
          : product.description[language] || product.description['de'] || '')
        : '';

      const brand = product.brand || '';
      const productAny = product as any;
      const ingredients = productAny.ingredients
        ? (typeof productAny.ingredients === 'string'
          ? productAny.ingredients
          : productAny.ingredients[language] || productAny.ingredients['de'] || '')
        : '';

      const searchableText = `${name} ${description} ${brand} ${ingredients}`.toLowerCase();
      return searchableText.includes(searchLower);
    });
  }, [globalSearchQuery, categories, language]);

  /**
   * Handle global search change
   */
  const handleGlobalSearchChange = useCallback((newFilters: FilterOptions) => {
    setGlobalSearchQuery(newFilters.searchQuery);
  }, []);

  /**
   * Get category name for a product
   */
  const getCategoryName = useCallback((product: Product): string => {
    const productAny = product as any;
    if (productAny.categoryName) {
      const catName = productAny.categoryName;
      if (typeof catName === 'string') {
        return catName;
      }
      return catName[language] || catName.de || '';
    }
    return '';
  }, [language]);

  /**
   * Clear global search
   */
  const clearGlobalSearch = useCallback(() => {
    setGlobalSearchQuery('');
  }, []);

  /**
   * Load events from API
   */
  const loadEvents = useCallback(async () => {
    try {
      // Dynamic import to avoid circular dependencies
      const { getActiveEvents } = await import('../../services/api');
      const data = await getActiveEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /**
   * Render main category selection
   */
  const renderMainCategories = () => {
    if (selectedMainCategory || isLoading) return null;

    // Check if there's an active global search
    const hasGlobalSearch = globalSearchQuery && globalSearchQuery.trim().length > 0;

    return (
      <>
        <MenuHeader
          showLogo
          language={language}
          onLanguageChange={setLanguage}
        />

        {/* Global Search Bar on Main Menu - DISABLED */}
        <MenuFilters
          filters={{ searchQuery: globalSearchQuery }}
          onFiltersChange={handleGlobalSearchChange}
          availableBrands={[]}
          availableCategories={[]}
          language={language}
          resultsCount={hasGlobalSearch ? globalSearchResults.length : undefined}
          showAdvancedFilters={false}
          showQuickFilters={false}
          showSearchBar={false}
        />

        {/* Search Results - pushes categories down */}
        <AnimatePresence>
          {hasGlobalSearch && (
            <MenuSearchResults
              products={globalSearchResults}
              searchQuery={globalSearchQuery}
              onClear={clearGlobalSearch}
              getCategoryName={getCategoryName}
              onProductClick={handleProductClick}
            />
          )}
        </AnimatePresence>

        {/* Category Navigation - gets pushed down by search results */}
        <CategoryNavigation
          mainCategories={enhancedMainCategories}
          categories={categories}
          selectedMainCategory={selectedMainCategory}
          selectedCategory={selectedCategory}
          onMainCategoryChange={handleMainCategoryChange}
          onCategoryChange={handleCategoryChange}
          language={language}
          getCategoryIdsForMainCategory={getCategoryIdsForMainCategory}
          showMainCategories
          showSubcategories={false}
        />

        {/* Upcoming Events Section */}
        <UpcomingEvents
          events={events}
          language={language}
          onEventClick={handleEventClick}
        />
      </>
    );
  };

  /**
   * Render menus overview - Handle both products and empty state
   */
  const renderMenusOverview = () => {
    if (selectedMainCategory !== 'menus') return null;

    // Get menus category from API data
    const menusCategory = categories.find(cat => cat.id === 'safira-menus');
    const menuProductsRaw = menusCategory ? menusCategory.items || [] : [];

    // Sort menu products by price (cheapest first)
    const menuProducts = [...menuProductsRaw].sort((a, b) => {
      const priceA = a.price || 0;
      const priceB = b.price || 0;
      return priceA - priceB;
    });

    return (
      <>
        <MenuHeader
          showBackButton
          onBack={handleBack}
          language={language}
          onLanguageChange={setLanguage}
          category={menusCategory ? {
            name: typeof menusCategory.name === 'string' 
              ? menusCategory.name 
              : menusCategory.name[language] || menusCategory.name.de || 'Safira Menüs'
          } : { name: 'Safira Menüs' }}
        />
        
        {/* Show product grid if products exist, otherwise show empty state */}
        {menuProducts.length > 0 ? (
          <ProductGrid
            products={menuProducts}
            language={language}
            isLoading={isLoading}
            error={error}
            onProductClick={handleProductClick}
            showControls
          />
        ) : (
          <div style={{ 
            padding: '60px 20px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: 'Aldrich, sans-serif'
          }}>
            <div style={{ 
              fontSize: '3rem',
              marginBottom: '20px',
              filter: 'drop-shadow(0 0 10px rgba(255, 65, 251, 0.5))'
            }}>
              🍽️
            </div>
            <h2 style={{ 
              color: '#FF41FB',
              marginBottom: '10px',
              fontSize: '1.5rem',
              textShadow: '0 0 10px rgba(255, 65, 251, 0.5)'
            }}>
              Menüs werden bald verfügbar sein
            </h2>
            <p style={{ 
              fontSize: '1rem',
              lineHeight: 1.6,
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              Unsere exklusiven Safira Menüs befinden sich derzeit in der Vorbereitung. 
              Schauen Sie bald wieder vorbei!
            </p>
          </div>
        )}
      </>
    );
  };

  /**
   * Render category content with products
   */
  const renderCategoryContent = () => {
    if (!selectedMainCategory || selectedMainCategory === 'menus' || isLoading) {
      return null;
    }

    const currentCategory = getCurrentCategory();
    
    return (
      <>
        <MenuHeader
          showBackButton
          onBack={handleBack}
          language={language}
          onLanguageChange={setLanguage}
          category={currentCategory ? {
            name: currentCategory.name
          } : undefined}
        />
        
        {/* Filters */}
        <MenuFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableBrands={availableBrands}
          availableCategories={availableCategories}
          language={language}
          resultsCount={resultsCount}
          showAdvancedFilters={false}
          showQuickFilters={false}
        />
        
        {/* Category Navigation for subcategories */}
        <CategoryNavigation
          mainCategories={enhancedMainCategories}
          categories={categories}
          selectedMainCategory={selectedMainCategory}
          selectedCategory={activeSubcategoryFilter}
          onMainCategoryChange={handleMainCategoryChange}
          onCategoryChange={handleSubcategoryFilterChange}
          language={language}
          getCategoryIdsForMainCategory={getCategoryIdsForMainCategory}
          showMainCategories={false}
          showSubcategories
        />

        {/* Product Grid */}
        <ProductGrid
          products={subcategoryFilteredProducts}
          language={language}
          isLoading={isLoading}
          error={error}
          onProductClick={handleProductClick}
          showControls
        />
      </>
    );
  };

  /**
   * Render mobile navigation - DISABLED (not needed)
   */
  const renderMobileNavigation = () => {
    // Mobile navigation disabled - category navigation is handled by CategoryNavigation component
    return null;
  };

  // Add effect to track backgroundCategory changes
  useEffect(() => {
    console.log('[MenuPageContainer] 🎬 Background category changed to:', backgroundCategory);
  }, [backgroundCategory]);

  return (
    <PageContainer className={className} data-testid={testId}>
      {/* Background Video */}
      <VideoBackground
        category={backgroundCategory || undefined}
      />
      

      {/* Main Content */}
      <ContentContainer>
        {/* Loading State */}
        {isLoading && !selectedMainCategory && (
          <MenuLoading
            type="skeleton"
            showProductSkeleton={false}
            text="Menü wird geladen..."
          />
        )}
        
        {/* Main Categories */}
        {renderMainCategories()}
        
        {/* Menus Overview */}
        {renderMenusOverview()}
        
        {/* Category Content */}
        {renderCategoryContent()}
      </ContentContainer>
      
      {/* Mobile Navigation */}
      {renderMobileNavigation()}
      
      {/* Bottom Navigation Bar */}
      <BottomNavigation
        categories={categories
          .filter(cat => cat.isMainCategory === true)
          .map(cat => ({
            id: cat.id,
            name: cat.name
          }))}
        currentCategory={selectedMainCategory || undefined}
        onCategoryChange={handleMainCategoryChange}
        onLanguageChange={setLanguage}
      />
      
      
      {/* Auto-refresh Notification */}
      <AnimatePresence>
        {refreshNotification && (
          <NotificationContainer
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={clearRefreshNotification}
          >
            {refreshNotification}
          </NotificationContainer>
        )}
      </AnimatePresence>
    </PageContainer>
  );
});

/**
 * Default export
 */
export default MenuPageContainer;