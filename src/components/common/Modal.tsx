import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  const maxWidthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#2B1B10]/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidthClasses} bg-[#FDF9F0] border-2 border-[#D4A56E] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(40,20,5,0.35)] relative animate-in zoom-in-95 duration-200`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E8D9C0]">
          <h2 id="modal-title" className="font-serif-title text-2xl sm:text-3xl font-bold text-[#321E0F]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-[#6B4B32] hover:text-[#2E1809] hover:bg-[#EFE5D2] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B8814D] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};
