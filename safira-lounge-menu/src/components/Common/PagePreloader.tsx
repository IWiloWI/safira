/**
 * Page Preloader Component
 * Displays loading animation during page transitions
 */

import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const PreloaderContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #000000 0%, #1a1a2e 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
`;

const LogoContainer = styled(motion.div)`
  position: relative;
  margin-bottom: 40px;
`;

const LogoImage = styled.img`
  width: 200px;
  height: auto;
  filter: drop-shadow(0 0 30px rgba(255, 65, 251, 0.8));

  @media (max-width: 768px) {
    width: 150px;
  }
`;

const LoadingBarContainer = styled.div`
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    width: 250px;
  }
`;

const LoadingBar = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #FF1493, #FF41FB, #FFD700);
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(255, 65, 251, 0.6);
`;

const LoadingText = styled(motion.p)`
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 20px;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const GlowCircle = styled(motion.div)`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 65, 251, 0.3) 0%, transparent 70%);
  filter: blur(40px);
  z-index: -1;
`;

interface PagePreloaderProps {
  isLoading: boolean;
  loadingText?: string;
}

export const PagePreloader: React.FC<PagePreloaderProps> = ({
  isLoading,
  loadingText = 'Lädt...'
}) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <PreloaderContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background glow effect */}
          <GlowCircle
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* Logo */}
          <LogoContainer
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              ease: 'easeOut'
            }}
          >
            <LogoImage
              src="/images/safira_logo_220w.webp"
              alt="Safira Lounge"
            />
          </LogoContainer>

          {/* Loading bar */}
          <LoadingBarContainer>
            <LoadingBar
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </LoadingBarContainer>

          {/* Loading text */}
          <LoadingText
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {loadingText}
          </LoadingText>
        </PreloaderContainer>
      )}
    </AnimatePresence>
  );
};

export default PagePreloader;
