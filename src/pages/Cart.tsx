import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, CheckCircle2,
  Ticket as TicketIcon, AlertCircle, CreditCard, DollarSign,
  QrCode, Camera, Check, Store, Truck, Printer, User, LogIn, UserPlus, Clock
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { useFeedback } from '../hooks/useFeedback';
import { pedidoService } from '../services/pedidoService';

export const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const { showWarning, showSuccess } = useFeedback();
  const navigate = useNavigate();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Cliente de Paso flag: if true, user chooses to proceed without registration
  const [isClienteDePaso, setIsClienteDePaso] = useState(false);

  // Delivery method: 'Mostrador' ($0) or 'Domicilio' ($5,000)
  const [metodoEntrega, setMetodoEntrega] = useState<'Mostrador' | 'Domicilio'>('Mostrador');

  // Customer & Shipping details
  const [compradorNombre, setCompradorNombre] = useState('');
  const [compradorTelefono, setCompradorTelefono] = useState('');
  const [compradorEmail, setCompradorEmail] = useState('');
  const [compradorCedula, setCompradorCedula] = useState('');
  const [direccionDomicilio, setDireccionDomicilio] = useState('');

  // Payment method: 'Efectivo' | 'Nequi' | 'Credito_Fiado'
  const [tipoPago, setTipoPago] = useState<'Efectivo' | 'Nequi' | 'Credito_Fiado'>('Efectivo');

  // Nequi voucher / reference
  const [referenciaNequi, setReferenciaNequi] = useState('');
  const [comprobanteNequiBase64, setComprobanteNequiBase64] = useState<string | undefined>(undefined);
  const nequiFileInputRef = useRef<HTMLInputElement>(null);

  // Checkout states
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderDetails, setCreatedOrderDetails] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      setIsClienteDePaso(false);
      if (user.direccion && !direccionDomicilio) {
        setDireccionDomicilio(user.direccion);
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

  // Calculations
  const costoEnvio = metodoEntrega === 'Domicilio' ? 5000 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + costoEnvio);
  const cupoTotal = user?.limiteCredito || 0;
  const deudaActual = user?.deudaActual || 0;
  const cupoDisponible = Math.max(0, cupoTotal - deudaActual);
  const nuevoCupoDisponible = Math.max(0, cupoDisponible - finalTotal);

  // Credit eligibility checks
  const isRegisteredCustomer = isAuthenticated && user?.rol === 'Cliente';
  const canUseCredit = isRegisteredCustomer && !isClienteDePaso && cupoDisponible >= finalTotal;

  // Nequi file reader
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

    // Validation for credit
    if (tipoPago === 'Credito_Fiado') {
      if (isClienteDePaso) {
        setCheckoutError('Los Clientes de Paso no tienen habilitado el crédito (fiado). Selecciona Efectivo o Transferencia.');
        return;
      }
      if (!isRegisteredCustomer) {
        setCheckoutError('El crédito (fiado) está reservado para clientes registrados con cupo aprobado.');
        return;
      }
      if (finalTotal > cupoDisponible) {
        setCheckoutError(
          `¡Cupo insuficiente! El total (${formatCurrency(finalTotal)}) supera tu cupo disponible (${formatCurrency(cupoDisponible)}).`
        );
        return;
      }
    }

    // Validation for Nequi
    if (tipoPago === 'Nequi' && !referenciaNequi && !comprobanteNequiBase64) {
      setCheckoutError('Por favor ingresa la referencia o captura del comprobante Nequi.');
      return;
    }

    // Validation for Domicilio address
    if (metodoEntrega === 'Domicilio' && !direccionDomicilio.trim()) {
      setCheckoutError('Por favor ingresa la dirección exacta para realizar el envío a domicilio.');
      return;
    }

    setIsCheckingOut(true);

    try {
      const direccionFinal = metodoEntrega === 'Mostrador'
        ? 'Mostrador Panadería Claudipan - Cra 5 # 10-20'
        : (direccionDomicilio.trim() || 'Dirección de Domicilio');

      const res = await pedidoService.create({
        usuarioId: (!isClienteDePaso && isAuthenticated && user) ? user.id : undefined,
        esInvitado: isClienteDePaso || !isAuthenticated,
        esClienteDePaso: isClienteDePaso,
        metodoEntrega: metodoEntrega,
        costoEnvio: costoEnvio,
        invitadoNombre: isClienteDePaso
          ? (compradorNombre.trim() || 'Cliente de Paso')
          : (isAuthenticated ? user?.nombre : (compradorNombre.trim() || 'Cliente Claudipan')),
        invitadoEmail: isClienteDePaso ? (compradorEmail.trim() || 'clientedepaso@claudipan.com') : user?.email,
        invitadoTelefono: isClienteDePaso ? compradorTelefono.trim() : user?.telefono,
        invitadoCedula: isClienteDePaso ? compradorCedula.trim() : user?.cedula,
        direccionEntrega: direccionFinal,
        tipoPago: tipoPago,
        referenciaPago: tipoPago === 'Nequi' ? referenciaNequi : undefined,
        comprobanteBase64: tipoPago === 'Nequi' ? comprobanteNequiBase64 : undefined,
        detalles: items.map(i => ({
          productoId: i.product.id,
          cantidad: i.quantity,
        })),
      });

      if (res.success && res.data) {
        setCreatedOrderDetails(res.data);
        setOrderSuccess(true);
        clearCart();
        if (isAuthenticated) {
          await refreshProfile();
        }
      } else {
        setCheckoutError(res.message || 'Error al procesar el pedido');
      }
    } catch (err: any) {
      setCheckoutError(err?.message || 'Error al comunicar con el servidor');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // SUCCESS / TICKET VIEW
  if (orderSuccess && createdOrderDetails) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in print:p-0 print:m-0 print:max-w-none">

        {/* Actions bar (hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-extrabold text-sm sm:text-base">¡Pedido Registrado con Éxito!</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ticket</span>
            </button>
            <Link to="/catalog">
              <Button size="sm" variant="outline">Ir al Catálogo</Button>
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard">
                <Button size="sm" variant="primary">Mis Pedidos</Button>
              </Link>
            )}
          </div>
        </div>

        {/* ELEGANT PRINTABLE TICKET CARD */}
        <div className="bg-white dark:bg-stone-900 border-2 border-dashed border-amber-300 dark:border-amber-600/50 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-stone-800 dark:text-stone-200 print:border-solid print:border-black print:text-black print:bg-white print:shadow-none">

          {/* Ticket Header */}
          <div className="text-center space-y-1.5 border-b border-stone-200 dark:border-stone-800 pb-5 print:border-black">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Panadería & Pastelería Claudipan S.A.S
            </span>
            <h2 className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100 print:text-black">
              TICKET DE PEDIDO
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Cra 5 # 10-20, Centro • Tel: (607) 654-3210 • Bucaramanga, Colombia
            </p>

            {/* Unique 10-char ticket code */}
            <div className="pt-3">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Código para Reclamar</span>
              <div className="inline-block mt-1 px-5 py-2 rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-amber-900 dark:text-amber-200 font-mono font-extrabold text-2xl tracking-widest shadow-inner print:text-black print:border-black">
                {createdOrderDetails.codigoTicket || `CP${createdOrderDetails.id?.toString().padStart(8, '0')}`}
              </div>
            </div>
          </div>

          {/* Order Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs border-b border-stone-200 dark:border-stone-800 pb-4 print:border-black">
            <div>
              <span className="text-stone-500 block text-[11px]">Cliente:</span>
              <strong className="text-stone-900 dark:text-stone-100 font-bold print:text-black">
                {createdOrderDetails.clienteNombre || 'Cliente de Paso'}
              </strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">N° Pedido:</span>
              <strong className="font-mono">#{createdOrderDetails.id}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Modalidad de Entrega:</span>
              <span className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-300 print:text-black">
                {createdOrderDetails.metodoEntrega === 'Domicilio' ? (
                  <>
                    <Truck className="w-3.5 h-3.5 text-blue-500" />
                    Envío a Domicilio
                  </>
                ) : (
                  <>
                    <Store className="w-3.5 h-3.5 text-amber-600" />
                    Retiro en Mostrador
                  </>
                )}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Forma de Pago:</span>
              <strong className="font-bold capitalize">
                {createdOrderDetails.tipoPago === 'Credito_Fiado' ? 'Crédito (Fiado)' : createdOrderDetails.tipoPago}
              </strong>
            </div>
            <div className="col-span-2">
              <span className="text-stone-500 block text-[11px]">Dirección:</span>
              <span className="font-medium text-stone-700 dark:text-stone-300 print:text-black">
                {createdOrderDetails.direccionEntrega}
              </span>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="space-y-2 border-b border-stone-200 dark:border-stone-800 pb-4 print:border-black">
            <div className="flex justify-between text-[11px] font-extrabold uppercase text-stone-500 border-b border-stone-200 dark:border-stone-800 pb-1">
              <span>Cant. & Producto</span>
              <span className="text-right">Total</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {createdOrderDetails.detalles?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-amber-800 dark:text-amber-400 print:text-black mr-2">
                      {item.cantidad}x
                    </span>
                    <span className="font-medium text-stone-800 dark:text-stone-200 print:text-black">
                      {item.productoNombre}
                    </span>
                    <span className="text-[10px] text-stone-500 block">
                      {formatCurrency(item.precioUnitario)} c/u
                    </span>
                  </div>
                  <span className="font-bold text-stone-900 dark:text-stone-100 print:text-black">
                    {formatCurrency(item.subtotal || (item.precioUnitario * item.cantidad))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Subtotal Productos:</span>
              <span>{formatCurrency(createdOrderDetails.subtotal || (createdOrderDetails.total - (createdOrderDetails.costoEnvio || 0)))}</span>
            </div>

            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Costo de Envío:</span>
              <span>
                {createdOrderDetails.costoEnvio > 0
                  ? formatCurrency(createdOrderDetails.costoEnvio)
                  : <strong className="text-emerald-600">¡GRATIS (Mostrador)!</strong>}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t-2 border-stone-300 dark:border-stone-700 text-base font-extrabold text-stone-900 dark:text-stone-100 print:border-black print:text-black">
              <span>TOTAL FACTURADO:</span>
              <span className="text-xl text-amber-700 dark:text-amber-400 print:text-black">
                {formatCurrency(createdOrderDetails.total)}
              </span>
            </div>
          </div>

          {/* Ticket Footer Instructions */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 text-[11px] text-stone-600 dark:text-stone-300 space-y-1 text-center print:bg-transparent print:border-black">
            <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Estado: PENDIENTE DE DESPACHO / ENTREGA
            </p>
            <p>
              Presenta este código <strong>{createdOrderDetails.codigoTicket}</strong> en mostrador o muéstralo al repartidor para recibir tu pedido.
            </p>
            <p className="text-[10px] text-stone-500 pt-1">
              ¡Gracias por preferir la frescura y tradición de Panadería Claudipan!
            </p>
          </div>

        </div>

      </div>
    );
  }

  // EMPTY CART VIEW
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

  // User is identified if already logged in or if they chose "Cliente de Paso"
  const isIdentified = isAuthenticated || isClienteDePaso;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-amber-200/80 dark:border-stone-800">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">Carrito de Compras</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {isAuthenticated
              ? `Comprando como: ${user?.nombre} (${user?.rol})`
              : isClienteDePaso
                ? 'Comprando como: Cliente de Paso (Retiro en Mostrador)'
                : 'Verifica tus productos y selecciona cómo deseas ordenar.'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 dark:text-red-400 hover:text-red-600">
          Vaciar Carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Product Items & Flow Options */}
        <div className="lg:col-span-8 space-y-6">

          {/* List of Products */}
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

          {/* STEP 1: USER IDENTIFICATION (ONLY WHEN NOT LOGGED IN AND NOT CLIENTE DE PASO) */}
          {!isIdentified && (
            <div className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-700 p-6 rounded-3xl space-y-4 shadow-sm animate-fade-in">
              <div className="text-left border-b border-amber-200/70 dark:border-stone-800 pb-3">
                <h3 className="text-base font-heading font-extrabold text-stone-900 dark:text-stone-100">
                  ¿Cómo deseas continuar con tu pedido?
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Tus productos y cantidades se conservarán intactos en todo momento.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* 1. Iniciar Sesión */}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex flex-col items-center text-center p-4 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 transition-all group shadow-sm hover:scale-[1.01]"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-2 shadow-sm">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-xs uppercase">1. Iniciar Sesión</span>
                  <span className="text-[11px] text-stone-600 dark:text-stone-300 mt-1">
                    Usa tu cuenta para solicitar tu pedido o utilizar tu cupo de crédito para fiar.
                  </span>
                </button>

                {/* 2. Registrarse */}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex flex-col items-center text-center p-4 rounded-2xl border-2 border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-900 dark:text-indigo-200 transition-all group shadow-sm hover:scale-[1.01]"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-sm">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-xs uppercase">2. Registrarse</span>
                  <span className="text-[11px] text-stone-600 dark:text-stone-300 mt-1">
                    Crea tu cuenta de cliente con cupo inicial de crédito asignado.
                  </span>
                </button>

                {/* 3. Cliente de Paso */}
                <button
                  type="button"
                  onClick={() => {
                    setIsClienteDePaso(true);
                    setMetodoEntrega('Mostrador');
                  }}
                  className="flex flex-col items-center text-center p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 transition-all group shadow-sm hover:scale-[1.01]"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-sm">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-xs uppercase">3. Cliente de Paso</span>
                  <span className="text-[11px] text-stone-600 dark:text-stone-300 mt-1">
                    Sin registro. Genera un ticket único para reclamar en mostrador.
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CHECKOUT OPTIONS (SHOWN ONLY WHEN LOGGED IN OR CLIENTE DE PASO) */}
          {isIdentified && (
            <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-6 rounded-3xl space-y-6 shadow-sm animate-fade-in">

              {/* Buyer Identification Banner */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold flex items-center justify-center border border-amber-500/30 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {isAuthenticated ? user?.nombre : 'Cliente de Paso (Mostrador)'}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold uppercase">
                        {isAuthenticated ? user?.rol : 'Sin Registro'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {isAuthenticated
                        ? `${user?.email} • CC: ${user?.cedula || 'N/A'}`
                        : 'Reclama tus productos en el mostrador presentando tu ticket de compra.'}
                    </p>
                  </div>
                </div>

                {isClienteDePaso && !isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => setIsClienteDePaso(false)}
                    className="text-xs text-amber-700 dark:text-amber-400 font-bold hover:underline self-start sm:self-auto"
                  >
                    ← Cambiar forma de compra
                  </button>
                )}
              </div>

              {/* Credit limit meter if registered customer */}
              {isRegisteredCustomer && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-950 border border-amber-200/70 dark:border-stone-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-stone-700 dark:text-stone-300">Cupo de Crédito Otorgado:</span>
                    <span className="text-amber-800 dark:text-amber-300">{formatCurrency(cupoTotal)}</span>
                  </div>
                  <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-red-500 h-full transition-all"
                      style={{ width: `${Math.min(100, (deudaActual / (cupoTotal || 1)) * 100)}%` }}
                    />
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${Math.max(0, 100 - (deudaActual / (cupoTotal || 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-500">Deuda actual: <strong className="text-red-600">{formatCurrency(deudaActual)}</strong></span>
                    <span className="text-stone-500">Disponible para fiar: <strong className="text-emerald-600">{formatCurrency(cupoDisponible)}</strong></span>
                  </div>
                </div>
              )}

              {/* SECTION: FORMA DE ENTREGA (MOSTRADOR VS DOMICILIO) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  1. ¿Cómo deseas recibir tus productos?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Mostrador ($0) */}
                  <button
                    type="button"
                    onClick={() => setMetodoEntrega('Mostrador')}
                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${metodoEntrega === 'Mostrador'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-100 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                      }`}
                  >
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold block uppercase">Retiro en Mostrador</span>
                      <span className="text-xs text-emerald-600 font-extrabold block mt-0.5">¡Costo: $0 (Gratis)!</span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 block leading-tight">
                        Reclama personalmente en la panadería (Cra 5 # 10-20) con tu ticket.
                      </span>
                    </div>
                  </button>

                  {/* Domicilio (+$5,000) */}
                  <button
                    type="button"
                    onClick={() => setMetodoEntrega('Domicilio')}
                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${metodoEntrega === 'Domicilio'
                        ? 'bg-blue-500/15 border-blue-500 text-blue-950 dark:text-blue-100 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                      }`}
                  >
                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-700 dark:text-blue-300 shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold block uppercase">Envío a Domicilio</span>
                      <span className="text-xs text-blue-600 font-extrabold block mt-0.5">+ $5.000 COP de Envío</span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 block leading-tight">
                        Te lo llevamos calientito hasta la puerta de tu casa o negocio.
                      </span>
                    </div>
                  </button>
                </div>

                {/* Domicilio Address Input */}
                {metodoEntrega === 'Domicilio' && (
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-stone-950 border border-blue-200 dark:border-blue-900/50 space-y-3 animate-fade-in">
                    <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                      Dirección exacta de entrega a domicilio *
                    </label>
                    <input
                      type="text"
                      required
                      value={direccionDomicilio}
                      onChange={(e) => setDireccionDomicilio(e.target.value)}
                      placeholder="Ej. Calle 36 # 24-18, Barrio San Francisco, Apto 201"
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />

                    {isClienteDePaso && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">Nombre de contacto *</label>
                          <input
                            type="text"
                            value={compradorNombre}
                            onChange={(e) => setCompradorNombre(e.target.value)}
                            placeholder="Ej. Carlos Mendoza"
                            className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">Teléfono / Celular *</label>
                          <input
                            type="text"
                            value={compradorTelefono}
                            onChange={(e) => setCompradorTelefono(e.target.value)}
                            placeholder="310 123 4567"
                            className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION: FORMA DE PAGO */}
              <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  2. Selecciona la Forma de Pago
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Efectivo */}
                  <button
                    type="button"
                    onClick={() => setTipoPago('Efectivo')}
                    className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${tipoPago === 'Efectivo'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                      }`}
                  >
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 mb-2">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold uppercase">1. Efectivo</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {metodoEntrega === 'Mostrador' ? 'Paga en el mostrador al reclamar.' : 'Pago contraentrega en efectivo.'}
                    </span>
                  </button>

                  {/* 2. Transferencia / Nequi */}
                  <button
                    type="button"
                    onClick={() => setTipoPago('Nequi')}
                    className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${tipoPago === 'Nequi'
                        ? 'bg-indigo-500/15 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                      }`}
                  >
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 mb-2">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold uppercase">2. Transferencia / Nequi</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Transferencia digital con número de comprobante.
                    </span>
                  </button>

                  {/* 3. A Crédito (Fiado) */}
                  <button
                    type="button"
                    disabled={!canUseCredit}
                    onClick={() => setTipoPago('Credito_Fiado')}
                    className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all relative ${tipoPago === 'Credito_Fiado'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                      } ${!canUseCredit ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 mb-2">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold uppercase">3. A Crédito (Fiado)</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {isClienteDePaso
                        ? 'No permitido para Clientes de Paso.'
                        : !isRegisteredCustomer
                          ? 'Requiere cuenta de cliente.'
                          : cupoDisponible < finalTotal
                            ? 'Cupo de crédito insuficiente.'
                            : 'Cargar a tu cupo disponible.'}
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

              </div>

            </div>
          )}

        </div>

        {/* Right Column: Order Summary & Pagar Button */}
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
              <TicketIcon className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3" />
            </div>
            <Button type="submit" variant="secondary" size="sm" disabled={couponApplied || !couponCode}>
              {couponApplied ? 'Aplicado' : 'Aplicar'}
            </Button>
          </form>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300 border-b border-amber-200/80 dark:border-stone-800 pb-3">
            <div className="flex justify-between">
              <span>Subtotal Productos</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Modalidad Entrega</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {metodoEntrega === 'Domicilio' ? 'Envío a Domicilio' : 'Retiro Mostrador'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Costo de Envío</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {metodoEntrega === 'Domicilio' ? (
                  <strong className="text-blue-600">+ {formatCurrency(5000)}</strong>
                ) : (
                  <strong className="text-emerald-600">¡GRATIS ($0)!</strong>
                )}
              </span>
            </div>

            {couponApplied && (
              <div className="flex justify-between text-amber-700 dark:text-amber-400 font-semibold">
                <span>Descuento CLAUDI15 (15%)</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between pt-1 border-t border-stone-100 dark:border-stone-800 font-bold">
              <span>Forma de Pago</span>
              <span className="text-amber-800 dark:text-amber-400 capitalize">
                {tipoPago === 'Credito_Fiado' ? 'Crédito (Fiado)' : tipoPago}
              </span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-stone-800 dark:text-stone-200">Total del Pedido</span>
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

          <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center leading-relaxed">
            ℹ️ Tu pedido se generará en estado <strong>Pendiente</strong>. El pago y despacho es verificado y registrado exclusivamente en caja por el <strong>Vendedor</strong>, <strong>Gerente</strong> o <strong>Administrador</strong>.
          </p>

          {/* BUTTON: CONFIRMAR PEDIDO (Enabled only when user is identified) */}
          {isIdentified ? (
            <Button
              variant="success"
              size="lg"
              className="w-full text-base font-extrabold tracking-wide shadow-lg shadow-emerald-500/20"
              isLoading={isCheckingOut}
              onClick={handleCheckout}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Confirmar Pedido por: {formatCurrency(finalTotal)}
            </Button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 text-center space-y-1">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Selecciona una opción a la izquierda
              </p>
              <p className="text-[11px] text-stone-500">
                Inicia sesión, regístrate o continúa como Cliente de Paso para habilitar la confirmación del pedido.
              </p>
            </div>
          )}

          <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
            🔒 Claudipan — Tu pedido genera un ticket de reclamo y se despachará en óptimas condiciones de frescura.
          </p>
        </div>

      </div>

    </div>
  );
};
