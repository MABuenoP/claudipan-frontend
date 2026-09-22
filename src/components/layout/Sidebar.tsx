import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Store, ShoppingBag, LayoutDashboard, LogIn, LogOut, X, 
  Sun, Moon, CreditCard, DollarSign, Settings, Flame, Truck, 
  Receipt, Trash2, ShoppingCart 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { CATEGORIES } from '../../utils/constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!isOpen) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar Panel */}
      <aside className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-stone-950 border-r border-amber-200/80 dark:border-amber-500/20 text-stone-900 dark:text-stone-100 shadow-2xl z-10 flex flex-col p-6 overflow-y-auto animate-slide-up transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-amber-200/80 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Claudipan" className="w-10 h-10 rounded-xl border border-amber-500/30 object-cover" />
            <div>
              <h2 className="font-heading font-bold text-amber-600 dark:text-amber-400 text-lg">CLAUDIPAN</h2>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest">SENA ADSO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-amber-100/50 dark:hover:bg-stone-900 rounded-xl transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Switcher Button */}
        <div className="mt-4 mb-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-amber-100/80 dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-amber-300 dark:border-stone-800 hover:border-amber-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-xs font-bold">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-700" />}
              <span>Modo Visual</span>
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {theme === 'dark' ? 'Oscuro 🌙' : 'Claro ☀️'}
            </span>
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="my-4 space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 px-3 mb-2">Navegación</p>
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              isActive('/') ? 'bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/30' : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50'
            }`}
          >
            <Home className="w-4 h-4 text-amber-600" />
            Inicio
          </Link>
          <Link
            to="/catalog"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              isActive('/catalog') ? 'bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/30' : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50'
            }`}
          >
            <Store className="w-4 h-4 text-amber-600" />
            Catálogo & Ofertas
          </Link>
          <Link
            to="/cart"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              isActive('/cart') ? 'bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/30' : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-600" />
            Carrito de Compras
          </Link>

          {/* Role specific links */}
          {user?.rol === 'Cliente' && (
            <Link
              to="/mis-deudas"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive('/mis-deudas') ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30' : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Mis Deudas / Cupo Fiado
            </Link>
          )}

          {(user?.rol === 'Panadero' || user?.rol === 'Administrador' || user?.rol === 'Gerente') && (
            <Link
              to="/produccion"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive('/produccion') ? 'bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/30' : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              Módulo de Producción
            </Link>
          )}

          {(user?.rol === 'Vendedor' || user?.rol === 'Administrador' || user?.rol === 'Gerente') && (
            <Link
              to="/pos"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive('/pos') ? 'bg-blue-500/20 text-blue-800 dark:text-blue-400 border border-blue-500/30' : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-blue-500" />
              Terminal POS Mostrador
            </Link>
          )}

          {(user?.rol === 'Contable' || user?.rol === 'Gerente' || user?.rol === 'Administrador') && (
            <Link
              to="/contabilidad"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive('/contabilidad') ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30' : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Contabilidad P&G
            </Link>
          )}

          {(user?.rol === 'Administrador' || user?.rol === 'Gerente' || user?.rol === 'Contable') && (
            <>
              <Link
                to="/compras"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive('/compras') ? 'bg-teal-500/20 text-teal-800 dark:text-teal-400 border border-teal-500/30' : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50'
                }`}
              >
                <Truck className="w-4 h-4 text-teal-500" />
                Compras a Proveedores
              </Link>
              <Link
                to="/gastos"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive('/gastos') ? 'bg-rose-500/20 text-rose-800 dark:text-rose-400 border border-rose-500/30' : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50'
                }`}
              >
                <Receipt className="w-4 h-4 text-rose-500" />
                Servicios & Nómina
              </Link>
              <Link
                to="/bajas"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive('/bajas') ? 'bg-red-500/20 text-red-800 dark:text-red-400 border border-red-500/30' : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50'
                }`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                Bajas & Mermas
              </Link>
            </>
          )}

          {user?.rol === 'Administrador' && (
            <Link
              to="/admin/tables"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive('/admin/tables') ? 'bg-purple-500/20 text-purple-800 dark:text-purple-400 border border-purple-500/30' : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/50'
              }`}
            >
              <Settings className="w-4 h-4 text-purple-600" />
              CRUD Tablas & Auditoría
            </Link>
          )}
        </nav>

        {/* User Auth Footer */}
        <div className="mt-auto pt-4 border-t border-amber-200/80 dark:border-stone-800">
          {isAuthenticated && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-amber-100/60 dark:bg-stone-900/80 rounded-2xl border border-amber-200/80 dark:border-stone-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-sm flex items-center justify-center border border-amber-500/30 shrink-0">
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{user.nombre}</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">{user.rol}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/20 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-600/20 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
};
