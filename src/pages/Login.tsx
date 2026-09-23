import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import {
  User,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Send,
  Sparkles,
  KeyRound,
  ArrowLeft,
  X
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export const Login: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nombre, setNombre] = useState('');
  const [documentoIdentidad, setDocumentoIdentidad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [redesSociales, setRedesSociales] = useState('');

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Field Verification State
  const [checkingField, setCheckingField] = useState<'cedula' | 'telefono' | 'email' | null>(null);
  const [verifiedStatus, setVerifiedStatus] = useState<{
    cedula?: { valid: boolean; text: string };
    telefono?: { valid: boolean; text: string };
    email?: { valid: boolean; text: string };
  }>({});

  // Duplicate Warning Modal State
  const [duplicateModal, setDuplicateModal] = useState<{
    isOpen: boolean;
    fieldName: string;
    fieldValue: string;
    fieldLabel: string;
  }>({
    isOpen: false,
    fieldName: '',
    fieldValue: '',
    fieldLabel: ''
  });

  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  // Handle field uniqueness verification
  const handleVerifyField = async (field: 'cedula' | 'telefono' | 'email') => {
    let value = '';
    let label = '';

    if (field === 'cedula') {
      value = documentoIdentidad.trim();
      label = 'Cédula / Documento';
    } else if (field === 'telefono') {
      value = telefono.trim();
      label = 'Número de Celular';
    } else if (field === 'email') {
      value = email.trim();
      label = 'Correo Electrónico';
    }

    if (!value) {
      setErrorMessage(`Por favor escribe el ${label.toLowerCase()} antes de verificar.`);
      return;
    }

    setErrorMessage(null);
    setCheckingField(field);

    try {
      const res = await authService.checkField(field, value);
      if (res.success && res.data) {
        if (res.data.exists) {
          // Ya existe: limpiar estado verificado y abrir modal
          setVerifiedStatus((prev) => ({ ...prev, [field]: undefined }));
          setDuplicateModal({
            isOpen: true,
            fieldName: field,
            fieldValue: value,
            fieldLabel: label
          });
        } else {
          // Disponible
          setVerifiedStatus((prev) => ({
            ...prev,
            [field]: { valid: true, text: '¡Disponible! No está registrado' }
          }));
        }
      } else {
        setErrorMessage(res.message || 'Error al verificar disponibilidad');
      }
    } catch {
      setErrorMessage('Error al consultar el servidor para verificación');
    } finally {
      setCheckingField(null);
    }
  };

  // Submit Login or Register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'register') {
      const res = await register({
        nombre,
        email,
        password,
        telefono,
        direccion,
        documentoIdentidad,
        redesSociales,
        limiteCredito: 50000 // Todo usuario nuevo entra con cupo fijo de $50.000 COP
      });
      if (res.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(res.message || 'Error en el registro');
      }
    } else if (mode === 'login') {
      const res = await login({ email, password });
      if (res.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(res.message || 'Credenciales inválidas');
      }
    }
  };

  // Submit Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setForgotSuccess(null);

    if (!email.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      if (res.success) {
        setForgotSuccess(
          res.message ||
            'Se ha enviado un correo con tu nueva contraseña temporal y el botón de activación.'
        );
      } else {
        setErrorMessage(
          res.message || 'No se pudo procesar la recuperación de contraseña'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white dark:bg-stone-900/90 border border-amber-300/80 dark:border-amber-500/20 p-8 rounded-3xl space-y-6 backdrop-blur-md shadow-2xl transition-colors duration-300 relative">
        
        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="Claudipan"
            className="w-16 h-16 rounded-2xl mx-auto border border-amber-500/30 object-cover shadow-md"
          />
          <h1 className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
            {mode === 'register'
              ? 'Crear Cuenta en Claudipan'
              : mode === 'forgot'
              ? 'Recuperar Contraseña'
              : 'Iniciar Sesión'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Panadería & Pastelería SENA ADSO
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-amber-100/60 dark:bg-stone-950 p-1 rounded-2xl border border-amber-200/80 dark:border-stone-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
              setForgotSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
              setForgotSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Registrarme
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('forgot');
              setErrorMessage(null);
              setForgotSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'forgot'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Recuperar Clave
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ------------------------------------ */}
        {/* MODE: FORGOT PASSWORD                */}
        {/* ------------------------------------ */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {forgotSuccess ? (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-stone-800 dark:text-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>¡Instrucciones enviadas!</span>
                </div>
                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  Hemos enviado a <strong>{email}</strong> un correo electrónico con tus datos, una nueva contraseña temporal de 8 dígitos alfanuméricos y un botón de activación.
                </p>
                <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-stone-900 p-2.5 rounded-xl border border-amber-200 dark:border-stone-800">
                  👉 <strong>Importante:</strong> Abre el correo y pulsa el botón <em>"Activar mi nueva contraseña"</em> para que tu nueva clave quede habilitada.
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setMode('login');
                    setForgotSuccess(null);
                  }}
                  className="w-full mt-2 cursor-pointer"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Ir al Login para Ingresar
                </Button>
              </div>
            ) : (
              <>
                <div className="p-3.5 bg-amber-50/60 dark:bg-stone-950/60 rounded-2xl border border-amber-200/80 dark:border-stone-800 flex items-start gap-2.5 text-xs text-stone-600 dark:text-stone-400">
                  <KeyRound className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>
                    Ingresa el correo con el que te registraste. Te enviaremos una nueva contraseña temporal y un enlace para activarla de inmediato.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Correo Electrónico Registrado *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="w-full mt-3 cursor-pointer shadow-md shadow-amber-600/20"
                  isLoading={forgotLoading}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Enviar Nueva Contraseña al Correo
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Volver a Iniciar Sesión
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* ------------------------------------ */}
        {/* MODE: LOGIN or REGISTER              */}
        {/* ------------------------------------ */}
        {mode !== 'forgot' && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                {/* Promo Banner Cupo $50.000 */}
                <div className="p-3 bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/10 border border-amber-400/40 rounded-2xl flex items-center gap-2.5 shadow-sm">
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="text-[11px] leading-tight text-amber-900 dark:text-amber-200">
                    <strong className="font-bold">¡Bienvenido a Claudipan!</strong> Al registrarte recibes un{' '}
                    <span className="font-extrabold text-amber-700 dark:text-amber-300">Cupo Inicial de $50.000 COP</span> para tus compras a crédito.
                  </div>
                </div>

                {/* Nombre Completo */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre y apellidos"
                      className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Cédula con Botón de Verificación */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                      Cédula / Documento *
                    </label>
                    {verifiedStatus.cedula?.valid && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Cédula disponible
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        value={documentoIdentidad}
                        onChange={(e) => {
                          setDocumentoIdentidad(e.target.value);
                          if (verifiedStatus.cedula) {
                            setVerifiedStatus((prev) => ({ ...prev, cedula: undefined }));
                          }
                        }}
                        placeholder="Número de C.C. o NIT"
                        className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                      />
                      <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    </div>
                    <button
                      type="button"
                      disabled={checkingField === 'cedula' || !documentoIdentidad.trim()}
                      onClick={() => handleVerifyField('cedula')}
                      className="px-3.5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl transition-all shadow-sm cursor-pointer shrink-0"
                    >
                      {checkingField === 'cedula' ? '...' : 'Verificar'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Correo Electrónico (con Verificación en Registro) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Correo Electrónico *
                </label>
                {mode === 'register' && verifiedStatus.email?.valid && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Correo disponible
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (verifiedStatus.email) {
                        setVerifiedStatus((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
                {mode === 'register' && (
                  <button
                    type="button"
                    disabled={checkingField === 'email' || !email.trim()}
                    onClick={() => handleVerifyField('email')}
                    className="px-3.5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    {checkingField === 'email' ? '...' : 'Verificar'}
                  </button>
                )}
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Contraseña *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
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

            {/* Campos adicionales de Registro */}
            {mode === 'register' && (
              <>
                {/* Teléfono / Celular con Verificación */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                      Teléfono / Celular
                    </label>
                    {verifiedStatus.telefono?.valid && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Celular disponible
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={telefono}
                        onChange={(e) => {
                          setTelefono(e.target.value);
                          if (verifiedStatus.telefono) {
                            setVerifiedStatus((prev) => ({ ...prev, telefono: undefined }));
                          }
                        }}
                        placeholder="300 123 4567"
                        className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                      />
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    </div>
                    <button
                      type="button"
                      disabled={checkingField === 'telefono' || !telefono.trim()}
                      onClick={() => handleVerifyField('telefono')}
                      className="px-3.5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl transition-all shadow-sm cursor-pointer shrink-0"
                    >
                      {checkingField === 'telefono' ? '...' : 'Verificar'}
                    </button>
                  </div>
                </div>

                {/* Dirección de Entrega */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Dirección de Entrega
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Calle # Carrera, Barrio o Punto de Referencia"
                      className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                    />
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Usuario de Facebook */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Usuario de Facebook
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={redesSociales}
                      onChange={(e) => setRedesSociales(e.target.value)}
                      placeholder="El usuario que posees en FaceBook @Usuaario"
                      className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                    />
                    <div className="absolute left-3.5 top-3 text-stone-400">
                      <svg
                        className="w-4 h-4 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full mt-3 cursor-pointer shadow-lg shadow-amber-600/20"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'register'
                ? 'Registrarme & Activar Cupo $50.000'
                : 'Ingresar a mi Cuenta'}
            </Button>
          </form>
        )}

      </div>

      {/* ------------------------------------ */}
      {/* MODAL: DUPLICATE ENTRY ALERT         */}
      {/* ------------------------------------ */}
      {duplicateModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-600/40 rounded-3xl shadow-2xl p-6 text-stone-900 dark:text-stone-100 animate-scale-up space-y-4">
            
            <button
              onClick={() =>
                setDuplicateModal({
                  isOpen: false,
                  fieldName: '',
                  fieldValue: '',
                  fieldLabel: ''
                })
              }
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Registro Existente
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                El <strong>{duplicateModal.fieldLabel.toLowerCase()}</strong>{' '}
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  "{duplicateModal.fieldValue}"
                </span>{' '}
                ya se encuentra registrado en Claudipan.
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                ¿Deseas iniciar sesión con tu cuenta existente o verificar otro dato?
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setDuplicateModal({
                    isOpen: false,
                    fieldName: '',
                    fieldValue: '',
                    fieldLabel: ''
                  });
                  setMode('login');
                }}
                className="w-full cursor-pointer shadow-md shadow-amber-600/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Ir a Login
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDuplicateModal({
                    isOpen: false,
                    fieldName: '',
                    fieldValue: '',
                    fieldLabel: ''
                  })
                }
                className="w-full cursor-pointer text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                Cancelar
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
