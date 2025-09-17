import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import SubcategoryTabs from './SubcategoryTabs';

const FullHeightContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  z-index: 100;
`;

const HeaderSection = styled.div`
  width: 80%;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 40px;
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 30px;
  
  @media (max-width: 968px) {
    width: 90%;
  }
  
  @media (max-width: 480px) {
    width: 95%;
  }
`;

const SafiraLogo = styled.img`
  height: 200px;
  width: auto;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    height: 150px;
    margin-bottom: 10px;
  }
`;

const CategoryTitle = styled.h2`
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    letter-spacing: 1px;
  }
`;

const ControlsContainer = styled.div`
  width: 80%;
  max-width: 1200px;
  margin: 0 auto;
  background: transparent;
  padding: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 968px) {
    width: 90%;
  }
  
  @media (max-width: 480px) {
    width: 95%;
  }
`;

const BackButton = styled.button`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 240, 255, 0.90));
  border: 2px solid rgba(233, 30, 99, 0.3);
  border-radius: 25px;
  padding: 12px 24px;
  margin: 0 auto 20px;
  display: block;
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
  color: #1A1A2E;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(233, 30, 99, 0.5);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 240, 255, 0.98));
    transform: translateY(-2px);
    color: #E91E63;
  }
`;

const LanguageSelector = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
`;

const LanguageButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop),
})<{ active: boolean }>`
  background: ${props => props.active ? 
    'linear-gradient(145deg, rgba(233, 30, 99, 0.9), rgba(233, 30, 99, 1))' : 
    'linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 240, 255, 0.90))'};
  border: 2px solid rgba(233, 30, 99, 0.3);
  border-radius: 20px;
  padding: 8px 16px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: ${props => props.active ? '#FFFFFF' : '#1A1A2E'};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(25px);

  &:hover {
    border-color: rgba(233, 30, 99, 0.5);
    transform: translateY(-2px);
  }
`;

const SearchContainer = styled.div`
  max-width: 500px;
  margin: 20px auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    border-color: #E91E63;
  }
`;

const ContentWrapper = styled.div`
  width: 80%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 30px;
  position: relative;
  height: calc(100vh - 450px);
  min-height: 600px;
  
  @media (max-width: 968px) {
    width: 90%;
    flex-direction: column;
    gap: 20px;
    height: auto;
    min-height: auto;
  }
  
  @media (max-width: 480px) {
    width: 95%;
  }
`;

const SidebarContainer = styled.div`
  width: 260px;
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  height: calc(100vh - 450px);
  max-height: calc(100vh - 450px);
  min-height: 600px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding: 25px 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(233, 30, 99, 0.5);
    border-radius: 3px;
    
    &:hover {
      background: rgba(233, 30, 99, 0.7);
    }
  }
  
  @media (max-width: 968px) {
    width: 100%;
    position: relative;
    top: 0;
    height: auto;
    max-height: none;
    min-height: auto;
    overflow-y: visible;
    background: transparent;
    border: none;
    padding: 0;
    backdrop-filter: none;
    flex-shrink: 1;
  }
`;

const SidebarTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.1rem;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 20px;
  text-align: center;
  opacity: 0.9;
  
  @media (max-width: 968px) {
    display: none;
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
  height: calc(100vh - 450px);
  min-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
  position: relative;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(233, 30, 99, 0.5);
    border-radius: 4px;
    
    &:hover {
      background: rgba(233, 30, 99, 0.7);
    }
  }
  
  @media (max-width: 968px) {
    height: auto;
    min-height: auto;
    overflow-y: visible;
    padding-right: 0;
  }
`;

const ProductsContainer = styled(motion.div)`
  width: 100%;
  min-height: 100%;
`;

const NoProductsMessage = styled(motion.div)`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Aldrich', sans-serif;
  font-size: 1.2rem;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.3;
`;

interface DrinksCategoryLayoutProps {
  products: any[];
  language: string;
  categoryName: string;
  showControls?: boolean;
  onBack?: () => void;
  setLanguage?: (lang: 'de' | 'da' | 'en') => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  categories: any[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const DrinksCategoryLayout: React.FC<DrinksCategoryLayoutProps> = ({
  products,
  language,
  categoryName,
  showControls,
  onBack,
  setLanguage,
  searchQuery,
  setSearchQuery,
  categories,
  activeCategory,
  onCategoryChange
}) => {
  const [previousActiveCategory, setPreviousActiveCategory] = useState(activeCategory);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (activeCategory !== previousActiveCategory) {
      setIsTransitioning(true);
      // Kurzer Delay für smooth transition
      const timer = setTimeout(() => {
        setPreviousActiveCategory(activeCategory);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeCategory, previousActiveCategory]);

  return (
    <FullHeightContainer>
      <HeaderSection>
        <SafiraLogo src="/images/safira_logo.png" alt="Safira Lounge" />
        {categoryName && <CategoryTitle>- {categoryName} -</CategoryTitle>}
      </HeaderSection>
      
      {showControls && (
        <ControlsContainer>
          {onBack && (
            <BackButton onClick={onBack}>
              ← Zurück zu Kategorien
            </BackButton>
          )}

          {setLanguage && (
            <LanguageSelector>
              <LanguageButton 
                active={language === 'de'} 
                onClick={() => setLanguage('de')}
              >
                Deutsch
              </LanguageButton>
              <LanguageButton 
                active={language === 'da'} 
                onClick={() => setLanguage('da')}
              >
                Dansk
              </LanguageButton>
              <LanguageButton 
                active={language === 'en'} 
                onClick={() => setLanguage('en')}
              >
                English
              </LanguageButton>
            </LanguageSelector>
          )}

          {setSearchQuery && (
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Suchen..."
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchContainer>
          )}
        </ControlsContainer>
      )}
      
      <ContentWrapper>
        <SidebarContainer>
          <SidebarTitle>Kategorien</SidebarTitle>
          <SubcategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
            language={language}
          />
        </SidebarContainer>
        
        <MainContent>
          <AnimatePresence mode="wait">
            <ProductsContainer
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {products.length === 0 ? (
                <NoProductsMessage
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <EmptyIcon>🔍</EmptyIcon>
                  <p>Keine Produkte gefunden</p>
                </NoProductsMessage>
              ) : (
                products.map((product, index) => (
                  <ProductCard
                    key={`${product.categoryId}-${product.id}`}
                    product={product}
                    language={language}
                    index={index}
                  />
                ))
              )}
            </ProductsContainer>
          </AnimatePresence>
        </MainContent>
      </ContentWrapper>
    </FullHeightContainer>
  );
};

export default DrinksCategoryLayout;