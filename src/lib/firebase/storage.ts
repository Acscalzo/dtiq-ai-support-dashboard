'use client';

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './client';

// Initialize Firebase Storage
const storage = getStorage(app);

/**
 * Upload user avatar to Firebase Storage
 * @param file - The file to upload (or Blob from cropped image)
 * @param userId - The user's unique ID
 * @returns The download URL of the uploaded avatar
 */
export async function uploadAvatar(file: File | Blob, userId: string): Promise<string> {
  const extension = file instanceof File ? file.name.split('.').pop() || 'jpg' : 'jpg';
  const fileName = `avatars/${userId}/avatar_${Date.now()}.${extension}`;
  const storageRef = ref(storage, fileName);

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
    customMetadata: {
      userId,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Get the download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Delete user avatar from Firebase Storage
 * @param userId - The user's unique ID
 * @param avatarUrl - The URL of the avatar to delete (optional, will try to delete all avatars for user)
 */
export async function deleteAvatar(userId: string, avatarUrl?: string): Promise<void> {
  if (avatarUrl) {
    try {
      // Extract the path from the URL
      const urlObj = new URL(avatarUrl);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/);
      if (pathMatch) {
        const path = decodeURIComponent(pathMatch[1]);
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
      }
    } catch (error) {
      // If the file doesn't exist or URL is invalid, just log and continue
      console.warn('Error deleting avatar:', error);
    }
  }
}

/**
 * Compress an image blob before upload
 * @param blob - The image blob to compress
 * @param maxWidth - Maximum width (default 400px for avatars)
 * @param quality - JPEG quality (0-1, default 0.85)
 * @returns Compressed image blob
 */
export async function compressImage(
  blob: Blob,
  maxWidth: number = 400,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height / width) * maxWidth;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
}

export { storage };
