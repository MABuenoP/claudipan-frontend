import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, Phone, MapPin, CreditCard, Shield, Lock, Save, AlertCircle, 
  CheckCircle2, Eye, EyeOff, KeyRound, Edit3, Camera, Mail, FileText, ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'password';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, initialTab = 'profile' }) => {
  const { user, updateProfile, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>(initialTab);
  const [isEditing, setIsEditing] = useState(false);

  // Profile Form Fields
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fotoBase64, setFotoBase64] = useState<string | undefined>(undefined);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize fields from user
  const populateFromUser = () => {
    if (!user) return;
    
    // Parse name parts if not directly populated
    let pNom = user.primerNombre || '';
    let sNom = user.segundoNombre || '';
    let pApe = user.primerApellido || '';
    let sApe = user.segundoApellido || '';

    if (!pNom && !pApe && user.nombre) {
      const parts = user.nombre.trim().split(/\s+/);
      if (parts.length === 1) {
        pNom = parts[0];
      } else if (parts.length === 2) {
        pNom = parts[0];
        pApe = parts[1];
      } else if (parts.length === 3) {
        pNom = parts[0];
        pApe = parts[1];
        sApe = parts[2];
      } else if (parts.length >= 4) {
        pNom = parts[0];
        sNom = parts[1];
        pApe = parts[2];
        sApe = parts.slice(3).join(' ');
      }
    }

    setPrimerNombre(pNom);
    setSegundoNombre(sNom);
    setPrimerApellido(pApe);
    setSegundoApellido(sApe);
    setCedula(user.cedula || '');
    setTelefono(user.telefono || '');
    setEmail(user.email || '');
    setDireccion(user.direccion || '');
    setFotoBase64(user.fotoBase64);
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsEditing(false);
      populateFromUser();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage(null);
    }
  }, [isOpen, initialTab, user]);

  if (!isOpen || !user) return null;

  // Handle image upload & base64 conversion
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen no debe superar los 3 MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFotoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await updateProfile({
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      cedula,
      telefono,
      email,
      direccion,
      fotoBase64,
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: res.message || 'Perfil actualizado exitosamente' });
      setIsEditing(false);
      await refreshProfile();
    } else {
      setMessage({ type: 'error', text: res.message || 'No se pudo actualizar el perfil' });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Por favor ingresa tu contraseña actual' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden' });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Contraseña actualizada con éxito' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: res.message || 'Error al cambiar contraseña' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error en el servidor al cambiar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrador': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300';
      case 'Gerente': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-300';
      case 'Contable': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300';
      case 'Panadero': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300';
      case 'Vendedor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300';
      default: return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-300';
    }
  };

  const fullNameDisplay = [primerNombre, segundoNombre, primerApellido, segundoApellido].filter(Boolean).join(' ') || user.nombre;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/15 via-amber-400/5 to-transparent border-b border-amber-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-2xl border-2 border-amber-500/40 overflow-hidden shadow-inner">
                {fotoBase64 ? (
                  <img src={fotoBase64} alt={fullNameDisplay} className="w-full h-full object-cover" />
                ) : (
                  <span>{fullNameDisplay.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-lg transition-transform hover:scale-110"
                  title="Cambiar foto de perfil"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
                  {fullNameDisplay}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border ${getRoleBadgeColor(user.rol)}`}>
                  {user.rol}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'profile' && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex px-6 pt-3 bg-amber-50/50 dark:bg-stone-950/50 border-b border-amber-200/60 dark:border-stone-800 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setMessage(null);
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-extrabold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Datos del Perfil
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setMessage(null);
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'password'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-extrabold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Cambiar Contraseña
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {message && (
            <div className={`p-4 rounded-2xl border text-sm font-medium flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' 
                : 'bg-red-500/10 text-red-800 dark:text-red-300 border-red-500/30'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <>
              {/* Cupo de Crédito Summary if Client */}
              {user.rol === 'Cliente' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400">
                      <CreditCard className="w-4 h-4" />
                      <span>Cupo de Crédito & Estado Fiado</span>
                    </div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      Modificable solo por Gerencia o Administración
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium">
                    <div className="p-2.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                      <p className="text-stone-500 dark:text-stone-400 text-[11px]">Tope Asignado</p>
                      <p className="font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                        ${(user.limiteCredito || 0).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                      <p className="text-stone-500 dark:text-stone-400 text-[11px]">Deuda Actual</p>
                      <p className={`font-extrabold text-sm ${user.deudaActual > 0 ? "text-red-600 dark:text-red-400" : "text-stone-600 dark:text-stone-300"}`}>
                        ${(user.deudaActual || 0).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                      <p className="text-stone-500 dark:text-stone-400 text-[11px]">Disponible</p>
                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        ${Math.max(0, (user.limiteCredito || 0) - (user.deudaActual || 0)).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* READ-ONLY VIEW MODE */}
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                        Primer Nombre
                      </span>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {primerNombre || '-'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                        Segundo Nombre
                      </span>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {segundoNombre || <span className="text-stone-400 italic">No especificado</span>}
                      </p>
                    </div>

                    <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                        Primer Apellido
                      </span>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {primerApellido || '-'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                        Segundo Apellido
                      </span>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {segundoApellido || <span className="text-stone-400 italic">No especificado</span>}
                      </p>
                    </div>

                    <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                        Cédula de Ciudadanía
                      </span>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {cedula || <span className="text-stone-400 italic">Sin registrar</span>}
                      </p>
                    </div>

                    <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                        Celular / Teléfono
                      </span>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {telefono || <span className="text-stone-400 italic">Sin registrar</span>}
                      </p>
                    </div>

                    <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                        Correo Electrónico
                      </span>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {email || '-'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                        Dirección de Envío
                      </span>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {direccion || <span className="text-stone-400 italic">Sin registrar</span>}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/20 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Editar Mis Datos</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* EDIT FORM */
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  {/* Photo upload banner */}
                  <div className="p-4 bg-amber-50/70 dark:bg-stone-950/70 rounded-2xl border border-amber-200 dark:border-stone-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 overflow-hidden flex items-center justify-center">
                        {fotoBase64 ? (
                          <img src={fotoBase64} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Foto de Perfil</p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">JPG, PNG o WEBP (Base64)</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                    >
                      Cambiar Foto
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Primer Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        value={primerNombre}
                        onChange={(e) => setPrimerNombre(e.target.value)}
                        placeholder="Ej. Juan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Segundo Nombre <span className="text-[10px] text-stone-400 font-normal lowercase">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={segundoNombre}
                        onChange={(e) => setSegundoNombre(e.target.value)}
                        placeholder="Ej. Carlos"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Primer Apellido *
                      </label>
                      <input
                        type="text"
                        required
                        value={primerApellido}
                        onChange={(e) => setPrimerApellido(e.target.value)}
                        placeholder="Ej. Pérez"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Segundo Apellido <span className="text-[10px] text-stone-400 font-normal lowercase">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={segundoApellido}
                        onChange={(e) => setSegundoApellido(e.target.value)}
                        placeholder="Ej. Gómez"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Cédula de Ciudadanía
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cedula}
                          onChange={(e) => setCedula(e.target.value)}
                          placeholder="Ej. 1020304050"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                        <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Celular / Teléfono
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          placeholder="Ej. 300 123 4567"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="correo@ejemplo.com"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Dirección de Envío
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={direccion}
                          onChange={(e) => setDireccion(e.target.value)}
                          placeholder="Calle # Carrera..."
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                        <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => {
                        populateFromUser();
                        setIsEditing(false);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                Por tu seguridad, introduce tu contraseña actual y define una nueva clave de acceso de al menos 6 caracteres.
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Contraseña Actual *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Ingresa tu contraseña actual"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 p-0.5 rounded-lg transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 p-0.5 rounded-lg transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Confirmar Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repite tu nueva contraseña"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 p-0.5 rounded-lg transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Actualizando...' : 'Actualizar Contraseña'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
