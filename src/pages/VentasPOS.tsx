import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { productService, Product } from '../services/productService';
import { pedidoService } from '../services/pedidoService';
import { formatCurrency } from '../utils/helpers';
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle2, 
  DollarSign, User, AlertCircle, RefreshCw, Printer, Sparkles, 
  CreditCard, ArrowRight, Tag, Flame
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';

export const VentasPOS: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination State for POS Product Cards (12 items per page, 4 boxes per line)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE_BOXES = 12;

  // Cart for POS
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  
  // Checkout & Payment State
  const [tipoPago, setTipoPago] = useState<'Efectivo' | 'Credito_Fiado' | 'Transferencia'>('Efectivo');
  const [nombreCliente, setNombreCliente] = useState('Cliente Mostrador');
  const [documentoCliente, setDocumentoCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [efectivoRecibido, setEfectivoRecibido] = useState<number | ''>('');
  
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

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
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
    setErrorMessage(null);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.product.precio * item.quantity), 0);
  const devuelta = typeof efectivoRecibido === 'number' ? Math.max(0, efectivoRecibido - subtotal) : 0;

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'todos' || 
      (selectedCategory === 'panes_500' && p.precio === 500) ||
      (selectedCategory === 'panes_1000' && p.precio === 1000) ||
      (selectedCategory === 'panes_2000' && p.precio === 2000) ||
      (selectedCategory === 'panes_5000' && p.precio === 5000) ||
      (selectedCategory === 'gaseosas' && (p.categoriaNombre?.toLowerCase().includes('gaseosa') || p.nombre.toLowerCase().includes('cola') || p.nombre.toLowerCase().includes('postobon'))) ||
      (selectedCategory === 'lacteos' && (p.categoriaNombre?.toLowerCase().includes('lácteo') || p.nombre.toLowerCase().includes('leche') || p.nombre.toLowerCase().includes('queso') || p.nombre.toLowerCase().includes('kumis'))) ||
      (p.categoriaNombre?.toLowerCase() === selectedCategory.toLowerCase());

    const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.descripcion.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCat && matchSearch;
  });

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setErrorMessage(null);

    if (tipoPago === 'Efectivo' && typeof efectivoRecibido === 'number' && efectivoRecibido < subtotal) {
      setErrorMessage(`El efectivo recibido ($${efectivoRecibido.toLocaleString('es-CO')}) es menor al total de la venta ($${subtotal.toLocaleString('es-CO')})`);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      tipoPago,
      nombreCliente: nombreCliente || 'Cliente Mostrador',
      documentoCliente: documentoCliente || '222222222',
      telefonoCliente: telefonoCliente || '3000000000',
      direccionEntrega: 'Venta Directa en Mostrador Claudipan',
      notas: `Venta POS por vendedor: ${user?.nombre || 'Cajero'}`,
      detalles: cart.map(item => ({
        productoId: item.product.id,
        cantidad: item.quantity
      }))
    };

    const res = await pedidoService.createPedido(payload);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setTicketEmitido({
        pedido: res.data,
        items: [...cart],
        subtotal,
        efectivoRecibido: typeof efectivoRecibido === 'number' ? efectivoRecibido : subtotal,
        devuelta,
        tipoPago,
        cliente: nombreCliente,
        fecha: new Date().toLocaleString('es-CO')
      });
      clearCart();
    } else {
      setErrorMessage(res.message || 'Error al procesar la venta en caja.');
    }
  };

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
              Terminal POS Mostrador <span className="text-xs bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full font-mono font-bold">Caja Rápida</span>
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
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all"
            title="Refrescar catálogo"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Products vs Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Product Selection Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Quick Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'panes_500', label: '🥖 Panes $500' },
              { id: 'panes_1000', label: '🥖 Panes $1.000' },
              { id: 'panes_2000', label: '🥖 Panes $2.000' },
              { id: 'panes_5000', label: '🥖 Panes $5.000' },
              { id: 'gaseosas', label: '🥤 Gaseosas' },
              { id: 'lacteos', label: '🥛 Lácteos' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-105'
                    : 'bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar producto por nombre (ej. Bolita, Queso, Coca-Cola)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs px-4 py-3 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Product Items Grid (12 items per page, 4 boxes per line in desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 min-h-[380px]">
            {filteredProducts.slice((currentPage - 1) * PAGE_SIZE_BOXES, currentPage * PAGE_SIZE_BOXES).map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-amber-200/80 dark:border-stone-800 hover:border-amber-500/80 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95"
              >
                <div>
                  <div className="h-24 w-full rounded-xl bg-amber-50 dark:bg-stone-950 overflow-hidden mb-2 relative">
                    <img 
                      src={p.imagenUrl || '/logo.png'} 
                      alt={p.nombre} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-amber-600/90 backdrop-blur-sm text-white font-extrabold text-[10px] rounded-lg shadow">
                      {formatCurrency(p.precio)}
                    </span>
                    {p.enOferta && (
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-red-600 text-white font-black text-[9px] rounded-md animate-pulse">
                        OFERTA
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-600 transition-colors">
                    {p.nombre}
                  </h3>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1">
                    {p.descripcion}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-[10px]">
                  <span className={`font-semibold ${p.stock > 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    Stock: {p.stock} u.
                  </span>
                  <span className="p-1 bg-amber-100 dark:bg-stone-800 text-amber-700 dark:text-amber-400 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination for POS Products */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            pageSize={PAGE_SIZE_BOXES}
            onPageChange={setCurrentPage}
            itemLabel="productos"
          />

        </div>

        {/* Right Column: POS Cart & Checkout Terminal (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 border border-amber-300/80 dark:border-stone-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/80 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                <h2 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base">
                  Ticket de Venta
                </h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vaciar
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-stone-400 dark:text-stone-500 space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs font-semibold">Toca los productos a la izquierda para agregarlos al ticket</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {cart.map(item => (
                  <div 
                    key={item.product.id}
                    className="flex items-center justify-between p-2.5 bg-amber-50/50 dark:bg-stone-950/50 rounded-2xl border border-amber-200/60 dark:border-stone-800 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-stone-900 dark:text-stone-100 truncate">{item.product.nombre}</p>
                      <p className="text-[11px] text-stone-500">{formatCurrency(item.product.precio)} c/u</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-600 dark:text-stone-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold font-mono text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-600 dark:text-stone-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-stone-900 dark:text-stone-100 w-16 text-right font-mono">
                        {formatCurrency(item.product.precio * item.quantity)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customer & Payment Type */}
            <div className="pt-2 border-t border-amber-200/80 dark:border-stone-800 space-y-3">
              
              {/* Payment Type Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase text-stone-600 dark:text-stone-400 block mb-1.5">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'Efectivo', label: '💵 Efectivo' },
                    { id: 'Credito_Fiado', label: '📋 Fiado' },
                    { id: 'Transferencia', label: '📲 Nequi/Davi' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setTipoPago(m.id as any)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        tipoPago === m.id
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-500">Cliente</label>
                  <input
                    type="text"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    placeholder="Cliente Mostrador"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-xs px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-500">Cédula / Celular</label>
                  <input
                    type="text"
                    value={documentoCliente}
                    onChange={(e) => setDocumentoCliente(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-xs px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800"
                  />
                </div>
              </div>

              {/* Cash Denominations Helper */}
              {tipoPago === 'Efectivo' && (
                <div className="p-3 bg-amber-50 dark:bg-stone-950 rounded-2xl border border-amber-200/80 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700 dark:text-stone-300">Efectivo Recibido:</span>
                    <input
                      type="number"
                      value={efectivoRecibido}
                      onChange={(e) => setEfectivoRecibido(e.target.value ? Number(e.target.value) : '')}
                      placeholder={subtotal.toString()}
                      className="w-28 text-right bg-white dark:bg-stone-900 font-mono font-bold text-xs p-1.5 rounded-xl border border-amber-300 dark:border-stone-700 focus:outline-none"
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="grid grid-cols-4 gap-1">
                    {[2000, 5000, 10000, 20000, 50000, 100000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setEfectivoRecibido(val)}
                        className="p-1 text-[10px] font-bold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-amber-100 hover:border-amber-400"
                      >
                        ${(val/1000)}k
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEfectivoRecibido(subtotal)}
                      className="col-span-2 p-1 text-[10px] font-black bg-amber-600 text-white rounded-lg hover:bg-amber-500"
                    >
                      Exacto
                    </button>
                  </div>

                  {/* Change (Devuelta) display */}
                  <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 dark:border-stone-800 text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Devuelta / Cambio:</span>
                    <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(devuelta)}
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Subtotal & Action Button */}
          <div className="space-y-3 pt-3 border-t border-amber-200/80 dark:border-stone-800">
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-stone-600 dark:text-stone-400">TOTAL A COBRAR:</span>
              <span className="text-2xl font-mono font-black text-amber-700 dark:text-amber-400">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full py-4 text-sm font-black tracking-wide uppercase bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              disabled={cart.length === 0 || isSubmitting}
              isLoading={isSubmitting}
              onClick={handleCheckout}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Cobrar & Registrar Venta
            </Button>
          </div>

        </div>

      </div>

      {/* Ticket Success Modal */}
      {ticketEmitido && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100">
                ¡Venta Registrada!
              </h3>
              <p className="text-xs text-stone-500">Ticket #{ticketEmitido.pedido?.id || Math.floor(Math.random()*9000+1000)}</p>
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
                  <span>{ticketEmitido.tipoPago}</span>
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
                className="flex-1"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-1.5" /> Imprimir
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
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
