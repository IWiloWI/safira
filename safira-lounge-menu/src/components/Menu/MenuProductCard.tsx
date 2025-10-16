/**
 * Menu Product Card Component
 * Simple list item matching original HTML structure
 */

import React from 'react';
import styled from 'styled-components';
import { Product, Language } from '../../types';
import { MultilingualHelpers } from '../../types';

// Simple list item styles matching original HTML
const ProductListItem = styled.div`
  opacity: 1;
  transform: none;
  transform-origin: 50% 50% 0px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    margin-bottom: 8px;
  }
`;

const ProductContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    margin-bottom: 3px;
    gap: 4px;
  }
`;

const ProductNameContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
`;

const ProductName = styled.h3`
  font-family: 'Aldrich', sans-serif;
  color: white;
  margin: 0;
  font-size: 1.1rem;
  font-weight: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ProductPrice = styled.div`
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 1.2rem;
  margin-left: 20px;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-left: 8px;
  }
`;

const ProductDescription = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin-top: 5px;
  font-family: 'Aldrich', sans-serif;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    margin-top: 2px;
  }
`;

const BadgesContainer = styled.div`
  display: inline-flex;
  gap: 6px;
  margin-left: 12px;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    gap: 4px;
    margin-left: 6px;
  }
`;

const Badge = styled.span<{ $type: 'neu' | 'beliebt' | 'kurze_zeit' }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.6rem;
  font-family: 'Aldrich', sans-serif;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  position: relative;
  overflow: hidden;
  border: 1px solid;
  backdrop-filter: blur(4px);

  @media (max-width: 768px) {
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 0.5rem;
    letter-spacing: 0.5px;
  }

  ${props => {
    switch (props.$type) {
      case 'neu':
        return `
          background: rgba(76, 175, 80, 0.2);
          color: #4CAF50;
          border-color: #4CAF50;
          box-shadow:
            0 0 10px rgba(76, 175, 80, 0.6),
            0 0 20px rgba(76, 175, 80, 0.4),
            inset 0 0 10px rgba(76, 175, 80, 0.1);
          text-shadow: 0 0 8px rgba(76, 175, 80, 0.8);
          animation: ledGlowGreen 4s ease-in-out infinite both;

          @keyframes ledGlowGreen {
            0%, 100% {
              box-shadow:
                0 0 8px rgba(76, 175, 80, 0.4),
                0 0 16px rgba(76, 175, 80, 0.2),
                inset 0 0 8px rgba(76, 175, 80, 0.08);
              opacity: 0.88;
            }
            20% {
              box-shadow:
                0 0 9px rgba(76, 175, 80, 0.5),
                0 0 18px rgba(76, 175, 80, 0.3),
                0 0 24px rgba(76, 175, 80, 0.15),
                inset 0 0 9px rgba(76, 175, 80, 0.1);
              opacity: 0.93;
            }
            50% {
              box-shadow:
                0 0 12px rgba(76, 175, 80, 0.7),
                0 0 24px rgba(76, 175, 80, 0.5),
                0 0 36px rgba(76, 175, 80, 0.3),
                inset 0 0 12px rgba(76, 175, 80, 0.15);
              opacity: 1;
            }
            80% {
              box-shadow:
                0 0 9px rgba(76, 175, 80, 0.5),
                0 0 18px rgba(76, 175, 80, 0.3),
                0 0 24px rgba(76, 175, 80, 0.15),
                inset 0 0 9px rgba(76, 175, 80, 0.1);
              opacity: 0.93;
            }
          }
        `;
      case 'beliebt':
        return `
          background: rgba(255, 107, 53, 0.2);
          color: #FF6B35;
          border-color: #FF6B35;
          box-shadow:
            0 0 10px rgba(255, 107, 53, 0.6),
            0 0 20px rgba(255, 107, 53, 0.4),
            inset 0 0 10px rgba(255, 107, 53, 0.1);
          text-shadow: 0 0 8px rgba(255, 107, 53, 0.8);
          animation: ledGlowOrange 4s ease-in-out infinite both;

          @keyframes ledGlowOrange {
            0%, 100% {
              box-shadow:
                0 0 8px rgba(255, 107, 53, 0.4),
                0 0 16px rgba(255, 107, 53, 0.2),
                inset 0 0 8px rgba(255, 107, 53, 0.08);
              opacity: 0.88;
            }
            20% {
              box-shadow:
                0 0 9px rgba(255, 107, 53, 0.5),
                0 0 18px rgba(255, 107, 53, 0.3),
                0 0 24px rgba(255, 107, 53, 0.15),
                inset 0 0 9px rgba(255, 107, 53, 0.1);
              opacity: 0.93;
            }
            50% {
              box-shadow:
                0 0 12px rgba(255, 107, 53, 0.7),
                0 0 24px rgba(255, 107, 53, 0.5),
                0 0 36px rgba(255, 107, 53, 0.3),
                inset 0 0 12px rgba(255, 107, 53, 0.15);
              opacity: 1;
            }
            80% {
              box-shadow:
                0 0 9px rgba(255, 107, 53, 0.5),
                0 0 18px rgba(255, 107, 53, 0.3),
                0 0 24px rgba(255, 107, 53, 0.15),
                inset 0 0 9px rgba(255, 107, 53, 0.1);
              opacity: 0.93;
            }
          }
        `;
      case 'kurze_zeit':
        return `
          background: rgba(255, 215, 0, 0.2);
          color: #FFD700;
          border-color: #FFD700;
          box-shadow:
            0 0 10px rgba(255, 215, 0, 0.6),
            0 0 20px rgba(255, 215, 0, 0.4),
            inset 0 0 10px rgba(255, 215, 0, 0.1);
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
          animation: ledGlowGold 4s ease-in-out infinite both;

          @keyframes ledGlowGold {
            0%, 100% {
              box-shadow:
                0 0 8px rgba(255, 215, 0, 0.4),
                0 0 16px rgba(255, 215, 0, 0.2),
                inset 0 0 8px rgba(255, 215, 0, 0.08);
              opacity: 0.88;
            }
            20% {
              box-shadow:
                0 0 9px rgba(255, 215, 0, 0.5),
                0 0 18px rgba(255, 215, 0, 0.3),
                0 0 24px rgba(255, 215, 0, 0.15),
                inset 0 0 9px rgba(255, 215, 0, 0.1);
              opacity: 0.93;
            }
            50% {
              box-shadow:
                0 0 12px rgba(255, 215, 0, 0.7),
                0 0 24px rgba(255, 215, 0, 0.5),
                0 0 36px rgba(255, 215, 0, 0.3),
                inset 0 0 12px rgba(255, 215, 0, 0.15);
              opacity: 1;
            }
            80% {
              box-shadow:
                0 0 9px rgba(255, 215, 0, 0.5),
                0 0 18px rgba(255, 215, 0, 0.3),
                0 0 24px rgba(255, 215, 0, 0.15),
                inset 0 0 9px rgba(255, 215, 0, 0.1);
              opacity: 0.93;
            }
          }
        `;
      default:
        return `
          background: rgba(150, 150, 150, 0.2);
          color: #999;
          border-color: #999;
          box-shadow:
            0 0 10px rgba(150, 150, 150, 0.6),
            0 0 20px rgba(150, 150, 150, 0.4);
        `;
    }
  }}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.8s ease;
  }

  &:hover {
    transform: scale(1.05);
    ${props => {
      switch (props.$type) {
        case 'neu':
          return `
            box-shadow:
              0 0 15px rgba(76, 175, 80, 0.8),
              0 0 30px rgba(76, 175, 80, 0.6),
              inset 0 0 15px rgba(76, 175, 80, 0.2);
          `;
        case 'beliebt':
          return `
            box-shadow:
              0 0 15px rgba(255, 107, 53, 0.8),
              0 0 30px rgba(255, 107, 53, 0.6),
              inset 0 0 15px rgba(255, 107, 53, 0.2);
          `;
        case 'kurze_zeit':
          return `
            box-shadow:
              0 0 15px rgba(255, 215, 0, 0.8),
              0 0 30px rgba(255, 215, 0, 0.6),
              inset 0 0 15px rgba(255, 215, 0, 0.2);
          `;
        default:
          return `
            box-shadow:
              0 0 15px rgba(150, 150, 150, 0.8),
              0 0 30px rgba(150, 150, 150, 0.6);
          `;
      }
    }}
  }

  &:hover::before {
    left: 100%;
  }
`;

const VariantsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 65, 251, 0.2);
`;

const VariantItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  padding: 4px 0;
`;

const VariantSize = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  font-size: 1rem;
`;

const VariantPrice = styled.span`
  color: rgba(255, 255, 255, 0.95);
  font-weight: 400;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-size: 1.2rem;
`;

const PriceRange = styled.span`
  color: #FF41FB;
  font-weight: 400;
  text-shadow: 0 0 8px rgba(255, 65, 251, 0.3);
  font-size: 1.2rem;
`;

const MenuItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  padding: 2px 0;

  &::before {
    content: '▸';
    color: #FF41FB;
    margin-right: 8px;
    font-size: 0.9rem;
  }
`;

// Component interfaces
export interface MenuProductCardProps {
  /** Product data */
  product: Product;
  /** Current language */
  language: Language;
  /** Click handler */
  onClick?: (product: Product) => void;
  /** Whether card is interactive */
  interactive?: boolean;
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Menu Product Card Component
 * Simple list item display matching original design
 */
export const MenuProductCard: React.FC<MenuProductCardProps> = React.memo(({
  product,
  language,
  onClick,
  interactive = true,
  className,
  testId = 'menu-product-card'
}) => {
  /**
   * Get product name in current language
   */
  const getProductName = () => {
    return MultilingualHelpers.getText(product.name, language);
  };

  /**
   * Get product description in current language
   */
  const getProductDescription = () => {
    if (!product.description) return '';
    return MultilingualHelpers.getText(product.description, language);
  };

  /**
   * Format price
   */
  const formatPrice = (price?: number) => {
    if (!price || price === 0) return '0.00 €';
    return `${price.toFixed(2)} €`;
  };

  /**
   * Check if product has multiple size variants
   */
  const hasMultipleSizes = () => {
    return product.sizes && product.sizes.length > 0;
  };

  /**
   * Get price display for variants
   * If variants exist, ignore main product price and only use variant prices
   */
  const getPriceDisplay = () => {
    if (hasMultipleSizes()) {
      // When variants exist, ONLY use variant prices (ignore main product price)
      const prices = product.sizes!.map(size => {
        const price = typeof size.price === 'number' ? size.price : parseFloat(size.price || '0');
        return price;
      }).filter(p => p > 0);

      // If no valid variant prices, show "Preis auf Anfrage"
      if (prices.length === 0) {
        return 'Preis auf Anfrage';
      }

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) {
        return formatPrice(minPrice);
      }
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    }

    // Only use main price if no variants exist
    return formatPrice(product.price);
  };

  /**
   * Get badge text in current language
   */
  const getBadgeText = (badgeType: 'neu' | 'beliebt' | 'kurze_zeit'): string => {
    const badgeTranslations = {
      neu: {
        de: 'NEU',
        en: 'NEW',
        da: 'NY',
        tr: 'YENİ',
        it: 'NUOVO'
      },
      beliebt: {
        de: 'BELIEBT',
        en: 'POPULAR',
        da: 'POPULÆR',
        tr: 'POPÜLER',
        it: 'POPOLARE'
      },
      kurze_zeit: {
        de: 'KURZE ZEIT',
        en: 'LIMITED TIME',
        da: 'BEGRÆNSET TID',
        tr: 'KISA SÜRESİNE',
        it: 'TEMPO LIMITATO'
      }
    };

    const translation = badgeTranslations[badgeType];
    return translation[language] || translation.de || badgeType.toUpperCase();
  };

  /**
   * Get badges to display
   */
  const getActiveBadges = () => {
    if (!product.badges) return [];

    const activeBadges: Array<{ type: 'neu' | 'beliebt' | 'kurze_zeit'; text: string }> = [];

    if (product.badges.neu) {
      activeBadges.push({ type: 'neu', text: getBadgeText('neu') });
    }
    if (product.badges.beliebt) {
      activeBadges.push({ type: 'beliebt', text: getBadgeText('beliebt') });
    }
    if (product.badges.kurze_zeit) {
      activeBadges.push({ type: 'kurze_zeit', text: getBadgeText('kurze_zeit') });
    }

    return activeBadges;
  };

  /**
   * Get menu package items
   */
  const getMenuItems = (): string[] => {
    if (!product.isMenuPackage || !product.menuContents) {
      console.log('🔍 DEBUG - No menu contents:', { isMenuPackage: product.isMenuPackage, menuContents: product.menuContents });
      return [];
    }

    console.log('🔍 DEBUG - Product:', product);
    console.log('🔍 DEBUG - Menu Contents:', product.menuContents);
    console.log('🔍 DEBUG - Type of menuContents:', typeof product.menuContents);

    // Handle if menuContents is already an array (parsed from API)
    if (Array.isArray(product.menuContents)) {
      console.log('🔍 DEBUG - menuContents is already an array');

      // Extract descriptions from array of objects
      const items = product.menuContents.map((item: any) => {
        if (typeof item === 'string') {
          // Simple string in array
          return item;
        } else if (typeof item === 'object' && item !== null) {
          // Object with multilingual fields - use current language
          const langKey = `description_${language}`;
          return item[langKey] || item.description_de || item[language] || item.de || item.name || item.description || item.title || JSON.stringify(item);
        }
        return String(item);
      }).filter(item => item && item.length > 0);

      console.log('🔍 DEBUG - Extracted items from array:', items);
      return items;
    }

    // Handle if menuContents is a JSON string
    if (typeof product.menuContents === 'string') {
      try {
        // Try to parse as JSON first (in case it's an array of objects)
        let parsed = JSON.parse(product.menuContents);

        // Check if it's a double-encoded JSON string
        if (typeof parsed === 'string') {
          console.log('🔍 DEBUG - Double-encoded JSON detected, parsing again');
          parsed = JSON.parse(parsed);
        }

        console.log('🔍 DEBUG - Parsed as JSON:', parsed);

        if (Array.isArray(parsed)) {
          // Extract descriptions from array of objects or simple strings
          const items = parsed.map(item => {
            if (typeof item === 'string') {
              // Simple string in array
              return item;
            } else if (typeof item === 'object' && item !== null) {
              // Object with multilingual fields - use current language
              const langKey = `description_${language}`;
              return item[langKey] || item.description_de || item[language] || item.de || item.name || item.description || item.title || item.id || JSON.stringify(item);
            }
            return String(item);
          }).filter(item => item && item.length > 0);

          console.log('🔍 DEBUG - Extracted items:', items);
          return items;
        }
      } catch (e) {
        console.log('🔍 DEBUG - Not JSON, treating as plain text with newlines');
        // Not JSON, treat as plain text with newlines
        const items = product.menuContents
          .split('\n')
          .map(item => item.trim())
          .filter(item => item.length > 0);

        console.log('🔍 DEBUG - Split items:', items);
        return items;
      }
    }

    return [];
  };

  /**
   * Handle click
   */
  const handleClick = () => {
    if (interactive && onClick) {
      onClick(product);
    }
  };

  const menuItems = getMenuItems();

  return (
    <ProductListItem
      className={className}
      data-testid={testId}
      data-product-id={product.id}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <ProductContent>
        <ProductNameContainer>
          <ProductName>
            {getProductName()}
          </ProductName>

          {/* Render badges */}
          {getActiveBadges().length > 0 && (
            <BadgesContainer>
              {getActiveBadges().map((badge, index) => (
                <Badge
                  key={`${badge.type}-${index}`}
                  $type={badge.type}
                  title={badge.text}
                >
                  {badge.text}
                </Badge>
              ))}
            </BadgesContainer>
          )}
        </ProductNameContainer>

        <ProductPrice>
          {/* Nur bei Produkten OHNE Varianten den Preis anzeigen */}
          {!hasMultipleSizes() && getPriceDisplay()}
        </ProductPrice>
      </ProductContent>

      {getProductDescription() && (
        <ProductDescription>
          {getProductDescription()}
        </ProductDescription>
      )}

      {/* Show detailed variants if available */}
      {hasMultipleSizes() && (
        <VariantsContainer>
          {product.sizes!.map((size, index) => (
            <VariantItem key={index}>
              <VariantSize>
                {size.size || size.description || `Größe ${index + 1}`}
              </VariantSize>
              <VariantPrice>
                {formatPrice(size.price)}
              </VariantPrice>
            </VariantItem>
          ))}
        </VariantsContainer>
      )}

      {/* Show menu package items if available */}
      {menuItems.length > 0 && (
        <MenuItemsContainer>
          {menuItems.map((item, index) => (
            <MenuItem key={index}>
              {item}
            </MenuItem>
          ))}
        </MenuItemsContainer>
      )}
    </ProductListItem>
  );
});

/**
 * Default export
 */
export default MenuProductCard;