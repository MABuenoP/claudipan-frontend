import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService, User } from '../services/authService';
import { Button } from '../components/ui/Button';
import { CheckCircle2, AlertCircle, ChefHat, Sparkles, Store, LayoutDashboard, ArrowRight } from 'lucide-react';

export const ConfirmarRegistro: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleConfirm = async () => {
      if (!token || !email) {
        setErrorMessage('El enlace no contiene el token o el correo de validación requerido.');
        setLoading(false);
        return;
      }

      try {
        const res = await authService.confirmPreRegister(token, email);
        if (res.success && res.data) {
          setSuccess(true);
          setUser(res.data);
        } else {
          setErrorMessage(res.message || 'No se pudo validar el prerregistro.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error de conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    handleConfirm();
  }, [token, email]);

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

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
                Claudipan • Validación Oficial
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
                Validando y activando tu cuenta...
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Estamos asegurando tus credenciales y preparando tu bienvenida.
              </p>
            </div>
          )}

          {/* State: Success */}
          {!loading && success && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce-subtle">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
                  ¡Bienvenido a la Familia Claudipan!
                </h1>
                <p className="text-base text-stone-600 dark:text-stone-300">
                  Hola <strong className="text-amber-700 dark:text-amber-400">{user?.nombre || 'Estimado Cliente'}</strong>, tu cuenta ha sido confirmada y activada con éxito.
                </p>
              </div>

              {/* Account Details Box */}
              <div className="bg-amber-50/80 dark:bg-stone-800/60 border border-amber-200/80 dark:border-amber-500/20 rounded-2xl p-5 text-left space-y-2.5 text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 dark:border-stone-700/60">
                  <span className="text-stone-500 dark:text-stone-400 font-medium">Correo Electrónico:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 dark:border-stone-700/60">
                  <span className="text-stone-500 dark:text-stone-400 font-medium">Cupo de Crédito Asignado:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">$50.000 COP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400 font-medium">Seguridad de Acceso:</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="w-3 h-3" /> Contraseña Cifrada MD5
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/catalog" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Store className="w-5 h-5" />}
                    className="w-full sm:w-auto !py-3.5 !px-6 shadow-lg shadow-amber-600/30 text-base"
                  >
                    Ver Catálogo de Panadería
                  </Button>
                </Link>

                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<LayoutDashboard className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                    className="w-full sm:w-auto !py-3.5 !px-6"
                  >
                    Ir a Mi Panel
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
                  No Pudimos Confirmar tu Registro
                </h1>
                <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                  {errorMessage || 'El enlace de validación ya no es válido, expiró o ya fue utilizado.'}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full sm:w-auto !py-3 !px-6"
                  >
                    Ir al Formulario de Registro
                  </Button>
                </Link>
                <Link to="/" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                    Volver a Inicio
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-amber-200/60 dark:border-stone-800 text-center">
            <p className="text-xs font-medium text-stone-400 dark:text-stone-500">
              © {new Date().getFullYear()} Claudipan • SENA ADSO. ¡El sabor tradicional en cada bocado!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfirmarRegistro;
