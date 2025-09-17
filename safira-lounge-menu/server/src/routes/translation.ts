import { Router } from 'express';
import { 
  AuthenticatedRequest, 
  TranslationRequest,
  TranslationResponse,
  ProductTranslationRequest,
  ProductTranslationResponse
} from '@/types/api';
import { authenticate } from '@/middleware/auth';
import { sendSuccess, sendError, asyncHandler } from '@/utils/responseUtils';
import translationService from '@/services/translationService';

const router = Router();

/**
 * Translate text
 */
router.post('/', 
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest & { body: TranslationRequest }, res) => {
    try {
      const { text, targetLanguages } = req.body;
      
      if (!translationService.isConfigured()) {
        sendError(res, 'Translation service not configured. Please add OpenAI API key to .env file.', 503);
        return;
      }
      
      if (!text || typeof text !== 'string') {
        sendError(res, 'Text parameter is required and must be a string', 400);
        return;
      }
      
      const translations = await translationService.translateText(text, targetLanguages);
      const response: TranslationResponse = { translations };
      
      sendSuccess(res, response);
    } catch (error) {
      console.error('Translation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Translation failed';
      sendError(res, errorMessage);
    }
  })
);

/**
 * Translate product
 */
router.post('/product', 
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest & { body: ProductTranslationRequest }, res) => {
    try {
      const { product } = req.body;
      
      if (!translationService.isConfigured()) {
        sendError(res, 'Translation service not configured. Please add OpenAI API key to .env file.', 503);
        return;
      }
      
      if (!product || typeof product !== 'object') {
        sendError(res, 'Product parameter is required and must be an object', 400);
        return;
      }
      
      const translatedProduct = await translationService.autoTranslateProduct(product);
      const response: ProductTranslationResponse = { product: translatedProduct };
      
      sendSuccess(res, response);
    } catch (error) {
      console.error('Product translation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Product translation failed';
      sendError(res, errorMessage);
    }
  })
);

/**
 * Get translation service status
 */
router.get('/status', (req, res) => {
  const configured = translationService.isConfigured();
  sendSuccess(res, {
    configured,
    message: configured 
      ? 'Translation service is ready' 
      : 'OpenAI API key not configured'
  });
});

export default router;