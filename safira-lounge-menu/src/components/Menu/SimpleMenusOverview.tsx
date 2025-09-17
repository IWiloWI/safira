import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { getProducts } from '../../services/api';

const Container = styled.div`
  min-height: 100vh;
  padding: 20px;
  position: relative;
  z-index: 20;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding-top: 60px;
`;

const Title = styled.h1`
  font-family: 'Oswald', sans-serif;
  font-size: 3rem;
  color: #FF41FB;
  text-shadow: 0 0 20px rgba(255, 65, 251, 0.5);
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  margin-bottom: 30px;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const CategoryCard = styled(motion.div)`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 65, 251, 0.6);
    transform: translateY(-5px);
  }
`;

const CategoryIcon = styled.div`
  font-size: 3rem;
  text-align: center;
  margin-bottom: 15px;
`;

const CategoryTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: #FF41FB;
  text-align: center;
  margin-bottom: 15px;
`;

const ProductsGrid = styled.div`
  display: grid;
  gap: 10px;
`;

const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProductName = styled.span`
  color: white;
  font-size: 0.9rem;
`;

const ProductPrice = styled.span`
  color: #FF41FB;
  font-weight: bold;
  font-size: 0.9rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: white;
  font-size: 1.2rem;
`;

export const SimpleMenusOverview: React.FC = () => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await getProducts();
        if (response.categories) {
          setCategories(response.categories);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const getLocalizedText = (text: any) => {
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text !== null) {
      return text[language] || text.de || text.en || Object.values(text)[0] || '';
    }
    return '';
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Safira Lounge Menu</Title>
          <Subtitle>Digital menu loaded with our finest selections</Subtitle>
        </Header>
        <LoadingContainer>
          Loading menu...
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Safira Lounge Menu</Title>
        <Subtitle>Digital menu loaded with our finest selections</Subtitle>
      </Header>
      
      <CategoryGrid>
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CategoryIcon>{category.icon || '🍽️'}</CategoryIcon>
            <CategoryTitle>
              {getLocalizedText(category.name)}
            </CategoryTitle>
            
            <ProductsGrid>
              {(category.items || []).slice(0, 5).map((product: any, idx: number) => (
                <ProductItem key={product.id || idx}>
                  <ProductName>
                    {getLocalizedText(product.name)}
                  </ProductName>
                  <ProductPrice>
                    {product.price ? `€${product.price}` : ''}
                  </ProductPrice>
                </ProductItem>
              ))}
              {(category.items || []).length > 5 && (
                <ProductItem>
                  <ProductName style={{ fontStyle: 'italic', opacity: 0.7 }}>
                    +{(category.items || []).length - 5} weitere Produkte...
                  </ProductName>
                  <ProductPrice></ProductPrice>
                </ProductItem>
              )}
            </ProductsGrid>
          </CategoryCard>
        ))}
      </CategoryGrid>
    </Container>
  );
};

export default SimpleMenusOverview;