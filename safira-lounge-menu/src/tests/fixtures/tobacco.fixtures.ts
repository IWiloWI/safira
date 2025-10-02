/**
 * Test Data Fixtures for Tobacco Catalog Testing
 * Provides realistic mock data for various test scenarios
 */

import { TobaccoCatalog, TobaccoItem } from '../../types/product.types';

/**
 * Standard tobacco catalog with diverse products
 */
export const standardTobaccoCatalog: TobaccoCatalog = {
  brands: ['Al Fakher', 'Adalya', 'Serbetli', 'Fumari', 'Starbuzz', 'Azure', 'Tangiers'],
  tobaccos: [
    {
      id: 'tobacco-001',
      name: {
        de: 'Doppelapfel',
        en: 'Double Apple',
        da: 'Dobbelt æble',
        tr: 'Çift Elma'
      },
      brand: 'Al Fakher',
      description: {
        de: 'Klassischer Doppelapfel-Geschmack mit süßem Anisaroma',
        en: 'Classic double apple flavor with sweet anise aroma',
        da: 'Klassisk dobbelt æble smag med sød anis aroma',
        tr: 'Tatlı anason aromalı klasik çift elma lezzeti'
      },
      price: 15.99,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z'
    },
    {
      id: 'tobacco-002',
      name: {
        de: 'Wassermelone',
        en: 'Watermelon',
        da: 'Vandmelon',
        tr: 'Karpuz'
      },
      brand: 'Adalya',
      description: {
        de: 'Frische, süße Wassermelone für einen erfrischenden Genuss',
        en: 'Fresh, sweet watermelon for a refreshing experience',
        da: 'Frisk, sød vandmelon for en forfriskende oplevelse',
        tr: 'Ferahlatıcı bir deneyim için taze, tatlı karpuz'
      },
      price: 16.99,
      createdAt: '2024-01-02T11:00:00Z',
      updatedAt: '2024-01-16T15:00:00Z'
    },
    {
      id: 'tobacco-003',
      name: {
        de: 'Minze',
        en: 'Mint',
        da: 'Mynte',
        tr: 'Nane'
      },
      brand: 'Serbetli',
      description: {
        de: 'Intensive, kühle Minze für maximale Frische',
        en: 'Intense, cool mint for maximum freshness',
        da: 'Intens, kold mynte for maksimal friskhed',
        tr: 'Maksimum tazelik için yoğun, serin nane'
      },
      price: 14.99,
      createdAt: '2024-01-03T12:00:00Z',
      updatedAt: '2024-01-17T16:00:00Z'
    },
    {
      id: 'tobacco-004',
      name: {
        de: 'Blaubeere',
        en: 'Blueberry',
        da: 'Blåbær',
        tr: 'Yaban mersini'
      },
      brand: 'Fumari',
      description: {
        de: 'Saftige Blaubeeren mit intensivem Fruchtaroma',
        en: 'Juicy blueberries with intense fruit aroma',
        da: 'Saftige blåbær med intens frugtaroma',
        tr: 'Yoğun meyve aromalı sulu yaban mersini'
      },
      price: 17.99,
      createdAt: '2024-01-04T13:00:00Z',
      updatedAt: '2024-01-18T17:00:00Z'
    },
    {
      id: 'tobacco-005',
      name: {
        de: 'Blauer Nebel',
        en: 'Blue Mist',
        da: 'Blå tåge',
        tr: 'Mavi sis'
      },
      brand: 'Starbuzz',
      description: {
        de: 'Mystische Mischung aus Blaubeere und Minze',
        en: 'Mystical blend of blueberry and mint',
        da: 'Mystisk blanding af blåbær og mynte',
        tr: 'Yaban mersini ve nanenin mistik karışımı'
      },
      price: 18.99,
      createdAt: '2024-01-05T14:00:00Z',
      updatedAt: '2024-01-19T18:00:00Z'
    },
    {
      id: 'tobacco-006',
      name: {
        de: 'Pfirsich',
        en: 'Peach',
        da: 'Fersken',
        tr: 'Şeftali'
      },
      brand: 'Azure',
      description: {
        de: 'Reife, süße Pfirsiche mit zartem Aroma',
        en: 'Ripe, sweet peaches with delicate aroma',
        da: 'Modne, søde ferskener med delikat aroma',
        tr: 'Narin aromalı olgun, tatlı şeftali'
      },
      price: 16.49,
      createdAt: '2024-01-06T15:00:00Z',
      updatedAt: '2024-01-20T19:00:00Z'
    },
    {
      id: 'tobacco-007',
      name: {
        de: 'Kaktusfeige',
        en: 'Cactus Fruit',
        da: 'Kaktus frugt',
        tr: 'Kaktüs meyvesi'
      },
      brand: 'Tangiers',
      description: {
        de: 'Exotische Kaktusfeige mit erdiger Note',
        en: 'Exotic cactus fruit with earthy note',
        da: 'Eksotisk kaktus frugt med jordig note',
        tr: 'Toprak notası olan egzotik kaktüs meyvesi'
      },
      price: 19.99,
      createdAt: '2024-01-07T16:00:00Z',
      updatedAt: '2024-01-21T20:00:00Z'
    }
  ]
};

/**
 * Empty tobacco catalog for testing empty states
 */
export const emptyTobaccoCatalog: TobaccoCatalog = {
  brands: [],
  tobaccos: []
};

/**
 * Catalog with only brands, no products
 */
export const brandsOnlyCatalog: TobaccoCatalog = {
  brands: ['Al Fakher', 'Adalya', 'Serbetli', 'Fumari', 'Starbuzz'],
  tobaccos: []
};

/**
 * Large catalog for performance testing
 */
export const largeTobaccoCatalog: TobaccoCatalog = {
  brands: ['Al Fakher', 'Adalya', 'Serbetli', 'Fumari', 'Starbuzz', 'Azure', 'Tangiers', 'Social Smoke', 'Haze', 'Ugly Hookah'],
  tobaccos: Array.from({ length: 150 }, (_, i) => ({
    id: `tobacco-${String(i + 1).padStart(3, '0')}`,
    name: {
      de: `Produkt ${i + 1}`,
      en: `Product ${i + 1}`,
      da: `Produkt ${i + 1}`,
      tr: `Ürün ${i + 1}`
    },
    brand: ['Al Fakher', 'Adalya', 'Serbetli', 'Fumari', 'Starbuzz', 'Azure', 'Tangiers', 'Social Smoke', 'Haze', 'Ugly Hookah'][i % 10],
    description: {
      de: `Beschreibung für Produkt ${i + 1}`,
      en: `Description for product ${i + 1}`,
      da: `Beskrivelse af produkt ${i + 1}`,
      tr: `Ürün ${i + 1} için açıklama`
    },
    price: 15.99 + (i * 0.5),
    createdAt: `2024-01-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`,
    updatedAt: `2024-01-${String((i % 28) + 1).padStart(2, '0')}T15:00:00Z`
  }))
};

/**
 * Tobacco with legacy string format (backward compatibility)
 */
export const legacyFormatTobacco: TobaccoItem = {
  id: 'tobacco-legacy',
  name: 'Legacy Product' as any,
  brand: 'Al Fakher',
  description: 'Legacy description format' as any,
  price: 15.99,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

/**
 * Tobacco without optional fields
 */
export const minimalTobacco: TobaccoItem = {
  id: 'tobacco-minimal',
  name: { de: 'Minimal Product' },
  brand: 'Al Fakher',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

/**
 * New tobacco item for testing creation
 */
export const newTobaccoItem: Omit<TobaccoItem, 'id' | 'createdAt' | 'updatedAt'> = {
  name: {
    de: 'Neue Tabaksorte',
    en: 'New Tobacco Flavor',
    da: 'Ny tobakssmag',
    tr: 'Yeni tütün aroması'
  },
  brand: 'Adalya',
  description: {
    de: 'Eine brandneue Geschmacksrichtung',
    en: 'A brand new flavor',
    da: 'En helt ny smag',
    tr: 'Yepyeni bir lezzet'
  },
  price: 16.99
};

/**
 * Mock API responses for testing
 */
export const mockApiResponses = {
  getCatalogSuccess: {
    data: standardTobaccoCatalog
  },

  getCatalogEmpty: {
    data: emptyTobaccoCatalog
  },

  getCatalogError: {
    error: 'Failed to load catalog',
    message: 'Internal server error'
  },

  addBrandSuccess: {
    data: {
      brands: [...standardTobaccoCatalog.brands, 'New Brand']
    }
  },

  addTobaccoSuccess: {
    data: {
      id: 'tobacco-new',
      ...newTobaccoItem,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  },

  deleteTobaccoSuccess: {
    success: true,
    message: 'Tobacco removed successfully'
  },

  addToMenuSuccess: {
    data: {
      product: {
        id: 'product-new',
        name: newTobaccoItem.name,
        description: newTobaccoItem.description,
        price: newTobaccoItem.price,
        available: true,
        categoryId: 'shisha-standard',
        subcategoryId: null,
        badges: { neu: false, kurze_zeit: false, beliebt: false },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    }
  },

  syncSuccess: {
    data: {
      message: 'Sync completed successfully',
      syncedCount: 5,
      totalTobaccos: 25
    }
  },

  debugInfo: {
    debug_info: {
      tobacco_products_count: 25,
      catalog_entries_count: 22,
      recent_tobacco_products: standardTobaccoCatalog.tobaccos.slice(0, 5),
      database_tables: ['tobacco_catalog', 'products'],
      last_sync: '2024-01-20T10:00:00Z'
    }
  },

  syncExistingSuccess: {
    added: 3,
    total_products: 25,
    skipped: 22,
    errors: []
  }
};

/**
 * Mock error responses
 */
export const mockErrorResponses = {
  unauthorized: {
    status: 401,
    error: 'Unauthorized',
    message: 'Invalid or expired token'
  },

  forbidden: {
    status: 403,
    error: 'Forbidden',
    message: 'Insufficient permissions'
  },

  notFound: {
    status: 404,
    error: 'Not Found',
    message: 'Resource not found'
  },

  conflict: {
    status: 409,
    error: 'Conflict',
    message: 'Resource already exists'
  },

  validationError: {
    status: 400,
    error: 'Validation Error',
    message: 'Invalid input data',
    details: {
      name: 'Name is required',
      brand: 'Brand must not be empty'
    }
  },

  serverError: {
    status: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  },

  timeout: {
    error: 'Request Timeout',
    message: 'Request took too long to complete'
  }
};

/**
 * Test user data for authentication
 */
export const testUser = {
  id: 'user-test',
  username: 'admin',
  email: 'admin@safira-lounge.de',
  role: 'admin',
  token: 'test-token-12345',
  isActive: true,
  isVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

/**
 * Badge configurations for testing
 */
export const testBadges = {
  allBadges: {
    neu: true,
    kurze_zeit: true,
    beliebt: true
  },

  noBadges: {
    neu: false,
    kurze_zeit: false,
    beliebt: false
  },

  newOnly: {
    neu: true,
    kurze_zeit: false,
    beliebt: false
  },

  popularOnly: {
    neu: false,
    kurze_zeit: false,
    beliebt: true
  }
};

/**
 * Category configurations for testing
 */
export const testCategories = [
  {
    id: 'shisha-standard',
    name: 'Shisha Standard',
    displayOrder: 1
  },
  {
    id: 'shisha-premium',
    name: 'Shisha Premium',
    displayOrder: 2
  },
  {
    id: 'specials',
    name: 'Specials',
    displayOrder: 3
  }
];
