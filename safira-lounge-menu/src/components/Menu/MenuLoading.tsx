/**
 * Menu Loading Component
 * Displays loading states and skeleton placeholders for menu content
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { LoadingSpinnerProps } from '../../types';

// Loading animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// Styled components
const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Aldrich', sans-serif;
  min-height: 300px;
`;

const Spinner = styled.div<{ size: 'small' | 'medium' | 'large'; color?: string }>`
  width: ${props => {
    switch (props.size) {
      case 'small': return '30px';
      case 'large': return '70px';
      default: return '50px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '30px';
      case 'large': return '70px';
      default: return '50px';
    }
  }};
  border: 3px solid rgba(255, 65, 251, 0.3);
  border-top: 3px solid ${props => props.color || '#FF41FB'};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.p`
  margin: 0;
  font-size: 1rem;
  letter-spacing: 0.5px;
`;

const SkeletonContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
`;

const SkeletonCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  height: 200px;
  
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
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: ${shimmer} 2s infinite;
  }
`;

const SkeletonLine = styled.div<{ width?: string; height?: string; margin?: string }>`
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '16px'};
  margin: ${props => props.margin || '10px 0'};
  animation: ${pulse} 2s infinite;
`;

const SkeletonHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const SkeletonLogo = styled.div`
  width: 200px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  margin: 0 auto 20px;
  animation: ${pulse} 2s infinite;
  
  @media (max-width: 768px) {
    width: 150px;
    height: 45px;
  }
`;

const SkeletonTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding: 0 20px;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SkeletonTab = styled.div`
  min-width: 100px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  animation: ${pulse} 2s infinite;
  
  &:nth-child(odd) {
    animation-delay: 0.2s;
  }
`;

// Component interfaces
export interface MenuLoadingProps {
  /** Loading text to display */
  text?: string;
  /** Loading type */
  type?: 'spinner' | 'skeleton' | 'minimal';
  /** Spinner size */
  size?: 'small' | 'medium' | 'large';
  /** Spinner color */
  color?: string;
  /** Show skeleton for product grid */
  showProductSkeleton?: boolean;
  /** Number of skeleton cards to show */
  skeletonCount?: number;
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Menu Loading Component
 * Displays various loading states for the menu application
 */
export const MenuLoading: React.FC<MenuLoadingProps> = React.memo(({
  text = 'Menü wird geladen...',
  type = 'spinner',
  size = 'medium',
  color,
  showProductSkeleton = false,
  skeletonCount = 6,
  className,
  testId = 'menu-loading'
}) => {
  // Render different loading types
  const renderLoading = () => {
    switch (type) {
      case 'skeleton':
        return (
          <SkeletonContainer className={className} data-testid={testId}>
            <SkeletonHeader>
              <SkeletonLogo />
              <SkeletonTabs>
                {Array.from({ length: 5 }, (_, i) => (
                  <SkeletonTab key={i} />
                ))}
              </SkeletonTabs>
            </SkeletonHeader>
            
            {showProductSkeleton && (
              <SkeletonGrid>
                {Array.from({ length: skeletonCount }, (_, i) => (
                  <SkeletonCard key={i}>
                    <SkeletonLine width="60%" height="20px" margin="0 0 15px 0" />
                    <SkeletonLine width="100%" height="14px" margin="0 0 8px 0" />
                    <SkeletonLine width="80%" height="14px" margin="0 0 8px 0" />
                    <SkeletonLine width="40%" height="18px" margin="15px 0 0 0" />
                  </SkeletonCard>
                ))}
              </SkeletonGrid>
            )}
          </SkeletonContainer>
        );
      
      case 'minimal':
        return (
          <LoadingContainer
            className={className}
            data-testid={testId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingText>{text}</LoadingText>
          </LoadingContainer>
        );
      
      default:
        return (
          <LoadingContainer
            className={className}
            data-testid={testId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Spinner size={size} color={color} />
            <LoadingText>{text}</LoadingText>
          </LoadingContainer>
        );
    }
  };

  return renderLoading();
});

/**
 * Skeleton Loading for Product Cards
 */
export const ProductCardSkeleton: React.FC<{ count?: number; className?: string }> = React.memo(({
  count = 1,
  className
}) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCard key={i} className={className}>
        <SkeletonLine width="60%" height="20px" margin="0 0 15px 0" />
        <SkeletonLine width="100%" height="14px" margin="0 0 8px 0" />
        <SkeletonLine width="80%" height="14px" margin="0 0 8px 0" />
        <SkeletonLine width="40%" height="18px" margin="15px 0 0 0" />
      </SkeletonCard>
    ))}
  </>
));

/**
 * Category Tabs Skeleton
 */
export const CategoryTabsSkeleton: React.FC<{ count?: number; className?: string }> = React.memo(({
  count = 5,
  className
}) => (
  <SkeletonTabs className={className}>
    {Array.from({ length: count }, (_, i) => (
      <SkeletonTab key={i} />
    ))}
  </SkeletonTabs>
));

/**
 * Full Page Loading with Background
 */
export const FullPageLoading: React.FC<{
  text?: string;
  showBackground?: boolean;
  className?: string;
}> = React.memo(({
  text = 'Loading...',
  showBackground = true,
  className
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: showBackground 
        ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%)'
        : 'transparent',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <MenuLoading text={text} size="large" />
  </motion.div>
));

// Default export
export default MenuLoading;