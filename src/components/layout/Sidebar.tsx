import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Store, ShoppingBag, LayoutDashboard, LogIn, LogOut, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORIES } from '../../utils/constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isOpen) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar Panel */}
      <aside className="fixed top-0 left-0 bottom-0 w-80 bg-stone-950 border-r border-amber-500/20 text-stone-100 shadow-2xl z-10 flex flex-col p-6 overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Claudipan" className="w-10 h-10 rounded-xl border border-amber-500/30" />
            <div>
              <h2 className="font-heading font-bold text-amber-400 text-lg">CLAUDIPAN</h2>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">Panadería Artesanal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-900 rounded-xl"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="my-6 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500/80 px-3 mb-2">Menú Principal</p>
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${
              isActive('/')
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-stone-300 hover:bg-stone-900 hover:text-stone-100'
            }`}
          >
            <Home className="w-5 h-5 text-amber-400" />
            Inicio
          </Link>
          <Link
            to="/catalog"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${
              isActive('/catalog')
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-stone-300 hover:bg-stone-900 hover:text-stone-100'
            }`}
          >
            <Store className="w-5 h-5 text-amber-400" />
            Catálogo Completo
          </Link>
          <Link
            to="/cart"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${
              isActive('/cart')
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-stone-300 hover:bg-stone-900 hover:text-stone-100'
            }`}
          >
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            Carrito de Compras
          </Link>
          <Link
            to="/dashboard"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${
              isActive('/dashboard')
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-stone-300 hover:bg-stone-900 hover:text-stone-100'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 text-amber-400" />
            Panel de Usuario
          </Link>
        </nav>

        {/* Categories Quick Links */}
        <div className="mb-6 pt-4 border-t border-stone-900">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 mb-3">Categorías</p>
          <div className="grid grid-cols-1 gap-1.5">
            {CATEGORIES.slice(1).map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.id}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs text-stone-300 hover:bg-stone-900 hover:text-amber-300 transition-colors"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* User Auth Footer */}
        <div className="mt-auto pt-6 border-t border-stone-800">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-stone-900/80 rounded-2xl border border-stone-800">
                <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-xl object-cover" />
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-stone-100 truncate">{user?.name}</p>
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-red-400 text-xs font-semibold rounded-xl transition-colors border border-stone-800"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all"
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
