import React, { useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up flex items-center gap-3 bg-stone-900/95 border border-amber-500/40 text-stone-100 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md max-w-sm">
      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
        <ShoppingBag className="w-5 h-5" />
      </div>
      <p className="text-sm font-medium pr-2 text-stone-200">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors ml-auto"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
