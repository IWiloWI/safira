/**
 * ARIA Live Region component for dynamic content announcements
 * Provides screen reader notifications for content changes
 */

import React, { useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { ariaUtils } from '../../utils/accessibility';

const LiveRegionContainer = styled.div<{ $priority: 'polite' | 'assertive' }>`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

interface LiveRegionProps {
  /** Content to announce to screen readers */
  children?: React.ReactNode;
  
  /** Priority level for announcements */
  priority?: 'polite' | 'assertive';
  
  /** Whether the entire region content should be read when any part changes */
  atomic?: boolean;
  
  /** What types of changes should trigger announcements */
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  
  /** Whether the live region is active */
  active?: boolean;
  
  /** Custom ARIA label */
  'aria-label'?: string;
  
  /** Custom ID */
  id?: string;
  
  /** Additional CSS class */
  className?: string;
}

/**
 * Live Region component for announcing dynamic content changes to screen readers
 */
const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  priority = 'polite',
  atomic = true,
  relevant = 'all',
  active = true,
  'aria-label': ariaLabel,
  id,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef<string>('');
  
  // Generate unique ID if not provided
  const regionId = id || ariaUtils.generateId('live-region');
  
  // Convert children to string for comparison
  const currentContent = React.Children.toArray(children)
    .map(child => 
      typeof child === 'string' ? child : 
      typeof child === 'number' ? child.toString() : 
      React.isValidElement(child) ? child.props.children : ''
    )
    .join(' ')
    .trim();
  
  // Announce content changes
  useEffect(() => {
    if (!active || !currentContent) return;
    
    // Only announce if content has actually changed
    if (currentContent !== lastContentRef.current) {
      lastContentRef.current = currentContent;
      
      // Small delay to ensure DOM updates are complete
      const timeoutId = setTimeout(() => {
        if (containerRef.current) {
          // Update the live region content
          containerRef.current.textContent = currentContent;
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentContent, active]);
  
  // Clear content after announcement to allow repeat announcements
  useEffect(() => {
    if (!currentContent) return;
    
    const timeoutId = setTimeout(() => {
      if (containerRef.current && containerRef.current.textContent === currentContent) {
        // Clear the content to allow the same message to be announced again later
        containerRef.current.textContent = '';
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [currentContent]);
  
  return (
    <LiveRegionContainer
      ref={containerRef}
      $priority={priority}
      className={className}
      id={regionId}
      aria-live={active ? priority : 'off'}
      aria-atomic={atomic}
      aria-relevant={relevant}
      aria-label={ariaLabel}
      role="status"
    />
  );
};

// Convenience components for different announcement types
export const PoliteAnnouncement: React.FC<Omit<LiveRegionProps, 'priority'>> = (props) => (
  <LiveRegion priority="polite" {...props} />
);

export const AssertiveAnnouncement: React.FC<Omit<LiveRegionProps, 'priority'>> = (props) => (
  <LiveRegion priority="assertive" {...props} />
);

export const StatusAnnouncement: React.FC<Omit<LiveRegionProps, 'priority' | 'relevant'>> = (props) => (
  <LiveRegion priority="polite" relevant="all" {...props} />
);

export const ErrorAnnouncement: React.FC<Omit<LiveRegionProps, 'priority'>> = (props) => (
  <LiveRegion priority="assertive" {...props} />
);

// Hook for programmatic announcements
export const useLiveAnnouncement = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    ariaUtils.announce(message, priority);
  }, []);
  
  const announceError = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);
  
  const announceSuccess = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);
  
  const announceLoading = useCallback((message: string = 'Loading...') => {
    announce(message, 'polite');
  }, [announce]);
  
  return {
    announce,
    announceError,
    announceSuccess,
    announceLoading
  };
};

export default LiveRegion;