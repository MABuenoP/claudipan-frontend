import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { MOCK_ORDERS } from '../data/mockData';
import { formatCurrency } from '../utils/helpers';
import { User, Package, Heart, Award, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-sm">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-stone-900 dark:text-stone-100">Acceso Requerido</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">Inicia sesión con tu cuenta demo para ver tus pedidos y perfil.</p>
        <Link to="/login">
          <Button variant="primary" size="lg">Iniciar Sesión Demo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-200/50 via-amber-100/40 to-amber-200/50 dark:from-stone-900 dark:via-amber-950/40 dark:to-stone-900 border border-amber-300/80 dark:border-amber-500/20 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl border-2 border-amber-500 object-cover shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-bold text-stone-900 dark:text-stone-100">{user?.name}</h1>
              <span className="bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Cliente VIP
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/catalog">
            <Button variant="outline" size="sm">Explorar Catálogo</Button>
          </Link>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Pedidos Totales</span>
            <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">12 Pedidos</span>
        </div>

        <div className="p-5 bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Puntos Claudipan</span>
            <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-2xl font-heading font-extrabold text-amber-700 dark:text-amber-400">450 Puntos</span>
        </div>

        <div className="p-5 bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Producto Favorito</span>
            <Heart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-1">Pan de Masa Madre</span>
        </div>
      </div>

      {/* Main content columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-xl font-heading font-bold text-stone-900 dark:text-stone-100">Historial de Pedidos Recientes</h2>
          
          <div className="space-y-3">
            {MOCK_ORDERS.map((ord) => (
              <div
                key={ord.id}
                className="bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 p-5 rounded-3xl space-y-3 hover:border-amber-400 dark:hover:border-amber-500/30 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-amber-200/80 dark:border-stone-800 pb-3">
                  <div>
                    <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 font-mono">{ord.id}</span>
                    <span className="text-[11px] text-stone-500 block">{ord.date}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    ord.status === 'Entregado'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {ord.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Productos:</span>
                  <div className="flex flex-wrap gap-2">
                    {ord.items.map((item, idx) => (
                      <span key={idx} className="bg-amber-100/60 dark:bg-stone-950 text-stone-800 dark:text-stone-300 text-xs px-2.5 py-1 rounded-xl border border-amber-200/80 dark:border-stone-800">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-stone-500 dark:text-stone-400">Total pagado</span>
                  <span className="text-base font-heading font-extrabold text-amber-700 dark:text-amber-400">
                    {formatCurrency(ord.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Info Details */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xl font-heading font-bold text-stone-900 dark:text-stone-100">Datos de Entrega</h2>
          <div className="bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300">
              <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-stone-900 dark:text-stone-200">Dirección Guardada</span>
                <span>{user?.address || 'Calle 93 # 12-45, Bogotá'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300">
              <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-stone-900 dark:text-stone-200">Teléfono Móvil</span>
                <span>{user?.phone || '+57 312 456 7890'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300">
              <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-stone-900 dark:text-stone-200">Correo Electrónico</span>
                <span>{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
