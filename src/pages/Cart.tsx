import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, CheckCircle2, 
  Ticket, AlertCircle, CreditCard, DollarSign, UserCheck, 
  UserX, ShieldCheck, Sparkles 
} from 'lucide-react';
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

  // Selector dual: Cliente vs Comprador Genérico
  const [checkoutMode, setCheckoutMode] = useState<'cliente' | 'comprador_generico'>(
    isAuthenticated && user?.rol === 'Cliente' ? 'cliente' : 'comprador_generico'
  );
  
  // Datos de Comprador Genérico
  const [compradorNombre, setCompradorNombre] = useState('Comprador de Paso');
  const [compradorEmail, setCompradorEmail] = useState('');
  const [compradorTelefono, setCompradorTelefono] = useState('');
  const [compradorCedula, setCompradorCedula] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState(user?.direccion || 'Retiro en Mostrador Panadería');

  // Método de pago: Efectivo, Transferencia, Tarjeta, Credito_Fiado
  const [tipoPago, setTipoPago] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Credito_Fiado'>('Efectivo');
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [createdOrderDetails, setCreatedOrderDetails] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'CLAUDI15') {
      const discount = Math.round(subtotal * 0.15);
      setDiscountAmount(discount);
      setCouponApplied(true);
    } else {
      alert('Código promocional no válido. Prueba con CLAUDI15');
    }
  };

  const finalTotal = Math.max(0, totalAmount - discountAmount);
  const cupoTotal = user?.limiteCredito || 0;
  const deudaActual = user?.deudaActual || 0;
  const cupoDisponible = Math.max(0, cupoTotal - deudaActual);
  const nuevoCupoDisponible = Math.max(0, cupoDisponible - finalTotal);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    const isClienteRegistrado = checkoutMode === 'cliente' && isAuthenticated;

    // Validación si es comprador genérico
    if (!isClienteRegistrado) {
      if (tipoPago === 'Credito_Fiado') {
        setCheckoutError('El crédito (fiado) está reservado para clientes registrados con cupo activo. Selecciona Efectivo o Transferencia.');
        return;
      }
    }

    // Validación si fiará como cliente
    if (tipoPago === 'Credito_Fiado' && isClienteRegistrado) {
      if (finalTotal > cupoDisponible) {
        setCheckoutError(
          `¡Cupo insuficiente! El total de la compra (${formatCurrency(finalTotal)}) supera tu cupo disponible para fiar (${formatCurrency(cupoDisponible)}). Por favor abona a tu deuda o paga de contado.`
        );
        return;
      }
    }

    setIsCheckingOut(true);

    try {
      const res = await pedidoService.create({
        usuarioId: isClienteRegistrado ? user?.id : undefined,
        esInvitado: !isClienteRegistrado,
        invitadoNombre: !isClienteRegistrado ? compradorNombre : undefined,
        invitadoEmail: !isClienteRegistrado ? compradorEmail : undefined,
        invitadoTelefono: !isClienteRegistrado ? compradorTelefono : undefined,
        invitadoCedula: !isClienteRegistrado ? compradorCedula : undefined,
        direccionEntrega: direccionEntrega,
        tipoPago: tipoPago,
        detalles: items.map(i => ({
          productoId: i.product.id,
          cantidad: i.quantity,
        })),
      });

      if (res.success && res.data) {
        setCreatedOrderId(res.data.id);
        setCreatedOrderDetails(res.data);
        setOrderSuccess(true);
        clearCart();
      } else {
        setCheckoutError(res.message || 'Error al procesar el pedido');
      }
    } catch (err: any) {
      setCheckoutError(err?.message || 'Error al comunicar con el servidor');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
          ¡Pedido #{createdOrderId} Procesado con Éxito!
        </h1>
        <p className="text-sm text-stone-700 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
          Tu orden ha sido registrada en el sistema de contabilidad de Claudipan. Nuestros panaderos iniciarán la preparación.
        </p>

        {createdOrderDetails?.tipoPago === 'Credito_Fiado' && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-300 space-y-1">
            <p className="font-extrabold text-sm">📋 Compra cargada a tu Cupo de Crédito (Fiado)</p>
            <p>Monto fiado: <strong>{formatCurrency(createdOrderDetails?.total)}</strong></p>
            <p>Podrás ver el estado de tu cuenta o registrar abonos en la sección <strong>Mis Deudas</strong>.</p>
          </div>
        )}

        <div className="pt-4 flex justify-center gap-4">
          <Link to="/catalog">
            <Button variant="primary">Seguir Comprando</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">Ver Mis Pedidos</Button>
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
          Explora nuestros panes artesanales desde $500, combos de panadería, gaseosas y lácteos frescos.
        </p>
        <Link to="/catalog">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
            Ir a la Vitrina de Panes
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
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Validación de compra: Cliente Registrado (con cupo de crédito) o Comprador Genérico (contabilidad de contado)
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 dark:text-red-400 hover:text-red-600">
          Vaciar Carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Item List & Customer Options */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="space-y-3">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 p-4 rounded-3xl hover:border-amber-400 transition-all shadow-sm"
              >
                <img
                  src={product.imagenUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200'}
                  alt={product.nombre}
                  className="w-20 h-20 rounded-2xl object-cover border border-amber-200/80 dark:border-stone-800 bg-amber-100/40 dark:bg-stone-950 shrink-0"
                />

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <span className="text-[10px] text-amber-700 dark:text-amber-500 font-extrabold uppercase tracking-wider">
                    {product.categoriaNombre || 'Panadería'}
                  </span>
                  <h3 className="font-heading font-bold text-stone-900 dark:text-stone-100 text-base">
                    {product.nombre}
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                    {formatCurrency(product.precio)} c/u
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-amber-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-2 text-stone-600 dark:text-stone-400 hover:text-amber-600"
                      aria-label="Disminuir"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 text-sm font-bold text-stone-900 dark:text-stone-100">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="p-2 text-stone-600 dark:text-stone-400 hover:text-amber-600"
                      aria-label="Aumentar"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100 min-w-[80px] text-right">
                    {formatCurrency(product.precio * quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-2 text-stone-400 hover:text-red-500 rounded-xl transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Type Selector: Cliente vs Comprador Genérico */}
          <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100 border-b border-amber-200/80 dark:border-stone-800 pb-3">
              Modalidad de Facturación del Pedido
            </h3>

            {/* Selector Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCheckoutMode('cliente')}
                className={`flex items-start gap-3 p-4 rounded-2xl text-left border transition-all ${
                  checkoutMode === 'cliente'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 mt-0.5">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase">1. Cliente Inscrito</h4>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                    Cliente registrado con sus datos y <strong>Tope de crédito para fiar</strong>.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCheckoutMode('comprador_generico');
                  if (tipoPago === 'Credito_Fiado') setTipoPago('Efectivo');
                }}
                className={`flex items-start gap-3 p-4 rounded-2xl text-left border transition-all ${
                  checkoutMode === 'comprador_generico'
                    ? 'bg-blue-500/15 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-700 dark:text-blue-300 mt-0.5">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase">2. Comprador Genérico</h4>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                    Cliente ocasional que <strong>pide y paga de contado</strong> para la contabilidad.
                  </p>
                </div>
              </button>
            </div>

            {/* FORM 1: Cliente Inscrito */}
            {checkoutMode === 'cliente' && (
              <div className="space-y-4">
                {isAuthenticated && user ? (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">{user.nombre}</span>
                        <span className="text-[11px] text-stone-500">C.C: {user.cedula || 'No registrada'} • Tel: {user.telefono || 'No registrado'}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] uppercase border border-emerald-500/30">
                        {user.rol}
                      </span>
                    </div>

                    {/* Credit limit meter bar */}
                    <div className="space-y-1.5 pt-2 border-t border-amber-200/60 dark:border-stone-800">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Cupo de Crédito para Fiar:</span>
                        <span className="text-amber-800 dark:text-amber-300">{formatCurrency(cupoTotal)}</span>
                      </div>
                      <div className="w-full bg-stone-200 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-red-500 h-full transition-all"
                          style={{ width: `${Math.min(100, (deudaActual / (cupoTotal || 1)) * 100)}%` }}
                          title={`Deuda Actual: ${formatCurrency(deudaActual)}`}
                        />
                        <div 
                          className="bg-emerald-500 h-full transition-all"
                          style={{ width: `${Math.max(0, 100 - (deudaActual / (cupoTotal || 1)) * 100)}%` }}
                          title={`Cupo Disponible: ${formatCurrency(cupoDisponible)}`}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-stone-500">
                        <span>Deuda actual: <strong className="text-red-600">{formatCurrency(deudaActual)}</strong></span>
                        <span>Disponible para fiar: <strong className="text-emerald-600">{formatCurrency(cupoDisponible)}</strong></span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-100/70 dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 flex items-center justify-between gap-4">
                    <span>Para comprar con tu cuenta de Cliente y usar tu cupo de crédito para fiar, por favor inicia sesión.</span>
                    <Link to="/login">
                      <Button size="sm" variant="primary">Iniciar Sesión</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* FORM 2: Comprador Genérico */}
            {checkoutMode === 'comprador_generico' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">Nombre del Comprador *</label>
                    <input
                      type="text"
                      required
                      value={compradorNombre}
                      onChange={(e) => setCompradorNombre(e.target.value)}
                      placeholder="Ej. Juan Gómez / Mostrador"
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">Cédula / NIT (opcional para factura)</label>
                    <input
                      type="text"
                      value={compradorCedula}
                      onChange={(e) => setCompradorCedula(e.target.value)}
                      placeholder="Ej. 1098765432"
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">Celular / Teléfono (opcional)</label>
                    <input
                      type="text"
                      value={compradorTelefono}
                      onChange={(e) => setCompradorTelefono(e.target.value)}
                      placeholder="310 000 0000"
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">Correo Electrónico (opcional)</label>
                    <input
                      type="email"
                      value={compradorEmail}
                      onChange={(e) => setCompradorEmail(e.target.value)}
                      placeholder="cliente@ejemplo.com"
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">Lugar de Entrega / Dirección</label>
              <input
                type="text"
                value={direccionEntrega}
                onChange={(e) => setDireccionEntrega(e.target.value)}
                placeholder="Dirección completa o Retiro en Panadería Claudipan"
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Seleccione el Método de Pago
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoPago('Efectivo')}
                  className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-extrabold transition-all ${
                    tipoPago === 'Efectivo'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Efectivo de Contado
                </button>

                <button
                  type="button"
                  onClick={() => setTipoPago('Transferencia')}
                  className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-extrabold transition-all ${
                    tipoPago === 'Transferencia'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Nequi / Transferencia
                </button>

                <button
                  type="button"
                  disabled={checkoutMode !== 'cliente' || !isAuthenticated}
                  onClick={() => setTipoPago('Credito_Fiado')}
                  className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-extrabold transition-all ${
                    tipoPago === 'Credito_Fiado'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-800 dark:text-purple-300 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  } ${(checkoutMode !== 'cliente' || !isAuthenticated) ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  Cargar a Crédito (Fiar)
                </button>
              </div>

              {tipoPago === 'Credito_Fiado' && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800 text-[11px] text-purple-900 dark:text-purple-300">
                  ℹ️ Esta compra se sumará a tu cuenta de deuda pendiente y se descontará de tu cupo disponible.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-900/90 border border-amber-300/80 dark:border-amber-500/20 p-6 rounded-3xl space-y-5 backdrop-blur-md sticky top-28 shadow-md">
          <h2 className="text-lg font-heading font-bold text-amber-700 dark:text-amber-400 border-b border-amber-200/80 dark:border-stone-800 pb-3">
            Resumen del Pedido
          </h2>

          {/* Coupon Form */}
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cupón (ej: CLAUDI15)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied}
                className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs px-3.5 py-2.5 rounded-xl border border-amber-200/80 dark:border-stone-800 uppercase font-mono focus:outline-none focus:border-amber-500"
              />
              <Ticket className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3" />
            </div>
            <Button type="submit" variant="secondary" size="sm" disabled={couponApplied || !couponCode}>
              {couponApplied ? 'Aplicado' : 'Aplicar'}
            </Button>
          </form>

          {/* Price breakdown */}
          <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300 border-b border-amber-200/80 dark:border-stone-800 pb-3">
            <div className="flex justify-between">
              <span>Subtotal Productos</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Costo de Envío</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {shippingFee === 0 ? <span className="text-emerald-600 font-bold">¡GRATIS!</span> : formatCurrency(shippingFee)}
              </span>
            </div>

            {couponApplied && (
              <div className="flex justify-between text-amber-700 dark:text-amber-400 font-semibold">
                <span>Descuento CLAUDI15 (15%)</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
          </div>

          {/* Total amount */}
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
            {tipoPago === 'Credito_Fiado' ? 'Confirmar Compra a Crédito (Fiar)' : 'Pagar y Registrar Compra'}
          </Button>

          <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
            🔒 Panadería Claudipan — Calidad y sabor tradicional garantizado.
          </p>
        </div>

      </div>

    </div>
  );
};
