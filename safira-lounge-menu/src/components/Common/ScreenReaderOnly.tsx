/**
 * Screen Reader Only component
 * Content visible only to screen readers, hidden from visual users
 */

import React from 'react';
import styled from 'styled-components';

const VisuallyHidden = styled.span<{ focusable?: boolean }>`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
  
  ${props => props.focusable && `
    &:focus {
      position: static !important;
      width: auto !important;
      height: auto !important;
      padding: 8px !important;
      margin: 0 !important;
      overflow: visible !important;
      clip: auto !important;
      white-space: normal !important;
      background: #000 !important;
      color: #fff !important;
      border: 2px solid #FF41FB !important;
      border-radius: 4px !important;
      z-index: 10000 !important;
    }
  `}
`;

export interface ScreenReaderOnlyProps {
  /** Content to be read by screen readers only */
  children: React.ReactNode;
  /** Whether the content should become visible when focused */
  focusable?: boolean;
  /** HTML element type (default: span) */
  as?: keyof JSX.IntrinsicElements;
  /** Additional CSS class */
  className?: string;
  /** Tab index for focusable elements */
  tabIndex?: number;
}

/**
 * Component for content that should only be available to screen readers
 * Optionally can become visible when focused (useful for skip links)
 */
const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
  children,
  focusable = false,
  as = 'span',
  className,
  tabIndex,
  ...props
}) => {
  return (
    <VisuallyHidden
      as={as}
      focusable={focusable}
      className={className}
      tabIndex={focusable ? (tabIndex ?? 0) : undefined}
      {...props}
    >
      {children}
    </VisuallyHidden>
  );
};

// Convenience components for common use cases
export const ScreenReaderText = (props: Omit<ScreenReaderOnlyProps, 'as'>) => (
  <ScreenReaderOnly as="span" {...props} />
);

export const ScreenReaderHeading = ({ level = 2, ...props }: Omit<ScreenReaderOnlyProps, 'as'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) => (
  <ScreenReaderOnly as={`h${level}` as keyof JSX.IntrinsicElements} {...props} />
);

export const ScreenReaderButton = (props: Omit<ScreenReaderOnlyProps, 'as' | 'focusable'>) => (
  <ScreenReaderOnly as="button" focusable={true} {...props} />
);

export const ScreenReaderLink = (props: Omit<ScreenReaderOnlyProps, 'as' | 'focusable'>) => (
  <ScreenReaderOnly as="a" focusable={true} {...props} />
);

export default ScreenReaderOnly;