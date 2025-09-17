const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

class TranslationService {
  constructor() {
    this.openai = null;
    this.translationCache = new Map(); // Cache für bereits übersetzte Texte
    this.cacheFile = path.join(__dirname, '../data/translation-cache.json');
    this.initializeOpenAI();
    this.loadCache();
  }

  initializeOpenAI() {
    console.log('🔧 Initializing OpenAI with key:', process.env.OPENAI_API_KEY ? 'Present' : 'Not found');
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('✅ OpenAI translation service initialized');
    } else {
      console.log('⚠️  OpenAI API key not configured. Auto-translation disabled.');
    }
  }

  isConfigured() {
    return this.openai !== null;
  }

  reinitialize() {
    this.initializeOpenAI();
  }

  async loadCache() {
    try {
      const cacheData = await fs.readFile(this.cacheFile, 'utf8');
      const cacheObj = JSON.parse(cacheData);
      this.translationCache = new Map(Object.entries(cacheObj));
      console.log(`📋 Loaded ${this.translationCache.size} translations from cache`);
    } catch (error) {
      // Cache-Datei existiert nicht oder ist beschädigt
      console.log('📋 No translation cache found, starting fresh');
    }
  }

  async saveCache() {
    try {
      const cacheObj = Object.fromEntries(this.translationCache);
      await fs.writeFile(this.cacheFile, JSON.stringify(cacheObj, null, 2));
      console.log(`💾 Saved ${this.translationCache.size} translations to cache`);
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }

  async translateText(text, targetLanguages = ['da', 'en']) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API not configured');
    }

    // Prüfe Cache zuerst
    const cacheKey = `${text}_${targetLanguages.join('_')}`;
    if (this.translationCache.has(cacheKey)) {
      console.log('📋 Using cached translation for:', text.substring(0, 30) + '...');
      return this.translationCache.get(cacheKey);
    }

    try {
      const languageNames = {
        'da': 'Danish',
        'en': 'English'
      };

      const targetLanguageList = targetLanguages.map(lang => languageNames[lang]).join(' and ');

      const prompt = `Translate the following German text to ${targetLanguageList}. 
This is for a lounge/restaurant menu, so keep the translation natural and appetizing.

German text: "${text}"

Please respond in JSON format like this:
{
  "da": "Danish translation here",
  "en": "English translation here"
}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional translator specializing in restaurant and lounge menus. Provide accurate, natural translations that sound appetizing and professional."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const response = completion.choices[0].message.content;
      
      // Parse the JSON response
      const translations = JSON.parse(response.trim());
      
      // Validate that we got the expected languages
      const result = { de: text }; // Include original German text
      
      targetLanguages.forEach(lang => {
        if (translations[lang]) {
          result[lang] = translations[lang];
        }
      });

      // Speichere in Cache für zukünftige Verwendung
      this.translationCache.set(cacheKey, result);
      console.log('💾 Cached translation for:', text.substring(0, 30) + '...');
      
      // Speichere Cache auf Festplatte (async, ohne zu warten)
      this.saveCache().catch(err => console.error('Cache save error:', err));

      return result;
      
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  async translateProductName(name, targetLanguages = ['da', 'en']) {
    // For product names, we often want to keep brand names unchanged
    // This is a specialized method for product names
    if (!this.isConfigured()) {
      throw new Error('OpenAI API not configured');
    }

    // Prüfe Cache zuerst
    const cacheKey = `name_${name}_${targetLanguages.join('_')}`;
    if (this.translationCache.has(cacheKey)) {
      console.log('📋 Using cached product name translation for:', name);
      return this.translationCache.get(cacheKey);
    }

    try {
      const languageNames = {
        'da': 'Danish',
        'en': 'English'
      };

      const targetLanguageList = targetLanguages.map(lang => languageNames[lang]).join(' and ');

      const prompt = `Translate the following German product name to ${targetLanguageList}. 
This is for a lounge/restaurant menu. Keep brand names unchanged, only translate descriptive parts.

Product name: "${name}"

Please respond in JSON format like this:
{
  "da": "Danish translation here",
  "en": "English translation here"
}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional translator specializing in restaurant menus. For product names, keep brand names unchanged and only translate descriptive parts. Make translations sound natural and professional."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      });

      const response = completion.choices[0].message.content;
      const translations = JSON.parse(response.trim());
      
      const result = { de: name };
      
      targetLanguages.forEach(lang => {
        if (translations[lang]) {
          result[lang] = translations[lang];
        }
      });

      // Speichere in Cache für zukünftige Verwendung
      this.translationCache.set(cacheKey, result);
      console.log('💾 Cached product name translation for:', name);
      
      // Speichere Cache auf Festplatte (async, ohne zu warten)
      this.saveCache().catch(err => console.error('Cache save error:', err));

      return result;
      
    } catch (error) {
      console.error('Product name translation error:', error);
      throw new Error(`Product name translation failed: ${error.message}`);
    }
  }

  async autoTranslateProduct(product, categoryId = null, translationOptions = null) {
    if (!this.isConfigured()) {
      console.log('OpenAI not configured, skipping auto-translation');
      return product;
    }

    try {
      const updatedProduct = { ...product };

      // If translation options are provided, use them directly
      if (translationOptions && typeof translationOptions === 'object') {
        console.log(`⚙️ Using custom translation options:`, translationOptions);
        
        // Translate name if requested and it's a string
        if (translationOptions.translateName && typeof product.name === 'string') {
          console.log(`🔄 Translating product name: ${product.name}`);
          updatedProduct.name = await this.translateProductName(product.name);
        } else if (typeof product.name === 'string') {
          console.log(`📝 Keeping name unchanged: ${product.name}`);
          updatedProduct.name = product.name; // Keep as string
        }

        // Translate description if requested and it's a string
        if (translationOptions.translateDescription && typeof product.description === 'string') {
          console.log(`🔄 Translating product description: ${product.description}`);
          updatedProduct.description = await this.translateText(product.description);
        } else if (typeof product.description === 'string') {
          console.log(`📝 Keeping description unchanged: ${product.description}`);
          updatedProduct.description = product.description; // Keep as string
        }

        return updatedProduct;
      }

      // Fallback: Use old logic based on category (for backward compatibility)
      const isTobaccoCategory = categoryId && (
        categoryId.includes('shisha') || 
        categoryId.includes('tobacco') || 
        categoryId.includes('tabak')
      );

      // For tobacco products: Only translate description, keep name unchanged
      if (isTobaccoCategory) {
        console.log(`🚬 Tobacco product detected - only translating description`);
        
        // Keep name as string (don't translate for tobacco)
        if (typeof product.name === 'string') {
          console.log(`📝 Keeping tobacco name unchanged: ${product.name}`);
          updatedProduct.name = product.name; // Keep as string, no translation
        }

        // Only translate description for tobacco
        if (typeof product.description === 'string') {
          console.log(`🔄 Auto-translating tobacco description: ${product.description}`);
          updatedProduct.description = await this.translateText(product.description);
        }
      } else {
        // For non-tobacco products: Translate both name and description
        console.log(`🍹 Non-tobacco product - translating name and description`);
        
        // Translate name if it's a string
        if (typeof product.name === 'string') {
          console.log(`🔄 Auto-translating product name: ${product.name}`);
          updatedProduct.name = await this.translateProductName(product.name);
        }

        // Translate description if it's a string
        if (typeof product.description === 'string') {
          console.log(`🔄 Auto-translating product description: ${product.description}`);
          updatedProduct.description = await this.translateText(product.description);
        }
      }

      return updatedProduct;
    } catch (error) {
      console.error('Auto-translation failed:', error);
      return product; // Return original product if translation fails
    }
  }
}

module.exports = new TranslationService();