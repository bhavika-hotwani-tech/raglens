import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog box */}
      <div
        className={cn(
          'relative w-full rounded-2xl bg-white shadow-xl border border-stone-200 z-10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200',
          maxWidth
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-stone-100">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-stone-900">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-xs text-stone-500 leading-normal">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 p-4 bg-stone-50 border-t border-stone-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
