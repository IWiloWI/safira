import fs from 'fs/promises';
import type { Stats } from 'fs';
import path from 'path';

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    throw error;
  }
}

/**
 * Read and parse a JSON file, return default data if file doesn't exist
 */
export async function readJSONFile<T>(filePath: string, defaultData: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as T;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await writeJSONFile(filePath, defaultData);
      return defaultData;
    }
    throw error;
  }
}

/**
 * Write data to a JSON file
 */
export async function writeJSONFile<T>(filePath: string, data: T): Promise<void> {
  try {
    // Ensure the directory exists
    const dirPath = path.dirname(filePath);
    await ensureDirectory(dirPath);
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a file if it exists
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    // File doesn't exist, which is fine
  }
}

/**
 * Copy a file from source to destination
 */
export async function copyFile(source: string, destination: string): Promise<void> {
  try {
    const destDir = path.dirname(destination);
    await ensureDirectory(destDir);
    await fs.copyFile(source, destination);
  } catch (error) {
    console.error(`Error copying file from ${source} to ${destination}:`, error);
    throw error;
  }
}

/**
 * Get file stats
 */
export async function getFileStats(filePath: string): Promise<Stats | null> {
  try {
    return await fs.stat(filePath);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Generate a unique filename by appending a timestamp and random string
 */
export function generateUniqueFilename(originalName: string): string {
  const extension = path.extname(originalName);
  const basename = path.basename(originalName, extension);
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  
  return `${basename}-${timestamp}-${randomString}${extension}`;
}

/**
 * Validate file extension against allowed extensions
 */
export function isAllowedFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const extension = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(extension);
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stats = await getFileStats(filePath);
  return stats ? stats.size : 0;
}

/**
 * Create a backup of a file
 */
export async function backupFile(filePath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup.${timestamp}`;
  
  if (await fileExists(filePath)) {
    await copyFile(filePath, backupPath);
  }
  
  return backupPath;
}