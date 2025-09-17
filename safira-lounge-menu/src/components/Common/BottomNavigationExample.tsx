import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BottomNavigation from './BottomNavigation';
import type { Language, SocialMediaLinks } from '../../types/common.types';

/**
 * Example implementation showing how to integrate the BottomNavigation component
 * This demonstrates proper usage patterns and required data structures
 */

const BottomNavigationExample: React.FC = () => {
  const { i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Example categories data - using simple objects, not full Category type
  const categories = [
    { id: 'all', name: 'Alle', icon: '🍽️' },
    { id: 'drinks', name: 'Getränke', icon: '🥤' },
    { id: 'food', name: 'Essen', icon: '🍕' },
    { id: 'shisha', name: 'Shisha', icon: '💨' },
    { id: 'desserts', name: 'Nachspeisen', icon: '🍰' },
    { id: 'cocktails', name: 'Cocktails', icon: '🍸' },
  ];

  // Example WiFi configuration
  const wifiConfig = {
    networkName: 'Safira_Lounge_Guest',
    password: 'Welcome2024!',
    guestNetwork: 'Safira_Guest',
    guestPassword: 'Guest123',
  };

  // Example social media links
  const socialLinks: SocialMediaLinks = {
    instagram: 'https://instagram.com/safiralounge',
    facebook: 'https://facebook.com/safiralounge',
    twitter: 'https://twitter.com/safiralounge',
    youtube: 'https://youtube.com/@safiralounge',
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    console.log('Category changed to:', categoryId);
    // Here you would typically update your main app state or trigger a data fetch
  };

  // Handle language change
  const handleLanguageChange = (language: Language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    console.log('Language changed to:', language);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: 'white',
      padding: '20px',
      paddingBottom: '100px' // Space for bottom navigation
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#d4af37' }}>
          Safira Lounge Menu
        </h1>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '40px'
        }}>
          <h2 style={{ marginTop: 0, color: '#d4af37' }}>Current Settings</h2>
          <p><strong>Active Category:</strong> {activeCategory}</p>
          <p><strong>Current Language:</strong> {i18n.language}</p>
          <p><strong>WiFi Network:</strong> {wifiConfig.networkName}</p>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '40px'
        }}>
          <h2 style={{ marginTop: 0, color: '#d4af37' }}>Available Categories</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {categories.map(category => (
              <div 
                key={category.id} 
                style={{ 
                  background: category.id === activeCategory ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  padding: '12px', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: category.id === activeCategory ? '1px solid #d4af37' : '1px solid transparent'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{category.icon}</div>
                <div style={{ fontSize: '14px' }}>{category.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '40px'
        }}>
          <h2 style={{ marginTop: 0, color: '#d4af37' }}>Features Demonstrated</h2>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Category switching with visual feedback</li>
            <li>Multi-language support (German, English, Turkish, Italian)</li>
            <li>WiFi information display</li>
            <li>Social media integration</li>
            <li>Glassmorphism design with backdrop blur</li>
            <li>Mobile-first responsive design</li>
            <li>Smooth animations and transitions</li>
            <li>Accessibility compliance (ARIA labels, keyboard navigation)</li>
            <li>Modal overlays with outside click detection</li>
            <li>Escape key support for closing modals</li>
          </ul>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginTop: 0, color: '#d4af37' }}>Bottom Navigation</h2>
          <p>The bottom navigation is fixed to the bottom of the screen on mobile devices.</p>
          <p>Try switching categories, languages, checking WiFi info, or visiting social media links!</p>
          <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '20px' }}>
            On desktop, the navigation appears as a floating bar at the bottom center.
          </p>
        </div>
      </div>

      <BottomNavigation
        categories={categories}
        currentCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onLanguageChange={handleLanguageChange}
      />
    </div>
  );
};

export default BottomNavigationExample;