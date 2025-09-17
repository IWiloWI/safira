/**
 * React component prop type definitions
 * Provides comprehensive typing for all React components in the application
 */

import type { ReactNode, CSSProperties } from 'react';
import { Language, FlexibleText, ProductBadges, LoadingState } from './common.types';
import { Product, Category, TobaccoItem } from './product.types';
import { User, UserRole } from './user.types';

/**
 * Base component props that all components should extend
 */
export interface BaseComponentProps {
  /** Component CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Component test ID for testing */
  testId?: string;
  /** Accessibility label */
  ariaLabel?: string;
  /** Accessibility description */
  ariaDescribedBy?: string;
  /** Custom data attributes */
  dataAttributes?: Record<string, string>;
}

/**
 * Props for components that handle loading states
 */
export interface LoadingProps {
  /** Loading state */
  isLoading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** Custom loading component */
  loadingComponent?: ReactNode;
}

/**
 * Props for components that can show errors
 */
export interface ErrorProps {
  /** Error state */
  hasError?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Custom error component */
  errorComponent?: ReactNode;
  /** Error retry handler */
  onRetry?: () => void;
}

/**
 * Props for multilingual components
 */
export interface MultilingualProps {
  /** Current language */
  language: Language;
  /** Language change handler */
  setLanguage?: (language: Language) => void;
  /** Available languages */
  availableLanguages?: Language[];
}

/**
 * Product Card component props
 */
export interface ProductCardProps extends BaseComponentProps, MultilingualProps {
  /** Product data */
  product: Product;
  /** Click handler */
  onClick?: (product: Product) => void;
  /** Show product badges */
  showBadges?: boolean;
  /** Show availability status */
  showAvailability?: boolean;
  /** Show price */
  showPrice?: boolean;
  /** Show description */
  showDescription?: boolean;
  /** Card size variant */
  size?: 'small' | 'medium' | 'large';
  /** Card layout */
  layout?: 'vertical' | 'horizontal';
  /** Whether card is interactive */
  interactive?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Product List component props
 */
export interface ProductListProps extends BaseComponentProps, MultilingualProps, LoadingProps, ErrorProps {
  /** List of products */
  products: Product[];
  /** Category name for header */
  categoryName?: string;
  /** Show search and filter controls */
  showControls?: boolean;
  /** Back button handler */
  onBack?: () => void;
  /** Search query */
  searchQuery?: string;
  /** Search query change handler */
  setSearchQuery?: (query: string) => void;
  /** Subcategory tabs component */
  subcategoryTabs?: ReactNode;
  /** Grid layout columns */
  columns?: number;
  /** Item click handler */
  onItemClick?: (product: Product) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** List layout */
  layout?: 'grid' | 'list';
}

/**
 * Category component props
 */
export interface CategoryProps extends BaseComponentProps, MultilingualProps {
  /** Category data */
  category: Category;
  /** Click handler */
  onClick?: (category: Category) => void;
  /** Show product count */
  showProductCount?: boolean;
  /** Show description */
  showDescription?: boolean;
  /** Card layout */
  layout?: 'card' | 'tile' | 'list';
  /** Whether category is active/selected */
  isActive?: boolean;
}

/**
 * Menu Categories component props
 */
export interface MenuCategoriesProps extends BaseComponentProps, MultilingualProps {
  /** List of categories */
  categories: Category[];
  /** Active category ID */
  activeCategoryId?: string;
  /** Category click handler */
  onCategoryClick?: (categoryId: string) => void;
  /** Layout variant */
  layout?: 'horizontal' | 'vertical' | 'grid';
  /** Show icons */
  showIcons?: boolean;
  /** Scrollable tabs */
  scrollable?: boolean;
}

/**
 * Search Bar component props
 */
export interface SearchBarProps extends BaseComponentProps, MultilingualProps {
  /** Search value */
  value: string;
  /** Search change handler */
  onChange: (value: string) => void;
  /** Search submit handler */
  onSubmit?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Show search button */
  showButton?: boolean;
  /** Show clear button */
  showClear?: boolean;
  /** Auto focus */
  autoFocus?: boolean;
  /** Search delay in ms */
  debounceDelay?: number;
}

/**
 * Subcategory Tabs component props
 */
export interface SubcategoryTabsProps extends BaseComponentProps, MultilingualProps {
  /** List of categories for tabs */
  categories: Category[];
  /** Active category ID */
  activeCategory: string;
  /** Category change handler */
  onCategoryChange: (categoryId: string) => void;
  /** Show icons in tabs */
  showIcons?: boolean;
  /** Scrollable tabs */
  scrollable?: boolean;
  /** Tab alignment */
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Language Toggle component props
 */
export interface LanguageToggleProps extends BaseComponentProps, MultilingualProps {
  /** Toggle style */
  variant?: 'dropdown' | 'buttons' | 'switch';
  /** Show language names */
  showNames?: boolean;
  /** Show flags */
  showFlags?: boolean;
  /** Compact mode */
  compact?: boolean;
}

/**
 * Loading Spinner component props
 */
export interface LoadingSpinnerProps extends BaseComponentProps {
  /** Spinner size */
  size?: 'small' | 'medium' | 'large';
  /** Spinner color */
  color?: string;
  /** Loading text */
  text?: string;
  /** Show overlay */
  overlay?: boolean;
  /** Spinner variant */
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
}

/**
 * Error Boundary component props
 */
export interface ErrorBoundaryProps {
  /** Child components */
  children: ReactNode;
  /** Fallback component */
  fallback?: ReactNode;
  /** Error handler */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Reset error state */
  resetOnPropsChange?: boolean;
  /** Reset keys */
  resetKeys?: Array<string | number>;
}

/**
 * Modal component props
 */
export interface ModalProps extends BaseComponentProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal children */
  children: ReactNode;
  /** Modal size */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Modal z-index */
  zIndex?: number;
}

/**
 * Button component props
 */
export interface ButtonProps extends BaseComponentProps {
  /** Button text or children */
  children: ReactNode;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Icon before text */
  iconBefore?: ReactNode;
  /** Icon after text */
  iconAfter?: ReactNode;
  /** Icon only button */
  iconOnly?: boolean;
}

/**
 * Input component props
 */
export interface InputProps extends BaseComponentProps {
  /** Input value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /** Placeholder text */
  placeholder?: string;
  /** Input label */
  label?: string;
  /** Help text */
  helpText?: string;
  /** Error message */
  error?: string;
  /** Required indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Auto focus */
  autoFocus?: boolean;
  /** Icon */
  icon?: ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
}

/**
 * Form component props
 */
export interface FormProps extends BaseComponentProps {
  /** Form children */
  children: ReactNode;
  /** Submit handler */
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  /** Form validation state */
  isValid?: boolean;
  /** Form loading state */
  isLoading?: boolean;
  /** Reset handler */
  onReset?: () => void;
  /** Auto complete */
  autoComplete?: 'on' | 'off';
}

/**
 * Admin Layout component props
 */
export interface AdminLayoutProps extends BaseComponentProps {
  /** Page children */
  children: ReactNode;
  /** Page title */
  title?: string;
  /** Show sidebar */
  showSidebar?: boolean;
  /** Sidebar collapsed state */
  sidebarCollapsed?: boolean;
  /** Sidebar toggle handler */
  onSidebarToggle?: () => void;
  /** Current user */
  user?: User;
  /** Logout handler */
  onLogout?: () => void;
}

/**
 * Admin Sidebar component props
 */
export interface AdminSidebarProps extends BaseComponentProps {
  /** Current user */
  user?: User;
  /** Active menu item */
  activeItem?: string;
  /** Menu item click handler */
  onItemClick?: (item: string) => void;
  /** Collapsed state */
  collapsed?: boolean;
  /** Toggle collapse handler */
  onToggleCollapse?: () => void;
  /** Logout handler */
  onLogout?: () => void;
}

/**
 * Product Manager component props
 */
export interface ProductManagerProps extends BaseComponentProps, MultilingualProps {
  /** Initial products */
  initialProducts?: Product[];
  /** Initial categories */
  initialCategories?: Category[];
  /** Product save handler */
  onProductSave?: (product: Product) => void;
  /** Product delete handler */
  onProductDelete?: (productId: string) => void;
  /** Show tobacco catalog features */
  showTobaccoFeatures?: boolean;
}

/**
 * Analytics component props
 */
export interface AnalyticsProps extends BaseComponentProps {
  /** Analytics data */
  data?: {
    totalViews: number;
    totalQRScans: number;
    todayViews: number;
    recentActivity: Array<{
      time: string;
      description: string;
      type: string;
    }>;
  };
  /** Date range */
  dateRange?: {
    from: string;
    to: string;
  };
  /** Refresh handler */
  onRefresh?: () => void;
  /** Auto refresh interval */
  autoRefresh?: boolean;
}

/**
 * QR Code Generator component props
 */
export interface QRGeneratorProps extends BaseComponentProps {
  /** Initial table ID */
  initialTableId?: string;
  /** Base URL */
  baseUrl?: string;
  /** QR code generation handler */
  onGenerate?: (qrData: { qrCode: string; url: string; tableId: string }) => void;
  /** Download handler */
  onDownload?: (qrCode: string, tableId: string) => void;
}

/**
 * Video Background component props
 */
export interface VideoBackgroundProps extends BaseComponentProps {
  /** Video source URL */
  src?: string;
  /** Video poster image */
  poster?: string;
  /** Video category for dynamic selection */
  category?: string;
  /** Muted playback */
  muted?: boolean;
  /** Auto play */
  autoPlay?: boolean;
  /** Loop playback */
  loop?: boolean;
  /** Overlay opacity */
  overlayOpacity?: number;
  /** Overlay color */
  overlayColor?: string;
}

/**
 * Notification component props
 */
export interface NotificationProps extends BaseComponentProps {
  /** Notification message */
  message: string;
  /** Notification type */
  type?: 'success' | 'error' | 'warning' | 'info';
  /** Auto dismiss after duration */
  autoDismiss?: boolean;
  /** Dismiss duration in ms */
  duration?: number;
  /** Show close button */
  showClose?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Icon */
  icon?: ReactNode;
  /** Position */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

/**
 * Pagination component props
 */
export interface PaginationProps extends BaseComponentProps {
  /** Current page (0-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Items per page */
  itemsPerPage?: number;
  /** Total items count */
  totalItems?: number;
  /** Show page size selector */
  showPageSize?: boolean;
  /** Page size change handler */
  onPageSizeChange?: (size: number) => void;
  /** Show first/last buttons */
  showFirstLast?: boolean;
  /** Show previous/next buttons */
  showPrevNext?: boolean;
  /** Maximum visible page buttons */
  maxVisiblePages?: number;
}

/**
 * Data Table component props
 */
export interface DataTableProps<T = unknown> extends BaseComponentProps, LoadingProps, ErrorProps {
  /** Table data */
  data: T[];
  /** Table columns */
  columns: Array<{
    key: string;
    title: string;
    width?: string;
    sortable?: boolean;
    render?: (value: unknown, row: T) => ReactNode;
  }>;
  /** Row key field */
  rowKey?: string;
  /** Sort configuration */
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  /** Sort change handler */
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  /** Row selection */
  selection?: {
    selectedKeys: string[];
    onSelectionChange: (keys: string[]) => void;
    multiple?: boolean;
  };
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Pagination */
  pagination?: PaginationProps;
  /** Empty message */
  emptyMessage?: string;
  /** Row actions */
  actions?: Array<{
    key: string;
    label: string;
    icon?: ReactNode;
    onClick: (row: T) => void;
    visible?: (row: T) => boolean;
  }>;
}

/**
 * Navigation props for components with routing
 */
export interface NavigationProps {
  /** Navigation handler */
  onNavigate?: (path: string) => void;
  /** Current path */
  currentPath?: string;
  /** Back handler */
  onBack?: () => void;
  /** Forward handler */
  onForward?: () => void;
}

/**
 * Animation props for components with motion
 */
export interface AnimationProps {
  /** Initial animation state */
  initial?: Record<string, unknown>;
  /** Animate to state */
  animate?: Record<string, unknown>;
  /** Exit animation state */
  exit?: Record<string, unknown>;
  /** Animation transition */
  transition?: Record<string, unknown>;
  /** Animation duration */
  duration?: number;
  /** Animation delay */
  delay?: number;
}