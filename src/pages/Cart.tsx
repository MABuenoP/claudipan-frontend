import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, CheckCircle2, Ticket, Sparkles } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/helpers';
import { Button } from '../components/ui/Button';

export const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal, shippingFee, totalAmount } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

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

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderSuccess(true);
      clearCart();
    }, 1500);
  };

  const finalTotal = Math.max(0, totalAmount - discountAmount);

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 animate-pulse-subtle">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">¡Pedido Recibido con Éxito!</h1>
        <p className="text-sm text-stone-700 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
          Hemos enviado la orden a nuestra cocina artesanal. Tus productos están siendo preparados con mucho amor y llegarán recién horneados.
        </p>
        <div className="p-4 bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-2xl text-xs text-stone-700 dark:text-stone-400 font-mono shadow-sm">
          N° de Guía: #ORD-2026-CLAUDI99
        </div>
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
        
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 p-4 rounded-3xl hover:border-amber-400 dark:hover:border-stone-700 transition-all shadow-sm"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-24 h-24 rounded-2xl object-cover border border-amber-200/80 dark:border-stone-800 bg-amber-100/40 dark:bg-stone-950 shrink-0"
              />

              <div className="flex-1 space-y-1 text-center sm:text-left">
                <span className="text-[10px] text-amber-700 dark:text-amber-500 font-extrabold uppercase tracking-wider">{product.category}</span>
                <h3 className="font-heading font-bold text-stone-900 dark:text-stone-100 text-base">{product.name}</h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">{formatCurrency(product.price)} c/u</p>
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
                  {formatCurrency(product.price * quantity)}
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

          {/* Checkout CTA */}
          <Button
            variant="success"
            size="lg"
            className="w-full"
            isLoading={isCheckingOut}
            onClick={handleCheckout}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Confirmar & Pagar Pedido
          </Button>

          <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
            🔒 Pago 100% seguro simulado. Entrega en 30-45 minutos en Bogotá.
          </p>
        </div>

      </div>

    </div>
  );
};
