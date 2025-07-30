import { storage } from './firebase';
import { ref, getDownloadURL } from 'firebase/storage';

// Firebase Storage bucket URL
const STORAGE_BUCKET_URL = 'https://denarii-mvp-f5aea.firebasestorage.app';

/**
 * Get the Firebase Storage URL for a media file
 * Falls back to direct bucket URL if Firebase Storage is not available
 */
export const getMediaUrl = (filename: string): string => {
  // Direct URL construction for Firebase Storage
  // This works without authentication for public files
  return `${STORAGE_BUCKET_URL}/o/${encodeURIComponent(filename)}?alt=media`;
};

/**
 * Get authenticated Firebase Storage URL (if needed for private files)
 * This requires Firebase Storage to be initialized
 */
export const getAuthenticatedMediaUrl = async (filename: string): Promise<string> => {
  if (!storage) {
    // Fallback to direct URL if storage is not initialized
    return getMediaUrl(filename);
  }
  
  try {
    const fileRef = ref(storage, filename);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.warn(`Failed to get authenticated URL for ${filename}, falling back to direct URL:`, error);
    return getMediaUrl(filename);
  }
};

// Pre-defined URLs for the media files
export const MEDIA_URLS = {
  FAVICON: getMediaUrl('icons8-money-96.png'),
  OG_IMAGE: getMediaUrl('og-image.png'),
} as const;