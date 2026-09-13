import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, Search, Sun, Moon } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { totalItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
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
                  Artisan Bakery
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Buscar pan de masa madre, croissants, café..."
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
              Mi Panel
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

            {/* Auth Profile Button */}
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 p-1.5 pr-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-md shadow-blue-600/20"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-xl object-cover border border-white/40"
                />
                <span className="hidden sm:inline text-xs font-bold text-white max-w-[100px] truncate">
                  {user?.name}
                </span>
              </Link>
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
  );
};
