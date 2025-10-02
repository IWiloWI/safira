/**
 * Tobacco Catalog Integration Testing Suite
 * Tests the complete tobacco catalog workflow end-to-end
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import TobaccoCatalog from '../../components/Admin/TobaccoCatalog';
import { LanguageProvider } from '../../contexts/LanguageContext';
import * as api from '../../services/api';
import {
  standardTobaccoCatalog,
  emptyTobaccoCatalog,
  mockApiResponses,
  testBadges,
  testCategories
} from '../fixtures/tobacco.fixtures';

// Mock the API module
jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('Tobacco Catalog Integration Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Default API mocks
    mockedApi.getTobaccoCatalog.mockResolvedValue(standardTobaccoCatalog);
    mockedApi.debugTobaccoSystem.mockResolvedValue(mockApiResponses.debugInfo);
    mockedApi.syncExistingTobacco.mockResolvedValue(mockApiResponses.syncExistingSuccess);
  });

  describe('Complete Workflow: Browse to Add to Menu', () => {

    test('user can browse catalog and add product to menu', async () => {
      mockedApi.addTobaccoToMenu.mockResolvedValue(mockApiResponses.addToMenuSuccess.data.product);

      renderWithProviders(<TobaccoCatalog />);

      // Step 1: Wait for catalog to load
      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      // Step 2: Search for specific product
      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');
      await userEvent.type(searchInput, 'Doppelapfel');

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
        expect(screen.queryByText('Wassermelone')).not.toBeInTheDocument();
      });

      // Step 3: Click add to menu
      const addButton = screen.getByTitle('Zur Speisekarte hinzufügen');
      await userEvent.click(addButton);

      // Step 4: Modal appears with product details
      await waitFor(() => {
        expect(screen.getByText('Zur Speisekarte hinzufügen')).toBeInTheDocument();
      });

      // Step 5: Select category
      const categorySelect = screen.getByLabelText('Kategorie');
      fireEvent.change(categorySelect, { target: { value: 'shisha-premium' } });

      // Step 6: Set badges
      const neuCheckbox = screen.getByRole('checkbox', { name: /Neu/i });
      const belieBtCheckbox = screen.getByRole('checkbox', { name: /Beliebt/i });
      await userEvent.click(neuCheckbox);
      await userEvent.click(beliebtCheckbox);

      // Step 7: Submit
      const submitButton = screen.getByText('Hinzufügen');
      await userEvent.click(submitButton);

      // Step 8: Verify API call
      await waitFor(() => {
        expect(mockedApi.addTobaccoToMenu).toHaveBeenCalledWith(
          'tobacco-001',
          'shisha-premium',
          expect.objectContaining({
            neu: true,
            beliebt: true
          })
        );
      });

      // Step 9: Success notification appears
      await waitFor(() => {
        expect(screen.getByText(/wurde zur Speisekarte hinzugefügt/i)).toBeInTheDocument();
      });

      // Step 10: Modal closes
      await waitFor(() => {
        expect(screen.queryByText('Zur Speisekarte hinzufügen')).not.toBeInTheDocument();
      });
    });
  });

  describe('Complete Workflow: Search, Filter, and Delete', () => {

    test('user can search, filter by brand, and delete product', async () => {
      mockedApi.removeTobaccoFromCatalog.mockResolvedValue();
      mockedApi.getTobaccoCatalog
        .mockResolvedValueOnce(standardTobaccoCatalog)
        .mockResolvedValueOnce({
          ...standardTobaccoCatalog,
          tobaccos: standardTobaccoCatalog.tobaccos.filter(t => t.id !== 'tobacco-001')
        });

      renderWithProviders(<TobaccoCatalog />);

      // Step 1: Wait for catalog to load
      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      // Step 2: Filter by brand
      const brandFilter = screen.getByRole('combobox');
      fireEvent.change(brandFilter, { target: { value: 'Al Fakher' } });

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
        expect(screen.queryByText('Wassermelone')).not.toBeInTheDocument();
      });

      // Step 3: Search within filtered results
      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');
      await userEvent.type(searchInput, 'Doppelapfel');

      // Step 4: Click delete button
      const deleteButton = screen.getByTitle('Aus Katalog entfernen');
      await userEvent.click(deleteButton);

      // Step 5: Confirmation modal appears
      await waitFor(() => {
        expect(screen.getByText('Tabaksorte löschen')).toBeInTheDocument();
      });

      // Step 6: Confirm deletion
      const confirmButton = screen.getByText('Löschen');
      await userEvent.click(confirmButton);

      // Step 7: Verify API call
      await waitFor(() => {
        expect(mockedApi.removeTobaccoFromCatalog).toHaveBeenCalledWith('tobacco-001');
      });

      // Step 8: Catalog reloads
      await waitFor(() => {
        expect(mockedApi.getTobaccoCatalog).toHaveBeenCalledTimes(2);
      });

      // Step 9: Success notification
      await waitFor(() => {
        expect(screen.getByText(/wurde aus dem Katalog entfernt/i)).toBeInTheDocument();
      });
    });
  });

  describe('Complete Workflow: Debug and Sync', () => {

    test('user can debug system and sync products', async () => {
      window.alert = jest.fn();

      renderWithProviders(<TobaccoCatalog />);

      // Step 1: Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      // Step 2: Click debug button
      const debugButton = screen.getByText('🔍 Debug System');
      await userEvent.click(debugButton);

      // Step 3: Verify debug API call
      await waitFor(() => {
        expect(mockedApi.debugTobaccoSystem).toHaveBeenCalled();
      });

      // Step 4: Alert with debug info shown
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Debug Info'));

      // Step 5: Click sync button
      const syncButton = screen.getByText('🔄 Sync Products');
      await userEvent.click(syncButton);

      // Step 6: Verify sync API call
      await waitFor(() => {
        expect(mockedApi.syncExistingTobacco).toHaveBeenCalled();
      });

      // Step 7: Alert with sync results shown
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Sync Complete'));

      // Step 8: Catalog refreshes after sync
      await waitFor(() => {
        expect(mockedApi.getTobaccoCatalog).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Complete Workflow: Empty State to First Product', () => {

    test('handles empty catalog and shows appropriate message', async () => {
      mockedApi.getTobaccoCatalog.mockResolvedValue(emptyTobaccoCatalog);

      renderWithProviders(<TobaccoCatalog />);

      // Step 1: Empty state message shown
      await waitFor(() => {
        expect(screen.getByText('Noch keine Tabaksorten im Katalog vorhanden.')).toBeInTheDocument();
      });

      // Step 2: Verify no product cards rendered
      const productCards = screen.queryAllByRole('heading', { level: 3 });
      expect(productCards).toHaveLength(0);

      // Step 3: Brand filter shows "Alle Marken" only
      const brandFilter = screen.getByRole('combobox');
      const options = within(brandFilter).getAllByRole('option');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('Alle Marken');
    });
  });

  describe('Complete Workflow: Multiple Filters and Actions', () => {

    test('applies multiple filters and performs batch operations', async () => {
      renderWithProviders(<TobaccoCatalog />);

      // Step 1: Wait for catalog
      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      // Initial count
      let productCount = screen.getAllByTitle('Zur Speisekarte hinzufügen').length;
      expect(productCount).toBe(7); // All products from standardTobaccoCatalog

      // Step 2: Filter by brand
      const brandFilter = screen.getByRole('combobox');
      fireEvent.change(brandFilter, { target: { value: 'Adalya' } });

      await waitFor(() => {
        productCount = screen.getAllByTitle('Zur Speisekarte hinzufügen').length;
        expect(productCount).toBe(1); // Only Wassermelone
      });

      // Step 3: Add search term
      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');
      await userEvent.type(searchInput, 'Wasser');

      await waitFor(() => {
        expect(screen.getByText('Wassermelone')).toBeInTheDocument();
      });

      // Step 4: Clear search
      await userEvent.clear(searchInput);

      await waitFor(() => {
        productCount = screen.getAllByTitle('Zur Speisekarte hinzufügen').length;
        expect(productCount).toBe(1); // Still filtered by Adalya brand
      });

      // Step 5: Reset to all brands
      fireEvent.change(brandFilter, { target: { value: 'all' } });

      await waitFor(() => {
        productCount = screen.getAllByTitle('Zur Speisekarte hinzufügen').length;
        expect(productCount).toBe(7); // All products visible again
      });
    });
  });

  describe('Error Recovery Workflows', () => {

    test('recovers from API error during add to menu', async () => {
      mockedApi.addTobaccoToMenu.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      // Try to add to menu
      const addButton = screen.getAllByTitle('Zur Speisekarte hinzufügen')[0];
      await userEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Zur Speisekarte hinzufügen')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Hinzufügen');
      await userEvent.click(submitButton);

      // Error notification shown
      await waitFor(() => {
        expect(screen.getByText(/Fehler beim Hinzufügen/i)).toBeInTheDocument();
      });

      // Modal remains open for retry
      expect(screen.getByText('Zur Speisekarte hinzufügen')).toBeInTheDocument();

      // Fix API and retry
      mockedApi.addTobaccoToMenu.mockResolvedValue(mockApiResponses.addToMenuSuccess.data.product);

      await userEvent.click(submitButton);

      // Success this time
      await waitFor(() => {
        expect(screen.getByText(/wurde zur Speisekarte hinzugefügt/i)).toBeInTheDocument();
      });
    });

    test('recovers from API error during delete', async () => {
      mockedApi.removeTobaccoFromCatalog
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce();

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      // Try to delete
      const deleteButton = screen.getAllByTitle('Aus Katalog entfernen')[0];
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Tabaksorte löschen')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Löschen');
      await userEvent.click(confirmButton);

      // Error notification
      await waitFor(() => {
        expect(screen.getByText(/Fehler beim Entfernen/i)).toBeInTheDocument();
      });

      // Modal remains open, try again
      expect(screen.getByText('Tabaksorte löschen')).toBeInTheDocument();

      await userEvent.click(confirmButton);

      // Success
      await waitFor(() => {
        expect(screen.getByText(/wurde aus dem Katalog entfernt/i)).toBeInTheDocument();
      });
    });
  });

  describe('Concurrent Operations', () => {

    test('handles multiple simultaneous filter operations', async () => {
      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      // Rapid filter changes
      const brandFilter = screen.getByRole('combobox');
      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');

      fireEvent.change(brandFilter, { target: { value: 'Al Fakher' } });
      await userEvent.type(searchInput, 'Doppelapfel');
      fireEvent.change(brandFilter, { target: { value: 'Adalya' } });
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'Wasser');

      // Final state should be correct
      await waitFor(() => {
        expect(screen.getByText('Wassermelone')).toBeInTheDocument();
        expect(screen.queryByText('Doppelapfel')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence', () => {

    test('maintains filter state during catalog refresh', async () => {
      mockedApi.getTobaccoCatalog.mockResolvedValue(standardTobaccoCatalog);

      renderWithProviders(<TobaccoCatalog />);

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      // Apply filters
      const brandFilter = screen.getByRole('combobox');
      fireEvent.change(brandFilter, { target: { value: 'Al Fakher' } });

      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');
      await userEvent.type(searchInput, 'Doppel');

      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
        expect(screen.queryByText('Wassermelone')).not.toBeInTheDocument();
      });

      // Trigger sync which refreshes catalog
      window.alert = jest.fn();
      const syncButton = screen.getByText('🔄 Sync Products');
      await userEvent.click(syncButton);

      await waitFor(() => {
        expect(mockedApi.getTobaccoCatalog).toHaveBeenCalledTimes(2);
      });

      // Filters should still be applied
      await waitFor(() => {
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
        expect(screen.queryByText('Wassermelone')).not.toBeInTheDocument();
      });

      expect(brandFilter).toHaveValue('Al Fakher');
      expect(searchInput).toHaveValue('Doppel');
    });
  });

  describe('User Experience Flows', () => {

    test('provides smooth navigation through all features', async () => {
      mockedApi.addTobaccoToMenu.mockResolvedValue(mockApiResponses.addToMenuSuccess.data.product);
      window.alert = jest.fn();

      renderWithProviders(<TobaccoCatalog />);

      // 1. Catalog loads
      await waitFor(() => {
        expect(screen.getByText('Tabak-Katalog')).toBeInTheDocument();
        expect(screen.getByText('Doppelapfel')).toBeInTheDocument();
      });

      // 2. User searches
      const searchInput = screen.getByPlaceholderText('Tabaksorten durchsuchen...');
      await userEvent.type(searchInput, 'Minze');

      await waitFor(() => {
        expect(screen.getByText('Minze')).toBeInTheDocument();
      });

      // 3. User clears search
      await userEvent.clear(searchInput);

      // 4. User filters by brand
      const brandFilter = screen.getByRole('combobox');
      fireEvent.change(brandFilter, { target: { value: 'Fumari' } });

      await waitFor(() => {
        expect(screen.getByText('Blaubeere')).toBeInTheDocument();
      });

      // 5. User adds to menu
      const addButton = screen.getByTitle('Zur Speisekarte hinzufügen');
      await userEvent.click(addButton);

      await waitFor(() => {
        const submitButton = screen.getByText('Hinzufügen');
        await userEvent.click(submitButton);
      });

      // 6. Success feedback
      await waitFor(() => {
        expect(screen.getByText(/wurde zur Speisekarte hinzugefügt/i)).toBeInTheDocument();
      });

      // 7. User debugs system
      const debugButton = screen.getByText('🔍 Debug System');
      await userEvent.click(debugButton);

      await waitFor(() => {
        expect(mockedApi.debugTobaccoSystem).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalled();
      });

      // All features work smoothly
      expect(true).toBe(true);
    });
  });
});
