'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { useOnboardingFileUpload } from '@/hooks/onboarding/useFileUpload';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  currentPhotoUrl: string | null;
  onUploadComplete: (url: string) => void;
}

export function PhotoUploader({ currentPhotoUrl, onUploadComplete }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { upload, isUploading, error } = useOnboardingFileUpload('upload-photo', {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  });

  const displayUrl = preview ?? currentPhotoUrl;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const result = await upload(file);
    if (result?.photo_url) {
      onUploadComplete(result.photo_url);
    } else {
      setPreview(null);
    }

    // Cleanup object URL
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          'relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed transition-all',
          'hover:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-500/50',
          displayUrl ? 'border-slate-200' : 'border-slate-300',
          isUploading && 'opacity-70',
        )}
        aria-label="Upload profile photo"
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
            <User className="w-8 h-8 text-slate-400" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </div>
      </button>

      <span className="text-xs text-slate-500">
        {isUploading ? 'Uploading...' : 'Click to upload photo'}
      </span>
      {error && <span className="text-xs text-red-500">{error}</span>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
