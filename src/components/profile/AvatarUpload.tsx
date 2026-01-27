'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Camera, Upload, Loader2, X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { uploadAvatar, deleteAvatar, compressImage } from '@/lib/firebase/storage';
import { authenticatedFetch } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

interface AvatarUploadProps {
  currentPhotoURL?: string | null;
  displayName: string | null;
  onSuccess: () => void;
  useFirebaseStorage?: boolean;
  onFilePickerOpen?: () => void;
  onFilePickerClose?: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function AvatarUpload({
  currentPhotoURL,
  displayName,
  onSuccess,
  useFirebaseStorage = true,
  onFilePickerOpen,
  onFilePickerClose,
}: AvatarUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropModal, setShowCropModal] = useState(false);
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Always call close callback when file picker closes
    onFilePickerClose?.();

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB before crop)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB');
      return;
    }

    setError(null);

    // Read file and show crop modal
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropModal(true);
      setScale(1);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Calculate the scaled crop dimensions
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to desired output size (400x400 for avatar)
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Calculate source dimensions
    const sourceX = completedCrop.x * scaleX;
    const sourceY = completedCrop.y * scaleY;
    const sourceWidth = completedCrop.width * scaleX;
    const sourceHeight = completedCrop.height * scaleY;

    // Draw the cropped image
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.9
      );
    });
  }, [completedCrop]);

  const handleConfirmCrop = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const croppedBlob = await getCroppedImage();
      if (!croppedBlob) {
        throw new Error('Failed to crop image');
      }

      let photoURL: string;

      if (useFirebaseStorage) {
        // Compress and upload to Firebase Storage
        const compressedBlob = await compressImage(croppedBlob, 400, 0.85);
        photoURL = await uploadAvatar(compressedBlob, user.uid);

        // Delete old avatar if exists
        if (currentPhotoURL && !currentPhotoURL.startsWith('data:')) {
          await deleteAvatar(user.uid, currentPhotoURL);
        }
      } else {
        // Store as base64 (fallback)
        photoURL = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(croppedBlob);
        });
      }

      // Update user via API
      const response = await authenticatedFetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoURL }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update avatar');
      }

      setShowCropModal(false);
      setImageSrc(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSuccess();
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCrop = () => {
    setShowCropModal(false);
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setError(null);
    setScale(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      // Delete via API (handles both storage and database)
      const response = await authenticatedFetch('/api/user/avatar', {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to remove avatar');
      }

      onSuccess();
    } catch (err) {
      console.error('Error removing photo:', err);
      setError('Failed to remove photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          {currentPhotoURL ? (
            <img
              src={currentPhotoURL}
              alt={displayName || 'User'}
              className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl border-4 border-white dark:border-gray-700 shadow-md">
              {getInitials(displayName || 'U')}
            </div>
          )}

          {/* Camera overlay button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFilePickerOpen?.();
              fileInputRef.current?.click();
            }}
            disabled={loading}
            className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            aria-label="Upload photo"
          >
            <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFilePickerOpen?.();
              fileInputRef.current?.click();
            }}
            disabled={loading}
            className="px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Photo
          </button>
          {currentPhotoURL && (
            <button
              onClick={handleRemovePhoto}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              Remove Photo
            </button>
          )}

          {error && !showCropModal && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            JPG, PNG or GIF. Max 10MB.
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          onClick={(e) => e.stopPropagation()}
          className="hidden"
        />
      </div>

      {/* Crop Modal */}
      {showCropModal && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Crop Photo
              </h2>
              <button
                onClick={handleCancelCrop}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Crop Area */}
            <div className="p-6">
              <div className="max-h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  className="max-h-[400px]"
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    style={{ transform: `scale(${scale})` }}
                    className="max-h-[400px] transition-transform"
                  />
                </ReactCrop>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-32 accent-primary"
                />
                <button
                  onClick={() => setScale(Math.min(2, scale + 0.1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={handleCancelCrop}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCrop}
                disabled={loading || !completedCrop}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Photo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
