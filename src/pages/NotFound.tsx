import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Store, Sparkles, ChefHat } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[82vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-auto text-center animate-fade-in">
        <div className="bg-white/90 dark:bg-stone-900/90 border border-amber-300/80 dark:border-amber-500/25 p-8 sm:p-12 rounded-3xl backdrop-blur-xl shadow-2xl shadow-amber-900/10 dark:shadow-black/50 transition-all duration-300">
          
          {/* Brand & Badge Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="/logo.png"
              alt="Claudipan Logo"
              className="w-14 h-14 rounded-2xl border-2 border-amber-500/40 object-cover shadow-lg shadow-amber-500/20"
            />
            <div className="text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50">
                <ChefHat className="w-3.5 h-3.5" />
                Error 404 • Receta No Encontrada
              </span>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                Panadería & Pastelería Claudipan
              </p>
            </div>
          </div>

          {/* Artistic 404 Number */}
          <div className="relative my-4 select-none">
            <h1 className="text-8xl sm:text-9xl font-black font-heading tracking-tight bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-amber-400/20 dark:text-amber-300/10 text-9xl sm:text-[10rem] font-heading font-black blur-sm">
                404
              </span>
            </div>
          </div>

          {/* Main User Message */}
          <div className="space-y-4 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
              ¡Upsss! Estás tratando de ir a un archivo que no se encuentra.
            </h2>
            
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-normal leading-relaxed">
              Usa nuestro enlace para regresarte a nuestra página de inicio y gracias por tu visita.
            </p>

            {/* Claudipan Warm Note */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-800/60 border border-amber-200/70 dark:border-amber-500/20 text-xs sm:text-sm text-amber-900 dark:text-amber-200/90 font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Nuestros hornos siguen encendidos con pan fresco y las mejores delicias del día.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-amber-200/60 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Primary Button: Ir al Inicio */}
            <Link to="/" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Home className="w-5 h-5" />}
                className="w-full sm:w-auto !py-3.5 !px-7 shadow-lg shadow-amber-600/30 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 transition-all text-base"
              >
                Ir a la Página de Inicio
              </Button>
            </Link>

            {/* Secondary Button: Catálogo */}
            <Link to="/catalog" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Store className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                className="w-full sm:w-auto !py-3.5 !px-6"
              >
                Ver Catálogo
              </Button>
            </Link>

            {/* Tertiary: Regresar */}
            <Button
              variant="ghost"
              size="lg"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto text-xs sm:text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
            >
              Volver atrás
            </Button>
          </div>

          {/* Polite Thank You Note */}
          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-stone-400 dark:text-stone-500">
              © {new Date().getFullYear()} Claudipan • SENA ADSO. ¡Esperamos verte pronto de nuevo!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotFound;
