import styled from 'styled-components';

// Responsive breakpoints
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1200px',
  xl: '1400px'
};

// Container mixin for consistent layout - FULL WIDTH
export const containerMixin = `
  width: 100%;
  padding: 0 30px;

  @media (max-width: ${breakpoints.tablet}) {
    padding: 0 20px;
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 0 15px;
  }
`;

// Responsive grid mixin
export const responsiveGridMixin = `
  display: grid;
  gap: 20px;

  @media (min-width: ${breakpoints.xl}) {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }

  @media (min-width: ${breakpoints.laptop}) and (max-width: ${breakpoints.xl}) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }

  @media (min-width: ${breakpoints.tablet}) and (max-width: ${breakpoints.laptop}) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
  }

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

// Main responsive container
export const ResponsiveContainer = styled.div`
  ${containerMixin}
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

// Page header with responsive navigation
export const ResponsivePageHeader = styled.div`
  background: linear-gradient(145deg, rgba(255, 65, 251, 0.15), rgba(255, 65, 251, 0.1));
  border-bottom: 2px solid rgba(255, 65, 251, 0.3);
  backdrop-filter: blur(15px);
  position: sticky;
  top: 0;
  z-index: 1000;

  .header-content {
    ${containerMixin}
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 15px;
    padding-bottom: 15px;
    flex-wrap: wrap;
    gap: 15px;

    @media (max-width: ${breakpoints.tablet}) {
      padding-top: 12px;
      padding-bottom: 12px;
      gap: 10px;
    }
  }
`;

// Responsive page title
export const ResponsivePageTitle = styled.h1`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 65, 251, 0.6);
  white-space: nowrap;

  font-size: clamp(1.25rem, 3vw, 2rem);

  @media (max-width: ${breakpoints.mobile}) {
    font-size: 1.25rem;
  }
`;

// Responsive navigation bar
export const ResponsiveNavBar = styled.nav`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: ${breakpoints.tablet}) {
    width: 100%;
    justify-content: flex-start;
    gap: 8px;
  }

  @media (max-width: ${breakpoints.mobile}) {
    gap: 6px;
  }
`;

// Responsive navigation button
export const ResponsiveNavButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: ${props => props.$active ? 'rgba(255, 65, 251, 0.3)' : 'transparent'};
  border: 2px solid ${props => props.$active ? '#FF41FB' : 'rgba(255, 65, 251, 0.3)'};
  border-radius: 8px;
  color: ${props => props.$active ? '#FF41FB' : 'rgba(255, 255, 255, 0.8)'};
  font-family: 'Aldrich', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 65, 251, 0.2);
    border-color: #FF41FB;
    color: #FF41FB;
    transform: translateY(-1px);
  }

  svg {
    font-size: 1rem;
    flex-shrink: 0;
  }

  @media (max-width: ${breakpoints.tablet}) {
    padding: 8px 12px;
    font-size: 0.8rem;
    gap: 6px;
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 6px 10px;
    font-size: 0.75rem;
    gap: 4px;

    span {
      display: none;
    }
  }
`;

// Main content area
export const ResponsiveMainContent = styled.main`
  flex: 1;
  ${containerMixin}
  padding-top: 40px;
  padding-bottom: 40px;

  @media (max-width: ${breakpoints.tablet}) {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding-top: 15px;
    padding-bottom: 15px;
  }
`;

// Card grid layout
export const ResponsiveCardGrid = styled.div`
  ${responsiveGridMixin}
`;

// Individual card component
export const ResponsiveCard = styled.div`
  background: linear-gradient(145deg, rgba(255, 65, 251, 0.15), rgba(255, 65, 251, 0.08));
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(255, 65, 251, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(255, 65, 251, 0.3);
    border-color: rgba(255, 65, 251, 0.5);
  }

  @media (max-width: ${breakpoints.tablet}) {
    padding: 20px;
    border-radius: 15px;
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 15px;
    border-radius: 12px;
  }
`;

// Button styles
export const ResponsiveButton = styled.button<{
  $variant?: 'primary' | 'secondary' | 'danger' | 'success';
  $size?: 'small' | 'medium' | 'large';
  $fullWidth?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  font-family: 'Aldrich', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => props.$fullWidth && 'width: 100%;'}

  // Variants
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #FF41FB, #FF41FB);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 65, 251, 0.4);
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 65, 251, 0.6);
          }
        `;
      case 'secondary':
        return `
          background: rgba(255, 65, 251, 0.1);
          color: #FF41FB;
          border: 2px solid rgba(255, 65, 251, 0.3);
          &:hover {
            background: rgba(255, 65, 251, 0.2);
            border-color: #FF41FB;
          }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, #f44336, #e91e63);
          color: white;
          box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(244, 67, 54, 0.6);
          }
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, #4caf50, #8bc34a);
          color: white;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, #FF41FB, #FF41FB);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 65, 251, 0.4);
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 65, 251, 0.6);
          }
        `;
    }
  }}

  // Sizes
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          padding: 8px 16px;
          font-size: 0.75rem;

          @media (max-width: ${breakpoints.mobile}) {
            padding: 6px 12px;
            font-size: 0.7rem;
          }
        `;
      case 'large':
        return `
          padding: 15px 30px;
          font-size: 1rem;

          @media (max-width: ${breakpoints.mobile}) {
            padding: 12px 24px;
            font-size: 0.9rem;
          }
        `;
      default:
        return `
          padding: 12px 24px;
          font-size: 0.85rem;

          @media (max-width: ${breakpoints.mobile}) {
            padding: 10px 20px;
            font-size: 0.8rem;
          }
        `;
    }
  }}
`;

// Form elements
export const ResponsiveFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;

  @media (max-width: ${breakpoints.mobile}) {
    margin-bottom: 15px;
  }
`;

export const ResponsiveLabel = styled.label`
  font-family: 'Aldrich', sans-serif;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: ${breakpoints.mobile}) {
    font-size: 0.85rem;
  }
`;

export const ResponsiveInput = styled.input`
  padding: 12px 16px;
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 10px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 0 3px rgba(255, 65, 251, 0.2);
    background: rgba(0, 0, 0, 0.5);
    color: white;
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 10px 14px;
    font-size: 0.85rem;
  }
`;

export const ResponsiveTextarea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 10px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 0 3px rgba(255, 65, 251, 0.2);
    background: rgba(0, 0, 0, 0.5);
    color: white;
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 10px 14px;
    font-size: 0.85rem;
    min-height: 80px;
  }
`;

export const ResponsiveSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 10px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  cursor: pointer;

  option {
    background: rgba(26, 26, 46, 0.95);
    color: rgba(255, 255, 255, 0.9);
  }

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 0 3px rgba(255, 65, 251, 0.2);
    background: rgba(0, 0, 0, 0.5);
    color: white;
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 10px 14px;
    font-size: 0.85rem;
  }
`;

// Statistics/metrics display
export const ResponsiveStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 15px;
  }
`;

export const ResponsiveStatCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 65, 251, 0.1), rgba(255, 65, 251, 0.05));
  border: 2px solid rgba(255, 65, 251, 0.2);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 65, 251, 0.3);
    border-color: rgba(255, 65, 251, 0.4);
  }

  .stat-number {
    font-family: 'Oswald', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: #FF41FB;
    margin: 0;
    text-shadow: 0 0 10px rgba(255, 65, 251, 0.5);

    @media (max-width: ${breakpoints.mobile}) {
      font-size: 1.5rem;
    }
  }

  .stat-label {
    font-family: 'Aldrich', sans-serif;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 5px;

    @media (max-width: ${breakpoints.mobile}) {
      font-size: 0.75rem;
    }
  }

  @media (max-width: ${breakpoints.tablet}) {
    padding: 15px;
    border-radius: 12px;
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 12px;
    border-radius: 10px;
  }
`;

// Loading and empty states
export const ResponsiveLoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;

  @media (max-width: ${breakpoints.mobile}) {
    padding: 20px;
  }
`;

export const ResponsiveEmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);

  .empty-icon {
    font-size: 3rem;
    color: rgba(255, 65, 251, 0.5);
    margin-bottom: 15px;

    @media (max-width: ${breakpoints.mobile}) {
      font-size: 2rem;
      margin-bottom: 10px;
    }
  }

  .empty-title {
    font-family: 'Oswald', sans-serif;
    font-size: 1.2rem;
    margin-bottom: 8px;
    color: rgba(255, 255, 255, 0.8);

    @media (max-width: ${breakpoints.mobile}) {
      font-size: 1rem;
    }
  }

  .empty-description {
    font-family: 'Aldrich', sans-serif;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);

    @media (max-width: ${breakpoints.mobile}) {
      font-size: 0.8rem;
    }
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 20px;
  }
`;