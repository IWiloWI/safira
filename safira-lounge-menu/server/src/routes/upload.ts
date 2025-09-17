import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { 
  AuthenticatedRequest, 
  FileUploadResponse
} from '@/types/api';
import { authenticate } from '@/middleware/auth';
import { fileUploadSecurity, isMulterError } from '@/middleware/security';
import { sendSuccess, sendError, sendBadRequest, asyncHandler } from '@/utils/responseUtils';

const router = Router();

// File storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  ...fileUploadSecurity
});

/**
 * Upload file
 */
router.post('/', 
  authenticate, 
  upload.single('file'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        sendBadRequest(res, 'No file uploaded');
        return;
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      const response: FileUploadResponse = {
        message: 'File uploaded successfully', 
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname
      };
      
      sendSuccess(res, response, 'File uploaded successfully', 201);
    } catch (error) {
      console.error('Error uploading file:', error);
      sendError(res, 'Failed to upload file');
    }
  })
);

// Error handling middleware for multer
router.use((error: any, req: AuthenticatedRequest, res: any, next: any) => {
  if (isMulterError(error)) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'File too large', 400);
      return;
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      sendError(res, 'Too many files', 400);
      return;
    }
  }
  
  if (error.message.includes('Invalid file type') || error.message.includes('Invalid file extension')) {
    sendError(res, error.message, 400);
    return;
  }
  
  sendError(res, 'File upload failed');
});

export default router;