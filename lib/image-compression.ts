import imageCompression from 'browser-image-compression';

// Enhanced interface with JSDoc for better documentation
export interface CompressionOptions {
  /** Maximum size in MB (default: 1) */
  maxSizeMB?: number;
  /** Maximum width or height in pixels (default: 1920) */
  maxWidthOrHeight?: number;
  /** Whether to use web worker (default: true) */
  useWebWorker?: boolean;
  /** Initial quality (0-1, default: 0.8) */
  initialQuality?: number;
  /** Output file type (default: 'image/webp') */
  fileType?: string;
  /** Minimum file size in bytes to process (default: 102400 = 100KB) */
  minSizeToProcess?: number;
}

// Default options with required types
const defaultOptions: Required<CompressionOptions> = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
  fileType: 'image/webp',
  minSizeToProcess: 102400 // 100KB
};

/**
 * Compresses and converts an image to WebP format
 * @param file - The input image file
 * @param customOptions - Optional custom compression options
 * @returns Promise with compression result
 * @throws {Error} If input is invalid or compression fails
 */
export async function compressAndConvertToWebp(
  file: File,
  customOptions: Partial<CompressionOptions> = {}
): Promise<{
  compressedFile: File;
  wasCompressed: boolean;
  originalSize: number;
  compressedSize: number;
  error?: string;
}> {
  // Input validation
  if (!(file instanceof File)) {
    throw new Error('Invalid input: Expected a File object');
  }

  if (!file.type.startsWith('image/')) {
    return {
      compressedFile: file,
      wasCompressed: false,
      originalSize: file.size,
      compressedSize: file.size,
      error: 'Invalid file type: Not an image'
    };
  }

  // Skip processing for small files
  const options = { ...defaultOptions, ...customOptions };
  if (file.size < options.minSizeToProcess) {
    return {
      compressedFile: file,
      wasCompressed: false,
      originalSize: file.size,
      compressedSize: file.size
    };
  }

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: options.maxSizeMB,
      maxWidthOrHeight: options.maxWidthOrHeight,
      useWebWorker: options.useWebWorker,
      initialQuality: options.initialQuality,
      fileType: options.fileType,
    });

    return {
      compressedFile,
      wasCompressed: true,
      originalSize: file.size,
      compressedSize: compressedFile.size
    };
  } catch (error) {
    console.error('Image compression failed:', error instanceof Error ? error.message : 'Unknown error');
    return {
      compressedFile: file,
      wasCompressed: false,
      originalSize: file.size,
      compressedSize: file.size,
      error: error instanceof Error ? error.message : 'Unknown error during compression'
    };
  }
}