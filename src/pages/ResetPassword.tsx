import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { CheckCircle2, AlertTriangle, KeyRound, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleActivate = async () => {
    if (!token || !email) {
      setStatus('error');
      setMessage('El enlace de activación es incompleto. Asegúrate de abrir el enlace tal como llegó a tu correo.');
      return;
    }

    setLoading(true);
    setStatus('idle');
    try {
      const res = await authService.resetPassword(token, email);
      if (res.success) {
        setStatus('success');
        setMessage(res.message || '¡Tu nueva contraseña ha sido activada con éxito!');
      } else {
        setStatus('error');
        setMessage(res.message || 'No se pudo activar la nueva contraseña. El enlace puede haber expirado.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Error de conexión al activar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white dark:bg-stone-900/90 border border-amber-300/80 dark:border-amber-500/20 p-8 rounded-3xl space-y-6 backdrop-blur-md shadow-2xl transition-colors duration-300">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="Claudipan"
            className="w-16 h-16 rounded-2xl mx-auto border border-amber-500/30 object-cover shadow-md"
          />
          <h1 className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
            Activación de Contraseña
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Panadería & Pastelería Claudipan - SENA ADSO
          </p>
        </div>

        {/* Email Tag */}
        {email && (
          <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs font-semibold">
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            <span>{email}</span>
          </div>
        )}

        {/* State Content */}
        {status === 'idle' && (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                Haz clic en el siguiente botón para <strong>confirmar y activar</strong> la nueva contraseña temporal de 8 caracteres que recibiste en tu correo.
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Una vez activada, tu contraseña anterior dejará de funcionar y podrás ingresar con la clave temporal.
              </p>
            </div>

            <Button
              onClick={handleActivate}
              variant="secondary"
              size="lg"
              className="w-full cursor-pointer shadow-lg shadow-amber-600/20"
              isLoading={loading}
              rightIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Activar mi Nueva Contraseña
            </Button>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                ¡Activación Exitosa!
              </h3>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {message}
              </p>
              <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
                💡 <strong>Consejo:</strong> Inicia sesión con la contraseña de 8 dígitos que te llegó por correo. Luego puedes cambiarla por tu propia contraseña en tu perfil si lo deseas.
              </div>
            </div>

            <Button
              onClick={() => navigate('/login')}
              variant="secondary"
              size="lg"
              className="w-full cursor-pointer shadow-lg shadow-amber-600/20"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ir a Iniciar Sesión
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-red-700 dark:text-red-400">
                No pudimos activar la contraseña
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {message}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleActivate}
                variant="secondary"
                size="md"
                className="w-full cursor-pointer"
                isLoading={loading}
              >
                Reintentar Activación
              </Button>
              <Link
                to="/login"
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline py-2"
              >
                ← Volver al Login y solicitar nuevo enlace
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
