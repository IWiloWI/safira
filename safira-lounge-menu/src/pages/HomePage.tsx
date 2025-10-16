import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { FaMapMarkerAlt, FaClock, FaPhone } from 'react-icons/fa';
import VideoBackground from '../components/Common/VideoBackground';
import SearchBar from '../components/Menu/SearchBar';
import HomeSearchResults from '../components/Home/HomeSearchResults';
import { useProducts } from '../hooks/useProducts';

const HomeContainer = styled.div`
  min-height: 100vh;
  padding-top: 80px;
`;

const HeroSection = styled.section`
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
`;

const LogoContainer = styled(motion.div)`
  margin-bottom: 40px;
`;

const LogoImage = styled.img`
  width: 280px;
  height: auto;
  filter: drop-shadow(0 0 30px rgba(255, 65, 251, 0.8)) 
          drop-shadow(0 0 50px rgba(255, 255, 255, 0.4))
          drop-shadow(0 0 80px rgba(255, 215, 0, 0.3));
  transition: all 0.8s ease;

  &:hover {
    filter: drop-shadow(0 0 40px rgba(255, 65, 251, 1)) 
            drop-shadow(0 0 70px rgba(255, 255, 255, 0.6))
            drop-shadow(0 0 100px rgba(255, 215, 0, 0.5));
    transform: scale(1.05) rotate(1deg);
  }

  @media (max-width: 768px) {
    width: 220px;
  }
`;

const Title = styled(motion.h1)`
  font-family: 'Oswald', sans-serif;
  font-size: clamp(3rem, 8vw, 6rem);
  color: #FF41FB;
  text-transform: uppercase;
  letter-spacing: 5px;
  text-shadow: 0 0 30px rgba(255, 65, 251, 0.8);
  margin-bottom: 20px;
`;

const Subtitle = styled(motion.p)`
  font-family: 'Aldrich', sans-serif;
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  color: white;
  margin-bottom: 40px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const InfoContainer = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  margin-bottom: 60px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  
  svg {
    color: #FF41FB;
    font-size: 1.2rem;
  }
`;

const CTAContainer = styled(motion.div)`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const CTAButton = styled(Link)`
  padding: 15px 45px;
  background: transparent;
  border: 2px solid #FF41FB;
  border-radius: 30px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 1.1rem;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: #FF41FB;
    transition: left 0.3s ease;
    z-index: -1;
  }

  &:hover {
    color: white;
    box-shadow: 0 0 30px rgba(255, 65, 251, 0.6);
    
    &::before {
      left: 0;
    }
  }
`;

const FeaturesSection = styled.section`
  padding: 80px 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 60px;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 65, 251, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(255, 65, 251, 0.3);
    border-color: #FF41FB;
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.5rem;
  margin-bottom: 15px;
  text-transform: uppercase;
`;

const FeatureDescription = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: white;
  line-height: 1.6;
`;

const CategoriesSection = styled.section`
  padding: 80px 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin-top: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled(motion(Link))`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 65, 251, 0.3);
  display: block;
  text-decoration: none;

  &::after {
    content: 'Klicken zum Öffnen';
    position: absolute;
    bottom: 10px;
    right: 15px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.7rem;
    font-family: 'Aldrich', sans-serif;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(255, 65, 251, 0.4);
    border-color: #FF41FB;
    
    &::after {
      opacity: 1;
    }
  }
`;

const CategoryImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${CategoryCard}:hover & {
    transform: scale(1.1);
  }
`;

const CategoryOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryName = styled.h3`
  font-family: 'Oswald', sans-serif;
  color: white;
  font-size: 1.5rem;
  text-transform: uppercase;
  text-align: center;
  text-shadow: 0 0 20px rgba(255, 65, 251, 0.8);
`;

const HomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const {
    products,
    getProductName,
    getProductDescription,
    isLoading
  } = useProducts(language);

  // Filter products based on search query and exclude "Menüs" category
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();

    return products.filter(product => {
      // Exclude products from "safira-menus" category
      if (product.categoryId === 'safira-menus') {
        return false;
      }

      // Search in product name
      const productName = getProductName(product.name, language).toLowerCase();
      if (productName.includes(query)) {
        return true;
      }

      // Search in product description
      if (product.description) {
        const productDesc = getProductDescription(product.description, language).toLowerCase();
        if (productDesc.includes(query)) {
          return true;
        }
      }

      return false;
    });
  }, [searchQuery, products, language, getProductName, getProductDescription]);

  const features = [
    {
      icon: '💨',
      title: 'Premium Shisha',
      description: 'Große Auswahl an hochwertigen Tabaksorten'
    },
    {
      icon: '🍹',
      title: 'Cocktails & Mocktails',
      description: 'Erfrischende Getränke für jeden Geschmack'
    },
    {
      icon: '🎵',
      title: 'Lounge Atmosphere',
      description: 'Entspannte Musik und gemütliches Ambiente'
    }
  ];

  const categories = [
    {
      id: 'menus',
      name: 'Safira Menüs',
      image: '/images/Produktkategorien/Cocktails-Safira.jpg',
      link: '/menu/menus'
    },
    {
      id: 'shisha',
      name: 'Shisha',
      image: '/images/Produktkategorien/Shisha-Safira.jpg',
      link: '/menu/shisha'
    },
    {
      id: 'drinks',
      name: 'Getränke',
      image: '/images/Produktkategorien/GETRAeNKE-Safira.jpg',
      link: '/menu/drinks'
    },
    {
      id: 'snacks',
      name: 'Snacks',
      image: '/images/Produktkategorien/Snacks-Safira.jpg',
      link: '/menu/snacks'
    }
  ];

  console.log('Categories count:', categories.length);
  console.log('Categories:', categories);

  return (
    <HomeContainer>
      <VideoBackground category="home" />
      <HeroSection>
        <LogoContainer
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <LogoImage
            src="/images/safira_logo_280w.webp"
            srcSet="/images/safira_logo_120w.webp 120w, /images/safira_logo_220w.webp 220w, /images/safira_logo_280w.webp 280w"
            sizes="(max-width: 768px) 220px, 280px"
            alt="Safira Lounge"
            fetchPriority="high"
          />
        </LogoContainer>

        <Title
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t('hero.title')}
        </Title>

        <Subtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {t('hero.subtitle')}
        </Subtitle>

        <InfoContainer
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <InfoItem>
            <FaMapMarkerAlt />
            <span>{t('hero.location')}</span>
          </InfoItem>
          <InfoItem>
            <FaClock />
            <span>Mo-So 15:00 - 02:00</span>
          </InfoItem>
          <InfoItem>
            <FaPhone />
            <span>+49 461 123456</span>
          </InfoItem>
        </InfoContainer>

        <CTAContainer
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <CTAButton to="/menu">
            {t('hero.viewMenu')}
          </CTAButton>
          <CTAButton to="/menu/safira-menus">
            Safira Menüs
          </CTAButton>
        </CTAContainer>
      </HeroSection>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        style={{
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 20px'
        }}
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Produkte durchsuchen..."
          language={language}
          showClear={true}
        />
      </motion.div>

      {/* Search Results */}
      {searchQuery && (
        <HomeSearchResults
          searchQuery={searchQuery}
          products={searchResults}
          onClearSearch={() => setSearchQuery('')}
          getProductName={getProductName}
          getProductDescription={getProductDescription}
        />
      )}

      <FeaturesSection>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            textAlign: 'center',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#FF41FB',
            fontFamily: 'Kallisto, sans-serif',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}
        >
          Premium Experience
        </motion.h2>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>

      <CategoriesSection
        as={motion.section}
        animate={{
          marginTop: searchQuery && searchResults.length > 0 ? '20px' : '0px'
        }}
        transition={{ duration: 0.4 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            textAlign: 'center',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#FF41FB',
            fontFamily: 'Kallisto, sans-serif',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}
        >
          Unser Angebot
        </motion.h2>

        <CategoriesGrid>
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              to={category.link}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <CategoryImage src={category.image} alt={category.name} />
              <CategoryOverlay>
                <CategoryName>{category.name}</CategoryName>
              </CategoryOverlay>
            </CategoryCard>
          ))}
        </CategoriesGrid>
      </CategoriesSection>
    </HomeContainer>
  );
};

export default HomePage;