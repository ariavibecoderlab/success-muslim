import React, { useRef, useState, useCallback } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ImagePlus } from 'lucide-react';

interface EditableImageProps {
  elementKey: string;
  defaultSrc: string;
  className?: string;
  alt?: string;
}

const EditableImage: React.FC<EditableImageProps> = ({
  elementKey,
  defaultSrc,
  className,
  alt = '',
}) => {
  const { isEditMode, getOverride, saveOverride, deleteOverride } = useEditMode();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showContext, setShowContext] = useState(false);

  const overrideValue = getOverride(elementKey, 'image');
  const displaySrc = overrideValue ?? defaultSrc;

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from('cms-uploads')
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data: urlData } = supabase.storage.from('cms-uploads').getPublicUrl(path);
      await saveOverride(elementKey, 'image', urlData.publicUrl);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }, [elementKey, saveOverride]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !overrideValue) return;
    e.preventDefault();
    setShowContext(true);
  }, [isEditMode, overrideValue]);

  const handleRevert = useCallback(() => {
    deleteOverride(elementKey, 'image');
    setShowContext(false);
  }, [elementKey, deleteOverride]);

  if (!isEditMode) {
    return <img src={displaySrc} alt={alt} className={className} />;
  }

  return (
    <div className="relative group inline-block">
      <img src={displaySrc} alt={alt} className={cn(className, 'ring-2 ring-transparent group-hover:ring-blue-400 transition-shadow')} onContextMenu={handleContextMenu} />
      <div
        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded"
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? (
          <div className="text-white text-sm font-medium">Uploading...</div>
        ) : (
          <div className="flex flex-col items-center text-white gap-1">
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs font-medium">Replace</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      {showContext && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowContext(false)} />
          <div className="absolute top-full left-0 z-50 mt-1 bg-background border rounded-md shadow-lg p-1 min-w-[140px]">
            <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded" onClick={handleRevert}>
              Revert to default
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditableImage;
