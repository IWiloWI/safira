/**
 * Custom hook for QR code generation functionality
 * Handles QR code generation for WiFi credentials and menu links
 */

import { useState, useCallback } from 'react';

export interface QRCodeData {
  /** QR code data URL */
  qrCode: string;
  /** Original data that was encoded */
  data: string;
  /** QR code type */
  type: 'wifi' | 'menu' | 'custom';
}

export interface UseQRCodeOptions {
  /** Default QR code size */
  defaultSize?: number;
  /** QR code error correction level */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface UseQRCodeReturn {
  /** Generated QR codes */
  qrCodes: QRCodeData[];
  /** Loading state */
  isGenerating: boolean;
  /** Error state */
  error: string | null;
  /** Generate WiFi QR code */
  generateWiFiQR: (ssid: string, password: string, security?: string) => Promise<QRCodeData>;
  /** Generate menu link QR code */
  generateMenuQR: (tableId?: string, baseUrl?: string) => Promise<QRCodeData>;
  /** Generate custom QR code */
  generateCustomQR: (data: string, type?: string) => Promise<QRCodeData>;
  /** Clear all QR codes */
  clearQRCodes: () => void;
  /** Download QR code */
  downloadQR: (qrCode: string, filename?: string) => void;
}

/**
 * Hook for QR code generation and management
 */
export function useQRCode(options: UseQRCodeOptions = {}): UseQRCodeReturn {
  const { defaultSize = 200, errorCorrectionLevel = 'M' } = options;
  
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate QR code using external service
   */
  const generateQRCode = useCallback(async (
    data: string, 
    type: 'wifi' | 'menu' | 'custom' = 'custom'
  ): Promise<QRCodeData> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Using QR Server API for QR code generation
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${defaultSize}x${defaultSize}&ecc=${errorCorrectionLevel}&data=${encodeURIComponent(data)}`;
      
      const qrCodeData: QRCodeData = {
        qrCode: qrUrl,
        data,
        type
      };

      setQRCodes(prev => [...prev, qrCodeData]);
      return qrCodeData;
    } catch (err) {
      const errorMessage = 'Failed to generate QR code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [defaultSize, errorCorrectionLevel]);

  /**
   * Generate WiFi QR code
   */
  const generateWiFiQR = useCallback(async (
    ssid: string, 
    password: string, 
    security: string = 'WPA'
  ): Promise<QRCodeData> => {
    const wifiData = `WIFI:T:${security};S:${ssid};P:${password};;`;
    return generateQRCode(wifiData, 'wifi');
  }, [generateQRCode]);

  /**
   * Generate menu link QR code
   */
  const generateMenuQR = useCallback(async (
    tableId?: string,
    baseUrl: string = window.location.origin
  ): Promise<QRCodeData> => {
    const menuUrl = tableId 
      ? `${baseUrl}/menu?table=${tableId}`
      : `${baseUrl}/menu`;
    
    return generateQRCode(menuUrl, 'menu');
  }, [generateQRCode]);

  /**
   * Generate custom QR code
   */
  const generateCustomQR = useCallback(async (
    data: string,
    type: string = 'custom'
  ): Promise<QRCodeData> => {
    return generateQRCode(data, type as any);
  }, [generateQRCode]);

  /**
   * Clear all generated QR codes
   */
  const clearQRCodes = useCallback(() => {
    setQRCodes([]);
    setError(null);
  }, []);

  /**
   * Download QR code as image
   */
  const downloadQR = useCallback((qrCode: string, filename: string = 'qr-code.png') => {
    try {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = filename;
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download QR code:', err);
      setError('Failed to download QR code');
    }
  }, []);

  return {
    qrCodes,
    isGenerating,
    error,
    generateWiFiQR,
    generateMenuQR,
    generateCustomQR,
    clearQRCodes,
    downloadQR
  };
}

/**
 * Default export for convenience
 */
export default useQRCode;