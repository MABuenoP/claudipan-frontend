import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, CheckCircle2, Ticket, AlertCircle, CreditCard, DollarSign, UserCheck, UserX } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { pedidoService } from '../services/pedidoService';

export const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal, shippingFee, totalAmount } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const [checkoutMode, setCheckoutMode] = useState<'registered' | 'guest'>(isAuthenticated ? 'registered' : 'guest');
  
  // Guest fields
  const [invitadoNombre, setInvitadoNombre] = useState('');
  const [invitadoEmail, setInvitadoEmail] = useState('');
  const [invitadoTelefono, setInvitadoTelefono] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState(user?.direccion || '');

  // Payment method
  const [tipoPago, setTipoPago] = useState<'Efectivo' | 'Tarjeta' | 'Credito_Deuda'>('Efectivo');
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'CLAUDI15') {
      const discount = Math.round(subtotal * 0.15);
      setDiscountAmount(discount);
      setCouponApplied(true);
    } else {
      alert('Código promocional no válido. Intenta con CLAUDI15');
    }
  };

  const finalTotal = Math.max(0, totalAmount - discountAmount);
  const cupoDisponible = (user?.limiteCredito || 0) - (user?.deudaActual || 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    const isGuestMode = checkoutMode === 'guest' || !isAuthenticated;

    if (isGuestMode) {
      if (!invitadoNombre || !invitadoEmail || !invitadoTelefono) {
        setCheckoutError('Por favor completa todos los datos del cliente invitado.');
        return;
      }
      if (tipoPago === 'Credito_Deuda') {
        setCheckoutError('Los clientes invitados no pueden realizar compras a crédito. Selecciona Efectivo o Tarjeta.');
        return;
      }
    }

    if (tipoPago === 'Credito_Deuda' && isAuthenticated && user) {
      if (finalTotal > cupoDisponible) {
        setCheckoutError(`El monto total (${formatCurrency(finalTotal)}) excede tu cupo disponible de crédito (${formatCurrency(cupoDisponible)}).`);
        return;
      }
    }

    setIsCheckingOut(true);

    try {
      const res = await pedidoService.createPedido({
        usuarioId: isGuestMode ? undefined : user?.id,
        esInvitado: isGuestMode,
        invitadoNombre: isGuestMode ? invitadoNombre : undefined,
        invitadoEmail: isGuestMode ? invitadoEmail : undefined,
        invitadoTelefono: isGuestMode ? invitadoTelefono : undefined,
        direccionEntrega: direccionEntrega || 'Retiro en Panadería Claudipan',
        tipoPago: tipoPago,
        detalles: items.map(i => ({
          productoId: i.product.id,
          cantidad: i.quantity,
        })),
      });

      if (res.success && res.data) {
        setCreatedOrderId(res.data.id);
        setOrderSuccess(true);
        clearCart();
      } else {
        setCheckoutError(res.message || 'Error al procesar la compra.');
      }
    } catch (err: any) {
      setCheckoutError(err?.message || 'Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 animate-pulse-subtle">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">¡Pedido Confirmado con Éxito!</h1>
        <p className="text-sm text-stone-700 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
          Tu orden ha sido registrada en el sistema de Claudipan. Nuestros panaderos artesanales están horneando tu pedido.
        </p>
        <div className="p-4 bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-2xl text-xs text-stone-700 dark:text-stone-300 font-mono shadow-sm">
          Número de Pedido: <strong className="text-amber-600 dark:text-amber-400 font-extrabold">#{createdOrderId}</strong>
        </div>
        <div className="pt-4 flex justify-center gap-4">
          <Link to="/catalog">
            <Button variant="primary">Seguir Comprando</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">Ver Estado de Pedidos</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-stone-900 dark:text-stone-100">Tu carrito está vacío</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
          Explora nuestra selección de panes de masa madre, croissants y deliciosos cafés recién hechos.
        </p>
        <Link to="/catalog">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
            Ir a la Panadería
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Title */}
      <div className="flex items-center justify-between pb-6 border-b border-amber-200/80 dark:border-stone-800">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">Carrito de Compras</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Tienes {items.reduce((a, b) => a + b.quantity, 0)} productos en tu orden</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 dark:text-red-400 hover:text-red-600">
          Vaciar Carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Item List & Customer options */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 p-4 rounded-3xl hover:border-amber-400 dark:hover:border-stone-700 transition-all shadow-sm"
              >
                <img
                  src={product.imagenUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200'}
                  alt={product.nombre}
                  className="w-24 h-24 rounded-2xl object-cover border border-amber-200/80 dark:border-stone-800 bg-amber-100/40 dark:bg-stone-950 shrink-0"
                />

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <span className="text-[10px] text-amber-700 dark:text-amber-500 font-extrabold uppercase tracking-wider">{product.categoriaNombre || 'Panadería'}</span>
                  <h3 className="font-heading font-bold text-stone-900 dark:text-stone-100 text-base">{product.nombre}</h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">{formatCurrency(product.precio)} c/u</p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-amber-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-2 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400"
                      aria-label="Disminuir"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 text-sm font-bold text-stone-900 dark:text-stone-100">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="p-2 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400"
                      aria-label="Aumentar"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100 min-w-[90px] text-right">
                    {formatCurrency(product.precio * quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-2 text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-stone-800 rounded-xl transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Options Form */}
          <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100 border-b border-amber-200/80 dark:border-stone-800 pb-3">
              Datos para el Envío y Facturación
            </h3>

            {/* Switch Mode: Invitado vs Registrado */}
            <div className="flex gap-3">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setCheckoutMode('registered')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-extrabold border transition-all ${
                    checkoutMode === 'registered'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-800 dark:text-amber-300'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Comprar como Cliente Registrado
                </button>
              )}

              <button
                type="button"
                onClick={() => setCheckoutMode('guest')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-extrabold border transition-all ${
                  checkoutMode === 'guest' || !isAuthenticated
                    ? 'bg-amber-500/20 border-amber-500 text-amber-800 dark:text-amber-300'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <UserX className="w-4 h-4" />
                Comprar como Cliente Invitado
              </button>
            </div>

            {/* Guest details form */}
            {(checkoutMode === 'guest' || !isAuthenticated) ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={invitadoNombre}
                    onChange={(e) => setInvitadoNombre(e.target.value)}
                    placeholder="Ej. María Pérez"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={invitadoEmail}
                    onChange={(e) => setInvitadoEmail(e.target.value)}
                    placeholder="maria@ejemplo.com"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Teléfono / Celular *</label>
                  <input
                    type="text"
                    required
                    value={invitadoTelefono}
                    onChange={(e) => setInvitadoTelefono(e.target.value)}
                    placeholder="300 123 4567"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-stone-800/60 border border-amber-500/20 text-xs text-stone-800 dark:text-stone-200 space-y-1">
                <p><strong>Cliente Registrado:</strong> {user?.nombre} ({user?.email})</p>
                <p>Cupo de crédito total: <strong>${user?.limiteCredito?.toLocaleString('es-CO')}</strong> | Cupo disponible actual: <strong className="text-emerald-600 dark:text-emerald-400">${Math.max(0, cupoDisponible).toLocaleString('es-CO')}</strong></p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Dirección de Entrega</label>
              <input
                type="text"
                value={direccionEntrega}
                onChange={(e) => setDireccionEntrega(e.target.value)}
                placeholder="Calle # Carrera, Barrio (o Retiro en Panadería)"
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            {/* Payment Options */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">Método de Pago</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoPago('Efectivo')}
                  className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-extrabold transition-all ${
                    tipoPago === 'Efectivo'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Efectivo contra entrega
                </button>

                <button
                  type="button"
                  onClick={() => setTipoPago('Tarjeta')}
                  className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-extrabold transition-all ${
                    tipoPago === 'Tarjeta'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Tarjeta Crédito/Débito
                </button>

                <button
                  type="button"
                  disabled={checkoutMode === 'guest' || !isAuthenticated}
                  onClick={() => setTipoPago('Credito_Deuda')}
                  className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-extrabold transition-all ${
                    tipoPago === 'Credito_Deuda'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-800 dark:text-purple-300'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  } ${(checkoutMode === 'guest' || !isAuthenticated) ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  Crédito / Cuenta Deuda
                </button>
              </div>
              {(checkoutMode === 'guest' || !isAuthenticated) && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  * Las compras a crédito solo están habilitadas para clientes registrados con cupo activo.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-900/90 border border-amber-300/80 dark:border-amber-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md sticky top-28 shadow-md">
          <h2 className="text-lg font-heading font-bold text-amber-700 dark:text-amber-400 border-b border-amber-200/80 dark:border-stone-800 pb-3">
            Resumen de la Orden
          </h2>

          {/* Coupon Form */}
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Código (ej: CLAUDI15)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied}
                className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs px-3.5 py-2.5 rounded-xl border border-amber-200/80 dark:border-stone-800 uppercase font-mono focus:outline-none focus:border-amber-500"
              />
              <Ticket className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute right-3 top-3" />
            </div>
            <Button type="submit" variant="secondary" size="sm" disabled={couponApplied || !couponCode}>
              {couponApplied ? 'Aplicado' : 'Aplicar'}
            </Button>
          </form>

          {/* Calculations */}
          <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300 border-b border-amber-200/80 dark:border-stone-800 pb-4">
            <div className="flex justify-between">
              <span>Subtotal Productos</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Costo de Envío</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {shippingFee === 0 ? <span className="text-amber-600 dark:text-amber-400 font-bold">¡GRATIS!</span> : formatCurrency(shippingFee)}
              </span>
            </div>

            {couponApplied && (
              <div className="flex justify-between text-amber-700 dark:text-amber-400 font-semibold">
                <span>Descuento Promocional (15%)</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-stone-800 dark:text-stone-200">Total a Pagar</span>
            <span className="text-2xl font-heading font-extrabold text-amber-700 dark:text-amber-400">
              {formatCurrency(finalTotal)}
            </span>
          </div>

          {checkoutError && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          {/* Checkout CTA */}
          <Button
            variant="success"
            size="lg"
            className="w-full"
            isLoading={isCheckingOut}
            onClick={handleCheckout}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Confirmar & Realizar Pedido
          </Button>

          <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
            🔒 Panadería Claudipan — Entrega garantizada recién horneada.
          </p>
        </div>

      </div>

    </div>
  );
};
