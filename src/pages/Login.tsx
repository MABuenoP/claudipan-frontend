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
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
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

  // Pre-registration Success Modal State
  const [preregisterModal, setPreregisterModal] = useState<{
    isOpen: boolean;
    email: string;
    nombre: string;
    mensaje: string;
  }>({
    isOpen: false,
    email: '',
    nombre: '',
    mensaje: ''
  });
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);

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
      // Suma de los campos para el Nombre Completo
      const nombreCompleto = [
        primerNombre.trim(),
        segundoNombre.trim(),
        primerApellido.trim(),
        segundoApellido.trim()
      ]
        .filter(Boolean)
        .join(' ');

      setIsSubmittingRegister(true);
      try {
        const res = await authService.preRegister({
          primerNombre: primerNombre.trim(),
          segundoNombre: segundoNombre.trim() || undefined,
          primerApellido: primerApellido.trim(),
          segundoApellido: segundoApellido.trim() || undefined,
          nombre: nombreCompleto,
          email: email.trim(),
          password,
          telefono: telefono.trim() || undefined,
          direccion: direccion.trim() || undefined,
          cedula: documentoIdentidad.trim() || undefined,
          documentoIdentidad: documentoIdentidad.trim() || undefined,
          redesSociales: redesSociales.trim() || undefined,
          limiteCredito: 50000
        });

        if (res.success && res.data) {
          setPreregisterModal({
            isOpen: true,
            email: res.data.email,
            nombre: res.data.nombre || nombreCompleto,
            mensaje: res.data.mensaje
          });
        } else {
          setErrorMessage(res.message || 'Error en el prerregistro');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error al conectar con el servidor');
      } finally {
        setIsSubmittingRegister(false);
      }
    } else if (mode === 'login') {
      const res = await login({ email: email.trim(), password });
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
    <div
      className={`mx-auto px-4 py-10 transition-all duration-300 ${mode === 'register' ? 'max-w-2xl' : 'max-w-md'
        }`}
    >
      <div className="bg-white dark:bg-stone-900/90 border border-amber-300/80 dark:border-amber-500/20 p-6 sm:p-8 rounded-3xl space-y-6 backdrop-blur-md shadow-2xl transition-colors duration-300 relative">

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
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${mode === 'login'
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
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${mode === 'register'
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
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${mode === 'forgot'
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
        {/* MODE: LOGIN FORM                     */}
        {/* ------------------------------------ */}
        {mode === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Correo Electrónico *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Contraseña *
                </label>
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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

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

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full mt-3 cursor-pointer shadow-lg shadow-amber-600/20"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ingresar a mi Cuenta
            </Button>
          </form>
        )}

        {/* ------------------------------------ */}
        {/* MODE: REGISTER FORM (2 COLUMNS GRID) */}
        {/* ------------------------------------ */}
        {mode === 'register' && (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Promo Banner Cupo $50.000 */}
            <div className="p-3 bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/10 border border-amber-400/40 rounded-2xl flex items-center gap-2.5 shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-[11px] leading-tight text-amber-900 dark:text-amber-200">
                <strong className="font-bold">¡Bienvenido a Claudipan!</strong> Al registrarte recibes un{' '}
                <span className="font-extrabold text-amber-700 dark:text-amber-300">Cupo Inicial de $50.000 COP</span> para tus compras a crédito.
              </div>
            </div>

            {/* Grid 2 Columnas para los Campos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">

              {/* FILA 1: Primer Nombre & Segundo Nombre */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Primer Nombre *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={primerNombre}
                    onChange={(e) => setPrimerNombre(e.target.value)}
                    placeholder="Ej. Juan"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Segundo Nombre <span className="text-stone-400 lowercase font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={segundoNombre}
                    onChange={(e) => setSegundoNombre(e.target.value)}
                    placeholder="Ej. Carlos"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* FILA 2: Primer Apellido & Segundo Apellido */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Primer Apellido *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={primerApellido}
                    onChange={(e) => setPrimerApellido(e.target.value)}
                    placeholder="Ej. Pérez"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Segundo Apellido <span className="text-stone-400 lowercase font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={segundoApellido}
                    onChange={(e) => setSegundoApellido(e.target.value)}
                    placeholder="Ej. Gómez"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* FILA 3: Cédula & Correo Electrónico (ambos con Verificar) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Cédula / Documento *
                  </label>
                  {verifiedStatus.cedula?.valid && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Disponible
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
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
                      placeholder="C.C. o NIT"
                      className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-3.5 py-2.5 pl-9 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                    />
                    <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                  <button
                    type="button"
                    disabled={checkingField === 'cedula' || !documentoIdentidad.trim()}
                    onClick={() => handleVerifyField('cedula')}
                    className="px-3 py-2 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    {checkingField === 'cedula' ? '...' : 'Verificar'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Correo Electrónico *
                  </label>
                  {verifiedStatus.email?.valid && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Disponible
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
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
                      className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-3.5 py-2.5 pl-9 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                  <button
                    type="button"
                    disabled={checkingField === 'email' || !email.trim()}
                    onClick={() => handleVerifyField('email')}
                    className="px-3 py-2 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    {checkingField === 'email' ? '...' : 'Verificar'}
                  </button>
                </div>
              </div>

              {/* FILA 4: Contraseña & Teléfono/Celular */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Contraseña *
                </label>
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
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Teléfono / Celular
                  </label>
                  {verifiedStatus.telefono?.valid && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Disponible
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
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
                      className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-3.5 py-2.5 pl-9 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                    />
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                  <button
                    type="button"
                    disabled={checkingField === 'telefono' || !telefono.trim()}
                    onClick={() => handleVerifyField('telefono')}
                    className="px-3 py-2 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    {checkingField === 'telefono' ? '...' : 'Verificar'}
                  </button>
                </div>
              </div>

              {/* FILA 5: Dirección de Entrega & Usuario de Facebook */}
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
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            {/* Botón de Envío ancho completo */}
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full mt-4 cursor-pointer shadow-lg shadow-amber-600/20"
              isLoading={isLoading || isSubmittingRegister}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isSubmittingRegister ? 'Enviando Prerregistro...' : 'Registrarme'}
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

      {/* Modal de Éxito de Prerregistro - Correo Enviado */}
      {preregisterModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-300/80 dark:border-amber-500/30 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 text-center">

            <button
              onClick={() => {
                setPreregisterModal({ isOpen: false, email: '', nombre: '', mensaje: '' });
                setMode('login');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300/60 dark:border-amber-700/50 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Mail className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50">
                <Sparkles className="w-3.5 h-3.5" />
                ¡Prerregistro Exitoso!
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-stone-900 dark:text-stone-100">
                Revisa tu Correo Electrónico
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Hemos enviado un correo a <strong className="text-amber-700 dark:text-amber-400">{preregisterModal.email}</strong> con todos los datos que registraste, incluida tu contraseña creada.
              </p>
            </div>

            {/* Informative Step Box */}
            <div className="bg-amber-50/80 dark:bg-stone-800/60 border border-amber-200/80 dark:border-amber-500/20 rounded-2xl p-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300 text-left space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                <span>Abre tu bandeja de entrada o carpeta de spam en <strong>{preregisterModal.email}</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                <span>Verifica tus datos y haz clic en el botón <strong>"Validar y Confirmar Registro"</strong> para activar tu cuenta.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                <span>Al confirmar, tu contraseña se guardará encriptada con estándar de seguridad <strong>MD5</strong>.</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => {
                  setPreregisterModal({ isOpen: false, email: '', nombre: '', mensaje: '' });
                  setMode('login');
                }}
                className="w-full cursor-pointer shadow-lg shadow-amber-600/30 !py-3"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Entendido, Ir a Iniciar Sesión
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
