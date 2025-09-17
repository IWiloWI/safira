/**
 * Individual product card component
 * Displays product information with interactive controls
 */

import React, { memo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaLanguage,
  FaTag
} from 'react-icons/fa';
import { Product, Category } from '../../types/product.types';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProductCardProps {
  product: Product;
  index: number;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleAvailability: (product: Product) => void;
  onToggleBadge: (product: Product, badgeType: 'neu' | 'kurze_zeit' | 'beliebt') => void;
  onTranslate: (product: Product, field: 'name' | 'description') => void;
  onAssignCategory: (product: Product, categoryId: string | null) => void;
  getProductName: (nameObj: any) => string;
  getProductDescription: (descObj: any) => string;
  renderPrice: (product: Product) => string;
}

const Card = styled(motion.div)`
  background: rgba(255, 65, 251, 0.08);
  border: 2px solid rgba(255, 65, 251, 0.2);
  border-radius: 15px;
  padding: 20px;
  position: relative;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 65, 251, 0.4);
    box-shadow: 0 10px 30px rgba(255, 65, 251, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.3rem;
  color: #FF41FB;
  margin-bottom: 5px;
  text-transform: uppercase;
  line-height: 1.2;
`;

const ProductCategory = styled.span`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
  text-transform: capitalize;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const ActionButton = styled.button<{ $variant?: 'danger' | 'translate' }>`
  background: ${props => {
    if (props.$variant === 'danger') return 'rgba(244, 67, 54, 0.2)';
    if (props.$variant === 'translate') return 'rgba(255, 107, 53, 0.2)';
    return 'rgba(255, 65, 251, 0.2)';
  }};
  border: 1px solid ${props => {
    if (props.$variant === 'danger') return 'rgba(244, 67, 54, 0.5)';
    if (props.$variant === 'translate') return 'rgba(255, 107, 53, 0.5)';
    return 'rgba(255, 65, 251, 0.5)';
  }};
  border-radius: 8px;
  color: ${props => {
    if (props.$variant === 'danger') return '#f44336';
    if (props.$variant === 'translate') return '#FF6B35';
    return '#FF41FB';
  }};
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => {
      if (props.$variant === 'danger') return 'rgba(244, 67, 54, 0.3)';
      if (props.$variant === 'translate') return 'rgba(255, 107, 53, 0.3)';
      return 'rgba(255, 65, 251, 0.3)';
    }};
    transform: translateY(-2px);
  }
`;

const ProductPrice = styled.div`
  font-family: 'Oswald', sans-serif;
  font-size: 1.2rem;
  font-weight: 800;
  color: #FF41FB;
  margin: 10px 0;
`;

const ProductDescription = styled.p`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  margin: 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
`;

const BadgeToggle = styled.button<{ $badgeType: 'neu' | 'kurze_zeit' | 'beliebt'; $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${props => {
    if (!props.$active) return 'rgba(244, 67, 54, 0.2)';
    switch (props.$badgeType) {
      case 'neu': return 'rgba(76, 175, 80, 0.2)';
      case 'kurze_zeit': return 'rgba(255, 152, 0, 0.2)';
      case 'beliebt': return 'rgba(233, 30, 99, 0.2)';
      default: return 'rgba(76, 175, 80, 0.2)';
    }
  }};
  border: 1px solid ${props => {
    if (!props.$active) return 'rgba(244, 67, 54, 0.5)';
    switch (props.$badgeType) {
      case 'neu': return 'rgba(76, 175, 80, 0.5)';
      case 'kurze_zeit': return 'rgba(255, 152, 0, 0.5)';
      case 'beliebt': return 'rgba(233, 30, 99, 0.5)';
      default: return 'rgba(76, 175, 80, 0.5)';
    }
  }};
  border-radius: 20px;
  color: ${props => {
    if (!props.$active) return '#f44336';
    switch (props.$badgeType) {
      case 'neu': return '#4CAF50';
      case 'kurze_zeit': return '#FF9800';
      case 'beliebt': return '#E91E63';
      default: return '#4CAF50';
    }
  }};
  padding: 6px 12px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => {
      if (!props.$active) return 'rgba(244, 67, 54, 0.3)';
      switch (props.$badgeType) {
        case 'neu': return 'rgba(76, 175, 80, 0.3)';
        case 'kurze_zeit': return 'rgba(255, 152, 0, 0.3)';
        case 'beliebt': return 'rgba(233, 30, 99, 0.3)';
        default: return 'rgba(76, 175, 80, 0.3)';
      }
    }};
    transform: scale(1.05);
  }
`;

const AvailabilityToggle = styled.button<{ $available: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${props => props.$available 
    ? 'rgba(76, 175, 80, 0.2)' 
    : 'rgba(244, 67, 54, 0.2)'};
  border: 1px solid ${props => props.$available 
    ? 'rgba(76, 175, 80, 0.5)' 
    : 'rgba(244, 67, 54, 0.5)'};
  border-radius: 20px;
  color: ${props => props.$available ? '#4CAF50' : '#f44336'};
  padding: 8px 12px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    background: ${props => props.$available 
      ? 'rgba(76, 175, 80, 0.3)' 
      : 'rgba(244, 67, 54, 0.3)'};
    transform: scale(1.05);
  }
`;

const BrandBadge = styled.span`
  display: inline-block;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.5);
  color: #4CAF50;
  padding: 4px 8px;
  border-radius: 12px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.7rem;
  margin-top: 5px;
`;

const CategorySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  padding: 10px;
  background: rgba(255, 65, 251, 0.05);
  border: 1px solid rgba(255, 65, 251, 0.2);
  border-radius: 8px;
`;

const CategorySelect = styled.select`
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 65, 251, 0.3);
  border-radius: 6px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 10px rgba(255, 65, 251, 0.3);
  }

  option {
    background: #1a1a1a;
    color: white;
  }
`;

const CategoryLabel = styled.span`
  font-family: 'Aldrich', sans-serif;
  color: #FF41FB;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ProductCard = memo(React.forwardRef<HTMLDivElement, ProductCardProps>(({
  product,
  index,
  categories,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleBadge,
  onTranslate,
  onAssignCategory,
  getProductName,
  getProductDescription,
  renderPrice
}, ref) => {
  const { t } = useLanguage();

  const handleBadgeToggle = (badgeType: 'neu' | 'kurze_zeit' | 'beliebt') => {
    onToggleBadge(product, badgeType);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = event.target.value;
    onAssignCategory(product, categoryId === 'unassigned' ? null : categoryId);
  };

  const getCategoryName = (category: Category): string => {
    if (typeof category.name === 'string') return category.name;
    return category.name.de || category.name.en || 'Unknown Category';
  };

  const productDescription = getProductDescription(product.description);

  return (
    <Card
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <BadgesContainer>
        <BadgeToggle
          $badgeType="neu"
          $active={product.badges?.neu || false}
          onClick={() => handleBadgeToggle('neu')}
          title={`Toggle ${t('product.badges.neu')} badge`}
        >
          <FaEye style={{ opacity: product.badges?.neu ? 1 : 0.5 }} />
          {t('product.badges.neu')}
        </BadgeToggle>
        <BadgeToggle
          $badgeType="kurze_zeit"
          $active={product.badges?.kurze_zeit || false}
          onClick={() => handleBadgeToggle('kurze_zeit')}
          title={`Toggle ${t('product.badges.kurze_zeit')} badge`}
        >
          <FaEye style={{ opacity: product.badges?.kurze_zeit ? 1 : 0.5 }} />
          {t('product.badges.kurze_zeit')}
        </BadgeToggle>
        <BadgeToggle
          $badgeType="beliebt"
          $active={product.badges?.beliebt || false}
          onClick={() => handleBadgeToggle('beliebt')}
          title={`Toggle ${t('product.badges.beliebt')} badge`}
        >
          <FaEye style={{ opacity: product.badges?.beliebt ? 1 : 0.5 }} />
          {t('product.badges.beliebt')}
        </BadgeToggle>
      </BadgesContainer>

      <CardHeader>
        <ProductInfo>
          <ProductName>{getProductName(product.name)}</ProductName>
          <ProductCategory>
            {product.categoryId ? 
              (() => {
                const category = categories.find(cat => cat.id === product.categoryId);
                return category ? getCategoryName(category) : product.categoryId?.replace('-', ' ') || 'Unbekannte Kategorie';
              })()
              : 'Nicht zugeordnet'
            }
          </ProductCategory>
          {product.brand && (
            <BrandBadge>{product.brand}</BrandBadge>
          )}
        </ProductInfo>
        
        <ProductActions>
          <ActionButton 
            onClick={() => onTranslate(product, 'name')}
            title="Translate name"
          >
            <FaLanguage />
          </ActionButton>
          <ActionButton 
            $variant="translate"
            onClick={() => onTranslate(product, 'description')}
            title="Translate description"
          >
            <FaLanguage />
          </ActionButton>
          <ActionButton 
            onClick={() => onEdit(product)}
            title="Edit product"
          >
            <FaEdit />
          </ActionButton>
          <ActionButton 
            $variant="danger"
            onClick={() => onDelete(product)}
            title="Delete product"
          >
            <FaTrash />
          </ActionButton>
        </ProductActions>
      </CardHeader>

      {productDescription && (
        <ProductDescription title={productDescription}>
          {productDescription}
        </ProductDescription>
      )}

      <CategorySelector>
        <CategoryLabel>
          <FaTag />
          Kategorie:
        </CategoryLabel>
        <CategorySelect 
          value={product.categoryId || 'unassigned'} 
          onChange={handleCategoryChange}
        >
          <option value="unassigned">Nicht zugeordnet</option>
          {categories
            .filter(cat => !cat.isMainCategory) // Only show subcategories
            .map(cat => (
              <option key={cat.id} value={cat.id}>
                {getCategoryName(cat)}
              </option>
            ))}
        </CategorySelect>
      </CategorySelector>

      <ProductPrice>{renderPrice(product)}</ProductPrice>

      <AvailabilityToggle
        $available={product.available}
        onClick={() => onToggleAvailability(product)}
        title={`Toggle availability: ${product.available ? 'Available' : 'Unavailable'}`}
      >
        {product.available ? <FaEye /> : <FaEyeSlash />}
        {product.available ? 'Available' : 'Unavailable'}
      </AvailabilityToggle>
    </Card>
  );
}));

ProductCard.displayName = 'ProductCard';

export default ProductCard;