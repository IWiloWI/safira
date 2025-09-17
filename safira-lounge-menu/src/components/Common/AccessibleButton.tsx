/**
 * Fully accessible button component with comprehensive ARIA support
 * Meets WCAG 2.1 AA standards for interactive elements
 */

import React, { forwardRef, useState, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { FaSpinner } from 'react-icons/fa';
import { touchUtils, motionUtils } from '../../utils/accessibility';
import useAccessibility from '../../hooks/useAccessibility';

// Base button styles with accessibility considerations
const BaseButton = styled.button<{
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'small' | 'medium' | 'large';
  isLoading: boolean;
  disabled: boolean;
  hasIcon: boolean;
  iconOnly: boolean;
  shouldShowFocusRing: boolean;
  reducedMotion: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: ${props => props.reducedMotion ? 'none' : 'all 0.2s ease'};
  position: relative;
  overflow: hidden;
  
  /* Ensure minimum touch target size */
  min-width: 44px;
  min-height: 44px;
  
  /* Size variants */
  ${props => {
    switch (props.size) {
      case 'small':
        return css`
          padding: ${props.iconOnly ? '8px' : '8px 16px'};
          font-size: 0.875rem;
          min-height: 36px;
        `;
      case 'large':
        return css`
          padding: ${props.iconOnly ? '16px' : '16px 24px'};
          font-size: 1.125rem;
          min-height: 52px;
        `;
      default: // medium
        return css`
          padding: ${props.iconOnly ? '12px' : '12px 20px'};
          font-size: 1rem;
          min-height: 44px;
        `;
    }
  }}
  
  /* Color variants */
  ${props => {
    switch (props.variant) {
      case 'primary':
        return css`
          background: linear-gradient(135deg, #FF41FB 0%, #FF0080 100%);
          color: #fff;
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #E63EE6 0%, #E6006B 100%);
            transform: ${props.reducedMotion ? 'none' : 'translateY(-1px)'};
          }
          
          &:active:not(:disabled) {
            transform: ${props.reducedMotion ? 'none' : 'translateY(0)'};
            background: linear-gradient(135deg, #CC33CC 0%, #CC0066 100%);
          }
        `;
      case 'secondary':
        return css`
          background: rgba(255, 255, 255, 0.1);
          color: #333;
          border: 2px solid rgba(255, 65, 251, 0.3);
          
          &:hover:not(:disabled) {
            background: rgba(255, 65, 251, 0.1);
            border-color: #FF41FB;
          }
          
          &:active:not(:disabled) {
            background: rgba(255, 65, 251, 0.2);
          }
        `;
      case 'danger':
        return css`
          background: #FF6B6B;
          color: #fff;
          
          &:hover:not(:disabled) {
            background: #FF5252;
          }
          
          &:active:not(:disabled) {
            background: #FF4444;
          }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: #666;
          
          &:hover:not(:disabled) {
            background: rgba(255, 65, 251, 0.1);
            color: #333;
          }
          
          &:active:not(:disabled) {
            background: rgba(255, 65, 251, 0.2);
          }
        `;
    }
  }}
  
  /* Focus styles */
  &:focus {
    outline: none;
    ${props => props.shouldShowFocusRing && css`
      box-shadow: 0 0 0 3px rgba(255, 65, 251, 0.4);
      outline: 2px solid transparent;
      outline-offset: 2px;
    `}
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    
    &:hover {
      transform: none !important;
    }
  }
  
  /* Loading state */
  ${props => props.isLoading && css`
    cursor: wait;
    pointer-events: none;
  `}
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 2px solid;
    
    &:focus {
      outline: 3px solid;
      outline-offset: 2px;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:hover:not(:disabled) {
      transform: none;
    }
  }
`;

const ButtonContent = styled.span<{ isLoading: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${props => props.isLoading ? 0 : 1};
  transition: opacity 0.2s ease;
`;

const LoadingSpinner = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  inset: 0;
`;

const SpinningIcon = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export interface AccessibleButtonProps {
  // Content
  children?: React.ReactNode;
  
  // Appearance
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  
  // State
  disabled?: boolean;
  loading?: boolean;
  pressed?: boolean; // For toggle buttons
  
  // Icon support
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  
  // Button behavior
  type?: 'button' | 'submit' | 'reset';
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-controls'?: string;
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  
  // Events
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  
  // Loading
  loadingText?: string;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  
  // HTML attributes
  id?: string;
  title?: string;
  tabIndex?: number;
}

/**
 * Fully accessible button component with WCAG 2.1 AA compliance
 */
const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>((
  {
    children,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    pressed,
    icon,
    iconPosition = 'left',
    iconOnly = false,
    type = 'button',
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-expanded': ariaExpanded,
    'aria-pressed': ariaPressed,
    'aria-controls': ariaControls,
    'aria-haspopup': ariaHasPopup,
    onClick,
    onKeyDown,
    onFocus,
    onBlur,
    loadingText = 'Loading...',
    className,
    style,
    id,
    title,
    tabIndex
  },
  ref
) => {
  const { shouldShowFocusRing, isReducedMotion, announce } = useAccessibility();
  const [isPressed, setIsPressed] = useState(false);
  
  const isLoading = loading;
  const isDisabled = disabled || isLoading;
  const hasIcon = Boolean(icon);
  const shouldShowIconOnly = iconOnly && hasIcon;
  
  // Determine ARIA pressed state
  const actualAriaPressed = pressed !== undefined ? pressed : (ariaPressed !== undefined ? ariaPressed : undefined);
  
  // Handle click with loading state announcement
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    
    if (isLoading) {
      announce(loadingText, 'polite');
    }
    
    onClick?.(event);
  }, [isDisabled, isLoading, loadingText, announce, onClick]);
  
  // Handle keyboard interactions
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    
    // Handle space and enter keys
    if (event.key === ' ' || event.key === 'Enter') {
      setIsPressed(true);
      
      // Announce loading state
      if (isLoading) {
        announce(loadingText, 'polite');
      }
    }
    
    onKeyDown?.(event);
  }, [isDisabled, isLoading, loadingText, announce, onKeyDown]);
  
  const handleKeyUp = useCallback(() => {
    setIsPressed(false);
  }, []);
  
  // Announce state changes
  const handleFocus = useCallback((event: React.FocusEvent<HTMLButtonElement>) => {
    if (isLoading) {
      announce(loadingText, 'polite');
    }
    
    onFocus?.(event);
  }, [isLoading, loadingText, announce, onFocus]);
  
  // Determine accessible label
  const accessibleLabel = ariaLabel || (shouldShowIconOnly ? title : undefined);
  
  // Determine button content
  const buttonContent = (
    <ButtonContent isLoading={isLoading}>
      {hasIcon && iconPosition === 'left' && icon}
      {!shouldShowIconOnly && children}
      {hasIcon && iconPosition === 'right' && icon}
    </ButtonContent>
  );
  
  return (
    <BaseButton
      ref={ref}
      type={type}
      variant={variant}
      size={size}
      isLoading={isLoading}
      disabled={isDisabled}
      hasIcon={hasIcon}
      iconOnly={shouldShowIconOnly}
      shouldShowFocusRing={shouldShowFocusRing}
      reducedMotion={isReducedMotion}
      className={className}
      style={style}
      id={id}
      title={title}
      tabIndex={isDisabled ? -1 : tabIndex}
      aria-label={accessibleLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={actualAriaPressed}
      aria-controls={ariaControls}
      aria-haspopup={ariaHasPopup}
      aria-disabled={isDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={handleFocus}
      onBlur={onBlur}
    >
      {buttonContent}
      
      {isLoading && (
        <LoadingSpinner aria-hidden="true">
          <SpinningIcon />
        </LoadingSpinner>
      )}
    </BaseButton>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;