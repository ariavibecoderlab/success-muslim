import React from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const EditModeToggle: React.FC = () => {
  const { isEditMode, toggleEditMode, isAdmin } = useEditMode();

  if (!isAdmin) return null;

  return (
    <>
      {/* Top banner when edit mode is active */}
      {isEditMode && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-blue-600 text-white px-4 py-2 flex items-center justify-between text-sm">
          <span className="font-medium">✏️ Edit Mode Active — changes auto-save</span>
          <button
            onClick={toggleEditMode}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 rounded px-3 py-1 text-xs font-medium transition-colors"
          >
            <X className="w-3 h-3" />
            Done
          </button>
        </div>
      )}

      {/* Floating action button */}
      <button
        onClick={toggleEditMode}
        className={cn(
          'fixed z-[55] w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all',
          'bottom-24 right-4 md:bottom-6 md:right-6',
          isEditMode
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        )}
        title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
      >
        {isEditMode ? <Check className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
      </button>
    </>
  );
};

export default EditModeToggle;
