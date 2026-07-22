import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { totalItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <header className="sticky top-0 z-40 w-full bg-stone-950/80 backdrop-blur-xl border-b border-amber-500/20 text-stone-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-stone-400 hover:text-amber-400 hover:bg-stone-900 rounded-xl"
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
                <span className="text-xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  CLAUDIPAN
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-400 -mt-1">
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
              className="w-full bg-stone-900/90 text-stone-100 placeholder-stone-400 text-sm px-4 py-2.5 pl-10 rounded-2xl border border-stone-800 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
            <Link
              to="/"
              className={`transition-colors ${isActive('/') ? 'text-amber-400 font-bold' : 'text-stone-300 hover:text-amber-400'}`}
            >
              Inicio
            </Link>
            <Link
              to="/catalog"
              className={`transition-colors ${isActive('/catalog') ? 'text-amber-400 font-bold' : 'text-stone-300 hover:text-amber-400'}`}
            >
              Catálogo
            </Link>
            <Link
              to="/dashboard"
              className={`transition-colors ${isActive('/dashboard') ? 'text-amber-400 font-bold' : 'text-stone-300 hover:text-amber-400'}`}
            >
              Mi Panel
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Cart Icon Button */}
            <Link
              to="/cart"
              className="relative p-2.5 bg-stone-900/80 hover:bg-stone-800 text-stone-200 hover:text-amber-400 rounded-2xl border border-stone-800 transition-all group"
              aria-label="Ver Carrito de Compras"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-950 text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-950 animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Profile Button */}
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 p-1.5 pr-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-2xl transition-all"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-xl object-cover border border-amber-500/40"
                />
                <span className="hidden sm:inline text-xs font-semibold text-stone-200 max-w-[100px] truncate">
                  {user?.name}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 transition-all"
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
