
import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
  // Key change: Force the output to be WebP for maximum efficiency
  fileType: 'image/webp', 
};

export async function compressAndConvertToWebp(file: File): Promise<File> {
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Image compression/conversion failed:", error);
    return file;
  }
}
