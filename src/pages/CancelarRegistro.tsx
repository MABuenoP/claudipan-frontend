import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { ChefHat, CheckCircle2, AlertCircle, Home, UserPlus } from 'lucide-react';

export const CancelarRegistro: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCancel = async () => {
      if (!token || !email) {
        setErrorMessage('El enlace no contiene el token o el correo de cancelación requerido.');
        setLoading(false);
        return;
      }

      try {
        const res = await authService.cancelPreRegister(token, email);
        if (res.success) {
          setSuccess(true);
        } else {
          setErrorMessage(res.message || 'No se pudo cancelar el prerregistro.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error de conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    handleCancel();
  }, [token, email]);

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl mx-auto text-center animate-fade-in">
        <div className="bg-white/95 dark:bg-stone-900/95 border border-amber-300/80 dark:border-amber-500/25 p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl shadow-amber-900/10 dark:shadow-black/50 transition-all duration-300">

          {/* Header Brand */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="/logo.png"
              alt="Claudipan Logo"
              className="w-14 h-14 rounded-2xl border-2 border-amber-500/40 object-cover shadow-lg shadow-amber-500/20"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50">
                <ChefHat className="w-3.5 h-3.5" />
                Claudipan • Gestión de Registro
              </span>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                Panadería & Pastelería Artesanal
              </p>
            </div>
          </div>

          {/* State: Loading */}
          {loading && (
            <div className="py-12 space-y-4">
              <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
                Procesando cancelación de registro...
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Estamos actualizando la solicitud en nuestra base de datos.
              </p>
            </div>
          )}

          {/* State: Success */}
          {!loading && success && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-500/40 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
                  Prerregistro Cancelado
                </h1>
                <p className="text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                  Tu solicitud para el correo <strong className="text-stone-800 dark:text-stone-100">{email}</strong> ha sido cancelada correctamente.
                </p>
              </div>

              <div className="bg-amber-50/80 dark:bg-stone-800/60 border border-amber-200/80 dark:border-amber-500/20 rounded-2xl p-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300 text-left space-y-1.5">
                <p>• Tus datos no fueron almacenados como usuario activo.</p>
                <p>• Tu contraseña temporal ha sido descartada de forma segura.</p>
                <p>• Si deseas registrarte en el futuro, puedes hacerlo libremente con el mismo correo.</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Home className="w-5 h-5" />}
                    className="w-full sm:w-auto !py-3.5 !px-6 shadow-lg shadow-amber-600/30 text-base"
                  >
                    Ir a la Página de Inicio
                  </Button>
                </Link>

                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<UserPlus className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                    className="w-full sm:w-auto !py-3.5 !px-6"
                  >
                    Crear Nueva Cuenta
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* State: Error */}
          {!loading && !success && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 border-2 border-red-500/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
                <AlertCircle className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-black font-heading text-stone-900 dark:text-stone-100">
                  Aviso de Cancelación
                </h1>
                <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                  {errorMessage || 'La solicitud ya había sido cancelada, expiró o ya fue validada con anterioridad.'}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto !py-3 !px-6">
                    Volver a Inicio
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-amber-200/60 dark:border-stone-800 text-center">
            <p className="text-xs font-medium text-stone-400 dark:text-stone-500">
              © {new Date().getFullYear()} Claudipan • SENA ADSO. ¡Gracias por visitarnos!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CancelarRegistro;
