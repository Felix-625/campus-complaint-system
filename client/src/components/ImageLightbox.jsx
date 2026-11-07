import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const ImageLightbox = ({ src, alt, title, onClose }) => {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    // Focus close button on mount for focus trap
    closeBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-overlay flex items-center justify-center p-4 bg-sidebar-bg/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-surface rounded-lg border border-border shadow-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <span className="text-xs font-semibold text-text truncate max-w-md">
            {title || alt || 'Complaint Photo'}
          </span>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-1.5 rounded-md text-muted hover:text-text hover:bg-surface-alt/30 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close image preview"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Image body */}
        <div className="p-2 overflow-auto flex items-center justify-center bg-surface-alt/10">
          <img
            src={src}
            alt={alt || 'Complaint preview full size'}
            className="max-h-[75vh] w-auto max-w-full rounded-md object-contain shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};
