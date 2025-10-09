/**
 * Skip Link component for keyboard navigation
 * Provides accessible navigation to main content areas
 */

import React from 'react';
import styled from 'styled-components';

const SkipLinkWrapper = styled.div`
  position: relative;
  z-index: 10000;
`;

const SkipLinkButton = styled.a`
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  z-index: 10001;
  transition: top 0.2s ease;

  /* Ensure it's always in tab order */
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  white-space: nowrap;
  width: 1px;

  &:focus {
    /* Remove clip when focused to make visible */
    clip: auto;
    clip-path: none;
    height: auto;
    overflow: visible;
    width: auto;
    top: 6px;
    outline: 2px solid #FF41FB;
    outline-offset: 2px;
  }

  &:hover:focus {
    background: #333;
  }
`;

export interface SkipLinkProps {
  /** Target element ID to skip to */
  href: string;
  /** Link text (default: "Skip to main content") */
  children?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

/**
 * Skip Link component for keyboard accessibility
 * Allows keyboard users to skip repetitive navigation
 */
const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children = "Skip to main content",
  className
}) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    
    // Find target element
    const targetId = href.startsWith('#') ? href.slice(1) : href;
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Make target focusable if it isn't already
      const originalTabIndex = targetElement.getAttribute('tabindex');
      targetElement.setAttribute('tabindex', '-1');
      
      // Focus the target
      targetElement.focus();
      
      // Restore original tabindex
      if (originalTabIndex === null) {
        targetElement.removeAttribute('tabindex');
      } else {
        targetElement.setAttribute('tabindex', originalTabIndex);
      }
      
      // Smooth scroll to target
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <SkipLinkWrapper className={className}>
      <SkipLinkButton
        href={href.startsWith('#') ? href : `#${href}`}
        onClick={handleClick}
      >
        {children}
      </SkipLinkButton>
    </SkipLinkWrapper>
  );
};

export default SkipLink;