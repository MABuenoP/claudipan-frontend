import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Store, ShoppingBag, X, 
  CreditCard, DollarSign, Settings, Flame, Truck, 
  Receipt, Trash2, ShoppingCart, Briefcase, ChevronRight, Package,
  ChevronLeft, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

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

  interface NavItem {
    to: string;
    label: string;
    sublabel?: string;
    icon: React.ReactNode;
    colorClass: string;
    activeClass: string;
  }

  const getNavItemsForRole = (): NavItem[] => {
    const role = user?.rol;

    if (role === 'Administrador') {
      return [
        {
          to: '/admin/tables',
          label: 'CRUD Tablas & Auditoría',
          sublabel: 'Productos, Categorías, Usuarios',
          icon: <Settings className="w-5 h-5" />,
          colorClass: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 group-hover:bg-purple-500/20',
          activeClass: 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
        },
        {
          to: '/produccion',
          label: 'Módulo de Producción',
          sublabel: 'Órdenes, Recetas & Stock Insumos',
          icon: <Flame className="w-5 h-5" />,
          colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 group-hover:bg-amber-500/20',
          activeClass: 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
        },
        {
          to: '/pos',
          label: 'Terminal POS Mostrador',
          sublabel: 'Venta rápida y facturación',
          icon: <ShoppingCart className="w-5 h-5" />,
          colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20',
          activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
        },
        {
          to: '/contabilidad',
          label: 'Contabilidad P&G',
          sublabel: 'Ingresos, Cartera y Balance',
          icon: <DollarSign className="w-5 h-5" />,
          colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500/20',
          activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
        },
        {
          to: '/compras',
          label: 'Compras Proveedores',
          sublabel: 'Facturas de insumos y directorio',
          icon: <Truck className="w-5 h-5" />,
          colorClass: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 group-hover:bg-teal-500/20',
          activeClass: 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
        },
        {
          to: '/gastos',
          label: 'Servicios & Nómina',
          sublabel: 'Luz, Agua, Gas, Sueldos',
          icon: <Receipt className="w-5 h-5" />,
          colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 group-hover:bg-rose-500/20',
          activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
        },
        {
          to: '/bajas',
          label: 'Bajas & Mermas',
          sublabel: 'Descarte y control de pérdidas',
          icon: <Trash2 className="w-5 h-5" />,
          colorClass: 'text-red-600 dark:text-red-400 bg-red-500/10 group-hover:bg-red-500/20',
          activeClass: 'bg-red-600 text-white shadow-md shadow-red-600/25'
        }
      ];
    }

    if (role === 'Gerente') {
      return [
        {
          to: '/contabilidad',
          label: 'Contabilidad P&G',
          sublabel: 'Pérdidas, Ganancias y Cartera',
          icon: <DollarSign className="w-5 h-5" />,
          colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500/20',
          activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
        },
        {
          to: '/produccion',
          label: 'Supervisión Producción',
          sublabel: 'Control de lotes y horneado',
          icon: <Flame className="w-5 h-5" />,
          colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 group-hover:bg-amber-500/20',
          activeClass: 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
        },
        {
          to: '/pos',
          label: 'Monitoreo POS Ventas',
          sublabel: 'Auditoría de ventas mostrador',
          icon: <ShoppingCart className="w-5 h-5" />,
          colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20',
          activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
        },
        {
          to: '/compras',
          label: 'Compras Proveedores',
          sublabel: 'Costos de harina, queso y materias primas',
          icon: <Truck className="w-5 h-5" />,
          colorClass: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 group-hover:bg-teal-500/20',
          activeClass: 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
        },
        {
          to: '/gastos',
          label: 'Servicios & Nómina',
          sublabel: 'Gastos fijos y variables',
          icon: <Receipt className="w-5 h-5" />,
          colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 group-hover:bg-rose-500/20',
          activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
        },
        {
          to: '/bajas',
          label: 'Bajas & Mermas',
          sublabel: 'Pérdidas operativas de panadería',
          icon: <Trash2 className="w-5 h-5" />,
          colorClass: 'text-red-600 dark:text-red-400 bg-red-500/10 group-hover:bg-red-500/20',
          activeClass: 'bg-red-600 text-white shadow-md shadow-red-600/25'
        }
      ];
    }

    if (role === 'Contable') {
      return [
        {
          to: '/contabilidad',
          label: 'Contabilidad P&G',
          sublabel: 'Libro diario y estados financieros',
          icon: <DollarSign className="w-5 h-5" />,
          colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500/20',
          activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
        },
        {
          to: '/compras',
          label: 'Facturas de Compras',
          sublabel: 'Insumos y cuentas por pagar',
          icon: <Truck className="w-5 h-5" />,
          colorClass: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 group-hover:bg-teal-500/20',
          activeClass: 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
        },
        {
          to: '/gastos',
          label: 'Servicios & Nómina',
          sublabel: 'Pagos ESSA, Gas, Agua y Sueldos',
          icon: <Receipt className="w-5 h-5" />,
          colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 group-hover:bg-rose-500/20',
          activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
        },
        {
          to: '/bajas',
          label: 'Bajas & Mermas',
          sublabel: 'Ajuste y amortización de pérdidas',
          icon: <Trash2 className="w-5 h-5" />,
          colorClass: 'text-red-600 dark:text-red-400 bg-red-500/10 group-hover:bg-red-500/20',
          activeClass: 'bg-red-600 text-white shadow-md shadow-red-600/25'
        }
      ];
    }

    if (role === 'Panadero') {
      return [
        {
          to: '/produccion',
          label: 'Módulo de Producción',
          sublabel: 'Fórmulas, Insumos y Órdenes de Horno',
          icon: <Flame className="w-5 h-5" />,
          colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 group-hover:bg-amber-500/20',
          activeClass: 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
        },
        {
          to: '/catalog',
          label: 'Catálogo de Panes',
          sublabel: 'Variedades y especificaciones',
          icon: <Package className="w-5 h-5" />,
          colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 group-hover:bg-amber-500/20',
          activeClass: 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
        }
      ];
    }

    if (role === 'Vendedor') {
      return [
        {
          to: '/pos',
          label: 'Terminal POS Mostrador',
          sublabel: 'Ventas directas y pedidos',
          icon: <ShoppingCart className="w-5 h-5" />,
          colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20',
          activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
        },
        {
          to: '/mis-deudas',
          label: 'Créditos & Clientes Fiados',
          sublabel: 'Gestión de cupos y saldos',
          icon: <CreditCard className="w-5 h-5" />,
          colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500/20',
          activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
        },
        {
          to: '/catalog',
          label: 'Catálogo & Precios',
          sublabel: 'Disponibilidad de vitrina',
          icon: <Package className="w-5 h-5" />,
          colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 group-hover:bg-amber-500/20',
          activeClass: 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
        }
      ];
    }

    // Cliente o visitante
    return [
      ...(isAuthenticated ? [
        {
          to: '/mis-deudas',
          label: 'Mis Deudas / Fiado',
          sublabel: 'Cupo disponible y extracto',
          icon: <CreditCard className="w-5 h-5" />,
          colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500/20',
          activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
        },
        {
          to: '/dashboard',
          label: 'Mis Pedidos & Compras',
          sublabel: 'Estado de órdenes recientes',
          icon: <Package className="w-5 h-5" />,
          colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 group-hover:bg-amber-500/20',
          activeClass: 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
        }
      ] : []),
      {
        to: '/catalog',
        label: 'Catálogo de Panes',
        sublabel: 'Vitrina recién horneada',
        icon: <Store className="w-5 h-5" />,
        colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 group-hover:bg-amber-500/20',
        activeClass: 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
      }
    ];
  };

  const navItems = getNavItemsForRole();

  // Content for the Sidebar
  const renderSidebarContent = (isMobile = false, collapsed = false) => (
    <div className="flex flex-col h-full select-none">
      
      {/* Header Info & Collapse Toggle */}
      <div className={`border-b border-amber-200/80 dark:border-stone-800 transition-all duration-300 ${collapsed ? 'p-2' : 'p-3 sm:p-4'}`}>
        {isMobile && (
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-amber-200/60 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Claudipan" className="w-8 h-8 rounded-xl border border-amber-500/30 object-cover shadow-sm" />
              <span className="font-heading font-black text-amber-700 dark:text-amber-400 text-sm tracking-tight">CLAUDIPAN</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-amber-100/50 dark:hover:bg-stone-800 rounded-xl transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Desktop Collapse / Expand Header Action */}
        {!isMobile && (
          <div className="flex items-center justify-between mb-2">
            {!collapsed ? (
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span>Menú de Trabajo</span>
              </div>
            ) : (
              <div className="w-full flex justify-center pb-1">
                <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            )}
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-amber-300/60 dark:border-stone-700 transition-all cursor-pointer shadow-sm active:scale-95"
              title={collapsed ? 'Expandir menú de trabajo (Ver nombres)' : 'Contraer menú de trabajo (Solo botones)'}
              aria-label="Contraer o expandir barra lateral"
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              )}
            </button>
          </div>
        )}

        {/* User Card when Authenticated */}
        {isAuthenticated && user ? (
          <div className={`bg-gradient-to-br from-amber-500/15 to-amber-600/5 dark:from-stone-900 dark:to-stone-900/60 rounded-2xl border border-amber-300/60 dark:border-stone-800 transition-all ${
            collapsed ? 'p-1.5 flex flex-col items-center justify-center text-center' : 'p-3'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center border-2 border-white dark:border-stone-800 shadow-md shadow-amber-600/20 shrink-0">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-stone-900 dark:text-stone-100 truncate">{user.nombre}</p>
                  <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-md text-[9px] font-extrabold uppercase border ${getRoleBadge(user.rol)}`}>
                    {user.rol}
                  </span>
                </div>
              )}
            </div>

            {!collapsed && user.rol === 'Cliente' && (
              <div className="mt-2.5 pt-2 border-t border-amber-200/60 dark:border-stone-800 flex items-center justify-between text-[11px]">
                <span className="text-stone-600 dark:text-stone-400 font-bold">Cupo Fiado:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  ${(user.limiteCredito - user.deudaActual).toLocaleString('es-CO')}
                </span>
              </div>
            )}
          </div>
        ) : (
          !collapsed && (
            <div className="p-2.5 bg-amber-100/50 dark:bg-stone-900 rounded-2xl border border-amber-200 dark:border-stone-800 text-center">
              <p className="text-xs font-black text-stone-800 dark:text-stone-200">Panel Claudipan</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">Acceso a módulos operativos</p>
            </div>
          )
        )}
      </div>

      {/* Navigation Modules Section */}
      <nav className={`flex-1 overflow-y-auto space-y-1.5 transition-all duration-300 ${collapsed ? 'p-2' : 'p-3'}`}>
        
        {/* Module Links */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                title={collapsed ? `${item.label} (${item.sublabel || ''})` : undefined}
                className={`group flex items-center rounded-2xl transition-all relative ${
                  collapsed
                    ? 'justify-center p-2.5'
                    : 'justify-between px-3 py-2.5 text-xs font-bold'
                } ${
                  active
                    ? item.activeClass
                    : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/60 dark:hover:bg-stone-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Large eye-catching styled icon container */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm shrink-0 ${
                    active ? 'bg-white/20 text-white border border-white/30' : item.colorClass
                  }`}>
                    {item.icon}
                  </div>

                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold tracking-tight truncate leading-tight">{item.label}</p>
                      {item.sublabel && (
                        <p className={`text-[10px] truncate ${active ? 'text-white/80' : 'text-stone-400 dark:text-stone-500'}`}>
                          {item.sublabel}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {!collapsed && (
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                    active ? 'opacity-90' : 'opacity-30'
                  }`} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Separator: Accesos Generales */}
        <div className={`border-t border-amber-200/60 dark:border-stone-800 ${collapsed ? 'pt-2 mt-2' : 'pt-3 mt-3'}`}>
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Accesos Rápidos
            </p>
          )}

          <div className="space-y-1">
            <Link
              to="/"
              onClick={onClose}
              title={collapsed ? 'Página Principal' : undefined}
              className={`group flex items-center rounded-2xl transition-all ${
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-xs font-bold'
              } ${
                isActive('/')
                  ? 'text-amber-800 dark:text-amber-300 bg-amber-200/70 dark:bg-stone-800 font-black'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-400 group-hover:bg-amber-500/20 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors shrink-0">
                <Home className="w-4 h-4" />
              </div>
              {!collapsed && <span>Página Principal</span>}
            </Link>

            <Link
              to="/cart"
              onClick={onClose}
              title={collapsed ? 'Mi Carrito de Compras' : undefined}
              className={`group flex items-center rounded-2xl transition-all ${
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-xs font-bold'
              } ${
                isActive('/cart')
                  ? 'text-amber-800 dark:text-amber-300 bg-amber-200/70 dark:bg-stone-800 font-black'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-400 group-hover:bg-amber-500/20 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              {!collapsed && <span>Mi Carrito</span>}
            </Link>
          </div>
        </div>
      </nav>

      {/* Collapsed Hint Footer */}
      {collapsed && (
        <div className="p-2 border-t border-amber-200/60 dark:border-stone-800 flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 transition-all"
            title="Expandir menú de trabajo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. Desktop Docked Sidebar (Always present on the left when authenticated, collapsible) */}
      {isAuthenticated && (
        <aside
          className={`hidden lg:flex flex-col shrink-0 bg-[#FFFBEB]/80 dark:bg-stone-950/80 border-r border-amber-200/80 dark:border-amber-500/20 sticky top-20 h-[calc(100vh-5rem)] overflow-hidden backdrop-blur-md transition-all duration-300 shadow-sm ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {renderSidebarContent(false, isCollapsed)}
        </aside>
      )}

      {/* 2. Mobile Drawer Sidebar (Toggled with Menu Button, always full view) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <aside className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-stone-950 border-r border-amber-200/80 dark:border-amber-500/20 text-stone-900 dark:text-stone-100 shadow-2xl z-10 flex flex-col overflow-hidden animate-slide-up transition-colors duration-300">
            {renderSidebarContent(true, false)}
          </aside>
        </div>
      )}
    </>
  );
};

