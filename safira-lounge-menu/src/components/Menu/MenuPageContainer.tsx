/**
 * Menu Page Container Component
 * Main orchestration component that coordinates all menu functionality
 */

import React, { useState, useCallback, useMemo } from 'react';
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
import { QRCodeModal } from './QRCodeModal';
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

const QRButton = styled(motion.button)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: linear-gradient(145deg, rgba(233, 30, 99, 0.9), rgba(233, 30, 99, 1));
  border: 2px solid #FF41FB;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(255, 65, 251, 0.5);
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(255, 65, 251, 0.7);
  }

  @media (max-width: 768px) {
    bottom: 90px; /* Above mobile nav */
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
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
  
  // QR modal state
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: ''
  });

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
    
    // Filter categories to find main categories
    categories
      ?.filter(cat => cat.isMainCategory === true)
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
   * Handle product click
   */
  const handleProductClick = useCallback((product: Product) => {
    console.log('Product clicked:', product);
    // Could open product detail modal, add to cart, etc.
  }, []);

  /**
   * Get current page background category
   */
  const backgroundCategory = useMemo(() => {
    if (selectedMainCategory === 'menus') {
      return 'home'; // Use home video for menus overview page
    }
    if (selectedMainCategory === 'drinks') {
      return selectedCategory;
    }
    // For shisha, snacks, and other main categories, use the main category name
    return selectedMainCategory || 'home'; // Default to home if no category
  }, [selectedMainCategory, selectedCategory]);

  /**
   * Get available brands for filtering
   */
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    filteredProducts.forEach(product => {
      if (product.brand) {
        brands.add(product.brand);
      }
    });
    return Array.from(brands).sort();
  }, [filteredProducts]);

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
          selectedCategory={selectedCategory}
          onMainCategoryChange={handleMainCategoryChange}
          onCategoryChange={handleCategoryChange}
          language={language}
          getCategoryIdsForMainCategory={getCategoryIdsForMainCategory}
          showMainCategories={false}
          showSubcategories
        />
        
        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
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
        onQRCode={() => setShowQRModal(true)}
        enableSwipe
        showFAB
      />
    );
  };

  return (
    <PageContainer className={className} data-testid={testId}>
      {/* Background Video */}
      <VideoBackground 
        category={backgroundCategory || undefined}
      />
      
      {/* QR Code Button */}
      <QRButton
        onClick={() => setShowQRModal(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open QR Code"
      >
        📶
      </QRButton>

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
        categories={categories.map(cat => ({
          id: cat.id,
          name: cat.name
        }))}
        currentCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onLanguageChange={setLanguage}
      />
      
      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        language={language}
        wifiCredentials={{
          ssid: 'Safira_Guest',
          password: 'Safira2024',
          security: 'WPA'
        }}
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