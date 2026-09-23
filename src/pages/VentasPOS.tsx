import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../hooks/useFeedback';
import { productService, Product } from '../services/productService';
import { pedidoService } from '../services/pedidoService';
import { authService, UsuarioAdmin } from '../services/authService';
import { formatCurrency } from '../utils/helpers';
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle2, 
  DollarSign, User, AlertCircle, RefreshCw, Printer, Sparkles, 
  CreditCard, ArrowRight, Tag, Flame, X, Camera, Upload, 
  FileText, Smartphone, UserCheck, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { LoadingModal } from '../components/ui/LoadingModal';

export const VentasPOS: React.FC = () => {
  const { user } = useAuth();
  const { showFeedback } = useFeedback();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'panes' | 'gaseosas' | 'lacteos'>('todos');
  const [panPriceFilter, setPanPriceFilter] = useState<'todos' | '500' | '1000' | '2000' | '5000'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination State for POS Product Table (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Cart for POS
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  
  // Checkout Modal State & Payment Options
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [tipoPago, setTipoPago] = useState<'Efectivo' | 'Nequi' | 'Credito_Fiado'>('Efectivo');
  const [nombreCliente, setNombreCliente] = useState('Cliente Mostrador');
  const [documentoCliente, setDocumentoCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [efectivoRecibido, setEfectivoRecibido] = useState<number | ''>('');
  
  // Nequi / Transferencia state
  const [referenciaPago, setReferenciaPago] = useState('');
  const [comprobanteBase64, setComprobanteBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fiado / Credito state
  const [usuariosClientes, setUsuariosClientes] = useState<UsuarioAdmin[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [clienteSearch, setClienteSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<UsuarioAdmin | null>(null);

  // Modal Ticket Success
  const [ticketEmitido, setTicketEmitido] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await productService.getProducts();
    if (res.success && res.data) {
      setProducts(res.data);
    }
    setLoading(false);
  };

  const fetchClientes = async () => {
    setLoadingClientes(true);
    const res = await authService.getAllUsers();
    if (res.success && res.data) {
      // Prioritize active clients or users with credit
      const clients = res.data.filter(u => u.activo);
      setUsuariosClientes(clients);
    }
    setLoadingClientes(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, panPriceFilter, searchQuery]);

  // Inventory & Stock Validations when adding/modifying cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      showFeedback({
        type: 'warning',
        title: 'Producto Agotado',
        message: `El producto "${product.nombre}" no cuenta con existencias disponibles en inventario.`
      });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          showFeedback({
            type: 'warning',
            title: 'Stock Límite Alcanzado',
            message: `Solo hay ${product.stock} unidad(es) de "${product.nombre}" en inventario.`
          });
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > item.product.stock) {
            showFeedback({
              type: 'warning',
              title: 'Stock Insuficiente',
              message: `No puedes agregar más de ${item.product.stock} unidades de "${item.product.nombre}".`
            });
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setEfectivoRecibido('');
    setReferenciaPago('');
    setComprobanteBase64(null);
    setSelectedClient(null);
    setErrorMessage(null);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.product.precio * item.quantity), 0);
  const devuelta = typeof efectivoRecibido === 'number' ? Math.max(0, efectivoRecibido - subtotal) : 0;

  // Filter products
  const filteredProducts = products.filter(p => {
    let matchCat = true;
    if (selectedCategory === 'panes') {
      const isDrinkOrDairy = p.categoriaNombre?.toLowerCase().includes('gaseosa') || 
                             p.categoriaNombre?.toLowerCase().includes('bebida') ||
                             p.categoriaNombre?.toLowerCase().includes('lácteo') ||
                             p.categoriaNombre?.toLowerCase().includes('lacteo') ||
                             p.nombre.toLowerCase().includes('gaseosa') ||
                             p.nombre.toLowerCase().includes('postobon') ||
                             p.nombre.toLowerCase().includes('coca-cola') ||
                             p.nombre.toLowerCase().includes('leche') ||
                             p.nombre.toLowerCase().includes('queso') ||
                             p.nombre.toLowerCase().includes('kumis');
      
      const isPan = !isDrinkOrDairy || 
                    p.categoriaNombre?.toLowerCase().includes('pan') || 
                    p.nombre.toLowerCase().includes('pan') ||
                    p.nombre.toLowerCase().includes('bolita') ||
                    p.nombre.toLowerCase().includes('croissant') ||
                    p.nombre.toLowerCase().includes('roscon') ||
                    p.nombre.toLowerCase().includes('mogolla') ||
                    p.nombre.toLowerCase().includes('hojaldre') ||
                    p.nombre.toLowerCase().includes('tostada');

      matchCat = isPan;

      if (matchCat && panPriceFilter !== 'todos') {
        matchCat = p.precio === Number(panPriceFilter);
      }
    } else if (selectedCategory === 'gaseosas') {
      matchCat = p.categoriaNombre?.toLowerCase().includes('gaseosa') || 
                 p.categoriaNombre?.toLowerCase().includes('bebida') ||
                 p.nombre.toLowerCase().includes('gaseosa') || 
                 p.nombre.toLowerCase().includes('cola') || 
                 p.nombre.toLowerCase().includes('postobon') || 
                 p.nombre.toLowerCase().includes('hit') ||
                 p.nombre.toLowerCase().includes('jugo') ||
                 p.nombre.toLowerCase().includes('agua') ||
                 p.nombre.toLowerCase().includes('quatro') ||
                 p.nombre.toLowerCase().includes('sprite');
    } else if (selectedCategory === 'lacteos') {
      matchCat = p.categoriaNombre?.toLowerCase().includes('lácteo') || 
                 p.categoriaNombre?.toLowerCase().includes('lacteo') || 
                 p.nombre.toLowerCase().includes('leche') || 
                 p.nombre.toLowerCase().includes('queso') || 
                 p.nombre.toLowerCase().includes('kumis') ||
                 p.nombre.toLowerCase().includes('yogurt') ||
                 p.nombre.toLowerCase().includes('mantequilla') ||
                 p.nombre.toLowerCase().includes('arequipe');
    }

    const matchSearch = !searchQuery.trim() || 
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.descripcion && p.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.categoriaNombre && p.categoriaNombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.precio.toString().includes(searchQuery.trim());

    return matchCat && matchSearch;
  });

  // Open Checkout Modal
  const handleOpenCheckoutModal = () => {
    if (cart.length === 0) return;

    // Validate inventory stock in cart
    for (const item of cart) {
      if (item.quantity > item.product.stock) {
        showFeedback({
          type: 'warning',
          title: 'Stock Excedido',
          message: `El producto "${item.product.nombre}" solo tiene ${item.product.stock} unidad(es) disponibles en inventario.`
        });
        return;
      }
    }

    if (usuariosClientes.length === 0) {
      fetchClientes();
    }

    setEfectivoRecibido(subtotal);
    setErrorMessage(null);
    setIsCheckoutModalOpen(true);
  };

  // Handle Image Upload for Nequi/Transferencia
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showFeedback({
        type: 'warning',
        title: 'Imagen muy pesada',
        message: 'La imagen del comprobante no debe superar los 5MB.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setComprobanteBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Process Checkout submission
  const handleConfirmCheckout = async () => {
    if (cart.length === 0) return;
    setErrorMessage(null);

    // Validations by payment type
    if (tipoPago === 'Efectivo') {
      if (typeof efectivoRecibido === 'number' && efectivoRecibido < subtotal) {
        setErrorMessage(`El dinero en efectivo recibido ($${efectivoRecibido.toLocaleString('es-CO')}) es menor al total ($${subtotal.toLocaleString('es-CO')}).`);
        return;
      }
    } else if (tipoPago === 'Credito_Fiado') {
      if (!selectedClient) {
        setErrorMessage('Debes buscar y seleccionar un cliente con crédito disponible en la lista.');
        return;
      }
      const cupoDisponible = selectedClient.limiteCredito - selectedClient.deudaActual;
      if (subtotal > cupoDisponible) {
        setErrorMessage(`El total de la venta ($${subtotal.toLocaleString('es-CO')}) supera el cupo disponible del cliente ($${cupoDisponible.toLocaleString('es-CO')}). Cupo total: $${selectedClient.limiteCredito.toLocaleString('es-CO')}.`);
        return;
      }
    }

    setIsSubmitting(true);

    const payload: any = {
      tipoPago: tipoPago === 'Credito_Fiado' ? 'Credito_Fiado' : (tipoPago === 'Nequi' ? 'Nequi' : 'Efectivo'),
      direccionEntrega: 'Venta Directa en Mostrador Claudipan',
      observaciones: `Venta POS en Caja Rápida por: ${user?.nombre || 'Cajero'}`,
      detalles: cart.map(item => ({
        productoId: item.product.id,
        cantidad: item.quantity
      }))
    };

    if (tipoPago === 'Credito_Fiado' && selectedClient) {
      payload.usuarioId = selectedClient.id;
      payload.esInvitado = false;
    } else {
      payload.esInvitado = true;
      payload.invitadoNombre = nombreCliente || 'Cliente Mostrador';
      payload.invitadoCedula = documentoCliente || '222222222';
      payload.invitadoTelefono = telefonoCliente || '3000000000';

      if (tipoPago === 'Nequi') {
        payload.referenciaPago = referenciaPago || 'Transf-Nequi-Caja';
        if (comprobanteBase64) {
          payload.comprobanteBase64 = comprobanteBase64;
        }
      }
    }

    const res = await pedidoService.createPedido(payload);
    setIsSubmitting(false);

    if (res.success && res.data) {
      // Re-fetch products to update stock in UI
      await fetchProducts();

      setTicketEmitido({
        pedido: res.data,
        items: [...cart],
        subtotal,
        efectivoRecibido: tipoPago === 'Efectivo' ? (typeof efectivoRecibido === 'number' ? efectivoRecibido : subtotal) : subtotal,
        devuelta: tipoPago === 'Efectivo' ? devuelta : 0,
        tipoPago: tipoPago === 'Credito_Fiado' ? 'Crédito (Fiado)' : (tipoPago === 'Nequi' ? 'Nequi / Transf.' : 'Efectivo'),
        cliente: tipoPago === 'Credito_Fiado' && selectedClient ? selectedClient.nombre : nombreCliente,
        fecha: new Date().toLocaleString('es-CO')
      });

      setIsCheckoutModalOpen(false);
      clearCart();
    } else {
      setErrorMessage(res.message || 'Error al procesar la venta en caja.');
    }
  };

  // Filter clients for Fiado search
  const filteredClients = usuariosClientes.filter(u => {
    const q = clienteSearch.toLowerCase().trim();
    if (!q) return true;
    return u.nombre.toLowerCase().includes(q) || 
           (u.cedula && u.cedula.includes(q)) || 
           (u.telefono && u.telefono.includes(q)) ||
           (u.email && u.email.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-700 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
            <ShoppingCart className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-black tracking-tight flex items-center gap-2">
              Caja Rápida
            </h1>
            <p className="text-xs text-blue-100">Atención al cliente, ventas directas y despacho en panadería</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
            Cajero: <strong className="text-amber-300">{user?.nombre || 'Vendedor'}</strong>
          </span>
          <button
            onClick={fetchProducts}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all cursor-pointer"
            title="Refrescar catálogo e inventario"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Cart/Ticket on Left (5 cols) vs Products on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: POS Cart & Checkout Terminal (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 border border-amber-300/80 dark:border-stone-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/80 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                <h2 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base">
                  Ticket de Venta
                </h2>
                <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {cart.reduce((a, b) => a + b.quantity, 0)} u.
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vaciar
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-stone-400 dark:text-stone-500 space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs font-semibold">Toca los productos a la derecha para agregarlos al ticket</p>
                <p className="text-[11px] text-stone-400">Verifica que haya existencias disponibles en inventario</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {cart.map(item => (
                  <div 
                    key={item.product.id}
                    className="flex items-center justify-between p-2.5 bg-amber-50/50 dark:bg-stone-950/50 rounded-2xl border border-amber-200/60 dark:border-stone-800 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-stone-900 dark:text-stone-100 truncate">{item.product.nombre}</p>
                      <div className="flex items-center gap-2 text-[10px] text-stone-500">
                        <span>{formatCurrency(item.product.precio)} c/u</span>
                        <span>•</span>
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">Stock: {item.product.stock} u.</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-600 dark:text-stone-300 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold font-mono text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-600 dark:text-stone-300 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-stone-900 dark:text-stone-100 w-16 text-right font-mono">
                        {formatCurrency(item.product.precio * item.quantity)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Summary Note */}
            <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-500 space-y-1">
              <div className="flex justify-between">
                <span>Artículos en orden:</span>
                <span className="font-bold text-stone-700 dark:text-stone-300">{cart.reduce((a, b) => a + b.quantity, 0)} unidades</span>
              </div>
              <div className="flex justify-between">
                <span>Productos distintos:</span>
                <span className="font-bold text-stone-700 dark:text-stone-300">{cart.length}</span>
              </div>
            </div>

          </div>

          {/* Total & Action Button */}
          <div className="space-y-3 pt-3 border-t border-amber-200/80 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-stone-600 dark:text-stone-400">TOTAL A COBRAR:</span>
              <span className="text-2xl font-mono font-black text-amber-700 dark:text-amber-400">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full py-4 text-sm font-black tracking-wide uppercase bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex flex-row items-center justify-center gap-2 cursor-pointer"
              disabled={cart.length === 0}
              onClick={handleOpenCheckoutModal}
              leftIcon={<CheckCircle2 className="w-5 h-5 shrink-0" />}
            >
              Cobrar
            </Button>
          </div>

        </div>

        {/* Right Column: Products Table Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'todos', label: 'Todos', icon: '🍞' },
              { id: 'panes', label: 'Panes', icon: '🥖' },
              { id: 'gaseosas', label: 'Gaseosas', icon: '🥤' },
              { id: 'lacteos', label: 'Lácteos', icon: '🥛' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategory(tab.id as any);
                  if (tab.id !== 'panes') setPanPriceFilter('todos');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === tab.id
                    ? 'bg-amber-800 text-white shadow-md shadow-amber-900/20 scale-102'
                    : 'bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-500'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Subclasificador for Panes: $500, $1.000, $2.000, $5.000 */}
          {selectedCategory === 'panes' && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-stone-950 p-2.5 rounded-2xl border border-amber-200/80 dark:border-stone-800 animate-fade-in">
              <span className="text-[11px] font-extrabold uppercase text-amber-900 dark:text-amber-400 pl-1 shrink-0">
                Precio Pan:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: '500', label: '$500' },
                  { id: '1000', label: '$1.000' },
                  { id: '2000', label: '$2.000' },
                  { id: '5000', label: '$5.000' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setPanPriceFilter(sub.id as any);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      panPriceFilter === sub.id
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-stone-900 border-amber-200/80 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-400'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar producto por nombre, descripción o precio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Products Table View */}
          <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/70 dark:bg-stone-950 text-stone-700 dark:text-stone-300 text-[11px] font-black uppercase tracking-wider border-b border-amber-200/80 dark:border-stone-800">
                  <th className="py-2.5 px-3 w-14 text-center">Foto</th>
                  <th className="py-2.5 px-3">Producto & Detalle</th>
                  <th className="py-2.5 px-3 text-right">Precio</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-center">Agregar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800 text-xs">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400 text-xs">
                      No se encontraron productos para los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map(p => {
                    const isOutOfStock = p.stock <= 0;
                    return (
                      <tr 
                        key={p.id}
                        className={`transition-colors group cursor-pointer ${
                          isOutOfStock 
                            ? 'opacity-60 bg-stone-50/60 dark:bg-stone-950/40' 
                            : 'hover:bg-amber-50/50 dark:hover:bg-stone-800/40'
                        }`}
                        onClick={() => addToCart(p)}
                      >
                        {/* Image Thumbnail */}
                        <td className="py-2 px-3 text-center">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-stone-950 border border-amber-200/60 dark:border-stone-800 overflow-hidden mx-auto relative shrink-0">
                            <img 
                              src={p.imagenUrl || '/logo.png'} 
                              alt={p.nombre} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            {p.enOferta && (
                              <span className="absolute bottom-0 inset-x-0 bg-red-600 text-white font-black text-[7px] text-center uppercase leading-tight">
                                Oferta
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Product Name & Details */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-stone-900 dark:text-stone-100 text-xs group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                              {p.nombre}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1">
                            {p.descripcion || p.categoriaNombre || 'Panadería Claudipan'}
                          </p>
                        </td>

                        {/* Price */}
                        <td className="py-2 px-3 text-right">
                          <span className="font-mono font-black text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
                            {formatCurrency(p.precio)}
                          </span>
                        </td>

                        {/* Stock Badge */}
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock > 10 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                              : p.stock > 0
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          }`}>
                            {isOutOfStock ? 'Agotado' : `${p.stock} u.`}
                          </span>
                        </td>

                        {/* Add Button */}
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(p);
                            }}
                            className={`px-2.5 py-1.5 font-extrabold text-[11px] rounded-xl shadow-sm inline-flex items-center gap-1 transition-transform active:scale-95 cursor-pointer ${
                              isOutOfStock
                                ? 'bg-stone-300 dark:bg-stone-800 text-stone-500 cursor-not-allowed'
                                : 'bg-amber-800 hover:bg-amber-700 text-white'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" /> Agregar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination (10 in 10) */}
            {filteredProducts.length > 0 && (
              <div className="p-3 border-t border-amber-200/80 dark:border-stone-800">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredProducts.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  itemLabel="productos"
                />
              </div>
            )}
          </div>

        </div>

      </div>

      {/* CHECKOUT MODAL: 3 Payment Options */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl animate-fade-in max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                    Procesar Cobro & Despacho
                  </h3>
                  <p className="text-xs text-stone-500">Selecciona el método de pago para completar la venta</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sale Total Card */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900 rounded-2xl border border-amber-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total a Pagar</span>
                <p className="text-2xl font-mono font-black text-amber-700 dark:text-amber-400">
                  {formatCurrency(subtotal)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-stone-500">{cart.reduce((a, b) => a + b.quantity, 0)} artículos</span>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Descuento de stock en línea</p>
              </div>
            </div>

            {/* 3 Payment Options Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-stone-700 dark:text-stone-300 block">
                Forma de Pago:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Efectivo', label: '1. Efectivo', icon: <DollarSign className="w-4 h-4" /> },
                  { id: 'Nequi', label: '2. Nequi / Transf.', icon: <Smartphone className="w-4 h-4" /> },
                  { id: 'Credito_Fiado', label: '3. Fiado (Crédito)', icon: <UserCheck className="w-4 h-4" /> }
                ].map(op => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => {
                      setTipoPago(op.id as any);
                      setErrorMessage(null);
                    }}
                    className={`py-3 px-2 rounded-2xl border text-xs font-extrabold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      tipoPago === op.id
                        ? 'bg-amber-800 text-white border-amber-800 shadow-md shadow-amber-900/20 scale-102'
                        : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-400'
                    }`}
                  >
                    <span>{op.icon}</span>
                    <span>{op.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* OPTION 1: EFECTIVO */}
            {tipoPago === 'Efectivo' && (
              <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <DollarSign className="w-4 h-4" />
                  <span>Pago en Efectivo (Caja Mostrador)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Nombre Cliente</label>
                    <input
                      type="text"
                      value={nombreCliente}
                      onChange={(e) => setNombreCliente(e.target.value)}
                      placeholder="Cliente Mostrador"
                      className="w-full bg-white dark:bg-stone-900 text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Dinero Recibido</label>
                    <input
                      type="number"
                      value={efectivoRecibido}
                      onChange={(e) => setEfectivoRecibido(e.target.value ? Number(e.target.value) : '')}
                      placeholder={subtotal.toString()}
                      className="w-full bg-white dark:bg-stone-900 font-mono font-bold text-sm text-right px-3 py-2 rounded-xl border border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Cash Buttons */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Billetes Rápidos:</span>
                  <div className="grid grid-cols-6 gap-1">
                    {[2000, 5000, 10000, 20000, 50000, 100000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setEfectivoRecibido(val)}
                        className="py-1 text-[11px] font-bold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-amber-100 hover:border-amber-400 cursor-pointer"
                      >
                        ${(val/1000)}k
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEfectivoRecibido(subtotal)}
                    className="w-full mt-1 py-1 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-500 cursor-pointer"
                  >
                    Monto Exacto (${subtotal.toLocaleString('es-CO')})
                  </button>
                </div>

                {/* Change Calculation */}
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">Cambio / Devuelta:</span>
                  <span className="font-mono font-black text-base text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(devuelta)}
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 italic">
                  ✓ El pago concluye como <strong>Pagado</strong> y <strong>Entregado</strong>, descontando los productos del inventario y sumando a ventas en caja.
                </p>
              </div>
            )}

            {/* OPTION 2: NEQUI / TRANSFERENCIA */}
            {tipoPago === 'Nequi' && (
              <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Pago por Nequi / Transferencia Bancaria</span>
                  </div>
                  <span className="text-[11px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-lg">
                    Nequi: 310 555 1234
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Nombre Cliente</label>
                    <input
                      type="text"
                      value={nombreCliente}
                      onChange={(e) => setNombreCliente(e.target.value)}
                      placeholder="Cliente Mostrador"
                      className="w-full bg-white dark:bg-stone-900 text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">N° Referencia / Aprobación</label>
                    <input
                      type="text"
                      value={referenciaPago}
                      onChange={(e) => setReferenciaPago(e.target.value)}
                      placeholder="Ej: M12345678 (Opcional)"
                      className="w-full bg-white dark:bg-stone-900 text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700"
                    />
                  </div>
                </div>

                {/* Upload or Capture Photo */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-500 uppercase block">
                    Foto del Comprobante / Transacción (Opcional):
                  </label>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    capture="environment"
                    onChange={handleImageFileChange} 
                    className="hidden" 
                  />

                  {comprobanteBase64 ? (
                    <div className="relative p-2 bg-white dark:bg-stone-900 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <img 
                          src={comprobanteBase64} 
                          alt="Comprobante" 
                          className="w-12 h-12 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-emerald-700 dark:text-emerald-400">✓ Comprobante cargado</p>
                          <p className="text-[10px] text-stone-500">Listo para guardar en contabilidad</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded-lg cursor-pointer font-semibold"
                        >
                          Cambiar
                        </button>
                        <button
                          type="button"
                          onClick={() => setComprobanteBase64(null)}
                          className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-indigo-500 rounded-2xl text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center justify-center gap-2 bg-white dark:bg-stone-900 cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4 text-indigo-600" />
                      <span>Tomar foto o subir captura del comprobante</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-stone-500 italic">
                  ✓ Al aceptar la venta, queda registrada como <strong>Pagada</strong> y <strong>Entregada</strong> en contabilidad, descontando de inventarios.
                </p>
              </div>
            )}

            {/* OPTION 3: FIADO A CLIENTE */}
            {tipoPago === 'Credito_Fiado' && (
              <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-300">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    <span>Fiado a Cliente con Crédito</span>
                  </div>
                  <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                    Verificación de Cupo
                  </span>
                </div>

                {/* Search Client */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-500 uppercase block">
                    Buscar Cliente Registrado:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={clienteSearch}
                      onChange={(e) => setClienteSearch(e.target.value)}
                      placeholder="Buscar por nombre, cédula o teléfono..."
                      className="w-full bg-white dark:bg-stone-900 text-xs px-3 py-2 pl-9 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-purple-500"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Client Select List */}
                <div className="max-h-32 overflow-y-auto space-y-1 border border-stone-200 dark:border-stone-800 rounded-xl p-1 bg-white dark:bg-stone-900">
                  {loadingClientes ? (
                    <p className="text-center py-2 text-stone-400 text-xs">Cargando clientes...</p>
                  ) : filteredClients.length === 0 ? (
                    <p className="text-center py-2 text-stone-400 text-xs">No se encontraron clientes registrados.</p>
                  ) : (
                    filteredClients.map(c => {
                      const cupoDisp = c.limiteCredito - c.deudaActual;
                      const isSelected = selectedClient?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedClient(c);
                            setErrorMessage(null);
                          }}
                          className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-purple-100 dark:bg-purple-950/60 border border-purple-400'
                              : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-stone-900 dark:text-stone-100">{c.nombre}</p>
                            <p className="text-[10px] text-stone-500">C.C. {c.cedula || 'Sin cédula'} • Tel: {c.telefono || 'Sin tel'}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-[11px] font-mono font-bold ${cupoDisp >= subtotal ? 'text-emerald-600' : 'text-red-500'}`}>
                              Cupo: {formatCurrency(cupoDisp)}
                            </span>
                            <p className="text-[9px] text-stone-400">Total: {formatCurrency(c.limiteCredito)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Selected Client Details & Credit Analysis */}
                {selectedClient && (() => {
                  const cupoDisponible = selectedClient.limiteCredito - selectedClient.deudaActual;
                  const tieneCupo = cupoDisponible >= subtotal;
                  return (
                    <div className={`p-3 rounded-xl border text-xs space-y-2 ${
                      tieneCupo
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900 dark:text-stone-100">{selectedClient.nombre}</span>
                          <p className="text-[10px] text-stone-500">C.C. {selectedClient.cedula || 'No registrada'}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tieneCupo ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                        }`}>
                          {tieneCupo ? '✓ Crédito Aprobado' : '⚠️ Cupo Insuficiente'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-200 dark:border-stone-800 font-mono text-[11px]">
                        <div>
                          <span className="text-[9px] text-stone-500 block uppercase">Cupo Límite:</span>
                          <span className="font-bold">{formatCurrency(selectedClient.limiteCredito)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-stone-500 block uppercase">Deuda Actual:</span>
                          <span className="font-bold text-amber-600">{formatCurrency(selectedClient.deudaActual)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-stone-500 block uppercase">Disponible:</span>
                          <span className={`font-bold ${tieneCupo ? 'text-emerald-700' : 'text-red-600'}`}>
                            {formatCurrency(cupoDisponible)}
                          </span>
                        </div>
                      </div>

                      {!tieneCupo && (
                        <p className="text-[10px] text-red-600 font-bold">
                          El pedido (${subtotal.toLocaleString('es-CO')}) excede el cupo disponible del cliente (${cupoDisponible.toLocaleString('es-CO')}).
                        </p>
                      )}
                    </div>
                  );
                })()}

                <p className="text-[11px] text-stone-500 italic">
                  ✓ Al fiar, el producto se entrega, se descuenta de inventarios y el valor pasa como <strong>deuda del cliente</strong> en contabilidad.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-200 dark:border-stone-800">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsCheckoutModalOpen(false)}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Cancelar
              </Button>

              <Button
                variant="primary"
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 cursor-pointer shadow-lg shadow-emerald-600/30"
                isLoading={isSubmitting}
                disabled={
                  isSubmitting ||
                  (tipoPago === 'Credito_Fiado' && (!selectedClient || (selectedClient.limiteCredito - selectedClient.deudaActual) < subtotal)) ||
                  (tipoPago === 'Efectivo' && typeof efectivoRecibido === 'number' && efectivoRecibido < subtotal)
                }
                onClick={handleConfirmCheckout}
                leftIcon={<CheckCircle2 className="w-5 h-5 shrink-0" />}
              >
                Confirmar y Entregar ({formatCurrency(subtotal)})
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Ticket Success Modal */}
      {ticketEmitido && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100">
                ¡Venta Registrada y Entregada!
              </h3>
              <p className="text-xs text-stone-500">Ticket #{ticketEmitido.pedido?.id || Math.floor(Math.random()*9000+1000)}</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">Inventarios actualizados en tiempo real</p>
            </div>

            {/* Ticket Printable Body */}
            <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 text-left font-mono text-xs space-y-2">
              <div className="text-center border-b pb-2 border-dashed border-stone-300 dark:border-stone-700">
                <p className="font-black text-sm">CLAUDIPAN</p>
                <p className="text-[10px] text-stone-500">Panadería & Pastelería SENA</p>
                <p className="text-[9px] text-stone-400">{ticketEmitido.fecha}</p>
              </div>

              <div className="space-y-1 py-1 border-b border-dashed border-stone-300 dark:border-stone-700">
                {ticketEmitido.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate">{it.quantity}x {it.product.nombre}</span>
                    <span className="font-bold">{formatCurrency(it.product.precio * it.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 text-[11px] pt-1">
                <div className="flex justify-between font-black text-xs">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(ticketEmitido.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Método:</span>
                  <span className="font-bold text-amber-700">{ticketEmitido.tipoPago}</span>
                </div>
                {ticketEmitido.tipoPago === 'Efectivo' && (
                  <>
                    <div className="flex justify-between text-stone-500">
                      <span>Recibido:</span>
                      <span>{formatCurrency(ticketEmitido.efectivoRecibido)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Cambio:</span>
                      <span>{formatCurrency(ticketEmitido.devuelta)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-stone-500">
                  <span>Cliente:</span>
                  <span className="truncate">{ticketEmitido.cliente}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1 cursor-pointer"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-1.5" /> Imprimir
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 cursor-pointer"
                onClick={() => setTicketEmitido(null)}
              >
                Nueva Venta
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
