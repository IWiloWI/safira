import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TabsWrapper = styled.div`
  position: relative;
  margin: 20px 0;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const TabsHeader = styled.div`
  text-align: center;
  margin-bottom: 15px;
`;

const TabsTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.2rem;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 5px 0;
  opacity: 0.9;
`;

const TabsSubtitle = styled.p`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;


const TabsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 15px;
  background: transparent;
  justify-content: center;
  max-width: 100%;

  @media (max-width: 480px) {
    gap: 8px;
    padding: 0 10px;
  }
`;

const TabButton = styled(motion.button)<{ $active: boolean }>`
  background: ${props => props.$active ? 
    'linear-gradient(145deg, rgba(233, 30, 99, 0.9), rgba(233, 30, 99, 1))' : 
    'linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 240, 255, 0.90))'};
  border: 2px solid ${props => props.$active ? 'rgba(233, 30, 99, 0.8)' : 'rgba(233, 30, 99, 0.3)'};
  border-radius: 20px;
  padding: 10px 14px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.85rem;
  color: ${props => props.$active ? '#FFFFFF' : '#1A1A2E'};
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(25px);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  white-space: nowrap;
  width: auto;
  min-width: 120px;
  position: relative;
  
  ${props => props.$active && `
    box-shadow: 0 0 20px rgba(233, 30, 99, 0.4);
  `}
  
  &::after {
    content: ${props => props.$active ? "'Aktiv'" : "'Klicken'"};
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
    opacity: 0;
    transition: opacity 0.3s ease;
    white-space: nowrap;
    pointer-events: none;
  }
  
  &:hover::after {
    opacity: ${props => props.$active ? '0' : '1'};
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 10px 12px;
    min-height: 40px;
    min-width: 100px;
    
    &::after {
      display: none;
    }
  }
  
  &:hover {
    border-color: rgba(233, 30, 99, 0.6);
    transform: translateY(-3px);
    background: ${props => props.$active ? 
      'linear-gradient(145deg, rgba(233, 30, 99, 1), rgba(233, 30, 99, 0.9))' : 
      'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 240, 255, 0.98))'};
    color: ${props => props.$active ? '#FFFFFF' : '#E91E63'};
    box-shadow: 0 5px 20px rgba(233, 30, 99, 0.3);
  }

  &:active {
    transform: translateY(-1px);
  }
`;


interface SubcategoryTabsProps {
  categories: Array<{
    id: string;
    name: any;
  }>;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  language: string;
  mainCategoryId?: string;
  /** Whether this is used for filtering instead of navigation */
  filterMode?: boolean;
}

const SubcategoryTabs: React.FC<SubcategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  language,
  mainCategoryId = '',
  filterMode = false
}) => {

  const getCategoryName = (nameObj: any) => {
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[language] || nameObj['de'] || nameObj;
  };

  const getMainCategoryTitle = () => {
    // Map category IDs to display names
    const categoryIdMapping: Record<string, string> = {
      '1': 'shisha',    // Category ID 1 = Shisha Tabak
      '2': 'drinks',    // Category ID 2 = Getränke
      '3': 'snacks',    // Category ID 3 = Snacks
      'menus': 'menus', // Keep menus as is
      'shisha': 'shisha',
      'drinks': 'drinks',
      'snacks': 'snacks'
    };

    const titles: Record<string, Record<string, string>> = {
      drinks: {
        de: 'Getränke-Kategorien',
        da: 'Drikkevare-kategorier',
        en: 'Drink Categories',
        tr: 'İçecek Kategorileri',
        it: 'Categorie Bevande'
      },
      shisha: {
        de: 'Shisha-Kategorien',
        da: 'Shisha-kategorier',
        en: 'Shisha Categories',
        tr: 'Shisha Kategorileri',
        it: 'Categorie Shisha'
      },
      snacks: {
        de: 'Snacks-Kategorien',
        da: 'Snacks-kategorier',
        en: 'Snack Categories',
        tr: 'Atıştırmalık Kategorileri',
        it: 'Categorie Snack'
      },
      menus: {
        de: 'Menü-Kategorien',
        da: 'Menu-kategorier',
        en: 'Menu Categories',
        tr: 'Menü Kategorileri',
        it: 'Categorie Menu'
      }
    };

    // Map the category ID to the correct key
    const mappedCategoryId = categoryIdMapping[mainCategoryId] || 'drinks';
    const categoryTitles = titles[mappedCategoryId] || titles.drinks;
    return categoryTitles[language] || categoryTitles.de;
  };

  const getTranslatedText = (key: 'selectCategoryFilter' | 'swipeToChange') => {
    const translations = {
      selectCategoryFilter: {
        de: 'Wähle eine Kategorie zum Filtern der Produkte',
        en: 'Select a category to filter products',
        da: 'Vælg en kategori for at filtrere produkter',
        tr: 'Ürünleri filtrelemek için bir kategori seçin',
        it: 'Seleziona una categoria per filtrare i prodotti'
      },
      swipeToChange: {
        de: 'Kategorie wechseln: links/rechts wischen oder Tab antippen',
        en: 'Change category: swipe left/right or tap tab',
        da: 'Skift kategori: swipe til venstre/højre eller tryk på fane',
        tr: 'Kategori değiştir: sola/sağa kaydır veya sekmeye dokunun',
        it: 'Cambia categoria: scorri a sinistra/destra o tocca scheda'
      }
    };

    const translationObj = translations[key];
    return translationObj[language as keyof typeof translationObj] || translationObj.de || '';
  };


  return (
    <div>
      <TabsHeader>
        <TabsTitle>{getMainCategoryTitle()}</TabsTitle>
        <TabsSubtitle>
          {filterMode
            ? getTranslatedText('selectCategoryFilter')
            : getTranslatedText('swipeToChange')}
        </TabsSubtitle>
      </TabsHeader>
      
      <TabsWrapper data-tab-container="true">
        <TabsContainer>
          {categories.map((category, index) => (
            <TabButton
              key={category.id}
              $active={activeCategory === category.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[SubcategoryTabs] Tab clicked:', category.id);
                onCategoryChange(category.id);
              }}
              data-tab-button="true"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {getCategoryName(category.name)}
            </TabButton>
          ))}
        </TabsContainer>
      </TabsWrapper>
    </div>
  );
};

export default SubcategoryTabs;