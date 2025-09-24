/**
 * Product and category type definitions for the Safira Lounge Menu
 * Handles multilingual products, categories, and tobacco catalog functionality
 */

import { 
  BaseEntity, 
  FlexibleText, 
  MultilingualText, 
  PartialMultilingualText, 
  ProductBadges, 
  PriceInfo, 
  Timestamps 
} from './common.types';

/**
 * Product size configuration
 * Used for products that have multiple size/price options
 */
export interface ProductSize extends PriceInfo {
  /** Whether this size is available */
  available?: boolean;
  /** Size description or additional info */
  description?: string;
}

/**
 * Core product interface
 * Represents a menu item with full multilingual support
 */
export interface Product extends BaseEntity {
  /** Product name (multilingual or string) */
  name: FlexibleText;
  /** Product description (optional, multilingual or string) */
  description?: FlexibleText;
  /** Base price for single-size products */
  price?: number;
  /** Price variations for different sizes */
  sizes?: ProductSize[];
  /** Whether product is currently available */
  available: boolean;
  /** Category this product belongs to */
  categoryId?: string;
  /** Visual badges for the product */
  badges?: ProductBadges;
  /** Brand name (mainly for tobacco products) */
  brand?: string;
  /** Product image URL */
  imageUrl?: string;
  /** Product thumbnail URL */
  thumbnailUrl?: string;
  /** Nutritional information */
  nutritionalInfo?: NutritionalInfo;
  /** Allergen information */
  allergens?: string[];
  /** Product weight in grams */
  weight?: number;
  /** Alcohol content percentage (for drinks) */
  alcoholContent?: number;
  /** Temperature serving recommendation */
  temperature?: 'hot' | 'cold' | 'room' | 'frozen';
  /** Preparation time in minutes */
  preparationTime?: number;
  /** Whether product is vegetarian */
  isVegetarian?: boolean;
  /** Whether product is vegan */
  isVegan?: boolean;
  /** Whether product is gluten-free */
  isGlutenFree?: boolean;
  /** Product origin/source information */
  origin?: string;
  /** Custom metadata for extensibility */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt?: string;
  /** Last update timestamp */
  updatedAt?: string;
}

/**
 * Nutritional information for products
 */
export interface NutritionalInfo {
  /** Calories per serving */
  calories?: number;
  /** Protein content in grams */
  protein?: number;
  /** Carbohydrate content in grams */
  carbohydrates?: number;
  /** Fat content in grams */
  fat?: number;
  /** Sugar content in grams */
  sugar?: number;
  /** Sodium content in milligrams */
  sodium?: number;
  /** Fiber content in grams */
  fiber?: number;
  /** Serving size description */
  servingSize?: string;
}

/**
 * Product creation data (without generated fields)
 */
export type ProductCreateData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Product update data (partial fields)
 */
export type ProductUpdateData = Partial<Omit<Product, 'id' | 'createdAt'>>;

/**
 * Category interface for organizing products
 */
export interface Category extends BaseEntity {
  /** Category name (multilingual or string) */
  name: FlexibleText;
  /** Category description (optional, multilingual or string) */
  description?: FlexibleText;
  /** Icon for the category (emoji or symbol) */
  icon?: string;
  /** Image URL for category button on home page */
  image?: string;
  /** Products in this category */
  items: Product[];
  /** Subcategories nested within this category */
  subcategories?: Category[];
  /** Parent category ID for subcategories */
  parentPage?: string;
  /** Whether this is a main category (shows on home page) */
  isMainCategory?: boolean;
  /** Display order for sorting */
  order?: number;
  /** Display order within parent category */
  sortOrder?: number;
  /** Whether category is visible to customers */
  visible?: boolean;
  /** Category color theme */
  color?: string;
  /** Category background image */
  backgroundImage?: string;
  /** Custom CSS classes */
  cssClasses?: string[];
  /** Creation timestamp */
  createdAt?: string;
  /** Last update timestamp */
  updatedAt?: string;
}

/**
 * Category creation data
 */
export type CategoryCreateData = Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'items'>;

/**
 * Category update data
 */
export type CategoryUpdateData = Partial<Omit<Category, 'id' | 'createdAt' | 'items'>>;

/**
 * Product data structure returned from API
 * Contains the complete menu with all categories and products
 */
export interface ProductData {
  /** List of all categories with their products */
  categories: Category[];
  /** Metadata about the menu */
  metadata?: {
    /** Last update timestamp */
    lastUpdated: string;
    /** Total number of products */
    totalProducts: number;
    /** Total number of categories */
    totalCategories: number;
    /** Menu version */
    version?: string;
  };
}

/**
 * Tobacco catalog item for the tobacco management system
 */
export interface TobaccoItem extends BaseEntity {
  /** Tobacco product name (multilingual or string) */
  name: FlexibleText;
  /** Product description (optional, multilingual or string) */
  description?: FlexibleText;
  /** Brand name */
  brand: string;
  /** Base price */
  price?: number;
  /** Size/price variations */
  sizes?: ProductSize[];
  /** Flavor profile */
  flavor?: string;
  /** Nicotine content information */
  nicotineContent?: 'light' | 'medium' | 'strong' | 'nicotine-free';
  /** Country of origin */
  origin?: string;
  /** Product image URL */
  imageUrl?: string;
  /** Whether item is available in catalog */
  available?: boolean;
  /** Custom properties */
  properties?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt?: string;
  /** Last update timestamp */
  updatedAt?: string;
}

/**
 * Tobacco catalog structure
 * Manages the complete tobacco inventory
 */
export interface TobaccoCatalog {
  /** Available tobacco brands */
  brands: string[];
  /** Tobacco products in the catalog */
  tobaccos: TobaccoItem[];
  /** Catalog metadata */
  metadata?: {
    /** Last sync timestamp */
    lastSync?: string;
    /** Total number of brands */
    totalBrands: number;
    /** Total number of tobacco items */
    totalTobaccos: number;
  };
}

/**
 * Tobacco item creation data
 */
export type TobaccoItemCreateData = Omit<TobaccoItem, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Product filter options for searching/filtering
 */
export interface ProductFilters {
  /** Filter by category ID */
  categoryId?: string;
  /** Filter by brand (for tobacco products) */
  brand?: string;
  /** Filter by availability */
  available?: boolean;
  /** Filter by price range */
  priceRange?: {
    min: number;
    max: number;
  };
  /** Filter by badges */
  badges?: Partial<ProductBadges>;
  /** Filter by product type */
  type?: 'drink' | 'food' | 'tobacco' | 'other';
  /** Filter by dietary restrictions */
  dietary?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
  };
  /** Text search query */
  searchQuery?: string;
}

/**
 * Product sorting options
 */
export interface ProductSortOptions {
  /** Field to sort by */
  field: 'name' | 'price' | 'brand' | 'createdAt' | 'updatedAt';
  /** Sort direction */
  direction: 'asc' | 'desc';
  /** Language for name sorting */
  language?: 'de' | 'da' | 'en' | 'tr' | 'it';
}

/**
 * Bulk operation result for products
 */
export interface BulkOperationResult {
  /** Success message */
  message: string;
  /** Number of items processed */
  processedCount: number;
  /** Number of items successfully updated */
  successCount: number;
  /** Number of items that failed */
  failureCount: number;
  /** Errors that occurred during processing */
  errors?: Array<{
    itemId: string;
    error: string;
  }>;
}

/**
 * Bulk price update request
 */
export interface BulkPriceUpdateRequest {
  /** Category to update */
  categoryId: string;
  /** New price to set */
  newPrice: number;
  /** Optional filter criteria */
  filters?: {
    /** Only update products with specific brand */
    brand?: string;
    /** Only update available products */
    availableOnly?: boolean;
  };
}

/**
 * Bulk price update result
 */
export interface BulkPriceUpdateResult extends BulkOperationResult {
  /** New price that was applied */
  newPrice: number;
  /** Number of products updated */
  updatedCount: number;
}

/**
 * Translation options for product operations
 */
export interface ProductTranslationOptions {
  /** Whether to translate the product name */
  translateName: boolean;
  /** Whether to translate the description */
  translateDescription: boolean;
  /** Target languages for translation */
  targetLanguages?: Array<'da' | 'en' | 'tr' | 'it'>;
  /** Source language (defaults to 'de') */
  sourceLanguage?: 'de' | 'da' | 'en' | 'tr' | 'it';
}

/**
 * Translation update request
 */
export interface TranslationUpdateRequest {
  /** Field being translated */
  field: 'name' | 'description';
  /** Translation values for each language */
  translations: {
    de: string;
    da: string;
    en: string;
    tr: string;
    it: string;
  };
}

/**
 * Product validation result
 */
export interface ProductValidationResult {
  /** Whether the product is valid */
  isValid: boolean;
  /** Validation errors */
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  /** Validation warnings */
  warnings?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * Main category configuration for the menu structure
 */
export interface MainCategory {
  /** Category identifier */
  id: string;
  /** Category name (multilingual) */
  name: MultilingualText;
  /** Category icon (emoji or symbol) */
  icon?: string;
  /** Category image URL */
  image: string;
  /** Associated category IDs */
  categoryIds: string[];
  /** Display order */
  order?: number;
  /** Whether category is enabled */
  enabled?: boolean;
}

/**
 * Menu structure with main categories
 */
export interface MenuStructure {
  /** Main category definitions */
  mainCategories: Record<string, MainCategory>;
  /** Category hierarchy */
  categoryHierarchy: Record<string, string[]>;
  /** Menu metadata */
  metadata?: {
    version: string;
    lastUpdated: string;
  };
}