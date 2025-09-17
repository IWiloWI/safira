/**
 * LanguageSwitch.jsx - Language selector component
 * Provides smooth language switching with accessibility support
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationIcon from './NavigationIcon';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' }
];

const LanguageSwitch = ({
  currentLanguage = 'en',
  onLanguageChange = () => {},
  availableLanguages = LANGUAGES.slice(0, 3), // Default to first 3
  className = '',
  compact = false,
  showFlag = true,
  showNativeName = true,
  position = 'bottom', // 'top' | 'bottom' | 'left' | 'right'
  testId = 'language-switch',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleLanguageSelect(availableLanguages[focusedIndex].code);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => 
            prev < availableLanguages.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(availableLanguages.length - 1);
        } else {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : availableLanguages.length - 1
          );
        }
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
    }
  };

  const handleLanguageSelect = (languageCode) => {
    if (languageCode !== currentLanguage) {
      onLanguageChange(languageCode);
      
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  };

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  // Animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: position === 'top' ? 10 : -10,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 1, 1]
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: [0, 0, 0.2, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.15 }
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`language-switch ${className} ${compact ? 'compact' : ''} ${position}`}
      data-testid={testId}
      {...props}
    >
      {/* Trigger Button */}
      <motion.button
        ref={triggerRef}
        className={`language-trigger ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current language: ${currentLang.name}. Click to change language`}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <div className="language-display">
          {showFlag && (
            <span className="language-flag" role="img" aria-hidden="true">
              {currentLang.flag}
            </span>
          )}
          
          {!compact && (
            <span className="language-name">
              {showNativeName ? currentLang.nativeName : currentLang.name}
            </span>
          )}
          
          {!compact && (
            <NavigationIcon
              icon="chevron-down"
              size="small"
              className={`dropdown-icon ${isOpen ? 'rotated' : ''}`}
              animated
            />
          )}
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`language-dropdown ${position}`}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{
              transformOrigin: position === 'top' ? 'bottom center' : 'top center'
            }}
          >
            <ul
              ref={listRef}
              role="listbox"
              aria-label="Available languages"
              className="language-list"
            >
              {availableLanguages.map((language, index) => (
                <motion.li
                  key={language.code}
                  variants={itemVariants}
                  custom={index}
                >
                  <button
                    role="option"
                    aria-selected={language.code === currentLanguage}
                    className={`language-option ${
                      language.code === currentLanguage ? 'selected' : ''
                    } ${focusedIndex === index ? 'focused' : ''}`}
                    onClick={() => handleLanguageSelect(language.code)}
                    onKeyDown={handleKeyDown}
                    onMouseEnter={() => setFocusedIndex(index)}
                    onFocus={() => setFocusedIndex(index)}
                    tabIndex={-1}
                  >
                    <div className="option-content">
                      {showFlag && (
                        <span className="option-flag" role="img" aria-hidden="true">
                          {language.flag}
                        </span>
                      )}
                      
                      <div className="option-text">
                        <span className="option-native">
                          {language.nativeName}
                        </span>
                        {language.name !== language.nativeName && (
                          <span className="option-english">
                            {language.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {language.code === currentLanguage && (
                      <NavigationIcon
                        icon="check"
                        size="small"
                        color="primary"
                        className="selection-indicator"
                      />
                    )}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitch;