/**
 * NavigationIcon.jsx - Reusable icon component
 * Provides consistent icon rendering with animations and accessibility
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';

// Icon mappings to Unicode/emoji characters
const ICON_MAP = {
  // Navigation
  'chevron-up': '↑',
  'chevron-down': '↓',
  'chevron-left': '←',
  'chevron-right': '→',
  'arrow-up': '↑',
  'arrow-down': '↓',
  'arrow-left': '←',
  'arrow-right': '→',
  'arrow-up-circle': '⬆️',
  'arrow-down-circle': '⬇️',
  
  // Interface
  'menu': '☰',
  'x': '✕',
  'close': '✕',
  'check': '✓',
  'check-circle': '✅',
  'x-circle': '❌',
  'plus': '+',
  'minus': '−',
  'settings': '⚙️',
  'gear': '⚙️',
  
  // Communication
  'wifi': '📶',
  'wifi-strong': '📶',
  'wifi-medium': '📶',
  'wifi-weak': '📶',
  'wifi-none': '📶',
  'wifi-off': '📵',
  'signal': '📶',
  'radio': '📻',
  
  // Actions
  'search': '🔍',
  'filter': '⚗️',
  'sort': '⇅',
  'refresh': '🔄',
  'reload': '🔄',
  'sync': '🔄',
  'loader': '⏳',
  'loading': '⏳',
  
  // Content
  'home': '🏠',
  'house': '🏠',
  'folder': '📁',
  'file': '📄',
  'document': '📄',
  'image': '🖼️',
  'photo': '🖼️',
  
  // Social/Communication
  'heart': '♥️',
  'star': '⭐',
  'bookmark': '🔖',
  'share': '↗️',
  'link': '🔗',
  'chain': '🔗',
  
  // Status/Feedback
  'info': 'ℹ️',
  'warning': '⚠️',
  'alert': '⚠️',
  'alert-circle': '⚠️',
  'error': '❌',
  'success': '✅',
  'question': '❓',
  'help': '❓',
  
  // Visibility
  'eye': '👁️',
  'eye-off': '🙈',
  'visible': '👁️',
  'hidden': '🙈',
  
  // Security
  'lock': '🔒',
  'unlock': '🔓',
  'key': '🔑',
  'shield': '🛡️',
  'security': '🛡️',
  
  // Technology
  'qr-code': '🔲',
  'barcode': '🔲',
  'code': '💻',
  'terminal': '💻',
  'database': '💾',
  'server': '🖥️',
  'cloud': '☁️',
  
  // Time
  'clock': '🕐',
  'time': '🕐',
  'calendar': '📅',
  'date': '📅',
  'schedule': '📅',
  
  // Media
  'play': '▶️',
  'pause': '⏸️',
  'stop': '⏹️',
  'volume': '🔊',
  'volume-up': '🔊',
  'volume-down': '🔉',
  'volume-off': '🔇',
  'mute': '🔇',
  
  // Layout
  'grid': '⊞',
  'list': '☰',
  'columns': '⫽',
  'rows': '☰',
  'layout': '⊞',
  
  // User/People
  'user': '👤',
  'users': '👥',
  'person': '👤',
  'people': '👥',
  'profile': '👤',
  'account': '👤',
  
  // Commerce
  'cart': '🛒',
  'shopping': '🛒',
  'bag': '🛍️',
  'payment': '💳',
  'credit-card': '💳',
  'money': '💰',
  
  // Location
  'map': '🗺️',
  'location': '📍',
  'pin': '📍',
  'marker': '📍',
  'compass': '🧭',
  'navigation-2': '🧭',
  
  // Misc
  'bell': '🔔',
  'notification': '🔔',
  'flag': '🏳️',
  'tag': '🏷️',
  'label': '🏷️',
  'hash': '#',
  'at': '@',
  'mail': '📧',
  'message': '💬',
  'chat': '💬',
  'phone': '📞',
  'mobile': '📱'
};

// Color mappings
const COLOR_MAP = {
  primary: '#ff41fb',
  secondary: 'rgba(255, 255, 255, 0.7)',
  success: '#00ff88',
  warning: '#ffb800',
  error: '#ff4757',
  info: '#0abde3',
  muted: 'rgba(255, 255, 255, 0.4)',
  white: '#ffffff',
  black: '#000000'
};

// Size mappings
const SIZE_MAP = {
  xs: '0.75rem',
  small: '1rem',
  medium: '1.25rem',
  large: '1.5rem',
  xl: '2rem',
  xxlarge: '3rem'
};

const NavigationIcon = memo(({
  icon = 'menu',
  size = 'medium',
  color = 'inherit',
  className = '',
  animated = false,
  rotation = 0,
  bounce = false,
  pulse = false,
  spin = false,
  onClick,
  onHover,
  disabled = false,
  ariaLabel,
  title,
  style = {},
  testId,
  ...props
}) => {
  // Get icon character
  const iconChar = ICON_MAP[icon] || ICON_MAP['help'] || '?';
  
  // Get color value
  const colorValue = COLOR_MAP[color] || color;
  
  // Get size value
  const sizeValue = SIZE_MAP[size] || size;
  
  // Animation variants
  const iconVariants = {
    initial: { 
      scale: 1, 
      rotate: rotation 
    },
    hover: {
      scale: animated ? 1.1 : 1,
      rotate: rotation,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: animated ? 0.9 : 1,
      transition: { duration: 0.1 }
    },
    bounce: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
        times: [0, 0.5, 1]
      }
    },
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 1,
        ease: "easeInOut",
        repeat: Infinity
      }
    },
    spin: {
      rotate: rotation + 360,
      transition: {
        duration: 1,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  // Determine animation state
  let animate = "initial";
  if (spin) animate = "spin";
  else if (pulse) animate = "pulse";
  else if (bounce) animate = "bounce";

  // Combine styles
  const combinedStyle = {
    fontSize: sizeValue,
    color: colorValue,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    userSelect: 'none',
    cursor: onClick && !disabled ? 'pointer' : 'default',
    opacity: disabled ? 0.5 : 1,
    ...style
  };

  // Handle click
  const handleClick = (e) => {
    if (!disabled && onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  // Handle hover
  const handleHover = (hovering) => {
    if (!disabled && onHover) {
      onHover(hovering);
    }
  };

  return (
    <motion.span
      className={`navigation-icon ${className} ${disabled ? 'disabled' : ''}`}
      style={combinedStyle}
      variants={iconVariants}
      initial="initial"
      animate={animate}
      whileHover={animated && !disabled ? "hover" : undefined}
      whileTap={animated && !disabled ? "tap" : undefined}
      onClick={handleClick}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      role={onClick ? "button" : "img"}
      tabIndex={onClick && !disabled ? 0 : -1}
      aria-label={ariaLabel || title}
      title={title}
      data-testid={testId}
      onKeyDown={(e) => {
        if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick(e);
        }
      }}
      {...props}
    >
      {/* Icon character */}
      <span 
        className="icon-char"
        style={{ 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontVariantEmoji: 'unicode'
        }}
      >
        {iconChar}
      </span>

      {/* Loading spinner overlay for specific icons */}
      {(icon === 'loader' || icon === 'loading') && (
        <motion.span
          className="spinner-overlay"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: `2px solid ${colorValue}`,
            borderTop: `2px solid transparent`,
            borderRadius: '50%'
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            ease: "linear",
            repeat: Infinity
          }}
        />
      )}
    </motion.span>
  );
});

NavigationIcon.displayName = 'NavigationIcon';

// Icon variants for specific use cases
export const SpinnerIcon = (props) => (
  <NavigationIcon icon="loader" spin animated {...props} />
);

export const CheckIcon = (props) => (
  <NavigationIcon icon="check" color="success" bounce animated {...props} />
);

export const ErrorIcon = (props) => (
  <NavigationIcon icon="error" color="error" pulse animated {...props} />
);

export const WiFiIcon = ({ strength = 100, ...props }) => {
  let icon = 'wifi-none';
  if (strength >= 80) icon = 'wifi-strong';
  else if (strength >= 60) icon = 'wifi-medium';
  else if (strength >= 40) icon = 'wifi-weak';
  
  return (
    <NavigationIcon 
      icon={icon} 
      color={strength >= 60 ? 'success' : strength >= 40 ? 'warning' : 'error'}
      {...props} 
    />
  );
};

export const ExpandIcon = ({ expanded, ...props }) => (
  <NavigationIcon
    icon={expanded ? 'chevron-up' : 'chevron-down'}
    rotation={expanded ? 180 : 0}
    animated
    {...props}
  />
);

// Utility function to check if icon exists
export const hasIcon = (iconName) => {
  return iconName in ICON_MAP;
};

// Get all available icons
export const getAvailableIcons = () => {
  return Object.keys(ICON_MAP);
};

// Get icon character directly
export const getIconChar = (iconName) => {
  return ICON_MAP[iconName] || '?';
};

export default NavigationIcon;