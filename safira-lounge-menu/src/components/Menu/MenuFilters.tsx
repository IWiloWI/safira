/**
 * Menu Filters Component
 * Provides search and filtering functionality for menu items
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';
import { Language } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';

// Styled components
const FiltersContainer = styled(motion.div)`
  width: 90vw;
  max-width: 900px;
  margin: 0 auto 30px;
  position: relative;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 1024px) {
    width: 90vw;
  }

  @media (max-width: 768px) {
    width: 90vw;
  }

  @media (max-width: 480px) {
    width: 90vw;
  }
`;

const SearchContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const QuickFiltersContainer = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const FilterChip = styled(motion.button)<{ $active: boolean }>`
  background: ${props => props.$active 
    ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
    : 'rgba(255, 255, 255, 0.1)'
  };
  border: 1px solid ${props => props.$active 
    ? 'rgba(255, 65, 251, 0.5)'
    : 'rgba(255, 255, 255, 0.2)'
  };
  border-radius: 20px;
  padding: 8px 16px;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
      : 'rgba(255, 255, 255, 0.15)'
    };
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 65, 251, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.75rem;
  }
`;

const AdvancedFiltersToggle = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 65, 251, 0.3);
  }
`;

const AdvancedFiltersPanel = styled(motion.div)`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 20px;
  margin-top: 15px;
  backdrop-filter: blur(15px);
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  display: block;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  font-weight: 600;
`;

const FilterSelect = styled.select`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  
  option {
    background: #1a1a1a;
    color: white;
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 65, 251, 0.5);
    box-shadow: 0 0 10px rgba(255, 65, 251, 0.2);
  }
`;

const PriceRangeContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const PriceInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 65, 251, 0.5);
    box-shadow: 0 0 10px rgba(255, 65, 251, 0.2);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  
  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #FF41FB;
  }
`;

const ClearFiltersButton = styled(motion.button)`
  background: linear-gradient(145deg, rgba(244, 67, 54, 0.8), rgba(211, 47, 47, 0.8));
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
  }
`;

const ResultsCount = styled(motion.div)`
  text-align: center;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  backdrop-filter: blur(10px);
`;

// Component interfaces
export interface FilterOptions {
  /** Text search query */
  searchQuery: string;
  /** Category filter */
  category?: string;
  /** Brand filter */
  brand?: string;
  /** Price range filter */
  priceRange?: {
    min?: number;
    max?: number;
  };
  /** Availability filter */
  availability?: 'all' | 'available' | 'unavailable';
  /** Dietary filters */
  dietary?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
  };
  /** Badge filters */
  badges?: {
    neu?: boolean;
    beliebt?: boolean;
    kurze_zeit?: boolean;
  };
}

export interface MenuFiltersProps {
  /** Current filter values */
  filters: FilterOptions;
  /** Filter change handler */
  onFiltersChange: (filters: FilterOptions) => void;
  /** Available brands for filtering */
  availableBrands?: string[];
  /** Available categories for filtering */
  availableCategories?: Array<{ id: string; name: string }>;
  /** Current language */
  language: Language;
  /** Number of results */
  resultsCount?: number;
  /** Show advanced filters */
  showAdvancedFilters?: boolean;
  /** Show quick filters */
  showQuickFilters?: boolean;
  /** Show search bar */
  showSearchBar?: boolean;
  /** Placeholder text for search */
  searchPlaceholder?: string;
  /** Debounce delay for search */
  searchDebounce?: number;
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Menu Filters Component
 * Provides comprehensive filtering and search functionality
 */
export const MenuFilters: React.FC<MenuFiltersProps> = React.memo(({
  filters,
  onFiltersChange,
  availableBrands = [],
  availableCategories = [],
  language,
  resultsCount,
  showAdvancedFilters = true,
  showQuickFilters = true,
  showSearchBar = true,
  searchPlaceholder,
  searchDebounce = 300,
  className,
  testId = 'menu-filters'
}) => {
  // const { isMobile } = useResponsive(); // Unused for now
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState({
    min: filters.priceRange?.min?.toString() || '',
    max: filters.priceRange?.max?.toString() || ''
  });

  /**
   * Get localized text
   */
  const getText = (key: string) => {
    const texts: Record<string, Record<Language, string>> = {
      search: {
        de: 'Produkte durchsuchen...',
        da: 'Søg produkter...',
        en: 'Search products...',
        tr: 'Ürün arayın...',
        it: 'Cerca prodotti...'
      },
      all: {
        de: 'Alle',
        da: 'Alle',
        en: 'All',
        tr: 'Hepsi',
        it: 'Tutti'
      },
      available: {
        de: 'Verfügbar',
        da: 'Tilgængelig',
        en: 'Available',
        tr: 'Mevcut',
        it: 'Disponibile'
      },
      unavailable: {
        de: 'Nicht verfügbar',
        da: 'Ikke tilgængelig',
        en: 'Unavailable',
        tr: 'Mevcut değil',
        it: 'Non disponibile'
      },
      advancedFilters: {
        de: 'Erweiterte Filter',
        da: 'Avancerede filtre',
        en: 'Advanced Filters',
        tr: 'Gelişmiş Filtreler',
        it: 'Filtri Avanzati'
      },
      category: {
        de: 'Kategorie',
        da: 'Kategori',
        en: 'Category',
        tr: 'Kategori',
        it: 'Categoria'
      },
      brand: {
        de: 'Marke',
        da: 'Mærke',
        en: 'Brand',
        tr: 'Marka',
        it: 'Marca'
      },
      priceRange: {
        de: 'Preisbereich',
        da: 'Prisinterval',
        en: 'Price Range',
        tr: 'Fiyat Aralığı',
        it: 'Fascia di Prezzo'
      },
      availability: {
        de: 'Verfügbarkeit',
        da: 'Tilgængelighed',
        en: 'Availability',
        tr: 'Mevcudiyet',
        it: 'Disponibilità'
      },
      dietary: {
        de: 'Ernährung',
        da: 'Kost',
        en: 'Dietary',
        tr: 'Diyet',
        it: 'Dietetico'
      },
      vegetarian: {
        de: 'Vegetarisch',
        da: 'Vegetarisk',
        en: 'Vegetarian',
        tr: 'Vejetaryen',
        it: 'Vegetariano'
      },
      vegan: {
        de: 'Vegan',
        da: 'Vegansk',
        en: 'Vegan',
        tr: 'Vegan',
        it: 'Vegano'
      },
      glutenFree: {
        de: 'Glutenfrei',
        da: 'Glutenfri',
        en: 'Gluten Free',
        tr: 'Glutensiz',
        it: 'Senza Glutine'
      },
      badges: {
        de: 'Kennzeichnung',
        da: 'Mærkater',
        en: 'Badges',
        tr: 'Rozetler',
        it: 'Distintivi'
      },
      new: {
        de: 'Neu',
        da: 'Ny',
        en: 'New',
        tr: 'Yeni',
        it: 'Nuovo'
      },
      popular: {
        de: 'Beliebt',
        da: 'Populær',
        en: 'Popular',
        tr: 'Popüler',
        it: 'Popolare'
      },
      limited: {
        de: 'Begrenzt',
        da: 'Begrænset',
        en: 'Limited',
        tr: 'Sınırlı',
        it: 'Limitato'
      },
      clearFilters: {
        de: 'Filter zurücksetzen',
        da: 'Ryd filtre',
        en: 'Clear Filters',
        tr: 'Filtreleri Temizle',
        it: 'Cancella Filtri'
      },
      resultsFound: {
        de: 'Ergebnisse gefunden',
        da: 'resultater fundet',
        en: 'results found',
        tr: 'sonuç bulundu',
        it: 'risultati trovati'
      },
      minPrice: {
        de: 'Min. Preis',
        da: 'Min. pris',
        en: 'Min. price',
        tr: 'Min. fiyat',
        it: 'Prezzo min.'
      },
      maxPrice: {
        de: 'Max. Preis',
        da: 'Max. pris',
        en: 'Max. price',
        tr: 'Max. fiyat',
        it: 'Prezzo max.'
      }
    };
    
    return texts[key]?.[language] || texts[key]?.de || key;
  };

  /**
   * Quick filter options
   */
  const quickFilters = [
    { key: 'all', label: getText('all'), filter: {} },
    { key: 'available', label: getText('available'), filter: { availability: 'available' as const } },
    { key: 'vegetarian', label: getText('vegetarian'), filter: { dietary: { vegetarian: true } } },
    { key: 'new', label: getText('new'), filter: { badges: { neu: true } } },
    { key: 'popular', label: getText('popular'), filter: { badges: { beliebt: true } } }
  ];

  /**
   * Handle search change
   */
  const handleSearchChange = useCallback((query: string) => {
    onFiltersChange({
      ...filters,
      searchQuery: query
    });
  }, [filters, onFiltersChange]);

  /**
   * Handle quick filter click
   */
  const handleQuickFilter = useCallback((filter: Partial<FilterOptions>) => {
    if (Object.keys(filter).length === 0) {
      // Clear all filters
      onFiltersChange({
        searchQuery: filters.searchQuery // Keep search query
      });
    } else {
      onFiltersChange({
        ...filters,
        ...filter
      });
    }
  }, [filters, onFiltersChange]);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  /**
   * Handle price range change
   */
  const handlePriceRangeChange = useCallback(() => {
    const min = localPriceRange.min ? parseFloat(localPriceRange.min) : undefined;
    const max = localPriceRange.max ? parseFloat(localPriceRange.max) : undefined;
    
    handleFilterChange('priceRange', {
      min: !isNaN(min!) ? min : undefined,
      max: !isNaN(max!) ? max : undefined
    });
  }, [localPriceRange, handleFilterChange]);

  /**
   * Handle price input change with debounce
   */
  useEffect(() => {
    const timeoutId = setTimeout(handlePriceRangeChange, 500);
    return () => clearTimeout(timeoutId);
  }, [localPriceRange, handlePriceRangeChange]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setLocalPriceRange({ min: '', max: '' });
    onFiltersChange({ searchQuery: '' });
  }, [onFiltersChange]);

  /**
   * Check if quick filter is active
   */
  const isQuickFilterActive = (filter: Partial<FilterOptions>) => {
    if (Object.keys(filter).length === 0) {
      // "All" filter is active if no special filters are set
      return !filters.availability && 
             !filters.dietary?.vegetarian &&
             !filters.badges?.neu &&
             !filters.badges?.beliebt;
    }
    
    return Object.entries(filter).every(([key, value]) => {
      const filterValue = filters[key as keyof FilterOptions];
      return JSON.stringify(filterValue) === JSON.stringify(value);
    });
  };

  /**
   * Animation variants
   */
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <FiltersContainer
      className={className}
      data-testid={testId}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Search Bar */}
      {showSearchBar && (
        <SearchContainer>
          <SearchBar
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder || getText('search')}
            language={language}
            debounceDelay={searchDebounce}
            showClear
            autoFocus={false}
          />
        </SearchContainer>
      )}


      {/* Advanced Filters Toggle */}
      {showAdvancedFilters && (
        <motion.div style={{ textAlign: 'center' }} variants={itemVariants}>
          <AdvancedFiltersToggle
            onClick={() => setShowAdvanced(!showAdvanced)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {getText('advancedFilters')}
            <span style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
              ▼
            </span>
          </AdvancedFiltersToggle>
        </motion.div>
      )}

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <AdvancedFiltersPanel
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <FilterSection>
                <FilterLabel>{getText('category')}</FilterLabel>
                <FilterSelect
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                >
                  <option value="">{getText('all')}</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </FilterSelect>
              </FilterSection>
            )}

            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <FilterSection>
                <FilterLabel>{getText('brand')}</FilterLabel>
                <FilterSelect
                  value={filters.brand || ''}
                  onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
                >
                  <option value="">{getText('all')}</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </FilterSelect>
              </FilterSection>
            )}

            {/* Price Range */}
            <FilterSection>
              <FilterLabel>{getText('priceRange')}</FilterLabel>
              <PriceRangeContainer>
                <PriceInput
                  type="number"
                  placeholder={getText('minPrice')}
                  value={localPriceRange.min}
                  onChange={(e) => setLocalPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  min="0"
                  step="0.1"
                />
                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>-</span>
                <PriceInput
                  type="number"
                  placeholder={getText('maxPrice')}
                  value={localPriceRange.max}
                  onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  min="0"
                  step="0.1"
                />
              </PriceRangeContainer>
            </FilterSection>

            {/* Availability Filter */}
            <FilterSection>
              <FilterLabel>{getText('availability')}</FilterLabel>
              <FilterSelect
                value={filters.availability || 'all'}
                onChange={(e) => handleFilterChange('availability', e.target.value === 'all' ? undefined : e.target.value)}
              >
                <option value="all">{getText('all')}</option>
                <option value="available">{getText('available')}</option>
                <option value="unavailable">{getText('unavailable')}</option>
              </FilterSelect>
            </FilterSection>

            {/* Dietary Filters */}
            <FilterSection>
              <FilterLabel>{getText('dietary')}</FilterLabel>
              <CheckboxContainer>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={filters.dietary?.vegetarian || false}
                    onChange={(e) => handleFilterChange('dietary', {
                      ...filters.dietary,
                      vegetarian: e.target.checked || undefined
                    })}
                  />
                  {getText('vegetarian')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={filters.dietary?.vegan || false}
                    onChange={(e) => handleFilterChange('dietary', {
                      ...filters.dietary,
                      vegan: e.target.checked || undefined
                    })}
                  />
                  {getText('vegan')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={filters.dietary?.glutenFree || false}
                    onChange={(e) => handleFilterChange('dietary', {
                      ...filters.dietary,
                      glutenFree: e.target.checked || undefined
                    })}
                  />
                  {getText('glutenFree')}
                </CheckboxLabel>
              </CheckboxContainer>
            </FilterSection>

            {/* Badge Filters */}
            <FilterSection>
              <FilterLabel>{getText('badges')}</FilterLabel>
              <CheckboxContainer>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={filters.badges?.neu || false}
                    onChange={(e) => handleFilterChange('badges', {
                      ...filters.badges,
                      neu: e.target.checked || undefined
                    })}
                  />
                  {getText('new')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={filters.badges?.beliebt || false}
                    onChange={(e) => handleFilterChange('badges', {
                      ...filters.badges,
                      beliebt: e.target.checked || undefined
                    })}
                  />
                  {getText('popular')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={filters.badges?.kurze_zeit || false}
                    onChange={(e) => handleFilterChange('badges', {
                      ...filters.badges,
                      kurze_zeit: e.target.checked || undefined
                    })}
                  />
                  {getText('limited')}
                </CheckboxLabel>
              </CheckboxContainer>
            </FilterSection>

            {/* Clear Filters Button */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <ClearFiltersButton
                onClick={clearFilters}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {getText('clearFilters')}
              </ClearFiltersButton>
            </div>
          </AdvancedFiltersPanel>
        )}
      </AnimatePresence>

    </FiltersContainer>
  );
});

/**
 * Default export
 */
export default MenuFilters;