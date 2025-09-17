/**
 * Product search and filtering controls component
 * Provides filtering, sorting, and search functionality
 */

import React, { memo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import { ProductFilters as IProductFilters, ProductSortOptions } from '../../types/product.types';
import { Category } from '../../types/product.types';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProductFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  categories: Category[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onFiltersChange: (filters: IProductFilters) => void;
  onSortChange: (sort: ProductSortOptions) => void;
  totalProducts: number;
  filteredCount: number;
}

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 10px;
  color: white;
  font-family: 'Aldrich', sans-serif;

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 15px rgba(255, 65, 251, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 65, 251, 0.7);
`;

const FilterSelect = styled.select`
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 10px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #FF41FB;
  }

  option {
    background: #1a1a1a;
    color: white;
  }
`;

const AdvancedFiltersToggle = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: rgba(255, 65, 251, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 10px;
  color: #FF41FB;
  font-family: 'Aldrich', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 65, 251, 0.2);
    border-color: #FF41FB;
  }
`;

const AdvancedFilters = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  padding: 20px;
  background: rgba(255, 65, 251, 0.05);
  border: 2px solid rgba(255, 65, 251, 0.2);
  border-radius: 10px;
  margin-top: 10px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-family: 'Aldrich', sans-serif;
  color: #FF41FB;
  font-size: 0.9rem;
  text-transform: uppercase;
`;

const PriceRangeContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const PriceInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 8px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #FF41FB;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  cursor: pointer;
  
  input[type="checkbox"] {
    accent-color: #FF41FB;
  }
`;

const ResultsInfo = styled.div`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const ClearFiltersButton = styled.button`
  padding: 8px 15px;
  background: transparent;
  border: 2px solid rgba(244, 67, 54, 0.5);
  border-radius: 8px;
  color: #f44336;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(244, 67, 54, 0.1);
    border-color: #f44336;
  }
`;

const ProductFilters: React.FC<ProductFiltersProps> = memo(({
  searchQuery,
  selectedCategory,
  categories,
  onSearchChange,
  onCategoryChange,
  onFiltersChange,
  onSortChange,
  totalProducts,
  filteredCount
}) => {
  const { language } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<IProductFilters>({
    categoryId: selectedCategory,
    searchQuery: searchQuery
  });
  const [sortOptions, setSortOptions] = useState<ProductSortOptions>({
    field: 'name',
    direction: 'asc',
    language: language as 'de' | 'da' | 'en'
  });

  const getCategoryName = useCallback((cat: Category): string => {
    if (typeof cat.name === 'string') return cat.name;
    return cat.name[language] || cat.name['de'] || String(cat.name);
  }, [language]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onSearchChange(query);
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, [onSearchChange]);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    onCategoryChange(categoryId);
    setFilters(prev => ({ ...prev, categoryId: categoryId === 'all' ? undefined : categoryId }));
  }, [onCategoryChange]);

  const handleSortChange = useCallback((field: string, direction?: 'asc' | 'desc') => {
    const newSort: ProductSortOptions = {
      field: field as ProductSortOptions['field'],
      direction: direction || (sortOptions.direction === 'asc' ? 'desc' : 'asc'),
      language: language as 'de' | 'da' | 'en'
    };
    setSortOptions(newSort);
    onSortChange(newSort);
  }, [sortOptions.direction, language, onSortChange]);

  const handleAdvancedFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handlePriceRangeChange = useCallback((type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0;
    const priceRange = filters.priceRange || { min: 0, max: 100 };
    const newRange = { ...priceRange, [type]: numValue };
    handleAdvancedFilterChange('priceRange', newRange);
  }, [filters.priceRange, handleAdvancedFilterChange]);

  const handleBadgeFilterChange = useCallback((badge: string, checked: boolean) => {
    const badges = filters.badges || {};
    const newBadges = { ...badges, [badge]: checked };
    handleAdvancedFilterChange('badges', newBadges);
  }, [filters.badges, handleAdvancedFilterChange]);

  const clearFilters = useCallback(() => {
    const clearedFilters: IProductFilters = {
      categoryId: undefined,
      searchQuery: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onSearchChange('');
    onCategoryChange('all');
  }, [onFiltersChange, onSearchChange, onCategoryChange]);

  return (
    <FiltersContainer>
      <FiltersRow>
        <SearchBox>
          <SearchInput
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <SearchIcon />
        </SearchBox>
        
        <FilterSelect
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="all">All Categories</option>
          <option value="unassigned">Nicht zugeordnet</option>
          {(() => {
            const filteredCats = categories.filter(cat => !cat.isMainCategory);
            console.log('ProductFilters - Rendering categories:', categories);
            console.log('ProductFilters - Filtered subcategories:', filteredCats);
            return filteredCats.map(cat => (
              <option key={cat.id} value={cat.id}>
                {getCategoryName(cat)}
              </option>
            ));
          })()}
        </FilterSelect>

        <FilterSelect
          value={`${sortOptions.field}-${sortOptions.direction}`}
          onChange={(e) => {
            const [field, direction] = e.target.value.split('-');
            handleSortChange(field, direction as 'asc' | 'desc');
          }}
        >
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="price-asc">Price Low-High</option>
          <option value="price-desc">Price High-Low</option>
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
        </FilterSelect>

        <AdvancedFiltersToggle
          onClick={() => setShowAdvanced(!showAdvanced)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaFilter />
          Advanced
        </AdvancedFiltersToggle>

        <ResultsInfo>
          Showing {filteredCount} of {totalProducts} products
        </ResultsInfo>

        {(filters.searchQuery || filters.categoryId || filters.priceRange || filters.badges || filters.available !== undefined) && (
          <ClearFiltersButton onClick={clearFilters}>
            Clear Filters
          </ClearFiltersButton>
        )}
      </FiltersRow>

      {showAdvanced && (
        <AdvancedFilters
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FilterGroup>
            <FilterLabel>Price Range (€)</FilterLabel>
            <PriceRangeContainer>
              <PriceInput
                type="number"
                placeholder="Min"
                value={filters.priceRange?.min || ''}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              />
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>-</span>
              <PriceInput
                type="number"
                placeholder="Max"
                value={filters.priceRange?.max || ''}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              />
            </PriceRangeContainer>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Availability</FilterLabel>
            <FilterSelect
              value={filters.available === undefined ? 'all' : filters.available ? 'available' : 'unavailable'}
              onChange={(e) => {
                const value = e.target.value;
                const available = value === 'all' ? undefined : value === 'available';
                handleAdvancedFilterChange('available', available);
              }}
            >
              <option value="all">All Products</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Badges</FilterLabel>
            <CheckboxGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={filters.badges?.neu || false}
                  onChange={(e) => handleBadgeFilterChange('neu', e.target.checked)}
                />
                🟢 New Products
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={filters.badges?.kurze_zeit || false}
                  onChange={(e) => handleBadgeFilterChange('kurze_zeit', e.target.checked)}
                />
                🟠 Limited Time
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={filters.badges?.beliebt || false}
                  onChange={(e) => handleBadgeFilterChange('beliebt', e.target.checked)}
                />
                🔴 Popular
              </CheckboxLabel>
            </CheckboxGroup>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Product Type</FilterLabel>
            <FilterSelect
              value={filters.type || 'all'}
              onChange={(e) => {
                const type = e.target.value === 'all' ? undefined : e.target.value;
                handleAdvancedFilterChange('type', type);
              }}
            >
              <option value="all">All Types</option>
              <option value="drink">Drinks</option>
              <option value="food">Food</option>
              <option value="tobacco">Tobacco</option>
              <option value="other">Other</option>
            </FilterSelect>
          </FilterGroup>
        </AdvancedFilters>
      )}
    </FiltersContainer>
  );
});

ProductFilters.displayName = 'ProductFilters';

export default ProductFilters;