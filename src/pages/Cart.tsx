import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, CheckCircle2, 
  Ticket, AlertCircle, CreditCard, DollarSign, UserCheck, 
  UserX, ShieldCheck, QrCode, Upload, Camera, FileText, Check 
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { useFeedback } from '../hooks/useFeedback';
import { pedidoService } from '../services/pedidoService';

export const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal, shippingFee, totalAmount } = useCart();
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const { showWarning, showSuccess, showError } = useFeedback();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Mode: If authenticated, default to logged in user; else allow generic buyer
  const [checkoutMode, setCheckoutMode] = useState<'cliente' | 'comprador_generico'>(
    isAuthenticated ? 'cliente' : 'comprador_generico'
  );
  
  // Generic buyer details if not authenticated
  const [compradorNombre, setCompradorNombre] = useState('Comprador de Paso');
  const [compradorEmail, setCompradorEmail] = useState('');
  const [compradorTelefono, setCompradorTelefono] = useState('');
  const [compradorCedula, setCompradorCedula] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState(user?.direccion || 'Retiro en Mostrador Panadería Claudipan');

  // Payment methods: Efectivo (Contado), Nequi (Contado Nequi), Credito_Fiado (Seguir Fiando)
  const [tipoPago, setTipoPago] = useState<'Efectivo' | 'Nequi' | 'Credito_Fiado'>('Efectivo');
  
  // Nequi voucher / reference
  const [referenciaNequi, setReferenciaNequi] = useState('');
  const [comprobanteNequiBase64, setComprobanteNequiBase64] = useState<string | undefined>(undefined);
  const nequiFileInputRef = useRef<HTMLInputElement>(null);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [createdOrderDetails, setCreatedOrderDetails] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated || user) {
      setCheckoutMode('cliente');
      if (user?.direccion && !direccionEntrega) {
        setDireccionEntrega(user.direccion);
      }
    }
  }, [isAuthenticated, user]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'CLAUDI15') {
      const discount = Math.round(subtotal * 0.15);
      setDiscountAmount(discount);
      setCouponApplied(true);
      showSuccess(`¡Cupón de descuento del 15% (${formatCurrency(discount)}) aplicado exitosamente!`, 'Cupón Activado');
    } else {
      showWarning('El código promocional ingresado no es válido. Prueba con el cupón: CLAUDI15', 'Cupón No Válido');
    }
  };

  const finalTotal = Math.max(0, totalAmount - discountAmount);
  const cupoTotal = user?.limiteCredito || 0;
  const deudaActual = user?.deudaActual || 0;
  const cupoDisponible = Math.max(0, cupoTotal - deudaActual);
  const nuevoCupoDisponible = Math.max(0, cupoDisponible - finalTotal);

  const handleNequiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showWarning('La imagen del comprobante de transferencia no debe superar los 3 MB.', 'Archivo Demasiado Grande');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setComprobanteNequiBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    const isClienteRegistrado = (isAuthenticated || !!user) && checkoutMode !== 'comprador_generico';

    // Validación si es comprador genérico intentando fiar
    if (!isClienteRegistrado && tipoPago === 'Credito_Fiado') {
      setCheckoutError('El crédito (fiado) está reservado para clientes registrados con cupo asignado. Inicia sesión o selecciona Efectivo / Nequi.');
      return;
    }

    // Validación si fiará como cliente
    if (tipoPago === 'Credito_Fiado' && isClienteRegistrado) {
      if (finalTotal > cupoDisponible) {
        setCheckoutError(
          `¡Cupo insuficiente! El total de la compra (${formatCurrency(finalTotal)}) supera tu cupo disponible para fiar (${formatCurrency(cupoDisponible)}). Por favor abona a tu deuda o paga de contado en Efectivo o Nequi.`
        );
        return;
      }
    }

    // Validación para Nequi
    if (tipoPago === 'Nequi' && !referenciaNequi && !comprobanteNequiBase64) {
      setCheckoutError('Por favor ingresa el número de referencia/aprobación o adjunta la captura del pago por Nequi.');
      return;
    }

    setIsCheckingOut(true);

    try {
      const res = await pedidoService.create({
        usuarioId: isClienteRegistrado ? (user?.id || undefined) : undefined,
        esInvitado: !isClienteRegistrado,
        invitadoNombre: isClienteRegistrado ? (user?.nombre || 'Cliente Claudipan') : compradorNombre,
        invitadoEmail: isClienteRegistrado ? user?.email : compradorEmail,
        invitadoTelefono: isClienteRegistrado ? user?.telefono : compradorTelefono,
        invitadoCedula: isClienteRegistrado ? user?.cedula : compradorCedula,
        direccionEntrega: direccionEntrega,
        tipoPago: tipoPago,
        referenciaPago: tipoPago === 'Nequi' ? referenciaNequi : undefined,
        comprobanteBase64: tipoPago === 'Nequi' ? comprobanteNequiBase64 : undefined,
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
        await refreshProfile();
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
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
          ¡Pedido #{createdOrderId} Registrado con Éxito!
        </h1>
        <p className="text-sm text-stone-700 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
          Tu compra ha quedado registrada a nombre de <strong>{createdOrderDetails?.clienteNombre || user?.nombre}</strong> en el sistema contable de Claudipan.
        </p>

        {createdOrderDetails?.tipoPago === 'Credito_Fiado' ? (
          <div className="p-5 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-200 text-left space-y-2 max-w-md mx-auto">
            <p className="font-extrabold text-sm flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Compra Registrada a Crédito (Fiado)
            </p>
            <p>Monto cargado a tu deuda: <strong>{formatCurrency(createdOrderDetails?.total)}</strong></p>
            <p>Tu cupo disponible se ha actualizado automáticamente. Puedes consultar o abonar en la sección <strong>Mis Deudas</strong>.</p>
          </div>
        ) : createdOrderDetails?.tipoPago === 'Nequi' ? (
          <div className="p-5 rounded-3xl bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-950 dark:text-indigo-200 text-left space-y-2 max-w-md mx-auto">
            <p className="font-extrabold text-sm flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
              <Check className="w-4 h-4 text-indigo-600" />
              Pago de Contado por Nequi
            </p>
            <p>Monto pagado: <strong>{formatCurrency(createdOrderDetails?.total)}</strong></p>
            {createdOrderDetails?.referenciaPago && (
              <p>Referencia de pago: <strong className="font-mono">{createdOrderDetails?.referenciaPago}</strong></p>
            )}
            <p className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Registrado en el historial de compras como Contado Nequi.</p>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-950 dark:text-emerald-200 text-left space-y-2 max-w-md mx-auto">
            <p className="font-extrabold text-sm flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
              <Check className="w-4 h-4 text-emerald-600" />
              Pago de Contado en Efectivo
            </p>
            <p>Monto a cancelar en mostrador: <strong>{formatCurrency(createdOrderDetails?.total)}</strong></p>
            <p className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Registrado en el historial de compras de contado.</p>
          </div>
        )}

        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <Link to="/catalog">
            <Button variant="primary">Catálogo</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">Mis Compras</Button>
          </Link>
          {createdOrderDetails?.tipoPago === 'Credito_Fiado' && (
            <Link to="/debts">
              <Button variant="secondary">Mis Deudas</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-stone-900 dark:text-stone-100">Tu carrito está vacío</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
          Explora nuestros panes artesanales desde $500, combos de panadería, gaseosas y lácteos frescos.
        </p>
        <Link to="/catalog">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
            Ir al Catálogo de Panes
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
            {isAuthenticated 
              ? `Comprando como: ${user?.nombre} (${user?.rol})` 
              : 'Selecciona si compras con tu cuenta o como comprador de paso.'}
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

          {/* Checkout Identity & Credit Section */}
          <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100 border-b border-amber-200/80 dark:border-stone-800 pb-3">
              Datos del Comprador & Facturación
            </h3>

            {/* If authenticated: Buyer info banner */}
            {isAuthenticated && user ? (
              <div className="p-5 rounded-3xl bg-amber-50/80 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-lg flex items-center justify-center border border-amber-500/30 overflow-hidden shrink-0">
                      {user.fotoBase64 ? (
                        <img src={user.fotoBase64} alt={user.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.nombre.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{user.nombre}</h4>
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] uppercase border border-amber-500/30">
                          {user.rol}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Email: {user.email} • CC: {user.cedula || 'Sin registrar'} • Tel: {user.telefono || 'Sin registrar'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl self-start sm:self-auto">
                    ✓ Compra vinculada a tu cuenta
                  </span>
                </div>

                {/* Cupo de crédito meter if Cliente */}
                {user.rol === 'Cliente' && (
                  <div className="space-y-1.5 pt-3 border-t border-amber-200/60 dark:border-stone-800">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-stone-700 dark:text-stone-300">Cupo de Crédito Otorgado (Tope Máximo):</span>
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
                    <div className="flex justify-between text-[11px]">
                      <span className="text-stone-500">Deuda actual: <strong className="text-red-600">{formatCurrency(deudaActual)}</strong></span>
                      <span className="text-stone-500">Disponible para fiar: <strong className="text-emerald-600">{formatCurrency(cupoDisponible)}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Non-authenticated mode */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-stone-800/80 border border-amber-200/80 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-stone-700 dark:text-stone-300">
                    <p className="font-bold text-stone-900 dark:text-stone-100 mb-0.5">¿Ya tienes cuenta en Claudipan?</p>
                    <p>Inicia sesión para vincular la compra a tu nombre y utilizar tu cupo de crédito para fiar.</p>
                  </div>
                  <Link to="/login">
                    <Button size="sm" variant="primary">Iniciar Sesión</Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    O diligencia tus datos para compra de contado:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        value={compradorNombre}
                        onChange={(e) => setCompradorNombre(e.target.value)}
                        placeholder="Ej. Juan Gómez"
                        className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">Cédula / NIT</label>
                      <input
                        type="text"
                        value={compradorCedula}
                        onChange={(e) => setCompradorCedula(e.target.value)}
                        placeholder="Ej. 1098765432"
                        className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">Celular / Teléfono</label>
                      <input
                        type="text"
                        value={compradorTelefono}
                        onChange={(e) => setCompradorTelefono(e.target.value)}
                        placeholder="310 123 4567"
                        className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">Correo Electrónico</label>
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
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">Dirección de Entrega / Retiro</label>
              <input
                type="text"
                value={direccionEntrega}
                onChange={(e) => setDireccionEntrega(e.target.value)}
                placeholder="Dirección completa o Retiro en Mostrador Panadería Claudipan"
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Selecciona la Forma de Pago
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Efectivo */}
                <button
                  type="button"
                  onClick={() => setTipoPago('Efectivo')}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                    tipoPago === 'Efectivo'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 mb-2">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold uppercase">1. Efectivo</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Pago de contado en mostrador o contraentrega.
                  </span>
                </button>

                {/* 2. Nequi */}
                <button
                  type="button"
                  onClick={() => setTipoPago('Nequi')}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                    tipoPago === 'Nequi'
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 mb-2">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold uppercase">2. Nequi (QR / Transf.)</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Pago de contado por Nequi con captura de comprobante.
                  </span>
                </button>

                {/* 3. Seguir Fiando (Crédito) */}
                <button
                  type="button"
                  disabled={!isAuthenticated || user?.rol !== 'Cliente'}
                  onClick={() => setTipoPago('Credito_Fiado')}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                    tipoPago === 'Credito_Fiado'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  } ${(!isAuthenticated || user?.rol !== 'Cliente') ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 mb-2">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold uppercase">3. Seguir Fiando</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Cargar a tu cupo de crédito disponible.
                  </span>
                </button>
              </div>

              {/* NEQUI DETAILS BOX */}
              {tipoPago === 'Nequi' && (
                <div className="p-5 rounded-3xl bg-indigo-50/80 dark:bg-stone-950 border border-indigo-200 dark:border-indigo-900/60 space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-indigo-600" />
                        Paga con Nequi a Claudipan
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                        Número Nequi: <strong className="text-stone-900 dark:text-stone-100 font-mono text-sm">312 456 7890</strong>
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Titular: <strong>Panadería y Pastelería Claudipan S.A.S</strong>
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Valor exacto a transferir: <strong className="text-indigo-700 dark:text-indigo-400 text-sm">{formatCurrency(finalTotal)}</strong>
                      </p>
                    </div>

                    {/* QR Code Demo Representation */}
                    <div className="p-3 bg-white rounded-2xl border border-indigo-200 shadow-sm flex flex-col items-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl flex flex-col items-center justify-center text-white p-2 text-center shadow-inner">
                        <QrCode className="w-12 h-12 text-white" />
                        <span className="text-[9px] font-mono font-bold mt-1">NEQUI CLAUDIPAN</span>
                      </div>
                      <span className="text-[9px] font-bold text-stone-500 mt-1">Escanea desde tu App</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-indigo-200/60 dark:border-stone-800">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Número de Referencia / Aprobación *
                      </label>
                      <input
                        type="text"
                        value={referenciaNequi}
                        onChange={(e) => setReferenciaNequi(e.target.value)}
                        placeholder="Ej. M12345678"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Captura de Pantalla del Comprobante (Opcional)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => nequiFileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shrink-0"
                        >
                          <Camera className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{comprobanteNequiBase64 ? 'Cambiar Captura' : 'Subir Comprobante'}</span>
                        </button>
                        {comprobanteNequiBase64 && (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Adjuntado
                          </span>
                        )}
                        <input
                          ref={nequiFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleNequiFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CREDITO FIADO DETAILS BOX */}
              {tipoPago === 'Credito_Fiado' && (
                <div className="p-4 rounded-3xl bg-amber-500/15 border border-amber-500/30 space-y-2 text-xs text-amber-950 dark:text-amber-200 animate-fade-in">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Balance de Crédito para esta compra
                    </span>
                    <span>Tope: {formatCurrency(cupoTotal)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 font-semibold text-[11px]">
                    <div className="p-2 bg-white dark:bg-stone-900 rounded-xl border border-amber-200 dark:border-stone-800">
                      <p className="text-stone-500">Deuda Actual</p>
                      <p className="text-red-600 font-extrabold">{formatCurrency(deudaActual)}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-stone-900 rounded-xl border border-amber-200 dark:border-stone-800">
                      <p className="text-stone-500">Esta Compra</p>
                      <p className="text-amber-700 dark:text-amber-400 font-extrabold">+{formatCurrency(finalTotal)}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-stone-900 rounded-xl border border-amber-200 dark:border-stone-800">
                      <p className="text-stone-500">Nuevo Cupo Libre</p>
                      <p className={`font-extrabold ${nuevoCupoDisponible >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(nuevoCupoDisponible)}
                      </p>
                    </div>
                  </div>
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

            <div className="flex justify-between pt-1 border-t border-stone-100 dark:border-stone-800 font-bold">
              <span>Modalidad de Pago</span>
              <span className="text-amber-800 dark:text-amber-400">
                {tipoPago === 'Efectivo' ? 'Efectivo de Contado' : tipoPago === 'Nequi' ? 'Contado Nequi' : 'Seguir Fiando (Crédito)'}
              </span>
            </div>
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
            {tipoPago === 'Credito_Fiado' 
              ? 'Fiar Pedido' 
              : tipoPago === 'Nequi'
              ? 'Pagar Nequi'
              : 'Pagar Efectivo'}
          </Button>

          <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
            🔒 Panadería Claudipan — Calidad artesanal y frescura garantizada.
          </p>
        </div>

      </div>

    </div>
  );
};
