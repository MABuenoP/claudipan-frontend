import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { User, Lock, Phone, MapPin, ArrowRight, AlertCircle, FileText, Share2, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nombre, setNombre] = useState('');
  const [documentoIdentidad, setDocumentoIdentidad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [redesSociales, setRedesSociales] = useState('');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isRegister) {
      const res = await register({ 
        nombre, 
        email, 
        password, 
        telefono, 
        direccion,
        documentoIdentidad,
        redesSociales
      });
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

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white dark:bg-stone-900/90 border border-amber-300/80 dark:border-amber-500/20 p-8 rounded-3xl space-y-6 backdrop-blur-md shadow-xl transition-colors duration-300">
        
        {/* Header logo */}
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="Claudipan" className="w-16 h-16 rounded-2xl mx-auto border border-amber-500/30 object-cover shadow-md" />
          <h1 className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
            {isRegister ? 'Crear Cuenta en Claudipan' : 'Iniciar Sesión'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">Panadería & Pastelería SENA ADSO</p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-amber-100/60 dark:bg-stone-950 p-1 rounded-2xl border border-amber-200/80 dark:border-stone-800">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              !isRegister ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isRegister ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
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
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Nombre Completo *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Cédula / Documento *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={documentoIdentidad}
                    onChange={(e) => setDocumentoIdentidad(e.target.value)}
                    placeholder="C.C. o NIT"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Correo Electrónico *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Contraseña *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 pr-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 focus:outline-none p-1 rounded-xl transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Teléfono / Celular</label>
                <div className="relative">
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="300 123 4567"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Dirección de Entrega</label>
                <div className="relative">
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle # Carrera, Barrio"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Redes Sociales / WhatsApp</label>
                <div className="relative">
                  <input
                    type="text"
                    value={redesSociales}
                    onChange={(e) => setRedesSociales(e.target.value)}
                    placeholder="@usuario_instagram o WhatsApp"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <Share2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full mt-2 cursor-pointer"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isRegister ? 'Registrarme & Activar Cupo' : 'Ingresar a mi Cuenta'}
          </Button>
        </form>

      </div>
    </div>
  );
};
