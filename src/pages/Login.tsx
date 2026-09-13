import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { User, Lock, Phone, MapPin, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@claudipan.com');
  const [password, setPassword] = useState('Admin123*');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isRegister) {
      const res = await register({ nombre, email, password, telefono, direccion });
      if (res.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(res.message || 'Error en el registro');
      }
    } else {
      const res = await login({ email, password });
      if (res.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(res.message || 'Credenciales inválidas');
      }
    }
  };

  const handleQuickLogin = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setIsRegister(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white dark:bg-stone-900/90 border border-amber-300/80 dark:border-amber-500/20 p-8 rounded-3xl space-y-6 backdrop-blur-md shadow-xl transition-colors duration-300">
        
        {/* Header logo */}
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="Claudipan" className="w-16 h-16 rounded-2xl mx-auto border border-amber-500/30 object-cover" />
          <h1 className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
            {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">Bienvenido a Claudipan Panadería Artesanal</p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-amber-100/60 dark:bg-stone-950 p-1 rounded-2xl border border-amber-200/80 dark:border-stone-800">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              !isRegister ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500'
            }`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              isRegister ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500'
            }`}
          >
            Registrarme
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Nombre Completo</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre y apellido"
                  className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-3 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                />
                <User className="w-4 h-4 text-stone-400 dark:text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Correo Electrónico</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-3 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
              />
              <User className="w-4 h-4 text-stone-400 dark:text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-3 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-stone-400 dark:text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Teléfono / Celular</label>
                <div className="relative">
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="300 123 4567"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-3 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <Phone className="w-4 h-4 text-stone-400 dark:text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Dirección de Entrega</label>
                <div className="relative">
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle # Carrera, Barrio"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-3 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <MapPin className="w-4 h-4 text-stone-400 dark:text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isRegister ? 'Registrarme' : 'Ingresar a mi Cuenta'}
          </Button>
        </form>

        {/* Demo role selectors */}
        {!isRegister && (
          <div className="p-4 bg-amber-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl space-y-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" /> Acceso Rápido por Roles Demo
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@claudipan.com', 'Admin123*')}
                className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-[10px] font-bold hover:bg-purple-500/20 transition-all text-left"
              >
                👑 Administrador
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('secretaria@claudipan.com', 'Secre123*')}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-bold hover:bg-emerald-500/20 transition-all text-left"
              >
                📑 Secretaria
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('tecnico@claudipan.com', 'Tecnico123*')}
                className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-[10px] font-bold hover:bg-blue-500/20 transition-all text-left"
              >
                🛠️ Técnico
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('cliente@claudipan.com', 'Cliente123*')}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[10px] font-bold hover:bg-amber-500/20 transition-all text-left"
              >
                🍞 Cliente
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
