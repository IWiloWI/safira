/**
 * Custom hook for image upload handling
 * Manages file uploads, validation, and preview generation
 */

import { useState, useCallback, useRef } from 'react';
import { UploadResult } from '../types/common.types';

interface ImagePreview {
  file: File;
  url: string;
  id: string;
}

interface UploadProgress {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UseImageUploadReturn {
  // State
  previews: ImagePreview[];
  uploads: UploadProgress[];
  isUploading: boolean;
  error: string | null;
  
  // Actions
  selectFiles: (files: FileList | File[]) => void;
  uploadFiles: () => Promise<UploadResult[]>;
  removePreview: (id: string) => void;
  clearAll: () => void;
  
  // Utilities
  openFileDialog: () => void;
  validateFile: (file: File) => { isValid: boolean; error?: string };
  
  // Refs
  fileInputRef: React.RefObject<HTMLInputElement>;
}

interface UseImageUploadOptions {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  uploadEndpoint?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';

const defaultOptions: Required<UseImageUploadOptions> = {
  maxFiles: 5,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  uploadEndpoint: `${API_BASE_URL}?action=upload`
};

export const useImageUpload = (options: UseImageUploadOptions = {}): UseImageUploadReturn => {
  const config = { ...defaultOptions, ...options };
  
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate a single file
   */
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file type
    if (!config.acceptedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not supported. Accepted types: ${config.acceptedTypes.join(', ')}`
      };
    }
    
    // Check file size
    if (file.size > config.maxFileSize) {
      return {
        isValid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(config.maxFileSize / 1024 / 1024).toFixed(2)}MB)`
      };
    }
    
    return { isValid: true };
  }, [config]);

  /**
   * Generate preview for a file
   */
  const generatePreview = useCallback((file: File): Promise<ImagePreview> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      reader.onload = (e) => {
        resolve({
          file,
          url: e.target?.result as string,
          id
        });
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Select files and generate previews
   */
  const selectFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    
    const fileArray = Array.from(files);
    
    // Check total file count
    if (previews.length + fileArray.length > config.maxFiles) {
      setError(`Cannot select more than ${config.maxFiles} files. Currently selected: ${previews.length}`);
      return;
    }
    
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    // Validate each file
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }
    
    // Show validation errors
    if (errors.length > 0) {
      setError(errors.join('\n'));
    }
    
    // Generate previews for valid files
    try {
      const newPreviews = await Promise.all(
        validFiles.map(file => generatePreview(file))
      );
      
      setPreviews(prev => [...prev, ...newPreviews]);
    } catch (error) {
      setError('Failed to generate file previews');
    }
  }, [previews.length, config.maxFiles, validateFile, generatePreview]);

  /**
   * Upload all selected files
   */
  const uploadFiles = useCallback(async (): Promise<UploadResult[]> => {
    if (previews.length === 0) {
      throw new Error('No files selected for upload');
    }
    
    setIsUploading(true);
    setError(null);
    
    // Initialize upload progress tracking
    const initialProgress = previews.map(preview => ({
      id: preview.id,
      progress: 0,
      status: 'pending' as const
    }));
    setUploads(initialProgress);
    
    const results: UploadResult[] = [];
    const errors: string[] = [];
    
    try {
      for (const preview of previews) {
        // Update status to uploading
        setUploads(prev => 
          prev.map(upload => 
            upload.id === preview.id 
              ? { ...upload, status: 'uploading' as const }
              : upload
          )
        );
        
        try {
          const result = await uploadSingleFile(preview.file, (progress) => {
            setUploads(prev => 
              prev.map(upload => 
                upload.id === preview.id 
                  ? { ...upload, progress }
                  : upload
              )
            );
          });
          
          results.push(result);
          
          // Update status to success
          setUploads(prev => 
            prev.map(upload => 
              upload.id === preview.id 
                ? { ...upload, status: 'success' as const, progress: 100 }
                : upload
            )
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          errors.push(`${preview.file.name}: ${errorMessage}`);
          
          // Update status to error
          setUploads(prev => 
            prev.map(upload => 
              upload.id === preview.id 
                ? { ...upload, status: 'error' as const, error: errorMessage }
                : upload
            )
          );
        }
      }
      
      if (errors.length > 0) {
        setError(errors.join('\n'));
      }
      
      return results;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [previews]);

  /**
   * Upload a single file with progress callback
   */
  const uploadSingleFile = useCallback(async (
    file: File, 
    onProgress: (progress: number) => void
  ): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });
      
      xhr.open('POST', config.uploadEndpoint);
      xhr.send(formData);
    });
  }, [config.uploadEndpoint]);

  /**
   * Remove a preview
   */
  const removePreview = useCallback((id: string) => {
    setPreviews(prev => {
      const preview = prev.find(p => p.id === id);
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
      return prev.filter(p => p.id !== id);
    });
    
    setUploads(prev => prev.filter(u => u.id !== id));
  }, []);

  /**
   * Clear all previews and uploads
   */
  const clearAll = useCallback(() => {
    // Revoke object URLs to prevent memory leaks
    previews.forEach(preview => {
      URL.revokeObjectURL(preview.url);
    });
    
    setPreviews([]);
    setUploads([]);
    setError(null);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previews]);

  /**
   * Open file dialog
   */
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      previews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, []);

  return {
    // State
    previews,
    uploads,
    isUploading,
    error,
    
    // Actions
    selectFiles,
    uploadFiles,
    removePreview,
    clearAll,
    
    // Utilities
    openFileDialog,
    validateFile,
    
    // Refs
    fileInputRef
  };
};

// Fix React import issue
import React from 'react';
