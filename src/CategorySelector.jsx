/**
 * CategorySelector.jsx - Category selection component
 * Provides smooth category navigation with swipe support and accessibility
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationIcon from './NavigationIcon';

const CategorySelector = ({
  categories = [],
  activeCategory = null,
  onCategoryChange = () => {},
  language = 'en',
  orientation = 'horizontal', // 'horizontal' | 'grid' | 'vertical'
  showLabels = true,
  enableSwipe = true,
  maxVisible = 5,
  compact = false,
  showCounter = false,
  className = '',
  testId = 'category-selector',
  ...props
}) => {
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Get category display name based on language
  const getCategoryName = useCallback((category) => {
    if (!category) return '';
    
    if (typeof category.name === 'string') {
      return category.name;
    }
    
    if (typeof category.name === 'object' && category.name) {
      return category.name[language] || 
             category.name.en || 
             category.name.de || 
             Object.values(category.name)[0] || 
             'Unknown';
    }
    
    return category.title || category.label || 'Unknown';
  }, [language]);

  // Filter and process categories
  const validCategories = categories.filter(cat => cat && (cat.id || cat.key));
  const displayCategories = orientation === 'horizontal' && !showAll 
    ? validCategories.slice(visibleStartIndex, visibleStartIndex + maxVisible)
    : validCategories;

  const hasMore = validCategories.length > maxVisible;
  const canScrollLeft = visibleStartIndex > 0;
  const canScrollRight = visibleStartIndex + maxVisible < validCategories.length;

  // Auto-scroll to active category
  useEffect(() => {
    if (!activeCategory || orientation !== 'horizontal') return;

    const activeIndex = validCategories.findIndex(cat => 
      (cat.id || cat.key) === activeCategory
    );

    if (activeIndex >= 0) {
      // Ensure active category is visible
      if (activeIndex < visibleStartIndex) {
        setVisibleStartIndex(Math.max(0, activeIndex - 1));
      } else if (activeIndex >= visibleStartIndex + maxVisible) {
        setVisibleStartIndex(Math.min(
          validCategories.length - maxVisible,
          activeIndex - maxVisible + 2
        ));
      }
    }
  }, [activeCategory, validCategories, visibleStartIndex, maxVisible, orientation]);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId) => {
    if (categoryId !== activeCategory) {
      onCategoryChange(categoryId);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  }, [activeCategory, onCategoryChange]);

  // Navigation functions
  const scrollLeft = useCallback(() => {
    if (canScrollLeft) {
      setVisibleStartIndex(prev => Math.max(0, prev - 1));
    }
  }, [canScrollLeft]);

  const scrollRight = useCallback(() => {
    if (canScrollRight) {
      setVisibleStartIndex(prev => 
        Math.min(validCategories.length - maxVisible, prev + 1)
      );
    }
  }, [canScrollRight, validCategories.length, maxVisible]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e) => {
    if (!enableSwipe) return;
    
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(false);
  }, [enableSwipe]);

  const handleTouchMove = useCallback((e) => {
    if (!enableSwipe || !touchStart.x) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);

    // Only handle horizontal swipes
    if (deltaX > deltaY && deltaX > 20) {
      setIsSwiping(true);
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
      e.preventDefault(); // Prevent scrolling
    }
  }, [enableSwipe, touchStart]);

  const handleTouchEnd = useCallback(() => {
    if (!enableSwipe || !isSwiping || !touchStart.x || !touchEnd.x) {
      setTouchStart({ x: 0, y: 0 });
      setTouchEnd({ x: 0, y: 0 });
      setIsSwiping(false);
      return;
    }

    const deltaX = touchEnd.x - touchStart.x;
    const minSwipeDistance = 80;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - show previous categories
        scrollLeft();
      } else {
        // Swipe left - show next categories
        scrollRight();
      }
    }

    // Reset touch states
    setTouchStart({ x: 0, y: 0 });
    setTouchEnd({ x: 0, y: 0 });
    setIsSwiping(false);
  }, [enableSwipe, isSwiping, touchStart, touchEnd, scrollLeft, scrollRight]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e, categoryId) => {
    const currentIndex = validCategories.findIndex(cat => 
      (cat.id || cat.key) === categoryId
    );

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleCategorySelect(categoryId);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (currentIndex > 0) {
          const prevCategory = validCategories[currentIndex - 1];
          handleCategorySelect(prevCategory.id || prevCategory.key);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentIndex < validCategories.length - 1) {
          const nextCategory = validCategories[currentIndex + 1];
          handleCategorySelect(nextCategory.id || nextCategory.key);
        }
        break;
      case 'Home':
        e.preventDefault();
        if (validCategories.length > 0) {
          const firstCategory = validCategories[0];
          handleCategorySelect(firstCategory.id || firstCategory.key);
        }
        break;
      case 'End':
        e.preventDefault();
        if (validCategories.length > 0) {
          const lastCategory = validCategories[validCategories.length - 1];
          handleCategorySelect(lastCategory.id || lastCategory.key);
        }
        break;
    }
  }, [validCategories, handleCategorySelect]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  if (validCategories.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`category-selector ${className} ${orientation} ${compact ? 'compact' : ''}`}
      data-testid={testId}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {/* Navigation controls for horizontal layout */}
      {orientation === 'horizontal' && hasMore && (
        <div className="navigation-controls">
          <motion.button
            className={`nav-arrow left ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Show previous categories"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <NavigationIcon icon="chevron-left" size="small" />
          </motion.button>

          <motion.button
            className={`nav-arrow right ${!canScrollRight ? 'disabled' : ''}`}
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Show next categories"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <NavigationIcon icon="chevron-right" size="small" />
          </motion.button>
        </div>
      )}

      {/* Category container */}
      <motion.div
        ref={scrollContainerRef}
        className="categories-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        role="tablist"
        aria-label="Category navigation"
      >
        <AnimatePresence mode="wait">
          {displayCategories.map((category, index) => {
            const categoryId = category.id || category.key;
            const isActive = categoryId === activeCategory;
            const categoryName = getCategoryName(category);
            
            return (
              <motion.div
                key={categoryId}
                className="category-item"
                variants={orientation === 'horizontal' ? slideVariants : itemVariants}
                custom={index}
                layout
              >
                <motion.button
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                  aria-selected={isActive}
                  aria-controls={`panel-${categoryId}`}
                  className={`category-button ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(categoryId)}
                  onKeyDown={(e) => handleKeyDown(e, categoryId)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  {/* Category icon */}
                  <div className="category-icon">
                    {category.icon ? (
                      typeof category.icon === 'string' && category.icon.startsWith('http') ? (
                        <img 
                          src={category.icon} 
                          alt=""
                          className="icon-image"
                          loading="lazy"
                        />
                      ) : (
                        <span className="icon-emoji" role="img" aria-hidden="true">
                          {category.icon}
                        </span>
                      )
                    ) : (
                      <NavigationIcon 
                        icon="folder" 
                        size={compact ? "small" : "medium"} 
                      />
                    )}
                  </div>

                  {/* Category label */}
                  {showLabels && (
                    <span className="category-label">
                      {categoryName}
                    </span>
                  )}

                  {/* Item counter */}
                  {showCounter && category.count !== undefined && (
                    <span className="category-count">
                      {category.count}
                    </span>
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="active-indicator"
                      layoutId="activeIndicator"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Show all toggle for grid layout */}
      {orientation === 'grid' && hasMore && !showAll && (
        <motion.button
          className="show-all-button"
          onClick={() => setShowAll(true)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
        >
          <NavigationIcon icon="grid" size="small" />
          <span>Show All ({validCategories.length})</span>
        </motion.button>
      )}

      {/* Pagination dots for horizontal layout */}
      {orientation === 'horizontal' && hasMore && (
        <div className="pagination-dots">
          {Array.from({ length: Math.ceil(validCategories.length / maxVisible) }).map((_, index) => {
            const isActive = Math.floor(visibleStartIndex / maxVisible) === index;
            return (
              <motion.button
                key={index}
                className={`pagination-dot ${isActive ? 'active' : ''}`}
                onClick={() => setVisibleStartIndex(index * maxVisible)}
                whileTap={{ scale: 0.8 }}
                aria-label={`Go to page ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;