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
import { Product, Category, MainCategory, MultilingualText } from '../../types';
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
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: ''
  });

  // Subcategory filter state (separate from navigation)
  // Empty string means "show all", specific ID means filter by that subcategory
  const [activeSubcategoryFilter, setActiveSubcategoryFilter] = useState<string>('');

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
      return;
    }

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
    products: [], // Will be populated by API
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
    let allProducts: Product[] = [...(mainCategory.items || [])];

    if (mainCategory.subcategories) {
      mainCategory.subcategories.forEach(subcat => {
        if (subcat.items) {
          // Add subcategory ID to products for filtering
          const subcatProducts = subcat.items.map(product => ({
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
   * Filter products by active subcategory filter
   */
  const subcategoryFilteredProducts = useMemo(() => {
    if (!selectedMainCategory || activeSubcategoryFilter === '') {
      return allMainCategoryProducts;
    }

    // Extract the actual subcategory ID (remove subcat_ prefix if present)
    const subcategoryId = activeSubcategoryFilter.replace('subcat_', '');
    console.log('[MenuPageContainer] Filtering by subcategory ID:', subcategoryId);

    return allMainCategoryProducts.filter(product => {
      const hasSubcategoryId = (product as any).subcategoryId === subcategoryId;
      console.log(`Product ${product.name} has subcategoryId: ${(product as any).subcategoryId}, matches: ${hasSubcategoryId}`);
      return hasSubcategoryId;
    });
  }, [allMainCategoryProducts, selectedMainCategory, activeSubcategoryFilter]);

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
   * Render main category selection
   */
  const renderMainCategories = () => {
    if (selectedMainCategory || isLoading) return null;
    
    return (
      <>
        <MenuHeader
          showLogo
          language={language}
          onLanguageChange={setLanguage}
          navigationHint="Wählen Sie eine Kategorie aus"
        />
        
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
    const menuProducts = menusCategory ? menusCategory.items || [] : [];
    
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
   * Render mobile navigation
   */
  const renderMobileNavigation = () => {
    if (!isMobile || !selectedMainCategory || selectedMainCategory === 'menus') {
      return null;
    }
    
    return (
      <MenuMobileNav
        categories={currentCategories}
        activeCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        language={language}
        onBack={handleBack}
        onSearch={() => {/* Open search modal */}}
        onQRCode={undefined}
        enableSwipe
        showFAB
      />
    );
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