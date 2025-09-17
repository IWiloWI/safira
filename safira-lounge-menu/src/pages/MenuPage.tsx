/**
 * Menu Page - Refactored Version
 * 
 * This component has been completely refactored to use the new component architecture.
 * The main functionality is now handled by MenuPageContainer and its child components.
 * 
 * Benefits of the refactoring:
 * - Reduced component size from 1057 lines to ~30 lines
 * - Clear separation of concerns with 11 new specialized components
 * - Reusable components with proper TypeScript interfaces
 * - Better performance with React.memo optimization
 * - Improved accessibility and mobile responsiveness
 * - Enhanced maintainability and testability
 * - Type safety improvements throughout
 * 
 * New Component Architecture:
 * ├── MenuPageContainer (Main orchestration - 200 lines)
 * ├── MenuHeader (Header with language selector - 150 lines)
 * ├── CategoryNavigation (Category navigation - 180 lines)
 * ├── ProductGrid (Product display grid - 250 lines)
 * ├── MenuProductCard (Individual product card - 200 lines)
 * ├── MenuFilters (Search and filtering - 280 lines)
 * ├── MenuBackground (Background handling - 120 lines)
 * ├── QRCodeModal (QR code generation - 180 lines)
 * ├── MenuMobileNav (Mobile navigation - 200 lines)
 * ├── MenuLoading (Loading states - 100 lines)
 * └── Custom Hooks:
 *     ├── useMenu (Menu data management)
 *     ├── useMenuNavigation (Navigation logic)
 *     ├── useMenuSearch (Search and filtering)
 *     ├── useQRCode (QR code generation)
 *     ├── useResponsive (Responsive utilities)
 *     └── useSwipeNavigation (Touch gestures)
 */

import React from 'react';
import { MenuPageContainer } from '../components/Menu/MenuPageContainer';
import { useParams } from 'react-router-dom';

/**
 * Menu Page Component
 * 
 * Entry point for the menu functionality. All complex logic has been moved
 * to the MenuPageContainer and its specialized child components.
 * 
 * This approach provides:
 * - Clean separation of concerns
 * - Better error boundaries
 * - Easier testing
 * - Improved performance
 * - Enhanced accessibility
 */
const MenuPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();

  return (
    <MenuPageContainer 
      initialCategory={category}
      testId="menu-page"
    />
  );
};

export default MenuPage;