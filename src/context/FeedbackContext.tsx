import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, HelpCircle, X } from 'lucide-react';
import { Button } from '../components/ui/Button';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface FeedbackOptions {
  type?: FeedbackType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface FeedbackContextType {
  showFeedback: (options: FeedbackOptions) => Promise<boolean>;
  showSuccess: (message: string, title?: string, confirmText?: string) => Promise<boolean>;
  showError: (message: string, title?: string, confirmText?: string) => Promise<boolean>;
  showWarning: (message: string, title?: string, confirmText?: string) => Promise<boolean>;
  showInfo: (message: string, title?: string, confirmText?: string) => Promise<boolean>;
  showConfirm: (message: string, title?: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: FeedbackOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showFeedback = useCallback((options: FeedbackOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        options: {
          type: 'info',
          confirmText: 'Aceptar',
          cancelText: 'Cancelar',
          ...options,
        },
        resolve,
      });
    });
  }, []);

  const showSuccess = useCallback((message: string, title = 'Operación Exitosa', confirmText = 'Entendido') => {
    return showFeedback({ type: 'success', title, message, confirmText });
  }, [showFeedback]);

  const showError = useCallback((message: string, title = 'Atención / Error', confirmText = 'Entendido') => {
    return showFeedback({ type: 'error', title, message, confirmText });
  }, [showFeedback]);

  const showWarning = useCallback((message: string, title = 'Advertencia', confirmText = 'Entendido') => {
    return showFeedback({ type: 'warning', title, message, confirmText });
  }, [showFeedback]);

  const showInfo = useCallback((message: string, title = 'Información', confirmText = 'Aceptar') => {
    return showFeedback({ type: 'info', title, message, confirmText });
  }, [showFeedback]);

  const showConfirm = useCallback((message: string, title = 'Confirmar Acción', confirmText = 'Confirmar', cancelText = 'Cancelar') => {
    return showFeedback({ type: 'confirm', title, message, confirmText, cancelText });
  }, [showFeedback]);

  const handleClose = (result: boolean) => {
    if (modalState) {
      modalState.resolve(result);
      setModalState(null);
    }
  };

  const currentOptions = modalState?.options || { message: '' };
  const modalType = currentOptions.type || 'info';

  const getIconConfig = () => {
    switch (modalType) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-scale-in" />,
          bgClass: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
          titleColor: 'text-emerald-900 dark:text-emerald-300',
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400 animate-scale-in" />,
          bgClass: 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800',
          titleColor: 'text-rose-900 dark:text-rose-300',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-scale-in" />,
          bgClass: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
          titleColor: 'text-amber-900 dark:text-amber-300',
        };
      case 'confirm':
        return {
          icon: <HelpCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-scale-in" />,
          bgClass: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
          titleColor: 'text-stone-900 dark:text-stone-100',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-scale-in" />,
          bgClass: 'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800',
          titleColor: 'text-blue-900 dark:text-blue-300',
        };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <FeedbackContext.Provider
      value={{
        showFeedback,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
      }}
    >
      {children}

      {/* Global Feedback Modal */}
      {modalState?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 border border-amber-300/80 dark:border-stone-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-slide-up text-stone-900 dark:text-stone-100">
            {/* Top Close Button */}
            <button
              onClick={() => handleClose(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header & Icon */}
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl border ${iconConfig.bgClass} shrink-0 shadow-sm`}>
                {iconConfig.icon}
              </div>
              <div className="space-y-1 pr-4">
                <h3 className={`font-heading font-extrabold text-base ${iconConfig.titleColor}`}>
                  {currentOptions.title || (modalType === 'success' ? 'Éxito' : modalType === 'error' ? 'Error' : 'Notificación')}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed break-words whitespace-pre-line">
                  {currentOptions.message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-100 dark:border-stone-800">
              {modalType === 'confirm' ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleClose(false)}
                    className="border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 px-4"
                  >
                    {currentOptions.cancelText || 'Cancelar'}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleClose(true)}
                    className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold px-5 shadow-sm"
                  >
                    {currentOptions.confirmText || 'Confirmar'}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleClose(true)}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold w-full sm:w-auto px-6 shadow-sm"
                >
                  {currentOptions.confirmText || 'Entendido'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback debe ser utilizado dentro de un FeedbackProvider');
  }
  return context;
};
