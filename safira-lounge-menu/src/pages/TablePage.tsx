import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import MenuPage from './MenuPage';

const TableContainer = styled.div`
  min-height: 100vh;
`;

const TableHeader = styled(motion.div)`
  background: rgba(255, 65, 251, 0.1);
  border-bottom: 3px solid #FF41FB;
  padding: 20px;
  margin-top: 80px;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const TableTitle = styled.h1`
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  color: #FF41FB;
  text-transform: uppercase;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(255, 65, 251, 0.8);
`;

const TableSubtitle = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: white;
  opacity: 0.8;
`;

const WelcomeMessage = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255, 65, 251, 0.2), rgba(255, 65, 251, 0.1));
  border: 2px solid rgba(255, 65, 251, 0.4);
  border-radius: 15px;
  padding: 20px;
  margin: 20px;
  text-align: center;
`;

const TablePage: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const { t } = useLanguage();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Track table access for analytics
    if (tableId) {
      const timestamp = new Date().toISOString();
      const tableAccess = {
        tableId,
        timestamp,
        userAgent: navigator.userAgent,
        language: navigator.language
      };
      
      // Store in localStorage for demo purposes
      // In production, this would be sent to the backend
      const existingData = localStorage.getItem('tableAnalytics');
      const analytics = existingData ? JSON.parse(existingData) : [];
      analytics.push(tableAccess);
      localStorage.setItem('tableAnalytics', JSON.stringify(analytics));
    }
  }, [tableId]);

  return (
    <TableContainer>
      <TableHeader
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <TableTitle>
          Tisch {tableId}
        </TableTitle>
        <TableSubtitle>
          {t('hero.welcome')} {t('hero.title')}
        </TableSubtitle>
      </TableHeader>

      {showWelcome && (
        <WelcomeMessage
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <h3 style={{ 
            fontFamily: 'Kallisto, sans-serif', 
            color: '#FF41FB', 
            marginBottom: '10px',
            textTransform: 'uppercase'
          }}>
            Willkommen an Tisch {tableId}! 
          </h3>
          <p style={{ 
            fontFamily: 'Aldrich, sans-serif', 
            color: 'white', 
            margin: 0 
          }}>
            Entdecken Sie unsere exklusive Speisekarte
          </p>
        </WelcomeMessage>
      )}

      <MenuPage />
    </TableContainer>
  );
};

export default TablePage;