/**
 * Product list component with display and filtering
 * Manages the grid display of products with comprehensive filtering
 */

import React, { memo, useState, useMemo } from 'react';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { Product } from '../../types/product.types';
import { Category } from '../../types/product.types';
import { ProductFilters as IProductFilters, ProductSortOptions } from '../../types/product.types';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import ProductPagination from './ProductPagination';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onToggleAvailability: (product: Product) => void;
  onToggleBadge: (product: Product, badgeType: 'neu' | 'kurze_zeit' | 'beliebt') => void;
  onTranslateProduct: (product: Product, field: 'name' | 'description') => void;
  onAssignCategory: (product: Product, categoryId: string | null) => void;
  getProductName: (nameObj: any) => string;
  getProductDescription: (descObj: any) => string;
  renderPrice: (product: Product) => string;
  isLoading?: boolean;
}

const ListContainer = styled.div`
  width: 100%;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  min-height: 400px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.6);
`;

const EmptyStateTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.5rem;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const EmptyStateMessage = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  max-width: 400px;
`;

const ProductList: React.FC<ProductListProps> = memo(({
  products,
  categories,
  onEditProduct,
  onDeleteProduct,
  onToggleAvailability,
  onToggleBadge,
  onTranslateProduct,
  onAssignCategory,
  getProductName,
  getProductDescription,
  renderPrice,
  isLoading = false
}) => {
  const { language } = useLanguage();

  // Create flat list of all categories (main + subcategories) for ProductCard lookup
  const flatCategories = useMemo(() => {
    const flat: Category[] = [];
    categories.forEach(cat => {
      flat.push(cat); // Add main category
      if (cat.subcategories) {
        flat.push(...cat.subcategories); // Add its subcategories
      }
    });
    return flat;
  }, [categories]);

  // Local state for filtering and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState<IProductFilters>({});
  const [sortOptions, setSortOptions] = useState<ProductSortOptions>({
    field: 'name',
    direction: 'asc',
    language: language as 'de' | 'da' | 'en'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Memoized filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(product => {
        const productName = String(getProductName(product.name) || '').toLowerCase();
        const productDesc = String(getProductDescription(product.description) || '').toLowerCase();
        const searchText = `${productName} ${productDesc} ${product.brand || ''}`.toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      });
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'unassigned') {
        // Show products with no categoryId (unassigned)
        result = result.filter(product => !product.categoryId);
      } else {
        // Show products assigned to specific category
        result = result.filter(product => product.categoryId === selectedCategory);
      }
    }

    // Apply advanced filters
    if (filters.available !== undefined) {
      result = result.filter(product => product.available === filters.available);
    }

    if (filters.brand) {
      result = result.filter(product => product.brand === filters.brand);
    }

    if (filters.priceRange) {
      result = result.filter(product => {
        const price = product.price || 0;
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }

    if (filters.badges) {
      result = result.filter(product => {
        if (!product.badges) return false;
        return Object.entries(filters.badges!).some(([badge, value]) => 
          value && product.badges![badge as keyof typeof product.badges]
        );
      });
    }

    if (filters.type) {
      result = result.filter(product => {
        // Determine product type based on category or other properties
        if (filters.type === 'tobacco') {
          return product.categoryId?.includes('shisha') || product.brand;
        }
        if (filters.type === 'drink') {
          return product.categoryId?.includes('drink') || product.categoryId?.includes('getraenke');
        }
        if (filters.type === 'food') {
          return product.categoryId?.includes('food') || product.categoryId?.includes('snack');
        }
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortOptions.field) {
        case 'name':
          aValue = String(getProductName(a.name) || '').toLowerCase();
          bValue = String(getProductName(b.name) || '').toLowerCase();
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'brand':
          aValue = a.brand || '';
          bValue = b.brand || '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || '').getTime();
          bValue = new Date(b.createdAt || '').getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt || '').getTime();
          bValue = new Date(b.updatedAt || '').getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    products, 
    searchQuery, 
    selectedCategory, 
    filters, 
    sortOptions, 
    getProductName, 
    getProductDescription
  ]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, endIndex);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  // Total pages calculation
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, filters, sortOptions]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleFiltersChange = (newFilters: IProductFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sort: ProductSortOptions) => {
    setSortOptions(sort);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  if (isLoading) {
    return (
      <ListContainer>
        <LoadingContainer>
          Loading products...
        </LoadingContainer>
      </ListContainer>
    );
  }

  // Debug logging removed for performance
  
  return (
    <ListContainer>
      <ProductFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        categories={categories}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        totalProducts={products.length}
        filteredCount={filteredAndSortedProducts.length}
      />

      {filteredAndSortedProducts.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>No Products Found</EmptyStateTitle>
          <EmptyStateMessage>
            {searchQuery || selectedCategory !== 'all' || Object.keys(filters).length > 0
              ? 'No products match your current filters. Try adjusting your search criteria.'
              : 'No products available. Add some products to get started.'
            }
          </EmptyStateMessage>
        </EmptyState>
      ) : (
        <>
          <ProductsGrid>
            <AnimatePresence mode="popLayout">
              {paginatedProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  categories={flatCategories}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                  onToggleAvailability={onToggleAvailability}
                  onToggleBadge={onToggleBadge}
                  onTranslate={onTranslateProduct}
                  onAssignCategory={onAssignCategory}
                  getProductName={getProductName}
                  getProductDescription={getProductDescription}
                  renderPrice={renderPrice}
                />
              ))}
            </AnimatePresence>
          </ProductsGrid>

          {totalPages > 1 && (
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredAndSortedProducts.length}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </>
      )}
    </ListContainer>
  );
});

ProductList.displayName = 'ProductList';

export default ProductList;