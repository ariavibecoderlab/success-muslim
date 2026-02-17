import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { cn } from '@/lib/utils';

interface EditableBoxProps {
  elementKey: string;
  children: React.ReactNode;
  className?: string;
}

const EditableBox: React.FC<EditableBoxProps> = ({ elementKey, children, className }) => {
  const { isEditMode, getOverride, saveOverride, deleteOverride } = useEditMode();
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showContext, setShowContext] = useState(false);
  const startPos = useRef({ x: 0, y: 0, ox: 0, oy: 0, w: 0, h: 0 });

  const styleOverride = getOverride(elementKey, 'style') as { transform?: string; width?: string; height?: string } | undefined;

  const currentStyle: React.CSSProperties = styleOverride
    ? { transform: styleOverride.transform, width: styleOverride.width, height: styleOverride.height }
    : {};

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    if (resizing) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    const rect = boxRef.current?.getBoundingClientRect();
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      ox: rect ? rect.left : 0,
      oy: rect ? rect.top : 0,
      w: 0, h: 0,
    };
  }, [resizing]);

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    const rect = boxRef.current?.getBoundingClientRect();
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      ox: 0, oy: 0,
      w: rect?.width || 0,
      h: rect?.height || 0,
    };
  }, []);

  useEffect(() => {
    if (!dragging && !resizing) return;

    const handleMove = (e: PointerEvent) => {
      if (dragging) {
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        setOffset({ x: dx, y: dy });
      }
    };

    const handleUp = () => {
      if (dragging && (offset.x !== 0 || offset.y !== 0)) {
        const existing = styleOverride || {};
        const prevTransform = existing.transform || 'translate(0px, 0px)';
        const match = prevTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        const prevX = match ? parseFloat(match[1]) : 0;
        const prevY = match ? parseFloat(match[2]) : 0;
        const newX = prevX + offset.x;
        const newY = prevY + offset.y;
        saveOverride(elementKey, 'style', {
          ...existing,
          transform: `translate(${newX}px, ${newY}px)`,
        });
        setOffset({ x: 0, y: 0 });
      }
      if (resizing) {
        const rect = boxRef.current?.getBoundingClientRect();
        if (rect) {
          const existing = styleOverride || {};
          saveOverride(elementKey, 'style', {
            ...existing,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          });
        }
      }
      setDragging(false);
      setResizing(false);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragging, resizing, offset, elementKey, saveOverride, styleOverride]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !styleOverride) return;
    e.preventDefault();
    setShowContext(true);
  }, [isEditMode, styleOverride]);

  if (!isEditMode) {
    return (
      <div className={className} style={currentStyle}>
        {children}
      </div>
    );
  }

  const computeDragTransform = (): string => {
    const base = currentStyle.transform || 'translate(0px, 0px)';
    const match = base.match(/translate\(([^,]+),\s*([^)]+)\)/);
    if (match) {
      return `translate(${parseFloat(match[1]) + offset.x}px, ${parseFloat(match[2]) + offset.y}px)`;
    }
    return `translate(${offset.x}px, ${offset.y}px)`;
  };

  const liveStyle: React.CSSProperties = {
    ...currentStyle,
    ...(dragging ? { transform: computeDragTransform() } : {}),
    cursor: 'grab',
    position: 'relative',
  };

  return (
    <div
      ref={boxRef}
      className={cn(className, 'ring-2 ring-transparent hover:ring-blue-400 transition-shadow')}
      style={liveStyle}
      onPointerDown={handleDragStart}
      onContextMenu={handleContextMenu}
    >
      {children}
      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl opacity-0 hover:opacity-100 transition-opacity"
        onPointerDown={handleResizeStart}
      />
      {showContext && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowContext(false)} />
          <div className="absolute top-full left-0 z-50 mt-1 bg-background border rounded-md shadow-lg p-1 min-w-[140px]">
            <button
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded"
              onClick={() => { deleteOverride(elementKey, 'style'); setShowContext(false); }}
            >
              Reset position & size
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditableBox;
