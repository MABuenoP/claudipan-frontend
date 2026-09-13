import React, { useState } from 'react';
import { X, User, Phone, MapPin, CreditCard, Shield, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [nombre, setNombre] = useState(user?.nombre || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [direccion, setDireccion] = useState(user?.direccion || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await updateProfile({
      nombre,
      telefono,
      direccion,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: res.message || 'Perfil actualizado con éxito' });
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setMessage({ type: 'error', text: res.message || 'No se pudo actualizar el perfil' });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrador': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300';
      case 'Secretaria': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300';
      case 'Tecnico': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300';
      default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-b border-amber-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
                Mi Perfil
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status and Credit summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 dark:text-stone-400 mb-1">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Rol de Usuario</span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold border ${getRoleBadgeColor(user.rol)}`}>
                {user.rol}
              </span>
            </div>

            {user.rol === 'Cliente' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400 mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Crédito & Cupo Fiado</span>
                </div>
                <div className="text-xs font-medium space-y-0.5">
                  <p className="text-stone-700 dark:text-stone-300">
                    Tope asignado: <strong className="text-stone-900 dark:text-stone-100">${user.limiteCredito?.toLocaleString('es-CO')}</strong>
                  </p>
                  <p className="text-stone-700 dark:text-stone-300">
                    Fiado actual: <strong className={user.deudaActual > 0 ? "text-red-600 dark:text-red-400" : "text-stone-500"}>${user.deudaActual?.toLocaleString('es-CO')}</strong>
                  </p>
                  <p className="text-stone-700 dark:text-stone-300 pt-1 border-t border-amber-500/20">
                    Cupo disponible: <strong className="text-emerald-600 dark:text-emerald-400">${Math.max(0, (user.limiteCredito || 0) - (user.deudaActual || 0)).toLocaleString('es-CO')}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

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

          {/* Edit form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Teléfono / Celular
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 300 123 4567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
              <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Cambiar Contraseña (Opcional)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
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
                <Save className="w-4 h-4" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
