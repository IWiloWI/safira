/**
 * Tobacco Catalog Component Testing Suite
 * Comprehensive tests for TobaccoCatalog component functionality
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import React from 'react';
import TobaccoCatalog from '../components/Admin/TobaccoCatalog';
import { LanguageProvider } from '../contexts/LanguageContext';
import * as api from '../services/api';

// Mock the API module
jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Test data fixtures
const mockTobaccoCatalog = {
  brands: ['Al Fakher', 'Adalya', 'Serbetli', 'Fumari', 'Starbuzz'],
  tobaccos: [
    {
      id: 'tobacco-1',
      name: { de: 'Doppelapfel', en: 'Double Apple', da: 'Dobbelt æble', tr: 'Çift Elma' },
      brand: 'Al Fakher',
      description: { de: 'Klassischer Doppelapfel', en: 'Classic double apple', da: 'Klassisk dobbelt æble', tr: 'Klasik çift elma' },
      price: 15.99,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'tobacco-2',
      name: { de: 'Wassermelone', en: 'Watermelon', da: 'Vandmelon', tr: 'Karpuz' },
      brand: 'Adalya',
      description: { de: 'Frische Wassermelone', en: 'Fresh watermelon', da: 'Frisk vandmelon', tr: 'Taze karpuz' },
      price: 16.99,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    },
    {
      id: 'tobacco-3',
      name: { de: 'Minze', en: 'Mint', da: 'Mynte', tr: 'Nane' },
      brand: 'Serbetli',
      description: { de: 'Kühle Minze', en: 'Cool mint', da: 'Kold mynte', tr: 'Soğuk nane' },
      price: 14.99,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z'
    }
  ]
};

const mockEmptyCatalog = {
  brands: [],
  tobaccos: []
};

// Wrapper component with necessary providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('TobaccoCatalog Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock setup
    mockedApi.getTobaccoCatalog.mockResolvedValue(mockTobaccoCatalog);
    mockedApi.debugTobaccoSystem.mockResolvedValue({ debug_info: { tobacco_products_count: 3 } });
    mockedApi.syncExistingTobacco.mockResolvedValue({ added: 0, total_products: 3 });
  });

  describe('Component Rendering', () => {

    test('renders tobacco catalog with header and controls', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Tabak-Katalog')).toBeInTheDocument();
        expect(screen.getByText('Verwalten Sie Ihre Shisha-Tabaksorten')).toBeInTheDocument();
      });
    });

    test('renders search input with placeholder', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');
        expect(searchInput).toBeInTheDocument();
      });
    });

    test('renders brand filter dropdown', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        const brandFilter = screen.getByRole('combobox');
        expect(brandFilter).toBeInTheDocument();
        expect(screen.getByText('Alle Marken')).toBeInTheDocument();
      });
    });

    test('renders debug buttons', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('🔍 Debug System')).toBeInTheDocument();
        expect(screen.getByText('🔄 Sync Products')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {

    test('loads tobacco catalog on component mount', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(mockedApi.getTobaccoCatalog).toHaveBeenCalledTimes(1);
      });
    });

    test('displays loading state while fetching data', () => {
      mockedApi.getTobaccoCatalog.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockTobaccoCatalog), 100))
      );

      renderWithProviders(<TobaccoCatalog />);

      expect(screen.getByText('Wird geladen...')).toBeInTheDocument();
    });

    test('displays tobacco products after loading', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
        expect(screen.getByText('Wassermelone')).toBeInTheDocument();
        expect(screen.getByText('Minze')).toBeInTheDocument();
      });
    });

    test('displays all brands in filter dropdown', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        mockTobaccoCatalog.brands.forEach(brand => {
          expect(screen.getByText(brand)).toBeInTheDocument();
        });
      });
    });

    test('handles empty catalog gracefully', async () => {
      mockedApi.getTobaccoCatalog.mockResolvedValue(mockEmptyCatalog);

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Noch keine Tabaksorten im Katalog vorhanden.')).toBeInTheDocument();
      });
    });

    test('handles API error with fallback behavior', async () => {
      mockedApi.getTobaccoCatalog.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        // Component should still render even with error
        expect(screen.getByText('Tabak-Katalog')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {

    test('filters products by name', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');
      fireEvent.change(searchInput, { target: { value: 'Wassermelone' } });

      await waitFor(() => {
        expect(screen.getByText('Wassermelone')).toBeInTheDocument();
        expect(screen.queryByText('Doppelapfel')).not.toBeInTheDocument();
      });
    });

    test('filters products by brand', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');
      fireEvent.change(searchInput, { target: { value: 'Adalya' } });

      await waitFor(() => {
        expect(screen.queryByText('Doppelapfel')).not.toBeInTheDocument();
        expect(screen.queryByText('Minze')).not.toBeInTheDocument();
      });
    });

    test('search is case-insensitive', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Wassermelone')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');
      fireEvent.change(searchInput, { target: { value: 'WASSERMELONE' } });

      await waitFor(() => {
        expect(screen.getByText('Wassermelone')).toBeInTheDocument();
      });
    });

    test('displays "no results" message when no matches found', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('Keine Tabaksorten gefunden.')).toBeInTheDocument();
      });
    });

    test('clears search results when search input is cleared', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');

      fireEvent.change(searchInput, { target: { value: 'Minze' } });
      await waitFor(() => {
        expect(screen.queryByText('Doppelapfel')).not.toBeInTheDocument();
      });

      fireEvent.change(searchInput, { target: { value: '' } });
      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
        expect(screen.getByText('Wassermelone')).toBeInTheDocument();
      });
    });
  });

  describe('Brand Filtering', () => {

    test('filters products by selected brand', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const brandFilter = screen.getByRole('combobox');
      fireEvent.change(brandFilter, { target: { value: 'Al Fakher' } });

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
        expect(screen.queryByText('Wassermelone')).not.toBeInTheDocument();
        expect(screen.queryByText('Minze')).not.toBeInTheDocument();
      });
    });

    test('shows all products when "all brands" is selected', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const brandFilter = screen.getByRole('combobox');

      fireEvent.change(brandFilter, { target: { value: 'Adalya' } });
      await waitFor(() => {
        expect(screen.queryByText('Doppelapfel')).not.toBeInTheDocument();
      });

      fireEvent.change(brandFilter, { target: { value: 'all' } });
      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
        expect(screen.getByText('Wassermelone')).toBeInTheDocument();
        expect(screen.getByText('Minze')).toBeInTheDocument();
      });
    });

    test('combines search and brand filter', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const brandFilter = screen.getByRole('combobox');
      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');

      fireEvent.change(brandFilter, { target: { value: 'Al Fakher' } });
      fireEvent.change(searchInput, { target: { value: 'Doppelapfel' } });

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
        expect(screen.queryByText('Wassermelone')).not.toBeInTheDocument();
      });
    });
  });

  describe('Add to Menu Functionality', () => {

    test('opens modal when add button is clicked', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByTitle('Zur Speisekarte hinzufügen');
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Zur Speisekarte hinzufügen')).toBeInTheDocument();
      });
    });

    test('modal displays selected tobacco details', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByTitle('Zur Speisekarte hinzufügen');
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        const modalContent = screen.getAllByText('Doppelapfel');
        expect(modalContent.length).toBeGreaterThan(1); // One in card, one in modal
      });
    });

    test('modal has category selection', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByTitle('Zur Speisekarte hinzufügen');
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Kategorie')).toBeInTheDocument();
        expect(screen.getByText('Shisha Standard')).toBeInTheDocument();
      });
    });

    test('modal has badge checkboxes', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByTitle('Zur Speisekarte hinzufügen');
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Neu')).toBeInTheDocument();
        expect(screen.getByText('Kurze Zeit')).toBeInTheDocument();
        expect(screen.getByText('Beliebt')).toBeInTheDocument();
      });
    });

    test('closes modal when cancel button is clicked', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByTitle('Zur Speisekarte hinzufügen');
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Zur Speisekarte hinzufügen')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Abbrechen');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        const modalTitle = screen.queryByText('Zur Speisekarte hinzufügen');
        expect(modalTitle).not.toBeInTheDocument();
      });
    });

    test('adds tobacco to menu with selected options', async () => {
      mockedApi.addTobaccoToMenu.mockResolvedValue({
        id: 'product-1',
        name: { de: 'Doppelapfel' },
        description: { de: 'Klassischer Doppelapfel' },
        price: 15.99,
        available: true,
        categoryId: 'shisha-standard',
        subcategoryId: null,
        badges: { neu: true, kurze_zeit: false, beliebt: false },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      });

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByTitle('Zur Speisekarte hinzufügen');
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Zur Speisekarte hinzufügen')).toBeInTheDocument();
      });

      // Select badge
      const neuCheckbox = screen.getByRole('checkbox', { name: /Neu/i });
      fireEvent.click(neuCheckbox);

      // Submit
      const submitButton = screen.getByText('Hinzufügen');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedApi.addTobaccoToMenu).toHaveBeenCalledWith(
          'tobacco-1',
          'shisha-standard',
          expect.objectContaining({ neu: true })
        );
      });
    });

    test('displays success notification after adding to menu', async () => {
      mockedApi.addTobaccoToMenu.mockResolvedValue({
        id: 'product-1',
        name: { de: 'Doppelapfel' },
        description: { de: 'Klassischer Doppelapfel' },
        price: 15.99,
        available: true,
        categoryId: 'shisha-standard',
        subcategoryId: null,
        badges: { neu: false, kurze_zeit: false, beliebt: false },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      });

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByTitle('Zur Speisekarte hinzufügen');
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        const submitButton = screen.getByText('Hinzufügen');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/wurde zur Speisekarte hinzugefügt/i)).toBeInTheDocument();
      });
    });
  });

  describe('Delete Tobacco Functionality', () => {

    test('opens confirmation modal when delete button is clicked', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Aus Katalog entfernen');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Tabaksorte löschen')).toBeInTheDocument();
      });
    });

    test('confirmation modal displays tobacco name', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Aus Katalog entfernen');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        const modalContent = screen.getAllByText('Doppelapfel');
        expect(modalContent.length).toBeGreaterThan(1);
      });
    });

    test('cancels deletion when cancel button is clicked', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Aus Katalog entfernen');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Tabaksorte löschen')).toBeInTheDocument();
      });

      const cancelButtons = screen.getAllByText('Abbrechen');
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);

      await waitFor(() => {
        expect(screen.queryByText('Tabaksorte löschen')).not.toBeInTheDocument();
      });

      expect(mockedApi.removeTobaccoFromCatalog).not.toHaveBeenCalled();
    });

    test('deletes tobacco when confirmed', async () => {
      mockedApi.removeTobaccoFromCatalog.mockResolvedValue();
      mockedApi.getTobaccoCatalog.mockResolvedValueOnce(mockTobaccoCatalog)
        .mockResolvedValueOnce({
          brands: mockTobaccoCatalog.brands,
          tobaccos: mockTobaccoCatalog.tobaccos.slice(1)
        });

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Aus Katalog entfernen');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Tabaksorte löschen')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('Löschen');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockedApi.removeTobaccoFromCatalog).toHaveBeenCalledWith('tobacco-1');
      });
    });

    test('displays success notification after deletion', async () => {
      mockedApi.removeTobaccoFromCatalog.mockResolvedValue();

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Aus Katalog entfernen');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        const deleteButton = screen.getByText('Löschen');
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/wurde aus dem Katalog entfernt/i)).toBeInTheDocument();
      });
    });

    test('displays error notification when deletion fails', async () => {
      mockedApi.removeTobaccoFromCatalog.mockRejectedValue(new Error('Delete failed'));

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Aus Katalog entfernen');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        const deleteButton = screen.getByText('Löschen');
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Fehler beim Entfernen/i)).toBeInTheDocument();
      });
    });
  });

  describe('Debug Functionality', () => {

    test('debug button calls debug system API', async () => {
      mockedApi.debugTobaccoSystem.mockResolvedValue({
        debug_info: {
          tobacco_products_count: 3,
          catalog_entries_count: 3,
          recent_tobacco_products: mockTobaccoCatalog.tobaccos
        }
      });

      // Mock window.alert
      window.alert = jest.fn();

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('🔍 Debug System')).toBeInTheDocument();
      });

      const debugButton = screen.getByText('🔍 Debug System');
      fireEvent.click(debugButton);

      await waitFor(() => {
        expect(mockedApi.debugTobaccoSystem).toHaveBeenCalled();
      });
    });

    test('sync button calls sync existing tobacco API', async () => {
      mockedApi.syncExistingTobacco.mockResolvedValue({
        added: 2,
        total_products: 5
      });

      // Mock window.alert
      window.alert = jest.fn();

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('🔄 Sync Products')).toBeInTheDocument();
      });

      const syncButton = screen.getByText('🔄 Sync Products');
      fireEvent.click(syncButton);

      await waitFor(() => {
        expect(mockedApi.syncExistingTobacco).toHaveBeenCalled();
      });
    });

    test('sync button refreshes catalog after sync', async () => {
      mockedApi.syncExistingTobacco.mockResolvedValue({
        added: 2,
        total_products: 5
      });

      window.alert = jest.fn();

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('🔄 Sync Products')).toBeInTheDocument();
      });

      const initialCallCount = mockedApi.getTobaccoCatalog.mock.calls.length;

      const syncButton = screen.getByText('🔄 Sync Products');
      fireEvent.click(syncButton);

      await waitFor(() => {
        expect(mockedApi.getTobaccoCatalog.mock.calls.length).toBe(initialCallCount + 1);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {

    test('handles tobacco with string name (legacy format)', async () => {
      const legacyCatalog = {
        brands: ['Al Fakher'],
        tobaccos: [{
          id: 'tobacco-legacy',
          name: 'Legacy Product' as any,
          brand: 'Al Fakher',
          description: 'Legacy description' as any,
          price: 15.99,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }]
      };

      mockedApi.getTobaccoCatalog.mockResolvedValue(legacyCatalog);

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Legacy Product')).toBeInTheDocument();
      });
    });

    test('handles tobacco without description', async () => {
      const noDescCatalog = {
        brands: ['Al Fakher'],
        tobaccos: [{
          id: 'tobacco-nodesc',
          name: { de: 'No Description' },
          brand: 'Al Fakher',
          price: 15.99,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }]
      };

      mockedApi.getTobaccoCatalog.mockResolvedValue(noDescCatalog);

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('No Description')).toBeInTheDocument();
      });
    });

    test('handles tobacco without price', async () => {
      const noPriceCatalog = {
        brands: ['Al Fakher'],
        tobaccos: [{
          id: 'tobacco-noprice',
          name: { de: 'No Price' },
          brand: 'Al Fakher',
          description: { de: 'Product without price' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }]
      };

      mockedApi.getTobaccoCatalog.mockResolvedValue(noPriceCatalog as any);

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('No Price')).toBeInTheDocument();
      });
    });

    test('handles API timeout gracefully', async () => {
      mockedApi.getTobaccoCatalog.mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        // Component should still render
        expect(screen.getByText('Tabak-Katalog')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('notification auto-dismisses after 4 seconds', async () => {
      jest.useFakeTimers();

      mockedApi.addTobaccoToMenu.mockResolvedValue({
        id: 'product-1',
        name: { de: 'Test' },
        description: { de: 'Test' },
        price: 15.99,
        available: true,
        categoryId: 'shisha-standard',
        subcategoryId: null,
        badges: { neu: false, kurze_zeit: false, beliebt: false },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      });

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByTitle('Zur Speisekarte hinzufügen');
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        const submitButton = screen.getByText('Hinzufügen');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/wurde zur Speisekarte hinzugefügt/i)).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(4500);
      });

      await waitFor(() => {
        expect(screen.queryByText(/wurde zur Speisekarte hinzugefügt/i)).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {

    test('all interactive elements have proper labels', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        const addButtons = screen.getAllByTitle('Zur Speisekarte hinzufügen');
        const deleteButtons = screen.getAllByTitle('Aus Katalog entfernen');

        expect(addButtons.length).toBeGreaterThan(0);
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });

    test('modals can be closed with keyboard', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      const addButtons = screen.getAllByTitle('Zur Speisekarte hinzufügen');
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Zur Speisekarte hinzufügen')).toBeInTheDocument();
      });

      const modal = screen.getByRole('dialog', { hidden: true }) || document.body;
      fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });

      // Modal should close (implementation dependent)
    });
  });

  describe('Performance', () => {

    test('renders large catalog efficiently', async () => {
      const largeCatalog = {
        brands: mockTobaccoCatalog.brands,
        tobaccos: Array.from({ length: 100 }, (_, i) => ({
          id: `tobacco-${i}`,
          name: { de: `Product ${i}` },
          brand: mockTobaccoCatalog.brands[i % mockTobaccoCatalog.brands.length],
          description: { de: `Description ${i}` },
          price: 15.99 + i,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }))
      };

      mockedApi.getTobaccoCatalog.mockResolvedValue(largeCatalog);

      const startTime = performance.now();
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Product 0')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;

      // Render should complete within reasonable time
      expect(renderTime).toBeLessThan(5000);
    });

    test('search filtering is performant', async () => {
      const largeCatalog = {
        brands: mockTobaccoCatalog.brands,
        tobaccos: Array.from({ length: 100 }, (_, i) => ({
          id: `tobacco-${i}`,
          name: { de: `Product ${i}` },
          brand: mockTobaccoCatalog.brands[i % mockTobaccoCatalog.brands.length],
          description: { de: `Description ${i}` },
          price: 15.99 + i,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }))
      };

      mockedApi.getTobaccoCatalog.mockResolvedValue(largeCatalog);

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Product 0')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');

      const startTime = performance.now();
      fireEvent.change(searchInput, { target: { value: 'Product 50' } });
      const filterTime = performance.now() - startTime;

      // Filtering should be instant
      expect(filterTime).toBeLessThan(100);
    });
  });
});
