/**
 * Menu Background Component
 * Handles background video/image display with category-specific content
 */

import React from 'react';
import styled from 'styled-components';

// Styled components
const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -10;
  overflow: hidden;
`;

const FallbackBackground = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    #1a1a1a 0%,
    #2d1b69 25%,
    #1a1a2e 50%,
    #16213e 75%,
    #0f3460 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

export interface MenuBackgroundProps {
  /** Current category for background selection */
  category?: string;
  /** CSS class name */
  className?: string;
  /** CSS style */
  style?: React.CSSProperties;
}

/**
 * Menu Background Component
 * Displays category-specific background videos or images
 */
export const MenuBackground: React.FC<MenuBackgroundProps> = React.memo(({
  category,
  className,
  style
}) => {
  return (
    <BackgroundContainer
      className={className}
      style={style}
      data-category={category}
    >
      <FallbackBackground />
    </BackgroundContainer>
  );
});

// Default export
export default MenuBackground;