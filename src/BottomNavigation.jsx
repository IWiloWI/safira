/**
 * BottomNavigation.jsx - Main navigation container
 * Modern React component with responsive design and accessibility
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitch from './LanguageSwitch';
import CategorySelector from './CategorySelector';
import WiFiLogin from './WiFiLogin';
import NavigationIcon from './NavigationIcon';
import './navigation.css';

const BottomNavigation = ({
  categories = [],
  activeCategory = null,
  onCategoryChange = () => {},
  language = 'en',
  onLanguageChange = () => {},
  onWiFiConnect = () => {},
  showWiFiLogin = false,
  onToggleWiFiLogin = () => {},
  className = '',
  testId = 'bottom-navigation',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  
  const navigationRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Responsive breakpoints
  const [screenSize, setScreenSize] = useState('mobile');
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-hide on scroll
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const currentScrollY = window.scrollY;
    const scrollDifference = Math.abs(currentScrollY - lastScrollY);
    
    // Only hide/show if scroll distance is significant
    if (scrollDifference > 10) {
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide navigation
        setIsVisible(false);
      } else {
        // Scrolling up - show navigation
        setIsVisible(true);
      }
    }

    // Show navigation after scroll stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStart.x || !touchStart.y) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);

    // Only consider horizontal swipes
    if (deltaX > deltaY && deltaX > 20) {
      setIsSwiping(true);
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
    }
  }, [touchStart]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping || !touchStart.x || !touchEnd.x) return;

    const deltaX = touchEnd.x - touchStart.x;
    const minSwipeDistance = 100;

    if (Math.abs(deltaX) > minSwipeDistance) {
      const currentIndex = categories.findIndex(cat => cat.id === activeCategory);
      
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - previous category
        onCategoryChange(categories[currentIndex - 1].id);
      } else if (deltaX < 0 && currentIndex < categories.length - 1) {
        // Swipe left - next category
        onCategoryChange(categories[currentIndex + 1].id);
      }
    }

    // Reset touch states
    setTouchStart({ x: 0, y: 0 });
    setTouchEnd({ x: 0, y: 0 });
    setIsSwiping(false);
  }, [isSwiping, touchStart, touchEnd, categories, activeCategory, onCategoryChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!navigationRef.current?.contains(document.activeElement)) return;

    const currentIndex = categories.findIndex(cat => cat.id === activeCategory);

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (currentIndex > 0) {
          onCategoryChange(categories[currentIndex - 1].id);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentIndex < categories.length - 1) {
          onCategoryChange(categories[currentIndex + 1].id);
        }
        break;
      case 'Home':
        e.preventDefault();
        if (categories.length > 0) {
          onCategoryChange(categories[0].id);
        }
        break;
      case 'End':
        e.preventDefault();
        if (categories.length > 0) {
          onCategoryChange(categories[categories.length - 1].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (isExpanded) {
          setIsExpanded(false);
        }
        break;
    }
  }, [categories, activeCategory, onCategoryChange, isExpanded]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Safe area detection for iOS devices
  const [safeAreaBottom, setSafeAreaBottom] = useState(0);
  
  useEffect(() => {
    const updateSafeArea = () => {
      const bottom = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--safe-area-inset-bottom') || '0'
      );
      setSafeAreaBottom(bottom);
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  // Animation variants
  const containerVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1
      }
    },
    hidden: {
      y: '100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const itemVariants = {
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 }
    },
    hidden: {
      opacity: 0,
      scale: 0.8
    }
  };

  const expandVariants = {
    expanded: {
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    collapsed: {
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <>
      <motion.nav
        ref={navigationRef}
        className={`bottom-navigation ${className} ${screenSize}`}
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        style={{
          paddingBottom: safeAreaBottom
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-testid={testId}
        role="navigation"
        aria-label="Bottom navigation menu"
        {...props}
      >
        {/* Swipe indicator */}
        <motion.div 
          className="swipe-indicator"
          animate={{
            opacity: isSwiping ? 0.8 : 0.3,
            scale: isSwiping ? 1.2 : 1
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Main navigation content */}
        <motion.div
          className="navigation-content"
          variants={expandVariants}
          animate={isExpanded ? "expanded" : "collapsed"}
        >
          {/* Navigation controls row */}
          <div className="navigation-row controls-row">
            <motion.div variants={itemVariants} className="nav-group">
              <LanguageSwitch
                currentLanguage={language}
                onLanguageChange={onLanguageChange}
                className="language-switch-compact"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="nav-group">
              <button
                className="expand-button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Collapse navigation" : "Expand navigation"}
              >
                <NavigationIcon
                  icon={isExpanded ? "chevron-down" : "chevron-up"}
                  size="medium"
                  animated
                />
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="nav-group">
              <button
                className="wifi-button"
                onClick={onToggleWiFiLogin}
                aria-label="WiFi login"
                data-active={showWiFiLogin}
              >
                <NavigationIcon
                  icon="wifi"
                  size="medium"
                  color={showWiFiLogin ? "primary" : "secondary"}
                  animated
                />
              </button>
            </motion.div>
          </div>

          {/* Category navigation row */}
          <AnimatePresence>
            {(isExpanded || screenSize === 'mobile') && (
              <motion.div
                className="navigation-row categories-row"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CategorySelector
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={onCategoryChange}
                  language={language}
                  orientation={screenSize === 'mobile' ? 'horizontal' : 'grid'}
                  showLabels={isExpanded || screenSize !== 'mobile'}
                  enableSwipe={screenSize === 'mobile'}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick actions row (tablet/desktop only) */}
          {screenSize !== 'mobile' && (
            <motion.div
              className="navigation-row actions-row"
              variants={itemVariants}
            >
              <button
                className="quick-action-btn"
                onClick={() => window.history.back()}
                aria-label="Go back"
              >
                <NavigationIcon icon="arrow-left" size="small" />
                <span className="action-label">Back</span>
              </button>

              <button
                className="quick-action-btn"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Scroll to top"
              >
                <NavigationIcon icon="arrow-up" size="small" />
                <span className="action-label">Top</span>
              </button>

              <button
                className="quick-action-btn"
                onClick={onToggleWiFiLogin}
                aria-label="WiFi settings"
              >
                <NavigationIcon icon="settings" size="small" />
                <span className="action-label">Settings</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.nav>

      {/* WiFi Login Modal */}
      <AnimatePresence>
        {showWiFiLogin && (
          <WiFiLogin
            onConnect={onWiFiConnect}
            onClose={onToggleWiFiLogin}
            language={language}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNavigation;