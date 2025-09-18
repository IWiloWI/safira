import { Router } from 'express';
import { AuthenticatedRequest } from '@/types/api';
import { authenticate } from '@/middleware/auth';
import { sendSuccess, sendError, sendNotFound, sendBadRequest, asyncHandler } from '@/utils/responseUtils';
import { trackActivity } from '@/utils/analytics';
import { readJSONFile, writeJSONFile } from '@/utils/fileUtils';
import translationService from '@/services/translationService';
import path from 'path';

const router = Router();
const SETTINGS_FILE = path.join(__dirname, '../../data/navigationSettings.json');

interface Language {
  code: string;
  name: string;
  flag: string;
  enabled: boolean;
}

interface WifiSettings {
  ssid: string;
  password: string;
  enabled: boolean;
}

interface SocialMedia {
  id: string;
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
}

interface NavigationSettings {
  languages: Language[];
  wifi: WifiSettings;
  socialMedia: SocialMedia[];
}

const defaultSettings: NavigationSettings = {
  languages: [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', enabled: true },
    { code: 'en', name: 'English', flag: '🇬🇧', enabled: true },
    { code: 'da', name: 'Dansk', flag: '🇩🇰', enabled: true },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷', enabled: true },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', enabled: true },
    { code: 'fr', name: 'Français', flag: '🇫🇷', enabled: false },
    { code: 'es', name: 'Español', flag: '🇪🇸', enabled: false },
    { code: 'pt', name: 'Português', flag: '🇵🇹', enabled: false },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱', enabled: false },
    { code: 'pl', name: 'Polski', flag: '🇵🇱', enabled: false },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', enabled: false },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', enabled: false }
  ],
  wifi: {
    ssid: 'Safira Lounge',
    password: 'Safira123',
    enabled: true
  },
  socialMedia: [
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://instagram.com/safiralounge',
      icon: '📸',
      enabled: true
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: 'https://facebook.com/safiralounge',
      icon: '👤',
      enabled: true
    },
    {
      id: 'twitter',
      name: 'Twitter',
      url: 'https://twitter.com/safiralounge',
      icon: '🐦',
      enabled: false
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: 'https://youtube.com/safiralounge',
      icon: '📺',
      enabled: false
    }
  ]
};

/**
 * Get navigation settings
 */
router.get('/navigation', asyncHandler(async (req, res) => {
  try {
    const settings = await readJSONFile<NavigationSettings>(SETTINGS_FILE, defaultSettings);
    sendSuccess(res, settings);
  } catch (error) {
    console.error('Error loading navigation settings:', error);
    sendError(res, 'Failed to load navigation settings');
  }
}));

/**
 * Update navigation settings
 */
router.put('/navigation',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      console.log('🔧 UPDATE NAVIGATION SETTINGS:', req.body);

      const newSettings: NavigationSettings = req.body;

      // Validate settings structure
      if (!newSettings.languages || !newSettings.wifi || !newSettings.socialMedia) {
        sendBadRequest(res, 'Invalid settings structure');
        return;
      }

      // Ensure at least one language is enabled
      const enabledLanguages = newSettings.languages.filter(lang => lang.enabled);
      if (enabledLanguages.length === 0) {
        sendBadRequest(res, 'At least one language must be enabled');
        return;
      }

      // Save settings
      await writeJSONFile(SETTINGS_FILE, newSettings);

      console.log('✅ Navigation settings updated successfully');

      // Track activity
      await trackActivity(req, 'settings_updated', {
        enabledLanguages: enabledLanguages.map(l => l.code),
        wifiEnabled: newSettings.wifi.enabled,
        socialMediaCount: newSettings.socialMedia.filter(s => s.enabled).length,
        description: 'Navigation settings updated'
      });

      sendSuccess(res, newSettings, 'Navigation settings updated successfully');
    } catch (error) {
      console.error('Error updating navigation settings:', error);
      sendError(res, 'Failed to update navigation settings');
    }
  })
);

/**
 * Translate all content to a new language
 */
router.post('/translate/all',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const { targetLanguage } = req.body;

      if (!targetLanguage) {
        sendBadRequest(res, 'Target language is required');
        return;
      }

      console.log(`🌍 Starting translation to ${targetLanguage}...`);

      if (!translationService.isConfigured()) {
        sendError(res, 'Translation service not configured');
        return;
      }

      // Load products data
      const productsFile = path.join(__dirname, '../../data/products.json');
      const productsData = await readJSONFile<{ categories: any[] }>(productsFile, { categories: [] });

      let translatedCount = 0;

      // Translate all category names and product data
      for (const category of productsData.categories) {
        try {
          // Translate category name if it's a string
          if (typeof category.name === 'string') {
            const translatedName = await translationService.translateText(
              category.name,
              [targetLanguage]
            );
            category.name = {
              ...category.name,
              ...translatedName
            };
            translatedCount++;
          }

          // Translate all products in the category
          if (category.items && Array.isArray(category.items)) {
            for (const product of category.items) {
              try {
                // Translate product name
                if (typeof product.name === 'string') {
                  const translatedName = await translationService.translateText(
                    product.name,
                    [targetLanguage]
                  );
                  product.name = {
                    ...product.name,
                    ...translatedName
                  };
                  translatedCount++;
                }

                // Translate product description
                if (typeof product.description === 'string') {
                  const translatedDescription = await translationService.translateText(
                    product.description,
                    [targetLanguage]
                  );
                  product.description = {
                    ...product.description,
                    ...translatedDescription
                  };
                  translatedCount++;
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
              } catch (productError) {
                console.error(`Error translating product ${product.id}:`, productError);
              }
            }
          }

          // Small delay between categories
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (categoryError) {
          console.error(`Error translating category ${category.id}:`, categoryError);
        }
      }

      // Save updated products data
      await writeJSONFile(productsFile, productsData);

      console.log(`✅ Translation completed: ${translatedCount} items translated to ${targetLanguage}`);

      // Track activity
      await trackActivity(req, 'content_translated', {
        targetLanguage,
        translatedCount,
        description: `All content translated to ${targetLanguage}`
      });

      sendSuccess(res, {
        translatedCount,
        targetLanguage,
        message: `Successfully translated ${translatedCount} items to ${targetLanguage}`
      });
    } catch (error) {
      console.error('Error translating content:', error);
      sendError(res, 'Failed to translate content');
    }
  })
);

/**
 * Get enabled languages for frontend
 */
router.get('/languages', asyncHandler(async (req, res) => {
  try {
    const settings = await readJSONFile<NavigationSettings>(SETTINGS_FILE, defaultSettings);
    const enabledLanguages = settings.languages.filter(lang => lang.enabled);
    sendSuccess(res, enabledLanguages);
  } catch (error) {
    console.error('Error loading enabled languages:', error);
    sendError(res, 'Failed to load enabled languages');
  }
}));

/**
 * Get WiFi settings for frontend
 */
router.get('/wifi', asyncHandler(async (req, res) => {
  try {
    const settings = await readJSONFile<NavigationSettings>(SETTINGS_FILE, defaultSettings);
    sendSuccess(res, settings.wifi);
  } catch (error) {
    console.error('Error loading WiFi settings:', error);
    sendError(res, 'Failed to load WiFi settings');
  }
}));

/**
 * Get social media settings for frontend
 */
router.get('/social', asyncHandler(async (req, res) => {
  try {
    const settings = await readJSONFile<NavigationSettings>(SETTINGS_FILE, defaultSettings);
    const enabledSocial = settings.socialMedia.filter(social => social.enabled);
    sendSuccess(res, enabledSocial);
  } catch (error) {
    console.error('Error loading social media settings:', error);
    sendError(res, 'Failed to load social media settings');
  }
}));

/**
 * Test translation service
 */
router.post('/translate/test',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const { text, targetLanguages } = req.body;

      if (!text || !targetLanguages) {
        sendBadRequest(res, 'Text and target languages are required');
        return;
      }

      if (!translationService.isConfigured()) {
        sendError(res, 'Translation service not configured');
        return;
      }

      const result = await translationService.translateText(text, targetLanguages);

      sendSuccess(res, {
        original: text,
        translations: result,
        service: 'OpenAI'
      });
    } catch (error) {
      console.error('Error testing translation:', error);
      sendError(res, 'Translation test failed');
    }
  })
);

export default router;