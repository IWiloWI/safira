import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import SearchBar from '../Menu/SearchBar';

const PageWrapper = styled.div`
  width: 90%;
  margin: 0 auto;
  position: relative;
  z-index: 100;
  padding-top: 40px;
  padding-bottom: 60px;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 30px;
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

const PageTitle = styled.h2`
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

const ControlsSection = styled.div`
  background: transparent;
  padding: 20px 20px 10px 20px;
  margin-bottom: 10px;
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

const LanguageButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active 
    ? 'linear-gradient(145deg, rgba(233, 30, 99, 0.9), rgba(233, 30, 99, 1))' 
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 240, 255, 0.90))'
  };
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

const ContentSection = styled.div`
  position: relative;
`;

interface PageLayoutProps {
  title: string;
  showBackButton?: boolean;
  backButtonPath?: string;
  onBackClick?: () => void;
  showLanguageSelector?: boolean;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  categories?: React.ReactNode;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  showBackButton = true,
  backButtonPath = '/menu',
  onBackClick,
  showLanguageSelector = true,
  showSearch = true,
  searchQuery = '',
  onSearchChange,
  categories,
  children
}) => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  const getTranslatedTitle = () => {
    // Handle translations for different titles
    const titleTranslations: { [key: string]: { de: string; da: string; en: string } } = {
      'Safira Menüs': {
        de: 'Safira Menüs',
        da: 'Safira Menuer',
        en: 'Safira Menus'
      },
      'Shisha': {
        de: 'Shisha',
        da: 'Vandpibe',
        en: 'Shisha'
      },
      'Getränke': {
        de: 'Getränke',
        da: 'Drikkevarer',
        en: 'Drinks'
      },
      'Snacks': {
        de: 'Snacks',
        da: 'Snacks',
        en: 'Snacks'
      }
    };

    const translations = titleTranslations[title];
    if (translations) {
      return translations[language as keyof typeof translations] || title;
    }
    return title;
  };

  const getBackButtonText = () => {
    const texts = {
      de: '← Zurück zu Kategorien',
      da: '← Tilbage til kategorier',
      en: '← Back to Categories'
    };
    return texts[language as keyof typeof texts] || texts.de;
  };

  return (
    <PageWrapper>
      {/* 1. Logo & 2. Page Title */}
      <HeaderSection>
        <SafiraLogo src="/images/safira_logo.png" alt="Safira Lounge" />
        <PageTitle>- {getTranslatedTitle()} -</PageTitle>
      </HeaderSection>

      <ControlsSection>
        {/* 3. Back to Categories */}
        {showBackButton && (
          <BackButton onClick={() => {
            if (onBackClick) {
              onBackClick();
            } else {
              navigate(backButtonPath);
            }
          }}>
            {getBackButtonText()}
          </BackButton>
        )}
        
        {/* 4. Language Translations */}
        {showLanguageSelector && (
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

        {/* 5. Search Function */}
        {showSearch && onSearchChange && (
          <SearchBar 
            value={searchQuery} 
            onChange={onSearchChange} 
          />
        )}
      </ControlsSection>

      {/* 6. Categories (if needed) */}
      {categories && categories}

      {/* 7. Content */}
      <ContentSection>
        {children}
      </ContentSection>
    </PageWrapper>
  );
};

export default PageLayout;