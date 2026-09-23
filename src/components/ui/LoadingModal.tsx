import React, { useEffect, useState } from 'react';

interface LoadingModalProps {
  isLoading: boolean;
  message?: string;
  submessage?: string;
}

// Mensajes rotativos mientras carga
const LOADING_TIPS = [
  'Consultando la base de datos...',
  'Organizando la información...',
  'Preparando los registros...',
  'Sincronizando con el servidor...',
  'Casi listo...',
];

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isLoading,
  message = 'Cargando información',
  submessage,
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [dots, setDots] = useState('');
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  // Anima la aparición/desaparición
  useEffect(() => {
    if (isLoading) {
      setClosing(false);
      setVisible(true);
    } else if (visible) {
      setClosing(true);
      const t = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 380);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  // Rota los mensajes de tip cada 1.8s
  useEffect(() => {
    if (!isLoading) return;
    const t = setInterval(() => {
      setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
    }, 1800);
    return () => clearInterval(t);
  }, [isLoading]);

  // Puntos suspensivos animados
  useEffect(() => {
    if (!isLoading) return;
    let count = 0;
    const t = setInterval(() => {
      count = (count + 1) % 4;
      setDots('.'.repeat(count));
    }, 400);
    return () => clearInterval(t);
  }, [isLoading]);

  // Bloquea scroll del body mientras carga
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        closing ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      aria-live="polite"
      aria-busy={isLoading}
    >
      {/* Backdrop con blur */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />

      {/* Panel principal */}
      <div
        className={`relative z-10 w-full max-w-sm transition-all duration-300 ${
          closing ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <div className="bg-white dark:bg-stone-900 border border-amber-300/70 dark:border-amber-500/20 rounded-3xl shadow-2xl shadow-amber-900/20 overflow-hidden">

          {/* Barra de progreso animada en el top */}
          <div className="h-1 w-full bg-amber-100 dark:bg-stone-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 animate-loading-bar" />
          </div>

          {/* Cuerpo */}
          <div className="px-8 py-8 flex flex-col items-center gap-5 text-center">

            {/* Logo / icono animado */}
            <div className="relative flex items-center justify-center">
              {/* Anillo exterior pulsante */}
              <div className="absolute w-20 h-20 rounded-full border-2 border-amber-400/30 animate-ping-slow" />
              {/* Spinner doble */}
              <div className="w-16 h-16 relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-amber-200/40 dark:border-stone-700" />
                <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-b-amber-400/60 border-t-transparent border-l-transparent border-r-transparent animate-spin-reverse" />
                {/* Logo letra */}
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-heading select-none">
                  C
                </span>
              </div>
            </div>

            {/* Mensaje principal */}
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-stone-800 dark:text-stone-100 font-heading">
                {message}<span className="text-amber-500">{dots}</span>
              </h3>
              {submessage && (
                <p className="text-xs text-stone-500 dark:text-stone-400">{submessage}</p>
              )}
            </div>

            {/* Tip rotativo */}
            <div className="w-full bg-amber-50 dark:bg-stone-800/60 rounded-2xl px-4 py-2.5 border border-amber-200/60 dark:border-stone-700/50 min-h-[2.5rem] flex items-center justify-center">
              <p
                key={tipIndex}
                className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold animate-fade-in"
              >
                {LOADING_TIPS[tipIndex]}
              </p>
            </div>

            {/* Puntos de actividad */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500"
                  style={{
                    animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 text-center">
            <p className="text-[10px] text-stone-400 dark:text-stone-600 font-medium">
              Claudipan · Conectando con el servidor
            </p>
          </div>
        </div>
      </div>

      {/* Keyframe styles inyectados */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .animate-ping-slow { animation: ping-slow 1.8s ease-out infinite; }
        .animate-spin-reverse { animation: spin-reverse 1s linear infinite; }
        .animate-loading-bar {
          animation: loading-bar 1.6s ease-in-out infinite;
          width: 60%;
        }
      `}</style>
    </div>
  );
};
