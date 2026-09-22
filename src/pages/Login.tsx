import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { User, Lock, Phone, MapPin, ArrowRight, Sparkles, AlertCircle, FileText, Share2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@claudipan.com');
  const [password, setPassword] = useState('Admin123*');
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

  const handleQuickLogin = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setIsRegister(false);
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
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              !isRegister ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
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
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isRegister ? 'Registrarme & Activar Cupo' : 'Ingresar a mi Cuenta'}
          </Button>
        </form>

        {/* Demo 6 role selectors */}
        {!isRegister && (
          <div className="p-4 bg-amber-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" /> Acceso Rápido por Roles (6 Roles)
              </span>
              <span className="text-[10px] text-stone-500 font-mono">1-Click Demo</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@claudipan.com', 'Admin123*')}
                className="p-2 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-xs font-bold hover:bg-purple-500/20 transition-all text-left flex flex-col"
              >
                <span className="font-extrabold">👑 Administrador</span>
                <span className="text-[10px] opacity-75">Control total & Auditoría</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('gerente@claudipan.com', 'Gerente123*')}
                className="p-2 rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-xs font-bold hover:bg-indigo-500/20 transition-all text-left flex flex-col"
              >
                <span className="font-extrabold">💼 Gerente</span>
                <span className="text-[10px] opacity-75">P&G, Ventas y Rentabilidad</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('contable@claudipan.com', 'Conta123*')}
                className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all text-left flex flex-col"
              >
                <span className="font-extrabold">📊 Contable</span>
                <span className="text-[10px] opacity-75">Servicios, Nómina y Balances</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('panadero@claudipan.com', 'Panadero123*')}
                className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition-all text-left flex flex-col"
              >
                <span className="font-extrabold">🥖 Panadero</span>
                <span className="text-[10px] opacity-75">Fórmulas y Producción</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('vendedor@claudipan.com', 'Vendedor123*')}
                className="p-2 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-xs font-bold hover:bg-blue-500/20 transition-all text-left flex flex-col"
              >
                <span className="font-extrabold">🛒 Vendedor</span>
                <span className="text-[10px] opacity-75">Caja Rápida POS Mostrador</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('cliente@claudipan.com', 'Cliente123*')}
                className="p-2 rounded-xl bg-stone-500/10 text-stone-700 dark:text-stone-300 border border-stone-500/20 text-xs font-bold hover:bg-stone-500/20 transition-all text-left flex flex-col"
              >
                <span className="font-extrabold">👤 Cliente</span>
                <span className="text-[10px] opacity-75">Cupo Fiado $500k & Compras</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
