/**
 * Tobacco API Service Testing Suite
 * Tests for all tobacco-related API functions
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  getTobaccoCatalog,
  addBrandToCatalog,
  addTobaccoToCatalog,
  removeTobaccoFromCatalog,
  addTobaccoToMenu,
  syncProductsToTobaccoCatalog,
  debugTobaccoSystem,
  syncExistingTobacco
} from '../services/api';

// Create mock adapter for axios
const mockAxios = new MockAdapter(axios);

describe('Tobacco API Service', () => {

  const API_URL = process.env.REACT_APP_API_URL || 'http://test.safira-lounge.de/safira-api-fixed.php';

  beforeEach(() => {
    mockAxios.reset();
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    mockAxios.reset();
  });

  describe('getTobaccoCatalog', () => {

    test('fetches tobacco catalog successfully', async () => {
      const mockCatalog = {
        data: {
          brands: ['Al Fakher', 'Adalya', 'Serbetli'],
          tobaccos: [
            {
              id: 'tobacco-1',
              name: { de: 'Doppelapfel' },
              brand: 'Al Fakher',
              description: { de: 'Klassischer Doppelapfel' },
              price: 15.99,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          ]
        }
      };

      mockAxios.onGet(API_URL, { params: { action: 'tobacco_catalog' } })
        .reply(200, mockCatalog);

      const result = await getTobaccoCatalog();

      expect(result).toEqual(mockCatalog.data);
      expect(result.brands).toHaveLength(3);
      expect(result.tobaccos).toHaveLength(1);
    });

    test('returns fallback data on API error', async () => {
      mockAxios.onGet(API_URL, { params: { action: 'tobacco_catalog' } })
        .reply(500, { error: 'Internal server error' });

      const result = await getTobaccoCatalog();

      expect(result).toHaveProperty('brands');
      expect(result).toHaveProperty('tobaccos');
      expect(Array.isArray(result.brands)).toBe(true);
      expect(Array.isArray(result.tobaccos)).toBe(true);
    });

    test('handles network timeout', async () => {
      mockAxios.onGet(API_URL, { params: { action: 'tobacco_catalog' } })
        .timeout();

      const result = await getTobaccoCatalog();

      // Should return fallback data
      expect(result.brands).toBeDefined();
      expect(result.tobaccos).toBeDefined();
    });

    test('handles empty catalog response', async () => {
      const emptyCatalog = {
        data: {
          brands: [],
          tobaccos: []
        }
      };

      mockAxios.onGet(API_URL, { params: { action: 'tobacco_catalog' } })
        .reply(200, emptyCatalog);

      const result = await getTobaccoCatalog();

      expect(result.brands).toEqual([]);
      expect(result.tobaccos).toEqual([]);
    });

    test('includes auth token in request when available', async () => {
      localStorage.setItem('adminToken', 'test-token-123');

      const mockCatalog = {
        data: {
          brands: ['Al Fakher'],
          tobaccos: []
        }
      };

      mockAxios.onGet(API_URL, { params: { action: 'tobacco_catalog' } })
        .reply(config => {
          expect(config.headers?.Authorization).toBe('Bearer test-token-123');
          return [200, mockCatalog];
        });

      await getTobaccoCatalog();
    });
  });

  describe('addBrandToCatalog', () => {

    test('adds new brand successfully', async () => {
      const mockResponse = {
        data: {
          brands: ['Al Fakher', 'Adalya', 'New Brand']
        }
      };

      mockAxios.onPost(API_URL, { brand: 'New Brand' }, { params: { action: 'add_tobacco_brand' } })
        .reply(200, mockResponse);

      const result = await addBrandToCatalog('New Brand');

      expect(result.brands).toContain('New Brand');
      expect(result.brands).toHaveLength(3);
    });

    test('trims whitespace from brand name', async () => {
      const mockResponse = {
        data: {
          brands: ['Al Fakher', 'Adalya', 'New Brand']
        }
      };

      mockAxios.onPost(API_URL, { brand: 'New Brand' }, { params: { action: 'add_tobacco_brand' } })
        .reply(config => {
          const data = JSON.parse(config.data);
          expect(data.brand).toBe('New Brand');
          return [200, mockResponse];
        });

      await addBrandToCatalog('  New Brand  ');
    });

    test('throws error on API failure', async () => {
      mockAxios.onPost(API_URL, { brand: 'New Brand' }, { params: { action: 'add_tobacco_brand' } })
        .reply(500, { error: 'Failed to add brand' });

      await expect(addBrandToCatalog('New Brand'))
        .rejects.toThrow();
    });

    test('handles duplicate brand error', async () => {
      mockAxios.onPost(API_URL, { brand: 'Al Fakher' }, { params: { action: 'add_tobacco_brand' } })
        .reply(409, { error: 'Brand already exists' });

      await expect(addBrandToCatalog('Al Fakher'))
        .rejects.toThrow();
    });
  });

  describe('addTobaccoToCatalog', () => {

    test('adds tobacco product successfully', async () => {
      const newTobacco = {
        name: { de: 'Wassermelone', en: 'Watermelon' },
        brand: 'Adalya',
        description: { de: 'Frische Wassermelone', en: 'Fresh watermelon' },
        price: 16.99
      };

      const mockResponse = {
        data: {
          id: 'tobacco-new',
          ...newTobacco,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      };

      mockAxios.onPost(API_URL, expect.any(Object), { params: { action: 'add_tobacco_catalog' } })
        .reply(200, mockResponse);

      const result = await addTobaccoToCatalog(newTobacco);

      expect(result.id).toBe('tobacco-new');
      expect(result.name).toEqual(newTobacco.name);
      expect(result.brand).toBe('Adalya');
      expect(result.price).toBe(16.99);
    });

    test('handles tobacco without description', async () => {
      const newTobacco = {
        name: { de: 'Simple Product' },
        brand: 'Al Fakher',
        price: 15.99
      };

      const mockResponse = {
        data: {
          id: 'tobacco-simple',
          name: newTobacco.name,
          brand: newTobacco.brand,
          description: '',
          price: newTobacco.price,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      };

      mockAxios.onPost(API_URL, expect.any(Object), { params: { action: 'add_tobacco_catalog' } })
        .reply(config => {
          const data = JSON.parse(config.data);
          expect(data.description).toBe('');
          return [200, mockResponse];
        });

      await addTobaccoToCatalog(newTobacco);
    });

    test('handles tobacco without price', async () => {
      const newTobacco = {
        name: { de: 'No Price Product' },
        brand: 'Serbetli'
      };

      const mockResponse = {
        data: {
          id: 'tobacco-noprice',
          name: newTobacco.name,
          brand: newTobacco.brand,
          description: '',
          price: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      };

      mockAxios.onPost(API_URL, expect.any(Object), { params: { action: 'add_tobacco_catalog' } })
        .reply(config => {
          const data = JSON.parse(config.data);
          expect(data.price).toBe(0);
          return [200, mockResponse];
        });

      await addTobaccoToCatalog(newTobacco);
    });

    test('throws error on validation failure', async () => {
      const invalidTobacco = {
        name: { de: '' }, // Empty name
        brand: 'Al Fakher',
        price: 15.99
      };

      mockAxios.onPost(API_URL, expect.any(Object), { params: { action: 'add_tobacco_catalog' } })
        .reply(400, { error: 'Name is required' });

      await expect(addTobaccoToCatalog(invalidTobacco))
        .rejects.toThrow();
    });
  });

  describe('removeTobaccoFromCatalog', () => {

    test('removes tobacco successfully', async () => {
      mockAxios.onDelete(API_URL, { params: { action: 'delete_tobacco_catalog', id: 'tobacco-1' } })
        .reply(200, { success: true });

      await expect(removeTobaccoFromCatalog('tobacco-1'))
        .resolves.not.toThrow();
    });

    test('throws error when tobacco not found', async () => {
      mockAxios.onDelete(API_URL, { params: { action: 'delete_tobacco_catalog', id: 'non-existent' } })
        .reply(404, { error: 'Tobacco not found' });

      await expect(removeTobaccoFromCatalog('non-existent'))
        .rejects.toThrow();
    });

    test('handles deletion of tobacco in use', async () => {
      mockAxios.onDelete(API_URL, { params: { action: 'delete_tobacco_catalog', id: 'tobacco-1' } })
        .reply(409, { error: 'Tobacco is currently in use in menu' });

      await expect(removeTobaccoFromCatalog('tobacco-1'))
        .rejects.toThrow();
    });

    test('includes auth token in delete request', async () => {
      localStorage.setItem('adminToken', 'test-token-123');

      mockAxios.onDelete(API_URL, { params: { action: 'delete_tobacco_catalog', id: 'tobacco-1' } })
        .reply(config => {
          expect(config.headers?.Authorization).toBe('Bearer test-token-123');
          return [200, { success: true }];
        });

      await removeTobaccoFromCatalog('tobacco-1');
    });
  });

  describe('addTobaccoToMenu', () => {

    test('adds tobacco to menu with badges', async () => {
      const badges = {
        neu: true,
        kurze_zeit: false,
        beliebt: true
      };

      const mockProduct = {
        id: 'product-1',
        name: 'Tobacco Product tobacco-1',
        description: 'Added from tobacco catalog',
        price: 15.99,
        available: true,
        categoryId: 'shisha-standard',
        badges,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      mockAxios.onPost(API_URL, expect.any(Object), { params: { action: 'create_product' } })
        .reply(200, { data: { product: mockProduct } });

      const result = await addTobaccoToMenu('tobacco-1', 'shisha-standard', badges);

      expect(result.badges).toEqual(badges);
      expect(result.categoryId).toBe('shisha-standard');
    });

    test('adds tobacco without badges', async () => {
      const mockProduct = {
        id: 'product-1',
        name: 'Tobacco Product tobacco-1',
        description: 'Added from tobacco catalog',
        price: 15.99,
        available: true,
        categoryId: 'shisha-premium',
        badges: { neu: false, kurze_zeit: false, beliebt: false },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      mockAxios.onPost(API_URL, expect.any(Object), { params: { action: 'create_product' } })
        .reply(200, { data: { product: mockProduct } });

      const result = await addTobaccoToMenu('tobacco-1', 'shisha-premium');

      expect(result.badges).toEqual({ neu: false, kurze_zeit: false, beliebt: false });
    });
  });

  describe('syncProductsToTobaccoCatalog', () => {

    test('syncs products successfully', async () => {
      const mockSyncResult = {
        data: {
          message: 'Sync completed',
          syncedCount: 5,
          totalTobaccos: 10
        }
      };

      mockAxios.onPost(API_URL, {}, { params: { action: 'sync_tobacco_catalog' } })
        .reply(200, mockSyncResult);

      const result = await syncProductsToTobaccoCatalog();

      expect(result.message).toBe('Sync completed');
      expect(result.syncedCount).toBe(5);
      expect(result.totalTobaccos).toBe(10);
    });

    test('handles sync with no new products', async () => {
      const mockSyncResult = {
        data: {
          message: 'No new products to sync',
          syncedCount: 0,
          totalTobaccos: 10
        }
      };

      mockAxios.onPost(API_URL, {}, { params: { action: 'sync_tobacco_catalog' } })
        .reply(200, mockSyncResult);

      const result = await syncProductsToTobaccoCatalog();

      expect(result.syncedCount).toBe(0);
      expect(result.totalTobaccos).toBe(10);
    });

    test('throws error on sync failure', async () => {
      mockAxios.onPost(API_URL, {}, { params: { action: 'sync_tobacco_catalog' } })
        .reply(500, { error: 'Sync failed' });

      await expect(syncProductsToTobaccoCatalog())
        .rejects.toThrow();
    });
  });

  describe('debugTobaccoSystem', () => {

    test('returns debug information', async () => {
      const mockDebugInfo = {
        debug_info: {
          tobacco_products_count: 15,
          catalog_entries_count: 12,
          recent_tobacco_products: [
            { id: 'tobacco-1', name: 'Product 1' },
            { id: 'tobacco-2', name: 'Product 2' }
          ]
        }
      };

      mockAxios.onGet(API_URL, { params: { action: 'debug_tobacco_system' } })
        .reply(200, mockDebugInfo);

      const result = await debugTobaccoSystem();

      expect(result.debug_info.tobacco_products_count).toBe(15);
      expect(result.debug_info.catalog_entries_count).toBe(12);
      expect(result.debug_info.recent_tobacco_products).toHaveLength(2);
    });

    test('handles debug endpoint errors', async () => {
      mockAxios.onGet(API_URL, { params: { action: 'debug_tobacco_system' } })
        .reply(500, { error: 'Debug failed' });

      await expect(debugTobaccoSystem())
        .rejects.toThrow();
    });
  });

  describe('syncExistingTobacco', () => {

    test('syncs existing tobacco products', async () => {
      const mockSyncResult = {
        added: 3,
        total_products: 20
      };

      mockAxios.onPost(API_URL, { action: 'sync_existing_tobacco' })
        .reply(200, mockSyncResult);

      const result = await syncExistingTobacco();

      expect(result.added).toBe(3);
      expect(result.total_products).toBe(20);
    });

    test('handles sync with no products to add', async () => {
      const mockSyncResult = {
        added: 0,
        total_products: 20
      };

      mockAxios.onPost(API_URL, { action: 'sync_existing_tobacco' })
        .reply(200, mockSyncResult);

      const result = await syncExistingTobacco();

      expect(result.added).toBe(0);
    });

    test('throws error on sync failure', async () => {
      mockAxios.onPost(API_URL, { action: 'sync_existing_tobacco' })
        .reply(500, { error: 'Sync failed' });

      await expect(syncExistingTobacco())
        .rejects.toThrow();
    });
  });

  describe('API Error Handling', () => {

    test('handles 401 unauthorized errors', async () => {
      localStorage.setItem('adminToken', 'invalid-token');

      mockAxios.onGet(API_URL, { params: { action: 'tobacco_catalog' } })
        .reply(401, { error: 'Unauthorized' });

      await getTobaccoCatalog();

      // Token should be cleared
      expect(localStorage.getItem('adminToken')).toBeNull();
    });

    test('handles 403 forbidden errors', async () => {
      mockAxios.onPost(API_URL, expect.any(Object), { params: { action: 'add_tobacco_brand' } })
        .reply(403, { error: 'Forbidden' });

      await expect(addBrandToCatalog('New Brand'))
        .rejects.toThrow();
    });

    test('handles network errors', async () => {
      mockAxios.onGet(API_URL, { params: { action: 'tobacco_catalog' } })
        .networkError();

      const result = await getTobaccoCatalog();

      // Should return fallback data
      expect(result.brands).toBeDefined();
    });

    test('handles malformed response data', async () => {
      mockAxios.onGet(API_URL, { params: { action: 'tobacco_catalog' } })
        .reply(200, 'invalid json');

      await expect(getTobaccoCatalog())
        .resolves.toBeDefined();
    });
  });

  describe('Request Configuration', () => {

    test('sets correct content-type header', async () => {
      mockAxios.onGet(API_URL, { params: { action: 'tobacco_catalog' } })
        .reply(config => {
          expect(config.headers?.['Content-Type']).toBe('application/json');
          return [200, { data: { brands: [], tobaccos: [] } }];
        });

      await getTobaccoCatalog();
    });

    test('includes request timeout', async () => {
      mockAxios.onGet(API_URL, { params: { action: 'tobacco_catalog' } })
        .reply(config => {
          expect(config.timeout).toBe(10000);
          return [200, { data: { brands: [], tobaccos: [] } }];
        });

      await getTobaccoCatalog();
    });

    test('uses correct base URL', async () => {
      mockAxios.onGet(API_URL, { params: { action: 'tobacco_catalog' } })
        .reply(config => {
          expect(config.baseURL).toBe(API_URL);
          return [200, { data: { brands: [], tobaccos: [] } }];
        });

      await getTobaccoCatalog();
    });
  });

  describe('Data Validation', () => {

    test('validates tobacco name format', async () => {
      const tobacco = {
        name: { de: 'Valid Name', en: 'Valid Name' },
        brand: 'Al Fakher',
        price: 15.99
      };

      mockAxios.onPost(API_URL, expect.any(Object), { params: { action: 'add_tobacco_catalog' } })
        .reply(config => {
          const data = JSON.parse(config.data);
          expect(typeof data.name).toBe('object');
          expect(data.name.de).toBe('Valid Name');
          return [200, { data: { id: 'tobacco-1', ...data } }];
        });

      await addTobaccoToCatalog(tobacco);
    });

    test('validates price is number', async () => {
      const tobacco = {
        name: { de: 'Product' },
        brand: 'Al Fakher',
        price: 15.99
      };

      mockAxios.onPost(API_URL, expect.any(Object), { params: { action: 'add_tobacco_catalog' } })
        .reply(config => {
          const data = JSON.parse(config.data);
          expect(typeof data.price).toBe('number');
          return [200, { data: { id: 'tobacco-1', ...data } }];
        });

      await addTobaccoToCatalog(tobacco);
    });

    test('validates brand is non-empty string', async () => {
      const tobacco = {
        name: { de: 'Product' },
        brand: 'Al Fakher',
        price: 15.99
      };

      mockAxios.onPost(API_URL, expect.any(Object), { params: { action: 'add_tobacco_catalog' } })
        .reply(config => {
          const data = JSON.parse(config.data);
          expect(typeof data.brand).toBe('string');
          expect(data.brand.length).toBeGreaterThan(0);
          return [200, { data: { id: 'tobacco-1', ...data } }];
        });

      await addTobaccoToCatalog(tobacco);
    });
  });
});
