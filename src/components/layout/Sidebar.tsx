import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Store, ShoppingBag, LogOut, X, 
  Sun, Moon, CreditCard, DollarSign, Settings, Flame, Truck, 
  Receipt, Trash2, ShoppingCart, UserCheck, Briefcase, ChevronRight, Package
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'Administrador': return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30';
      case 'Gerente': return 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
      case 'Contable': return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'Panadero': return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'Vendedor': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30';
      default: return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30';
    }
  };

  // Content for the Sidebar
  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <div className="p-4 border-b border-amber-200/80 dark:border-stone-800">
        {isMobile && (
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-200/60 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Claudipan" className="w-8 h-8 rounded-lg border border-amber-500/30 object-cover" />
              <span className="font-heading font-extrabold text-amber-700 dark:text-amber-400 text-sm">CLAUDIPAN</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-amber-100/50 dark:hover:bg-stone-800 rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {isAuthenticated && user ? (
          <div className="p-3 bg-gradient-to-br from-amber-500/15 to-amber-600/5 dark:from-stone-900 dark:to-stone-900/60 rounded-2xl border border-amber-300/60 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold text-sm flex items-center justify-center border border-amber-500/30 shrink-0">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{user.nombre}</p>
                <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-md text-[9px] font-extrabold uppercase border ${getRoleBadge(user.rol)}`}>
                  {user.rol}
                </span>
              </div>
            </div>

            {user.rol === 'Cliente' && (
              <div className="mt-2.5 pt-2 border-t border-amber-200/60 dark:border-stone-800 flex items-center justify-between text-[11px]">
                <span className="text-stone-600 dark:text-stone-400 font-medium">Cupo Fiado:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${(user.limiteCredito - user.deudaActual).toLocaleString('es-CO')}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-amber-100/50 dark:bg-stone-900 rounded-2xl border border-amber-200 dark:border-stone-800 text-center">
            <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Menú de Navegación</p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">Ingresa para ver tu módulo de trabajo</p>
          </div>
        )}
      </div>

      {/* Navigation Modules Section */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Menú de Trabajo</span>
        </div>

        {/* --- Rol Administrador --- */}
        {user?.rol === 'Administrador' && (
          <div className="space-y-1">
            <Link
              to="/admin/tables"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/admin/tables')
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-purple-500" />
                <span>CRUD Tablas & Auditoría</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/produccion"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/produccion')
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Módulo de Producción</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/pos"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/pos')
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-blue-500" />
                <span>Terminal POS Mostrador</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/contabilidad"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/contabilidad')
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Contabilidad P&G</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/compras"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/compras')
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-teal-500/10 hover:text-teal-700 dark:hover:text-teal-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-teal-500" />
                <span>Compras Proveedores</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/gastos"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/gastos')
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-rose-500" />
                <span>Servicios & Nómina</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/bajas"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/bajas')
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>Bajas & Mermas</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>
          </div>
        )}

        {/* --- Rol Gerente --- */}
        {user?.rol === 'Gerente' && (
          <div className="space-y-1">
            <Link
              to="/contabilidad"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/contabilidad')
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-emerald-500/10 hover:text-emerald-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Contabilidad P&G</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/produccion"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/produccion')
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-amber-500/10 hover:text-amber-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Supervisión Producción</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/pos"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/pos')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-blue-500/10 hover:text-blue-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-blue-500" />
                <span>Monitoreo POS Ventas</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/compras"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/compras')
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-teal-500/10 hover:text-teal-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-teal-500" />
                <span>Compras Proveedores</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/gastos"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/gastos')
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-rose-500/10 hover:text-rose-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-rose-500" />
                <span>Servicios & Nómina</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/bajas"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/bajas')
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-red-500/10 hover:text-red-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>Bajas & Mermas</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>
          </div>
        )}

        {/* --- Rol Contable --- */}
        {user?.rol === 'Contable' && (
          <div className="space-y-1">
            <Link
              to="/contabilidad"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/contabilidad')
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-emerald-500/10 hover:text-emerald-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Contabilidad P&G</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/compras"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/compras')
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-teal-500/10 hover:text-teal-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-teal-500" />
                <span>Compras Proveedores</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/gastos"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/gastos')
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-rose-500/10 hover:text-rose-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-rose-500" />
                <span>Servicios & Nómina</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/bajas"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/bajas')
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-red-500/10 hover:text-red-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>Bajas & Mermas</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>
          </div>
        )}

        {/* --- Rol Panadero --- */}
        {user?.rol === 'Panadero' && (
          <div className="space-y-1">
            <Link
              to="/produccion"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/produccion')
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-amber-500/10 hover:text-amber-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Módulo de Producción</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/catalog"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/catalog')
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-amber-500/10 hover:text-amber-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Catálogo de Productos</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>
          </div>
        )}

        {/* --- Rol Vendedor --- */}
        {user?.rol === 'Vendedor' && (
          <div className="space-y-1">
            <Link
              to="/pos"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/pos')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-blue-500/10 hover:text-blue-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-blue-500" />
                <span>Terminal POS Mostrador</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/mis-deudas"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/mis-deudas')
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-emerald-500/10 hover:text-emerald-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>Créditos & Cupos Fiados</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              to="/catalog"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/catalog')
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-amber-500/10 hover:text-amber-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Catálogo & Stock</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>
          </div>
        )}

        {/* --- Rol Cliente o Invitado --- */}
        {(!user || user?.rol === 'Cliente') && (
          <div className="space-y-1">
            {isAuthenticated && (
              <>
                <Link
                  to="/mis-deudas"
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/mis-deudas')
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-emerald-500/10 hover:text-emerald-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>Mis Deudas / Cupo Fiado</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </Link>

                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/dashboard')
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-amber-500/10 hover:text-amber-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span>Mis Pedidos & Compras</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </Link>
              </>
            )}

            <Link
              to="/catalog"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/catalog')
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-amber-500/10 hover:text-amber-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-amber-600" />
                <span>Catálogo de Panes</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>
          </div>
        )}

        {/* Separator */}
        <div className="pt-3 mt-3 border-t border-amber-200/60 dark:border-stone-800">
          <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Accesos Generales
          </p>

          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/') ? 'text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-stone-800' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Home className="w-4 h-4 text-stone-500" />
            <span>Página Principal</span>
          </Link>

          <Link
            to="/cart"
            onClick={onClose}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/cart') ? 'text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-stone-800' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-stone-500" />
            <span>Mi Carrito</span>
          </Link>
        </div>
      </nav>

      {/* Footer / Logout */}
      {isAuthenticated && (
        <div className="p-3 border-t border-amber-200/80 dark:border-stone-800 bg-amber-50/50 dark:bg-stone-950/50">
          <button
            onClick={() => {
              logout();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. Desktop Docked Sidebar (Always present on the left when authenticated) */}
      {isAuthenticated && (
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#FFFBEB]/70 dark:bg-stone-950/70 border-r border-amber-200/80 dark:border-amber-500/20 sticky top-20 h-[calc(100vh-5rem)] overflow-hidden backdrop-blur-md transition-colors duration-300">
          {renderSidebarContent(false)}
        </aside>
      )}

      {/* 2. Mobile Drawer Sidebar (Toggled with Menu Button) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <aside className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-stone-950 border-r border-amber-200/80 dark:border-amber-500/20 text-stone-900 dark:text-stone-100 shadow-2xl z-10 flex flex-col overflow-hidden animate-slide-up transition-colors duration-300">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
