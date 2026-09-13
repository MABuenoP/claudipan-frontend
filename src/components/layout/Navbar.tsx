import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, Search, Sun, Moon, LogOut, CreditCard, Shield, ChevronDown, Package, DollarSign, Settings } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ProfileModal } from '../profile/ProfileModal';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'Administrador': return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30';
      case 'Secretaria': return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'Tecnico': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30';
      default: return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FFFBEB]/90 dark:bg-stone-950/80 backdrop-blur-xl border-b border-amber-200/80 dark:border-amber-500/20 text-stone-900 dark:text-stone-100 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-stone-900 rounded-xl transition-colors shadow-sm"
                aria-label="Abrir menú"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link to="/" className="flex items-center gap-3 group">
                <img
                  src="/logo.png"
                  alt="Claudipan Logo"
                  className="w-12 h-12 rounded-xl border border-amber-500/30 group-hover:scale-105 transition-transform duration-300 shadow-md shadow-amber-500/10 object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-400 dark:via-amber-300 dark:to-amber-500 bg-clip-text text-transparent">
                    CLAUDIPAN
                  </span>
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-800/80 dark:text-stone-400 -mt-1">
                    Panadería Artesanal
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8 relative">
              <input
                type="text"
                placeholder="Buscar pan hojaldrado, croissants, café..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-400 text-sm px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 shadow-sm transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 dark:text-stone-400 absolute left-3.5 top-3" />
            </form>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
              <Link
                to="/"
                className={`transition-colors ${
                  isActive('/')
                    ? 'text-amber-700 dark:text-amber-400 font-extrabold'
                    : 'text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400'
                }`}
              >
                Inicio
              </Link>
              <Link
                to="/catalog"
                className={`transition-colors ${
                  isActive('/catalog')
                    ? 'text-amber-700 dark:text-amber-400 font-extrabold'
                    : 'text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400'
                }`}
              >
                Catálogo
              </Link>
              <Link
                to="/dashboard"
                className={`transition-colors ${
                  isActive('/dashboard')
                    ? 'text-amber-700 dark:text-amber-400 font-extrabold'
                    : 'text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400'
                }`}
              >
                Panel Pedidos
              </Link>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2.5">
              {/* Theme Switcher Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTheme();
                }}
                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-amber-800 dark:text-amber-300 rounded-2xl border border-amber-300 dark:border-stone-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer font-bold text-xs"
                aria-label="Cambiar tema de color"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                    <span className="hidden sm:inline">Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-amber-800 transition-transform duration-300 -rotate-12 hover:rotate-0" />
                    <span className="hidden sm:inline">Oscuro</span>
                  </>
                )}
              </button>

              {/* Cart Icon Button */}
              <Link
                to="/cart"
                className="relative p-2.5 bg-white hover:bg-amber-100/70 dark:bg-stone-900/80 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 rounded-2xl border border-amber-200/80 dark:border-stone-800 transition-all shadow-sm group"
                aria-label="Ver Carrito de Compras"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-950 text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-stone-950 animate-bounce">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Auth Profile Menu Button Dropdown */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/20 text-white font-bold text-sm flex items-center justify-center border border-white/30">
                      {user.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold max-w-[100px] truncate">
                      {user.nombre.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-2xl z-50 overflow-hidden animate-slide-up p-2 space-y-1">
                        
                        {/* Header User info */}
                        <div className="p-3 bg-amber-500/10 dark:bg-stone-800/80 rounded-xl mb-1">
                          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{user.nombre}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{user.email}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getRoleBadge(user.rol)}`}>
                            {user.rol}
                          </span>
                        </div>

                        {/* Menu Links */}
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsProfileModalOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-stone-800 rounded-xl transition-colors text-left"
                        >
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Mi Perfil
                        </button>

                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-stone-800 rounded-xl transition-colors"
                        >
                          <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          Mis Compras / Pedidos
                        </Link>

                        {user.rol === 'Cliente' && (
                          <Link
                            to="/mis-deudas"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-stone-800 rounded-xl transition-colors"
                          >
                            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            Mis Deudas / Crédito
                          </Link>
                        )}

                        {(user.rol === 'Secretaria' || user.rol === 'Administrador') && (
                          <Link
                            to="/contabilidad"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-stone-800 rounded-xl transition-colors"
                          >
                            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            Contabilidad & Cartera
                          </Link>
                        )}

                        {(user.rol === 'Tecnico' || user.rol === 'Administrador') && (
                          <Link
                            to="/admin/tables"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-stone-800 rounded-xl transition-colors"
                          >
                            <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            Gestión CRUD Tablas
                          </Link>
                        )}

                        <div className="pt-1 border-t border-stone-100 dark:border-stone-800">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-blue-600/20 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Ingresar</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

