import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TabsWrapper = styled.div`
  position: relative;
  margin: 20px 0;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  display: flex;
  justify-content: center;
  /* Prevent touch events from bubbling up to parent swipe handlers */
  touch-action: pan-x;
  
  /* Ultra smooth scroll behavior with longer duration */
  scroll-behavior: smooth;
  
  /* CSS scroll-timeline für flüssigere Animationen */
  @media (prefers-reduced-motion: no-preference) {
    transition: scroll-position 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  
  /* Scroll snap für sanftere Positionierung */
  scroll-snap-type: x mandatory;
  scroll-padding: 0;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(233, 30, 99, 0.5);
    border-radius: 2px;
  }
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

const ScrollHint = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  font-family: 'Aldrich', sans-serif;
  pointer-events: none;
  animation: fadeInOut 3s infinite;
  
  @keyframes fadeInOut {
    0%, 50%, 100% { opacity: 0.5; }
    25%, 75% { opacity: 0.8; }
  }
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  padding: 0 15px;
  background: transparent;
  min-width: max-content;
  justify-content: center;
  
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
  min-width: 140px;
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
    min-width: 130px;
    
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
  scrollable?: boolean;
  mainCategoryId?: string;
  /** Whether this is used for filtering instead of navigation */
  filterMode?: boolean;
}

const SubcategoryTabs: React.FC<SubcategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  language,
  scrollable = true,
  mainCategoryId = '',
  filterMode = false
}) => {
  const tabsWrapperRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const previousScrollRef = useRef<number>(0);

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

  const hasScrollableContent = categories.length > 4;

  // Zentriere aktiven Tab mit benachbarten Tabs sichtbar
  useEffect(() => {
    if (!activeTabRef.current || !tabsWrapperRef.current) return;

    const tabElement = activeTabRef.current;
    const wrapperElement = tabsWrapperRef.current;
    
    const wrapperWidth = wrapperElement.offsetWidth;
    const tabLeft = tabElement.offsetLeft;
    const tabWidth = tabElement.offsetWidth;
    const tabCenter = tabLeft + tabWidth / 2;
    const wrapperCenter = wrapperWidth / 2;
    
    // Berechne perfekte Zentrierung: Tab-Center soll in Wrapper-Center sein
    let targetScroll = tabCenter - wrapperCenter;
    
    // Begrenze auf gültige Scroll-Bereiche
    const maxScroll = wrapperElement.scrollWidth - wrapperWidth;
    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    
    const currentScroll = wrapperElement.scrollLeft;
    
    if (!isInitialized) {
      // Beim ersten Mal instant setzen
      wrapperElement.scrollLeft = targetScroll;
      previousScrollRef.current = targetScroll;
      setIsInitialized(true);
    } else if (Math.abs(targetScroll - currentScroll) > 5) {
      // Ultra smooth scroll mit Delay für sanftere Animation
      setTimeout(() => {
        requestAnimationFrame(() => {
          // Setze CSS für längere, sanftere Animation
          wrapperElement.style.scrollBehavior = 'smooth';
          wrapperElement.style.transition = 'scroll-left 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
          
          wrapperElement.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
          });
          previousScrollRef.current = targetScroll;
          
          // Reset nach Animation
          setTimeout(() => {
            wrapperElement.style.transition = '';
          }, 600);
        });
      }, 50);
    }
  }, [activeCategory, isInitialized])

  return (
    <div>
      <TabsHeader>
        <TabsTitle>{getMainCategoryTitle()}</TabsTitle>
        <TabsSubtitle>
          {filterMode
            ? "Wähle eine Kategorie zum Filtern der Produkte"
            : hasScrollableContent
              ? "Tabs scrollen: hier wischen • Kategorie wechseln: außerhalb der Tabs wischen"
              : "Kategorie wechseln: links/rechts wischen oder Tab antippen"}
        </TabsSubtitle>
      </TabsHeader>
      
      <TabsWrapper data-tab-container="true" ref={tabsWrapperRef}>
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
              ref={activeCategory === category.id ? activeTabRef : null}
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
        
        {hasScrollableContent && (
          <ScrollHint>
            ← Wischen →
          </ScrollHint>
        )}
      </TabsWrapper>
    </div>
  );
};

export default SubcategoryTabs;