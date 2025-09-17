/**
 * Menu Mobile Navigation Component
 * Provides mobile-optimized navigation with swipe gestures and touch-friendly controls
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';
import { useResponsive } from '../../hooks/useResponsive';
import { Category, Language } from '../../types';

// Styled components
const MobileNavContainer = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, 
    rgba(0, 0, 0, 0.95) 0%,
    rgba(26, 26, 46, 0.98) 100%
  );
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 65, 251, 0.3);
  z-index: 100;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const NavTabs = styled.div`
  display: flex;
  overflow-x: auto;
  padding: 10px 15px;
  gap: 8px;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const NavTab = styled(motion.button)<{ $active: boolean }>`
  min-width: 80px;
  padding: 12px 16px;
  border: none;
  border-radius: 20px;
  background: ${props => props.$active 
    ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
    : 'rgba(255, 255, 255, 0.1)'
  };
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  .icon {
    font-size: 1.2rem;
  }
  
  .label {
    font-size: 0.7rem;
    line-height: 1;
  }
  
  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
      : 'rgba(255, 255, 255, 0.15)'
    };
  }
`;

const SwipeIndicator = styled(motion.div)`
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
`;

const FloatingActionButton = styled(motion.button)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(145deg, #FF41FB, #FF1493);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255, 65, 251, 0.4);
  z-index: 101;
  
  &:hover {
    box-shadow: 0 6px 25px rgba(255, 65, 251, 0.6);
  }
`;

const CategoryDrawer = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, 
    rgba(0, 0, 0, 0.98) 0%,
    rgba(26, 26, 46, 0.99) 100%
  );
  backdrop-filter: blur(30px);
  border-top: 2px solid rgba(255, 65, 251, 0.5);
  border-radius: 20px 20px 0 0;
  z-index: 200;
  max-height: 60vh;
  overflow-y: auto;
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const DrawerTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.2rem;
  color: white;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 65, 251, 0.2);
    border-color: rgba(255, 65, 251, 0.4);
  }
`;

const DrawerContent = styled.div`
  padding: 20px;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
`;

const CategoryCard = styled(motion.button)<{ $active: boolean }>`
  background: ${props => props.$active 
    ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
    : 'rgba(255, 255, 255, 0.1)'
  };
  border: 1px solid ${props => props.$active 
    ? 'rgba(255, 65, 251, 0.5)'
    : 'rgba(255, 255, 255, 0.2)'
  };
  border-radius: 15px;
  padding: 15px 10px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  .icon {
    font-size: 1.5rem;
  }
  
  .name {
    text-align: center;
    line-height: 1.2;
  }
  
  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
      : 'rgba(255, 255, 255, 0.15)'
    };
    transform: translateY(-2px);
  }
`;

const QuickActions = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const QuickActionButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 10px 20px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(255, 65, 251, 0.2);
    border-color: rgba(255, 65, 251, 0.4);
  }
`;

// Component interfaces
export interface MenuMobileNavProps {
  /** Available categories */
  categories: Category[];
  /** Active category ID */
  activeCategory: string;
  /** Category change handler */
  onCategoryChange: (categoryId: string) => void;
  /** Current language */
  language: Language;
  /** Back navigation handler */
  onBack?: () => void;
  /** Search handler */
  onSearch?: () => void;
  /** QR code handler */
  onQRCode?: () => void;
  /** Show floating action button */
  showFAB?: boolean;
  /** Enable swipe navigation */
  enableSwipe?: boolean;
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Menu Mobile Navigation Component
 * Provides touch-optimized navigation for mobile devices
 */
export const MenuMobileNav: React.FC<MenuMobileNavProps> = React.memo(({
  categories,
  activeCategory,
  onCategoryChange,
  language,
  onBack,
  onSearch,
  onQRCode,
  showFAB = true,
  enableSwipe = true,
  className,
  testId = 'menu-mobile-nav'
}) => {
  const { isMobile } = useResponsive();
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  /**
   * Get category name in current language
   */
  const getCategoryName = (category: Category): string => {
    if (typeof category.name === 'string') {
      return category.name;
    }
    if (typeof category.name === 'object' && category.name) {
      return category.name[language] || category.name.de || category.name.en || Object.values(category.name)[0] || 'Unbekannt';
    }
    return 'Unbekannt';
  };

  /**
   * Get truncated category name for mobile
   */
  const getTruncatedName = (name: string, maxLength = 10) => {
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  };

  /**
   * Setup swipe navigation
   */
  const categoryIds = categories.map(cat => cat.id);
  const swipeNavigation = useSwipeNavigation({
    categories: categoryIds,
    activeCategory,
    onCategoryChange,
    enabled: enableSwipe && isMobile,
    minSwipeDistance: 80
  });

  /**
   * Handle scroll to hide/show navigation
   */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  /**
   * Get visible categories (limit for horizontal scroll)
   */
  const visibleCategories = categories.slice(0, 8); // Limit to 8 for performance
  const hasMoreCategories = categories.length > 8;

  /**
   * Animation variants
   */
  const navVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const drawerVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Main Navigation Bar */}
      <MobileNavContainer
        className={className}
        data-testid={testId}
        variants={navVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        onTouchStart={swipeNavigation.onTouchStart}
        onTouchMove={swipeNavigation.onTouchMove}
        onTouchEnd={swipeNavigation.onTouchEnd}
      >
        <SwipeIndicator />
        
        <NavTabs>
          {visibleCategories.map((category) => {
            const isActive = category.id === activeCategory;
            const categoryName = getCategoryName(category);
            
            return (
              <NavTab
                key={category.id}
                $active={isActive}
                onClick={() => onCategoryChange(category.id)}
                whileTap={{ scale: 0.95 }}
                data-tab-button="true"
              >
                <span className="label">
                  {getTruncatedName(categoryName, 8)}
                </span>
              </NavTab>
            );
          })}
          
          {/* More categories button */}
          {hasMoreCategories && (
            <NavTab
              $active={false}
              onClick={() => setShowCategoryDrawer(true)}
              whileTap={{ scale: 0.95 }}
            >
              <span className="icon">⋯</span>
              <span className="label">Mehr</span>
            </NavTab>
          )}
        </NavTabs>
        
        {/* Quick Actions */}
        <QuickActions>
          {onBack && (
            <QuickActionButton
              onClick={onBack}
              whileTap={{ scale: 0.95 }}
            >
              ← Zurück
            </QuickActionButton>
          )}
          
          {onSearch && (
            <QuickActionButton
              onClick={onSearch}
              whileTap={{ scale: 0.95 }}
            >
              🔍 Suchen
            </QuickActionButton>
          )}
          
          {onQRCode && (
            <QuickActionButton
              onClick={onQRCode}
              whileTap={{ scale: 0.95 }}
            >
              📱 QR
            </QuickActionButton>
          )}
        </QuickActions>
      </MobileNavContainer>

      {/* Floating Action Button */}
      {showFAB && (
        <FloatingActionButton
          onClick={() => setShowCategoryDrawer(true)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          animate={{
            scale: showCategoryDrawer ? 0 : 1,
            opacity: showCategoryDrawer ? 0 : 1
          }}
        >
          ☰
        </FloatingActionButton>
      )}

      {/* Category Drawer */}
      <AnimatePresence>
        {showCategoryDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCategoryDrawer(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 199
              }}
            />
            
            {/* Drawer */}
            <CategoryDrawer
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DrawerHeader>
                <DrawerTitle>Kategorien</DrawerTitle>
                <CloseButton
                  onClick={() => setShowCategoryDrawer(false)}
                >
                  ✕
                </CloseButton>
              </DrawerHeader>
              
              <DrawerContent>
                <CategoryGrid>
                  {categories.map((category) => {
                    const isActive = category.id === activeCategory;
                    const categoryName = getCategoryName(category);
                    
                    return (
                      <CategoryCard
                        key={category.id}
                        $active={isActive}
                        onClick={() => {
                          onCategoryChange(category.id);
                          setShowCategoryDrawer(false);
                        }}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="name">{categoryName}</span>
                      </CategoryCard>
                    );
                  })}
                </CategoryGrid>
              </DrawerContent>
            </CategoryDrawer>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

/**
 * Default export
 */
export default MenuMobileNav;