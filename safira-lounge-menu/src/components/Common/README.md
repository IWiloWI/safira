# BottomNavigation Component

A modern, responsive bottom navigation menu component for the Safira Lounge Menu app featuring glassmorphism design, multi-language support, and social media integration.

## Features

### 🎨 Design
- **Glassmorphism Design**: Backdrop blur effects with transparency
- **Mobile-First**: Fixed to bottom on mobile, floating bar on desktop
- **Smooth Animations**: CSS keyframes and Framer Motion transitions
- **Responsive**: Adapts to different screen sizes
- **Modern UI**: Clean, minimal design with hover effects

### 🌍 Multi-Language Support
- **5 Languages**: German, Danish, English, Turkish, Italian
- **Dynamic Translation**: Uses react-i18next for live language switching
- **Flag Icons**: Visual language indicators
- **Fallback Support**: Graceful handling of missing translations

### ⚡ Functionality
- **Category Switcher**: Quick navigation between menu categories
- **WiFi Information**: Display network credentials and guest access
- **Social Media Links**: Instagram, Facebook, Twitter, YouTube integration
- **Modal System**: Animated overlays with outside-click-to-close
- **Keyboard Navigation**: Full accessibility support

### ♿ Accessibility
- **ARIA Labels**: Proper screen reader support
- **Keyboard Navigation**: Tab and Enter key support
- **Focus Management**: Visual focus indicators
- **Escape Key**: Close modals with escape key
- **Semantic HTML**: Proper button and navigation elements

## Installation & Usage

### Prerequisites
- React 18+
- styled-components 6+
- framer-motion 10+
- react-i18next 13+
- react-icons 4+

### Basic Usage

```tsx
import BottomNavigation from './components/Common/BottomNavigation';\nimport type { Language, SocialMediaLinks } from './types/common.types';\n\nconst App = () => {\n  const [activeCategory, setActiveCategory] = useState('all');\n  const [currentLanguage, setCurrentLanguage] = useState<Language>('de');\n\n  const categories = [\n    { id: 'all', name: 'Alle', icon: '🍽️' },\n    { id: 'drinks', name: 'Getränke', icon: '🥤' },\n    { id: 'food', name: 'Essen', icon: '🍕' },\n  ];\n\n  const wifiConfig = {\n    networkName: 'Safira_Guest',\n    password: 'Welcome123!',\n  };\n\n  const socialLinks: SocialMediaLinks = {\n    instagram: 'https://instagram.com/safiralounge',\n    facebook: 'https://facebook.com/safiralounge',\n  };\n\n  return (\n    <div>\n      {/* Your app content */}\n      <BottomNavigation\n        categories={categories}\n        activeCategory={activeCategory}\n        onCategoryChange={setActiveCategory}\n        currentLanguage={currentLanguage}\n        onLanguageChange={setCurrentLanguage}\n        wifiConfig={wifiConfig}\n        socialLinks={socialLinks}\n      />\n    </div>\n  );\n};\n```\n\n## Props Reference\n\n### Required Props\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `categories` | `Category[]` | Array of menu categories |\n| `onCategoryChange` | `(id: string) => void` | Category selection handler |\n| `currentLanguage` | `Language` | Currently selected language |\n| `onLanguageChange` | `(lang: Language) => void` | Language change handler |\n| `wifiConfig` | `WiFiConfig` | WiFi network information |\n| `socialLinks` | `SocialMediaLinks` | Social media URLs |\n\n### Optional Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `activeCategory` | `string` | `undefined` | Currently active category ID |\n| `isVisible` | `boolean` | `true` | Show/hide navigation |\n\n## Type Definitions\n\n### Category\n```typescript\ninterface Category {\n  id: string;\n  name: string;\n  icon: string; // Emoji or icon string\n}\n```\n\n### WiFiConfig\n```typescript\ninterface WiFiConfig {\n  networkName: string;\n  password: string;\n  guestNetwork?: string;\n  guestPassword?: string;\n}\n```\n\n### SocialMediaLinks\n```typescript\ninterface SocialMediaLinks {\n  instagram?: string;\n  facebook?: string;\n  twitter?: string;\n  youtube?: string;\n  linkedin?: string;\n  tiktok?: string;\n}\n```\n\n## Supported Languages\n\n| Code | Language | Flag |\n|------|----------|------|\n| `de` | Deutsch | 🇩🇪 |\n| `da` | Dansk | 🇩🇰 |\n| `en` | English | 🇺🇸 |\n| `tr` | Türkçe | 🇹🇷 |\n| `it` | Italiano | 🇮🇹 |\n\n## Translation Keys\n\nThe component uses the following i18next translation keys:\n\n```json\n{\n  \"navigation\": {\n    \"categories\": \"Categories\",\n    \"menu\": \"Menu\",\n    \"language\": \"Language\",\n    \"wifi\": \"WiFi\",\n    \"social\": \"Social Media\",\n    \"wifiNetwork\": \"Network Name\",\n    \"wifiPassword\": \"Password\",\n    \"guestNetwork\": \"Guest Network\",\n    \"guestPassword\": \"Guest Password\",\n    \"followUs\": \"Follow us\"\n  },\n  \"common\": {\n    \"close\": \"Close\"\n  }\n}\n```\n\n## Customization\n\n### Styling\nThe component uses styled-components with CSS-in-JS. You can customize:\n\n- **Colors**: Modify glassmorphism background colors\n- **Animations**: Adjust keyframe animations\n- **Spacing**: Change padding and margins\n- **Breakpoints**: Update responsive design breakpoints\n\n### Adding Social Media\nTo add new social media platforms:\n\n1. Add the URL to `SocialMediaLinks` interface\n2. Import the icon from `react-icons`\n3. Add configuration to `SOCIAL_CONFIGS` array\n\n```typescript\nconst SOCIAL_CONFIGS = [\n  // ... existing configs\n  { key: 'tiktok', icon: FiTiktok, label: 'TikTok', color: '#000000' },\n];\n```\n\n## Browser Support\n\n- **Modern Browsers**: Full support with backdrop-filter\n- **Safari**: Full support with -webkit-backdrop-filter\n- **Older Browsers**: Graceful degradation without blur effects\n\n## Performance\n\n- **Optimized Renders**: Uses `useCallback` for event handlers\n- **Lazy Animations**: Animations only run when needed\n- **Memory Management**: Proper cleanup of event listeners\n- **Bundle Size**: Tree-shakeable imports from react-icons\n\n## Accessibility Features\n\n- ✅ **Screen Reader Support**: ARIA labels and roles\n- ✅ **Keyboard Navigation**: Tab, Enter, and Escape keys\n- ✅ **Focus Management**: Clear focus indicators\n- ✅ **High Contrast**: Sufficient color contrast ratios\n- ✅ **Touch Targets**: Minimum 48px touch targets\n\n## Testing\n\nExample test structure:\n\n```typescript\nimport { render, screen, fireEvent } from '@testing-library/react';\nimport BottomNavigation from './BottomNavigation';\n\ndescribe('BottomNavigation', () => {\n  it('renders all navigation buttons', () => {\n    render(<BottomNavigation {...props} />);\n    expect(screen.getByLabelText(/categories/i)).toBeInTheDocument();\n    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();\n    expect(screen.getByLabelText(/wifi/i)).toBeInTheDocument();\n  });\n\n  it('opens category modal on click', () => {\n    render(<BottomNavigation {...props} />);\n    fireEvent.click(screen.getByLabelText(/categories/i));\n    expect(screen.getByText('Categories')).toBeInTheDocument();\n  });\n});\n```\n\n## Contributing\n\nWhen contributing to this component:\n\n1. Follow the existing TypeScript patterns\n2. Add translations for all supported languages\n3. Ensure accessibility compliance\n4. Test on multiple screen sizes\n5. Update documentation for new features\n\n## License\n\nPart of the Safira Lounge Menu application.\n