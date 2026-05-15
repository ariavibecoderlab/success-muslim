import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  elementKey: string;
  defaultText: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'li';
}

const EditableText: React.FC<EditableTextProps> = ({
  elementKey,
  defaultText,
  className,
  tag: Tag = 'span',
}) => {
  const { isEditMode, getOverride, saveOverride, deleteOverride } = useEditMode();
  const ref = useRef<HTMLElement>(null);
  const [showContext, setShowContext] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const overrideValue = getOverride(elementKey, 'text');
  const displayText = overrideValue ?? defaultText;

  // Sync content when override changes externally
  useEffect(() => {
    if (ref.current && !isEditMode) {
      ref.current.textContent = displayText;
    }
  }, [displayText, isEditMode]);

  const handleBlur = useCallback(() => {
    if (!ref.current) return;
    const newText = ref.current.textContent || '';
    if (newText === defaultText) {
      deleteOverride(elementKey, 'text');
    } else if (newText !== displayText) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveOverride(elementKey, 'text', newText);
      }, 500);
    }
  }, [elementKey, defaultText, displayText, saveOverride, deleteOverride]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !overrideValue) return;
    e.preventDefault();
    setShowContext(true);
  }, [isEditMode, overrideValue]);

  const handleRevert = useCallback(() => {
    deleteOverride(elementKey, 'text');
    if (ref.current) ref.current.textContent = defaultText;
    setShowContext(false);
  }, [elementKey, defaultText, deleteOverride]);

  if (!isEditMode) {
    return <Tag className={className}>{displayText}</Tag>;
  }

  return (
    <div className="relative inline">
      <Tag
        ref={ref as any}
        className={cn(
          className,
          'outline-none ring-2 ring-transparent hover:ring-blue-400 focus:ring-blue-500 rounded-sm cursor-text transition-shadow'
        )}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onContextMenu={handleContextMenu}
      >
        {displayText}
      </Tag>
      {showContext && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowContext(false)} />
          <div className="absolute top-full left-0 z-50 mt-1 bg-background border rounded-md shadow-lg p-1 min-w-[140px]">
            <button
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded"
              onClick={handleRevert}
            >
              Revert to default
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditableText;
