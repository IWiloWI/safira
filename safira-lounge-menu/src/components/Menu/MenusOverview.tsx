import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '../Layout/PageLayout';
import ProductCard from './ProductCard';
import { getProducts } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { Category, Product, Language } from '../../types';
import { MultilingualHelpers } from '../../types';
import productsData from '../../data/products.json';


const MenusContainer = styled.div`
  padding: 10px 20px;
  position: relative;
  background: transparent;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active 
    ? 'linear-gradient(145deg, rgba(233, 30, 99, 0.9), rgba(233, 30, 99, 1))' 
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 240, 255, 0.90))'
  };
  border: 2px solid ${props => props.$active ? 'rgba(233, 30, 99, 0.5)' : 'rgba(233, 30, 99, 0.3)'};
  border-radius: 20px;
  padding: 12px 24px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: ${props => props.$active ? '#FFFFFF' : '#1A1A2E'};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(25px);

  &:hover {
    border-color: rgba(233, 30, 99, 0.5);
    transform: translateY(-2px);
  }
`;

const MenuContent = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const BuilderSection = styled(motion.div)`
  position: relative;
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
  overflow: hidden;
  min-height: 600px;
`;

const VideoSectionBackground = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
  filter: brightness(0.4) contrast(1.3) saturate(1.2);
`;

const SectionOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(255, 65, 251, 0.2) 30%,
    rgba(0, 0, 0, 0.6) 70%,
    rgba(233, 30, 99, 0.3) 100%
  );
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse at center,
      transparent 20%,
      rgba(0, 0, 0, 0.3) 80%
    );
  }
`;

const SectionContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const SectionHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 15px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StepTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: #FFD700;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const ProductButton = styled(motion.button)<{ $selected?: boolean }>`
  background: ${props => props.$selected 
    ? 'linear-gradient(145deg, rgba(233, 30, 99, 0.9), rgba(233, 30, 99, 1))' 
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 240, 255, 0.90))'
  };
  border: 2px solid ${props => props.$selected ? 'rgba(233, 30, 99, 0.8)' : 'rgba(233, 30, 99, 0.3)'};
  border-radius: 15px;
  padding: 15px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: ${props => props.$selected ? '#FFFFFF' : '#1A1A2E'};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    border-color: rgba(233, 30, 99, 0.6);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CategoryToggle = styled(motion.button)<{ $active?: boolean }>`
  background: ${props => props.$active 
    ? 'linear-gradient(145deg, rgba(255, 65, 251, 0.9), rgba(255, 65, 251, 1))' 
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 240, 255, 0.2))'
  };
  border: 2px solid ${props => props.$active ? 'rgba(255, 65, 251, 0.8)' : 'rgba(255, 65, 251, 0.3)'};
  border-radius: 20px;
  padding: 8px 16px;
  margin: 5px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  color: ${props => props.$active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
  
  &:hover {
    border-color: rgba(255, 65, 251, 0.6);
    transform: translateY(-1px);
  }
`;

const ProductSelectionContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  z-index: 1001;
`;

const ProductsScrollContainer = styled.div`
  flex: 1;
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  backdrop-filter: blur(15px);
  
  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(145deg, rgba(255, 65, 251, 0.8), rgba(233, 30, 99, 0.8));
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(255, 65, 251, 0.3);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(145deg, rgba(255, 65, 251, 1), rgba(233, 30, 99, 1));
    box-shadow: 0 0 15px rgba(255, 65, 251, 0.5);
  }
`;


const ActionButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  padding: 15px 40px;
  background: ${props => props.$variant === 'secondary' 
    ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2))' 
    : 'linear-gradient(145deg, rgba(255, 65, 251, 0.9), rgba(233, 30, 99, 0.9))'
  };
  border: 2px solid ${props => props.$variant === 'secondary' 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'rgba(255, 65, 251, 0.8)'
  };
  border-radius: 25px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 1.1rem;
  cursor: pointer;
  backdrop-filter: blur(15px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 10px 30px ${props => props.$variant === 'secondary' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(255, 65, 251, 0.4)'
    };
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CategoryFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const OverviewContainer = styled(motion.div)`
  padding: 20px;
  background: transparent;
`;

const StepIndicator = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding: 25px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 65, 251, 0.3);
`;

const StepText = styled.h2`
  font-family: 'Oswald', sans-serif;
  font-size: 1.8rem;
  color: #FF41FB;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const StepDescription = styled.p`
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

const CategoryBanner = styled(motion.div)<{ $categoryType: 'shisha' | 'drinks' | 'snacks' }>`
  position: relative;
  height: 200px;
  margin-bottom: 20px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid rgba(255, 65, 251, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 65, 251, 0.6);
    box-shadow: 0 10px 30px rgba(255, 65, 251, 0.3);
  }
`;

const BannerVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.5) contrast(1.2);
`;

const BannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(255, 65, 251, 0.2) 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
  backdrop-filter: blur(2px);
`;

const BannerTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  color: white;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const BannerSubtitle = styled.p`
  font-family: 'Aldrich', sans-serif;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  text-align: center;
`;

interface MenuOption {
  id: string;
  name: string;
  price: number;
  description: string;
  includes: string[];
  categories: {
    shisha?: number;
    drinks?: number;
    snacks?: number;
    extras?: string[];
  };
}



interface MenusOverviewProps {
  onBack?: () => void;
}

const MenusOverview: React.FC<MenusOverviewProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [selectedMenuId, setSelectedMenuId] = useState<string>('single');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<{
    shisha: string[];
    drinks: string[];
    snacks: string[];
  }>({
    shisha: [],
    drinks: [],
    snacks: []
  });
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'overview' | 'shisha' | 'drinks' | 'snacks' | 'summary'>('overview');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');

  console.log('MenusOverview component is rendering');

  // Load product data
  useEffect(() => {
    const loadProductData = async () => {
      setIsLoading(true);
      try {
        const data = await getProducts();
        setAvailableCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to load products, using fallback data:', error);
        setAvailableCategories(productsData.categories as Category[]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, []);

  // Helper function to get localized text
  const getLocalizedText = (text: any): string => {
    return MultilingualHelpers.getText(text, language);
  };

  // Get available products based on categories and filters
  const getAvailableProducts = () => {
    const products: { [key: string]: Product[] } = {
      shisha: [],
      drinks: [],
      snacks: []
    };

    availableCategories.forEach(category => {
      const categoryName = category.id.toLowerCase();
      
      // Map categories to menu types
      if (categoryName.includes('shisha')) {
        products.shisha.push(...category.items.filter(item => item.available));
      } else if (categoryName.includes('cocktails') || categoryName.includes('mocktails') || 
                 categoryName.includes('softdrinks') || categoryName.includes('bier') ||
                 categoryName.includes('wein') || categoryName.includes('hot-drinks') ||
                 categoryName.includes('saefte')) {
        products.drinks.push(...category.items.filter(item => item.available));
      } else if (categoryName.includes('snacks')) {
        products.snacks.push(...category.items.filter(item => item.available));
      }
    });

    return products;
  };

  // Get subcategories for current step
  const getSubcategories = () => {
    if (currentStep === 'drinks') {
      return availableCategories.filter(cat => {
        const catId = cat.id.toLowerCase();
        return catId.includes('cocktails') || catId.includes('mocktails') || 
               catId.includes('softdrinks') || catId.includes('bier') ||
               catId.includes('wein') || catId.includes('hot-drinks') ||
               catId.includes('saefte');
      });
    } else if (currentStep === 'shisha') {
      return availableCategories.filter(cat => cat.id.toLowerCase().includes('shisha'));
    } else if (currentStep === 'snacks') {
      return availableCategories.filter(cat => cat.id.toLowerCase().includes('snacks'));
    }
    return [];
  };

  // Get filtered products based on active subcategory
  const getFilteredProducts = () => {
    if (activeSubcategory === 'all') {
      return availableProducts[currentStep as 'shisha' | 'drinks' | 'snacks'];
    }
    
    const category = availableCategories.find(cat => cat.id === activeSubcategory);
    return category ? category.items.filter(item => item.available) : [];
  };

  const availableProducts = getAvailableProducts();

  // Get category videos for previews
  const getCategoryVideo = (categoryType: 'shisha' | 'drinks' | 'snacks') => {
    const videoMappings = {
      shisha: '/videos/shisha-background.mp4',
      drinks: '/videos/Juice-and-NightClub-FHD.mp4',
      snacks: '/videos/Home_Rosen_Background.mp4'
    };
    return videoMappings[categoryType];
  };

  const menus: MenuOption[] = [
    {
      id: 'single',
      name: 'Single Menü',
      price: 20,
      description: '1x Shisha, 1x Cocktail oder Mocktail',
      includes: ['1x Premium Shisha nach Wahl', '1x Cocktail oder Mocktail nach Wahl'],
      categories: {
        shisha: 1,
        drinks: 1
      }
    },
    {
      id: 'duo',
      name: 'Duo Menü',
      price: 50,
      description: '2x Shisha, 2x Getränke nach Wahl, Nachos oder Snack Box',
      includes: ['2x Premium Shisha nach Wahl', '2x Getränke nach Wahl', '1x Nachos oder Snack Box'],
      categories: {
        shisha: 2,
        drinks: 2,
        snacks: 1
      }
    },
    {
      id: 'party',
      name: 'Party Menü',
      price: 100,
      description: 'Inkl. 2 Flaschen Softdrink oder 6 Dosen Red Bull/Moloko',
      includes: [
        '2x Premium Shisha nach Wahl',
        '1x Flasche (Vodka, Jack Daniels, Gin)',
        '2 Flaschen Softdrink oder 6 Dosen Red Bull/Moloko',
        '1x Nachos oder Snack Box'
      ],
      categories: {
        shisha: 2,
        drinks: 1,
        snacks: 1,
        extras: ['2x Softdrink Flaschen oder 6x Energy Drinks']
      }
    }
  ];

  const selectedMenu = menus.find(menu => menu.id === selectedMenuId);

  const handleTabSelect = (menuId: string) => {
    setSelectedMenuId(menuId);
    // Reset selections when changing menu
    setSelectedItems({
      shisha: [],
      drinks: [],
      snacks: []
    });
    // Reset to overview step
    setCurrentStep('overview');
  };

  const toggleItemSelection = (category: 'shisha' | 'drinks' | 'snacks', itemId: string) => {
    const maxAllowed = selectedMenu?.categories[category] || 0;
    
    setSelectedItems(prev => {
      const currentItems = prev[category];
      const isSelected = currentItems.includes(itemId);
      
      if (isSelected) {
        // Remove item
        return {
          ...prev,
          [category]: currentItems.filter(id => id !== itemId)
        };
      } else if (currentItems.length < maxAllowed) {
        // Add item if under limit
        return {
          ...prev,
          [category]: [...currentItems, itemId]
        };
      }
      
      return prev;
    });
  };

  // Get the required steps based on selected menu
  const getRequiredSteps = (): ('shisha' | 'drinks' | 'snacks')[] => {
    if (!selectedMenu) return [];
    
    const steps: ('shisha' | 'drinks' | 'snacks')[] = [];
    
    if (selectedMenu.categories.shisha && selectedMenu.categories.shisha > 0) {
      steps.push('shisha');
    }
    if (selectedMenu.categories.drinks && selectedMenu.categories.drinks > 0) {
      steps.push('drinks');
    }
    if (selectedMenu.categories.snacks && selectedMenu.categories.snacks > 0) {
      steps.push('snacks');
    }
    
    return steps;
  };

  // Handle category selection from overview
  const handleCategorySelect = (category: 'shisha' | 'drinks' | 'snacks') => {
    setIsTransitioning(true);
    setActiveSubcategory('all'); // Reset subcategory filter
    setTimeout(() => {
      setCurrentStep(category);
      setIsTransitioning(false);
    }, 200);
  };

  // Handle going back in workflow
  const handleGoBack = () => {
    if (currentStep === 'summary') {
      setCurrentStep('overview');
    } else if (currentStep !== 'overview') {
      setCurrentStep('overview');
    }
  };

  // Handle editing a category from summary
  const handleEditCategory = (category: 'shisha' | 'drinks' | 'snacks') => {
    setCurrentStep(category);
  };

  // Get info about current step completion
  const getCurrentStepInfo = () => {
    if (currentStep === 'overview' || currentStep === 'summary') {
      return { isCurrentStepComplete: true };
    }
    
    const category = currentStep as 'shisha' | 'drinks' | 'snacks';
    const required = selectedMenu?.categories[category] || 0;
    const selected = selectedItems[category].length;
    
    return {
      isCurrentStepComplete: selected >= required,
      selected,
      required
    };
  };

  // Handle proceeding to next step or summary
  const handleProceedToNext = () => {
    if (currentStep === 'overview') {
      // Should not happen from overview
      return;
    }
    
    const requiredSteps = getRequiredSteps();
    const currentIndex = requiredSteps.indexOf(currentStep as 'shisha' | 'drinks' | 'snacks');
    
    if (currentIndex !== -1 && currentIndex < requiredSteps.length - 1) {
      // Go to next required category
      const nextStep = requiredSteps[currentIndex + 1];
      setActiveSubcategory('all'); // Reset subcategory filter
      setCurrentStep(nextStep);
    } else {
      // Go to summary
      setCurrentStep('summary');
    }
  };

  return (
    <PageLayout
      title="Safira Menüs"
      showBackButton={true}
      backButtonPath="/menu"
      onBackClick={onBack}
      showLanguageSelector={true}
      showSearch={true}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <MenusContainer>
        <TabsContainer>
          {menus.map((menu) => (
            <Tab
              key={menu.id}
              $active={selectedMenuId === menu.id}
              onClick={() => handleTabSelect(menu.id)}
            >
              {menu.name} - {menu.price}€
            </Tab>
          ))}
        </TabsContainer>

        {selectedMenu && (
          <MenuContent>
            <AnimatePresence mode="wait">
              {currentStep === 'overview' && (
                <OverviewContainer
                  key="overview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <StepIndicator>
                    <StepText>Wählen Sie Ihre Kategorien</StepText>
                    <StepDescription>Klicken Sie auf eine Kategorie um Ihre Produkte auszusuchen</StepDescription>
                  </StepIndicator>

                  {getRequiredSteps().includes('shisha') && (
                    <CategoryBanner
                      $categoryType="shisha"
                      onClick={() => handleCategorySelect('shisha')}
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <BannerVideo
                        src={getCategoryVideo('shisha')}
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                      <BannerOverlay>
                        <BannerTitle>🌿 Shisha Auswahl</BannerTitle>
                        <BannerSubtitle>
                          {selectedItems.shisha.length > 0 
                            ? `${selectedItems.shisha.length}/${selectedMenu.categories.shisha || 0} ausgewählt` 
                            : `${selectedMenu.categories.shisha || 0} Shisha${(selectedMenu.categories.shisha || 0) > 1 ? 's' : ''} wählen`
                          }
                        </BannerSubtitle>
                      </BannerOverlay>
                    </CategoryBanner>
                  )}

                  {getRequiredSteps().includes('drinks') && (
                    <CategoryBanner
                      $categoryType="drinks"
                      onClick={() => handleCategorySelect('drinks')}
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <BannerVideo
                        src={getCategoryVideo('drinks')}
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                      <BannerOverlay>
                        <BannerTitle>🍹 Getränke Auswahl</BannerTitle>
                        <BannerSubtitle>
                          {selectedItems.drinks.length > 0 
                            ? `${selectedItems.drinks.length}/${selectedMenu.categories.drinks || 0} ausgewählt` 
                            : `${selectedMenu.categories.drinks || 0} Getränk${(selectedMenu.categories.drinks || 0) > 1 ? 'e' : ''} wählen`
                          }
                        </BannerSubtitle>
                      </BannerOverlay>
                    </CategoryBanner>
                  )}

                  {getRequiredSteps().includes('snacks') && (
                    <CategoryBanner
                      $categoryType="snacks"
                      onClick={() => handleCategorySelect('snacks')}
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <BannerVideo
                        src={getCategoryVideo('snacks')}
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                      <BannerOverlay>
                        <BannerTitle>🍿 Snacks Auswahl</BannerTitle>
                        <BannerSubtitle>
                          {selectedItems.snacks.length > 0 
                            ? `${selectedItems.snacks.length}/${selectedMenu.categories.snacks || 0} ausgewählt` 
                            : `${selectedMenu.categories.snacks || 0} Snack${(selectedMenu.categories.snacks || 0) > 1 ? 's' : ''} wählen`
                          }
                        </BannerSubtitle>
                      </BannerOverlay>
                    </CategoryBanner>
                  )}

                  {/* Check if all required steps are complete */}
                  {getRequiredSteps().every(step => {
                    const category = step as 'shisha' | 'drinks' | 'snacks';
                    const required = selectedMenu.categories[category] || 0;
                    return selectedItems[category].length >= required;
                  }) && (
                    <ActionButtons>
                      <ActionButton
                        $variant="primary"
                        onClick={() => setCurrentStep('summary')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ✅ Zusammenfassung anzeigen
                      </ActionButton>
                    </ActionButtons>
                  )}
                </OverviewContainer>
              )}

              {(currentStep === 'shisha' || currentStep === 'drinks' || currentStep === 'snacks') && (
                <ProductSelectionContainer
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <VideoSectionBackground
                    src={getCategoryVideo(currentStep as 'shisha' | 'drinks' | 'snacks')}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <SectionOverlay />
                  
                  <SectionContent style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
                    <SectionHeader>
                      <StepTitle>
                        {currentStep === 'shisha' && `🌿 Shisha wählen (${selectedItems.shisha.length}/${selectedMenu.categories.shisha})`}
                        {currentStep === 'drinks' && `🍹 Getränke wählen (${selectedItems.drinks.length}/${selectedMenu.categories.drinks})`}
                        {currentStep === 'snacks' && `🍿 Snacks wählen (${selectedItems.snacks.length}/${selectedMenu.categories.snacks})`}
                      </StepTitle>
                    </SectionHeader>
                    
                    {/* Subcategory Tabs */}
                    {getSubcategories().length > 0 && (
                      <CategoryFilters style={{ marginBottom: '20px' }}>
                        <CategoryToggle
                          $active={activeSubcategory === 'all'}
                          onClick={() => setActiveSubcategory('all')}
                        >
                          Alle
                        </CategoryToggle>
                        {getSubcategories().map(cat => (
                          <CategoryToggle
                            key={cat.id}
                            $active={activeSubcategory === cat.id}
                            onClick={() => setActiveSubcategory(cat.id)}
                          >
                            {getLocalizedText(cat.name)}
                          </CategoryToggle>
                        ))}
                      </CategoryFilters>
                    )}
                    
                    <ProductsScrollContainer>
                      {getFilteredProducts()
                        .map((product, index) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            language={language}
                            index={index}
                            isMenuBuilder={true}
                            isSelected={selectedItems[currentStep as 'shisha' | 'drinks' | 'snacks'].includes(product.id)}
                            isDisabled={!selectedItems[currentStep as 'shisha' | 'drinks' | 'snacks'].includes(product.id) && 
                                       selectedItems[currentStep as 'shisha' | 'drinks' | 'snacks'].length >= (selectedMenu.categories[currentStep as 'shisha' | 'drinks' | 'snacks'] || 0)}
                            onSelect={() => toggleItemSelection(currentStep as 'shisha' | 'drinks' | 'snacks', product.id)}
                          />
                        ))
                      }
                    </ProductsScrollContainer>

                    <ActionButtons>
                      <ActionButton
                        $variant="secondary"
                        onClick={handleGoBack}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ← Zurück
                      </ActionButton>
                      
                      {getCurrentStepInfo().isCurrentStepComplete && (
                        <ActionButton
                          $variant="primary"
                          onClick={handleProceedToNext}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Weiter →
                        </ActionButton>
                      )}
                    </ActionButtons>
                  </SectionContent>
                </ProductSelectionContainer>
              )}

              {currentStep === 'summary' && (
                <OverviewContainer
                  key="summary"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <StepIndicator>
                    <StepText>Ihre Auswahl - Gesamt: {selectedMenu.price}€</StepText>
                    <StepDescription>Überprüfen Sie Ihre Auswahl oder bearbeiten Sie einzelne Kategorien</StepDescription>
                  </StepIndicator>

                  <div style={{ 
                    background: 'rgba(0, 0, 0, 0.6)', 
                    padding: '30px', 
                    borderRadius: '20px',
                    marginBottom: '30px',
                    backdropFilter: 'blur(15px)'
                  }}>
                    {selectedItems.shisha.length > 0 && (
                      <motion.div 
                        style={{ marginBottom: '25px' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <strong style={{ color: '#FF41FB', fontSize: '1.2rem' }}>🌿 Shisha:</strong>
                          <ActionButton 
                            $variant="secondary" 
                            onClick={() => handleEditCategory('shisha')}
                            style={{ padding: '8px 15px', fontSize: '0.9rem' }}
                          >
                            Bearbeiten
                          </ActionButton>
                        </div>
                        {selectedItems.shisha.map(id => {
                          const product = availableProducts.shisha.find(p => p.id === id);
                          return (
                            <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', color: 'white' }}>
                              <span>• {getLocalizedText(product?.name || '')}</span>
                              {product?.price && <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{product.price}€</span>}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                    
                    {selectedItems.drinks.length > 0 && (
                      <motion.div 
                        style={{ marginBottom: '25px' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <strong style={{ color: '#FF41FB', fontSize: '1.2rem' }}>🍹 Getränke:</strong>
                          <ActionButton 
                            $variant="secondary" 
                            onClick={() => handleEditCategory('drinks')}
                            style={{ padding: '8px 15px', fontSize: '0.9rem' }}
                          >
                            Bearbeiten
                          </ActionButton>
                        </div>
                        {selectedItems.drinks.map(id => {
                          const product = availableProducts.drinks.find(p => p.id === id);
                          return (
                            <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', color: 'white' }}>
                              <span>• {getLocalizedText(product?.name || '')}</span>
                              {product?.price && <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{product.price}€</span>}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                    
                    {selectedItems.snacks.length > 0 && (
                      <motion.div 
                        style={{ marginBottom: '25px' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <strong style={{ color: '#FF41FB', fontSize: '1.2rem' }}>🍿 Snacks:</strong>
                          <ActionButton 
                            $variant="secondary" 
                            onClick={() => handleEditCategory('snacks')}
                            style={{ padding: '8px 15px', fontSize: '0.9rem' }}
                          >
                            Bearbeiten
                          </ActionButton>
                        </div>
                        {selectedItems.snacks.map(id => {
                          const product = availableProducts.snacks.find(p => p.id === id);
                          return (
                            <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', color: 'white' }}>
                              <span>• {getLocalizedText(product?.name || '')}</span>
                              {product?.price && <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{product.price}€</span>}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>

                  <ActionButtons>
                    <ActionButton
                      $variant="secondary"
                      onClick={handleGoBack}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ← Zurück zur Übersicht
                    </ActionButton>
                    
                    <ActionButton
                      $variant="primary"
                      onClick={() => alert('Bestellung wird verarbeitet... 🎉')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🎉 Bestellen
                    </ActionButton>
                  </ActionButtons>
                </OverviewContainer>
              )}
            </AnimatePresence>
          </MenuContent>
        )}
      </MenusContainer>
    </PageLayout>
  );
};

export default MenusOverview;