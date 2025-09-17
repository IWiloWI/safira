// Database schema types
export interface DatabaseCategory {
  id: string;
  name: string; // JSON string in database
  icon: string;
  description?: string; // JSON string in database
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseProduct {
  id: string;
  category_id: string;
  name: string; // JSON string in database
  description?: string; // JSON string in database
  price: number;
  image_url?: string;
  available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseAnalytics {
  id: number;
  type: 'page_view' | 'qr_scan' | 'device_info';
  data: string; // JSON string in database
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// Multilingual content type
export interface MultilingualText {
  de: string;
  da?: string;
  en?: string;
}

// Application types (transformed from database)
export interface Category {
  id: string;
  name: MultilingualText;
  icon: string;
  description?: MultilingualText;
  items: Product[];
}

export interface Product {
  id: string;
  name: string | MultilingualText;
  description?: string | MultilingualText;
  price: number;
  imageUrl?: string;
  available?: boolean;
  badges?: {
    neu?: boolean;
    kurze_zeit?: boolean;
    beliebt?: boolean;
  };
  brand?: string; // For tobacco products
}

export interface TobaccoItem {
  id: string;
  name: string;
  description?: string;
  brand: string;
  price: number;
}

export interface TobaccoCatalog {
  brands: string[];
  tobaccos: TobaccoItem[];
}

// Analytics types
export interface AnalyticsView {
  timestamp: string;
  ip?: string;
  userAgent?: string;
  tableId?: string;
  page?: string;
}

export interface AnalyticsQRScan {
  timestamp: string;
  ip?: string;
  userAgent?: string;
  tableId: string;
}

export interface AnalyticsDeviceInfo {
  timestamp: string;
  ip?: string;
  userAgent?: string;
  device: {
    browser?: string;
    os?: string;
    mobile?: boolean;
    screen?: {
      width: number;
      height: number;
    };
  };
}

export interface AnalyticsActivity {
  time: string;
  description: string;
  timestamp: string;
  type: string;
  user: string;
  data: Record<string, any>;
}

export interface Analytics {
  views: AnalyticsView[];
  qrScans: AnalyticsQRScan[];
  deviceInfo: AnalyticsDeviceInfo[];
  tableActivity: Record<string, number>;
  recentActivity: AnalyticsActivity[];
}

// Configuration types
export interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface AppConfig {
  siteName: string;
  address: string;
  phone: string;
  email: string;
  hours: BusinessHours;
  social: SocialMedia;
}

// Database connection pool type
export interface DatabasePool {
  execute(sql: string, params?: any[]): Promise<[any[], any]>;
  getConnection(): Promise<DatabaseConnection>;
}

export interface DatabaseConnection {
  execute(sql: string, params?: any[]): Promise<[any[], any]>;
  release(): void;
}