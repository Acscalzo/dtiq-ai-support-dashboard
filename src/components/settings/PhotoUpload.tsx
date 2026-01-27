'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, X, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedFetch } from '@/lib/api/client';

interface PhotoUploadProps {
  currentPhotoURL?: string | null;
  displayName: string | null;
  onSuccess: () => void;
}

export function PhotoUpload({ currentPhotoURL, displayName, onSuccess }: PhotoUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setShowConfirm(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmUpload = async () => {
    if (!user?.uid || !previewUrl) return;

    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoURL: previewUrl }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to upload photo');
      }

      setShowConfirm(false);
      setPreviewUrl(null);
      onSuccess();
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUpload = () => {
    setPreviewUrl(null);
    setShowConfirm(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch('/api/user/avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to remove photo');
      }

      onSuccess();
    } catch (err) {
      console.error('Error removing photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayUrl = previewUrl || currentPhotoURL;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Avatar */}
      <div className="relative">
        {displayUrl ? (
          <img
            src={displayUrl}
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
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          aria-label="Upload photo"
        >
          <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {showConfirm ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirmUpload}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {loading ? 'Saving...' : 'Confirm'}
            </button>
            <button
              onClick={handleCancelUpload}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
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
          </>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400">
          JPG, PNG or GIF. Max 5MB.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
