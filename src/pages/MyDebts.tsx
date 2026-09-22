import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  AlertCircle, RefreshCw, PlusCircle, QrCode, Camera, Check, X, 
  CheckCircle2, ShoppingBag, Calendar, Eye, PackageCheck, Receipt,
  Search, ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { contabilidadService, MisDeudasResumen } from '../services/contabilidadService';
import { pedidoService, TransaccionDeuda, Pedido } from '../services/pedidoService';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { useFeedback } from '../hooks/useFeedback';

export const MyDebts: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { showSuccess, showError, showWarning } = useFeedback();
  const [resumen, setResumen] = useState<MisDeudasResumen | null>(null);
  const [transacciones, setTransacciones] = useState<TransaccionDeuda[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tab State: 'compras' (all orders: efectivo, nequi, fiado) | 'cartera' (debt charges & abonos)
  const [activeTab, setActiveTab] = useState<'compras' | 'cartera'>('compras');
  
  // Search & Mobile view states
  const [searchComprasInput, setSearchComprasInput] = useState('');
  const [searchComprasTerm, setSearchComprasTerm] = useState('');
  const [visibleComprasMobile, setVisibleComprasMobile] = useState(10);

  const [searchCarteraInput, setSearchCarteraInput] = useState('');
  const [searchCarteraTerm, setSearchCarteraTerm] = useState('');
  const [visibleCarteraMobile, setVisibleCarteraMobile] = useState(10);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Selected Order Detail Modal
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  // Abono modal state
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
  const [abonoMonto, setAbonoMonto] = useState<number>(0);
  const [abonoMetodo, setAbonoMetodo] = useState<'Efectivo' | 'Nequi'>('Efectivo');
  const [abonoConcepto, setAbonoConcepto] = useState('Abono a saldo de fiado');
  const [abonoReferencia, setAbonoReferencia] = useState('');
  const [abonoComprobanteBase64, setAbonoComprobanteBase64] = useState<string | undefined>(undefined);
  const [isSubmittingAbono, setIsSubmittingAbono] = useState(false);
  const [abonoMessage, setAbonoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const abonoFileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    await refreshProfile();
    
    const res = await contabilidadService.getMisDeudas();
    if (res.success && res.data) {
      setResumen(res.data);
      setTransacciones(res.data.transacciones || []);
      setPedidos(res.data.pedidos || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const limiteCredito = resumen?.limiteCredito ?? (user?.limiteCredito || 0);
  const deudaActual = resumen?.deudaActual ?? (user?.deudaActual || 0);
  const cupoDisponible = resumen?.cupoDisponible ?? Math.max(0, limiteCredito - deudaActual);
  const totalComprasAcumuladas = resumen?.totalCompras ?? pedidos.reduce((sum, p) => sum + (p.total || 0), 0);

  const handleAbonoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showWarning('La imagen del comprobante de abono no debe superar los 3 MB.', 'Archivo Demasiado Grande');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAbonoComprobanteBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRegistrarAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    setAbonoMessage(null);

    if (!user) return;
    if (abonoMonto <= 0) {
      setAbonoMessage({ type: 'error', text: 'Ingresa un monto válido para el abono.' });
      return;
    }

    if (abonoMetodo === 'Nequi' && !abonoReferencia && !abonoComprobanteBase64) {
      setAbonoMessage({ type: 'error', text: 'Para abonos con Nequi, ingresa el número de referencia o adjunta la captura del pago.' });
      return;
    }

    setIsSubmittingAbono(true);

    try {
      const res = await pedidoService.registrarAbono({
        usuarioId: user.id,
        monto: abonoMonto,
        metodoPago: abonoMetodo,
        concepto: abonoConcepto,
        referenciaPago: abonoMetodo === 'Nequi' ? abonoReferencia : undefined,
        comprobanteBase64: abonoMetodo === 'Nequi' ? abonoComprobanteBase64 : undefined,
      });

      if (res.success) {
        setAbonoMessage({ type: 'success', text: res.message || 'Abono registrado con éxito.' });
        await refreshProfile();
        await fetchData();
        setTimeout(() => {
          setIsAbonoModalOpen(false);
          setAbonoMonto(0);
          setAbonoReferencia('');
          setAbonoComprobanteBase64(undefined);
          setAbonoMessage(null);
        }, 1500);
      } else {
        setAbonoMessage({ type: 'error', text: res.message || 'No se pudo registrar el abono.' });
      }
    } catch {
      setAbonoMessage({ type: 'error', text: 'Error al conectar con el servidor.' });
    } finally {
      setIsSubmittingAbono(false);
    }
  };

  // Filtered lists
  const filteredPedidos = pedidos.filter(p => {
    if (!searchComprasTerm) return true;
    const term = searchComprasTerm.toLowerCase();
    const matchesId = `#${p.id}`.includes(term) || p.id.toString().includes(term);
    const matchesTipo = p.tipoPago?.toLowerCase().includes(term);
    const matchesEstado = p.estado?.toLowerCase().includes(term);
    const matchesDetalles = p.detalles?.some(d => d.productoNombre?.toLowerCase().includes(term));
    return matchesId || matchesTipo || matchesEstado || matchesDetalles;
  });

  const filteredTransacciones = transacciones.filter(t => {
    if (!searchCarteraTerm) return true;
    const term = searchCarteraTerm.toLowerCase();
    return (
      (t.concepto && t.concepto.toLowerCase().includes(term)) ||
      (t.referenciaPago && t.referenciaPago.toLowerCase().includes(term)) ||
      (t.tipo && t.tipo.toLowerCase().includes(term)) ||
      (t.metodoPagoAbono && t.metodoPagoAbono.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-[#FFFBEB]/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent">
              Mis Compras, Deudas y Fiado
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              Consulta tus compras en efectivo, Nequi y tu saldo de fiado con abonos en línea.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-amber-500 transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              Refrescar
            </button>
            <button
              onClick={() => {
                setAbonoMonto(deudaActual > 0 ? deudaActual : 10000);
                setIsAbonoModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-700 text-white text-xs font-extrabold shadow-lg shadow-amber-800/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Abonar a Mi Deuda
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Cupo Total Asignado</span>
              <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
              {formatCurrency(limiteCredito)}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">Límite máximo fijado por administración</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Deuda Fiada Pendiente</span>
              <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-2xl font-heading font-extrabold text-red-600 dark:text-red-400 font-mono">
              {formatCurrency(deudaActual)}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">Saldo acumulado por compras fiadas</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Cupo Disponible</span>
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(cupoDisponible)}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">Libre para nuevas compras fiadas</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Compras</span>
              <ShoppingBag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-heading font-extrabold text-amber-700 dark:text-amber-300">
              {formatCurrency(totalComprasAcumuladas)}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">{pedidos.length} pedidos registrados</p>
          </div>
        </div>

        {/* Dynamic Credit Formula Card */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-3xl text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-sm">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Regla de Fiado y Cupo de Crédito</span>
          </div>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            Las compras con forma de pago <strong>Fiado</strong> se acumulan en tu deuda pendiente y reducen tu cupo disponible. Al realizar abonos de contado o por Nequi, tu cupo disponible se restaura de inmediato.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono font-bold text-xs text-stone-900 dark:text-stone-100">
            <span className="bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-stone-800">
              Tope: {formatCurrency(limiteCredito)}
            </span>
            <span className="text-amber-700 dark:text-amber-400">-</span>
            <span className="bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-red-300 dark:border-stone-800 text-red-600 dark:text-red-400">
              Deuda Fiada: {formatCurrency(deudaActual)}
            </span>
            <span className="text-amber-700 dark:text-amber-400">=</span>
            <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl shadow-sm">
              Cupo Libre: {formatCurrency(cupoDisponible)}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b border-amber-200/80 dark:border-stone-800 pb-2">
          <button
            onClick={() => setActiveTab('compras')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
              activeTab === 'compras'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-amber-200/80 dark:border-stone-800 hover:border-amber-500'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Listado de Mis Compras ({pedidos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cartera')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
              activeTab === 'cartera'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-amber-200/80 dark:border-stone-800 hover:border-amber-500'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Movimientos de Cartera y Fiado ({transacciones.length})</span>
          </button>
        </div>

        {/* TAB 1: LISTADO DE COMPRAS (CONTADO, NEQUI, FIADO) */}
        {activeTab === 'compras' && (
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm overflow-hidden animate-fade-in space-y-4">
            <div className="p-6 border-b border-amber-200/80 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100">
                  Historial de Compras y Pedidos
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Todas tus compras en línea y en panadería: Contado en Efectivo, Nequi y Fiado.
                </p>
              </div>

              {/* Top Bar: Search on Left */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchComprasTerm(searchComprasInput);
                  setCurrentPage(1);
                }}
                className="flex items-center gap-2"
              >
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar pedido, producto..."
                    value={searchComprasInput}
                    onChange={(e) => {
                      setSearchComprasInput(e.target.value);
                      if (e.target.value === '') setSearchComprasTerm('');
                    }}
                    className="w-56 pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {searchComprasInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchComprasInput('');
                        setSearchComprasTerm('');
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold px-3 whitespace-nowrap"
                >
                  Buscar
                </Button>
              </form>
            </div>

            {loading ? (
              <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm">
                Cargando tus compras...
              </div>
            ) : filteredPedidos.length === 0 ? (
              <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-amber-500 opacity-60" />
                <p>No se encontraron compras con los filtros aplicados.</p>
              </div>
            ) : (
              <div>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-stone-700 dark:text-stone-300">
                    <thead className="bg-amber-500/10 dark:bg-stone-800/80 text-xs uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                      <tr>
                        <th className="py-3.5 px-6">Pedido</th>
                        <th className="py-3.5 px-6">Forma de Pago</th>
                        <th className="py-3.5 px-6">Productos</th>
                        <th className="py-3.5 px-6">Fecha</th>
                        <th className="py-3.5 px-6">Estado</th>
                        <th className="py-3.5 px-6 text-right">Total</th>
                        <th className="py-3.5 px-6 text-center">Detalle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100 dark:divide-stone-800">
                      {filteredPedidos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((p) => {
                        const isFiado = p.tipoPago === 'Credito_Fiado' || p.tipoPago?.toLowerCase().includes('fiado');
                        const isNequi = p.tipoPago === 'Nequi' || p.tipoPago?.toLowerCase().includes('nequi');

                        return (
                          <tr key={p.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                            <td className="py-4 px-6 font-bold text-stone-900 dark:text-stone-100">
                              #{p.id}
                            </td>
                            <td className="py-4 px-6 font-semibold text-xs">
                              {isFiado ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                                  <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Fiado (Crédito)
                                </span>
                              ) : isNequi ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30">
                                  <QrCode className="w-3.5 h-3.5 text-indigo-600" /> Contado Nequi
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Contado Efectivo
                                </span>
                              )}
                              {p.referenciaPago && (
                                <p className="text-[10px] text-stone-500 font-mono mt-0.5">Ref: {p.referenciaPago}</p>
                              )}
                            </td>
                            <td className="py-4 px-6 text-xs text-stone-600 dark:text-stone-300 max-w-xs truncate">
                              {p.detalles && p.detalles.length > 0 ? (
                                <span>
                                  {p.detalles.map(d => `${d.cantidad}x ${d.productoNombre || 'Producto'}`).join(', ')}
                                </span>
                              ) : (
                                <span className="italic text-stone-400">Sin desglose</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-xs text-stone-500 dark:text-stone-400">
                              {new Date(p.fechaPedido).toLocaleString('es-CO')}
                            </td>
                            <td className="py-4 px-6 text-xs">
                              <span className={`px-2.5 py-1 rounded-xl font-bold border ${
                                p.estado === 'Entregado' || p.estado === 'Completado'
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                  : p.estado === 'Cancelado'
                                  ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                              }`}>
                                {p.estado}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-extrabold text-stone-900 dark:text-stone-100">
                              {formatCurrency(p.total)}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => setSelectedPedido(p)}
                                className="p-1.5 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-stone-800 transition-colors"
                                title="Ver detalle de productos"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="p-4 border-t border-amber-200/80 dark:border-stone-800">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredPedidos.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setCurrentPage}
                      itemLabel="compras"
                    />
                  </div>
                </div>

                {/* Mobile CardView (10 en 10) */}
                <div className="md:hidden p-4 space-y-3">
                  {filteredPedidos.slice(0, visibleComprasMobile).map(p => (
                    <div key={p.id} className="p-4 rounded-2xl bg-amber-50/40 dark:bg-stone-950 border border-amber-200/60 dark:border-stone-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">Pedido #{p.id}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          p.estado === 'Entregado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.estado}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400">
                        {p.detalles?.map(d => `${d.cantidad}x ${d.productoNombre}`).join(', ')}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-amber-200/40 dark:border-stone-800 text-xs">
                        <span className="text-[10px] text-stone-400">{new Date(p.fechaPedido).toLocaleDateString('es-CO')}</span>
                        <span className="font-mono font-black text-amber-800 dark:text-amber-300 text-sm">{formatCurrency(p.total)}</span>
                      </div>
                      <button
                        onClick={() => setSelectedPedido(p)}
                        className="w-full mt-1 py-1.5 bg-white dark:bg-stone-900 border border-amber-300 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Productos
                      </button>
                    </div>
                  ))}

                  {visibleComprasMobile < filteredPedidos.length && (
                    <div className="pt-2 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVisibleComprasMobile(prev => prev + 10)}
                        className="w-full text-amber-700 dark:text-amber-400 border-amber-500 font-bold"
                      >
                        <ChevronDown className="w-4 h-4 mr-1" /> Cargar 10 compras más ({visibleComprasMobile} de {filteredPedidos.length})
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MOVIMIENTOS DE CARTERA Y FIADO */}
        {activeTab === 'cartera' && (
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm overflow-hidden animate-fade-in space-y-4">
            <div className="p-6 border-b border-amber-200/80 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100">
                  Historial de Movimientos de Cartera
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Registro detallado de compras fiadas (cargos) y pagos realizados (abonos)
                </p>
              </div>

              {/* Top Bar: Search on Left + Action on Right */}
              <div className="flex items-center gap-3">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSearchCarteraTerm(searchCarteraInput);
                    setCurrentPage(1);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Buscar movimiento..."
                      value={searchCarteraInput}
                      onChange={(e) => {
                        setSearchCarteraInput(e.target.value);
                        if (e.target.value === '') setSearchCarteraTerm('');
                      }}
                      className="w-52 pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    {searchCarteraInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchCarteraInput('');
                          setSearchCarteraTerm('');
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold px-3 whitespace-nowrap"
                  >
                    Buscar
                  </Button>
                </form>

                {(user?.deudaActual || 0) > 0 && (
                  <button
                    onClick={() => {
                      setAbonoMonto(user?.deudaActual || 0);
                      setIsAbonoModalOpen(true);
                    }}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline whitespace-nowrap"
                  >
                    + Abonar ahora
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm">
                Cargando historial de cartera...
              </div>
            ) : filteredTransacciones.length === 0 ? (
              <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-amber-500 opacity-60" />
                <p>No registras transacciones con los filtros aplicados.</p>
              </div>
            ) : (
              <div>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-stone-700 dark:text-stone-300">
                    <thead className="bg-amber-500/10 dark:bg-stone-800/80 text-xs uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                      <tr>
                        <th className="py-3.5 px-6">Tipo</th>
                        <th className="py-3.5 px-6">Concepto / Referencia</th>
                        <th className="py-3.5 px-6">Método de Pago</th>
                        <th className="py-3.5 px-6">Fecha</th>
                        <th className="py-3.5 px-6 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100 dark:divide-stone-800">
                      {filteredTransacciones.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((t) => {
                        const isCargo = t.tipo === 'Cargo_Credito' || t.tipo === 'Cargo_Deuda';
                        return (
                          <tr key={t.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                            <td className="py-4 px-6 font-bold">
                              {isCargo ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                                  <ArrowUpRight className="w-3.5 h-3.5" /> Compra Fiada
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                  <ArrowDownLeft className="w-3.5 h-3.5" /> Abono de Deuda
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 font-medium text-stone-900 dark:text-stone-100">
                              <div>
                                <p>{t.concepto}</p>
                                {t.referenciaPago && (
                                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                                    Ref: {t.referenciaPago}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-stone-600 dark:text-stone-400 text-xs font-semibold">
                              {t.metodoPagoAbono ? (
                                <span className={`px-2 py-0.5 rounded-lg border ${
                                  t.metodoPagoAbono === 'Nequi' 
                                    ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                                }`}>
                                  {t.metodoPagoAbono}
                                </span>
                              ) : isCargo ? (
                                <span className="text-amber-700 dark:text-amber-400">Crédito</span>
                              ) : (
                                <span>Efectivo</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-stone-500 dark:text-stone-400 text-xs">
                              {new Date(t.fecha).toLocaleString('es-CO')}
                            </td>
                            <td className={`py-4 px-6 text-right font-extrabold ${
                              isCargo ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {isCargo ? '+' : '-'}{formatCurrency(t.monto)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="p-4 border-t border-amber-200/80 dark:border-stone-800">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredTransacciones.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setCurrentPage}
                      itemLabel="transacciones de cartera"
                    />
                  </div>
                </div>

                {/* Mobile CardView (10 en 10) */}
                <div className="md:hidden p-4 space-y-3">
                  {filteredTransacciones.slice(0, visibleCarteraMobile).map(t => {
                    const isCargo = t.tipo === 'Cargo_Credito' || t.tipo === 'Cargo_Deuda';
                    return (
                      <div key={t.id} className="p-4 rounded-2xl bg-amber-50/40 dark:bg-stone-950 border border-amber-200/60 dark:border-stone-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">{t.concepto}</span>
                          {isCargo ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">Fiado</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Abono</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-amber-200/40 dark:border-stone-800 text-xs">
                          <span className="text-[10px] text-stone-400">{new Date(t.fecha).toLocaleDateString('es-CO')}</span>
                          <span className={`font-mono font-black text-sm ${isCargo ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isCargo ? '+' : '-'}{formatCurrency(t.monto)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {visibleCarteraMobile < filteredTransacciones.length && (
                    <div className="pt-2 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVisibleCarteraMobile(prev => prev + 10)}
                        className="w-full text-amber-700 dark:text-amber-400 border-amber-500 font-bold"
                      >
                        <ChevronDown className="w-4 h-4 mr-1" /> Cargar 10 movimientos más ({visibleCarteraMobile} de {filteredTransacciones.length})
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: DETALLE DE PEDIDO */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl border border-amber-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-b border-amber-200/80 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-stone-900 dark:text-stone-100">
                    Detalle del Pedido #{selectedPedido.id}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {new Date(selectedPedido.fechaPedido).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPedido(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-stone-200 dark:border-stone-800">
                <span className="text-stone-500">Forma de Pago:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{selectedPedido.tipoPago}</span>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider">Productos Comprados</h4>
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {selectedPedido.detalles?.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-stone-900 dark:text-stone-100">{item.productoNombre || `Producto #${item.productoId}`}</p>
                        <p className="text-stone-500">{item.cantidad} x {formatCurrency(item.precioUnitario || 0)}</p>
                      </div>
                      <span className="font-extrabold text-stone-900 dark:text-stone-100">
                        {formatCurrency(item.subtotal || ((item.cantidad || 1) * (item.precioUnitario || 0)))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between font-heading font-extrabold text-base">
                <span>Total Pedido:</span>
                <span className="text-amber-700 dark:text-amber-400">{formatCurrency(selectedPedido.total)}</span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPedido(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REALIZAR ABONO */}
      {isAbonoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl border border-amber-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent border-b border-amber-200/80 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-stone-900 dark:text-stone-100">
                    Realizar Abono a Mi Deuda
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Deuda actual: <strong className="text-red-600">{formatCurrency(user?.deudaActual || 0)}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAbonoModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleRegistrarAbono} className="p-6 overflow-y-auto space-y-4">
              {abonoMessage && (
                <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
                  abonoMessage.type === 'success'
                    ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                    : 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30'
                }`}>
                  {abonoMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{abonoMessage.text}</span>
                </div>
              )}

              {/* Quick Amount Chips */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                  Selecciona o digita el Monto del Abono ($) *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[10000, 20000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAbonoMonto(amt)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                        abonoMonto === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-500'
                      }`}
                    >
                      {formatCurrency(amt)}
                    </button>
                  ))}
                  {(user?.deudaActual || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => setAbonoMonto(user?.deudaActual || 0)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                        abonoMonto === (user?.deudaActual || 0)
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20'
                      }`}
                    >
                      Pagar Total ({formatCurrency(user?.deudaActual || 0)})
                    </button>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-stone-400 font-bold">$</span>
                  <input
                    type="number"
                    required
                    min={100}
                    value={abonoMonto || ''}
                    onChange={(e) => setAbonoMonto(parseFloat(e.target.value) || 0)}
                    placeholder="Digita el valor..."
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Método de Pago del Abono
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAbonoMetodo('Efectivo')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      abonoMetodo === 'Efectivo'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-extrabold uppercase">Contado / Efectivo</p>
                      <p className="text-[10px] text-stone-500">Pago en caja de la panadería</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAbonoMetodo('Nequi')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      abonoMetodo === 'Nequi'
                        ? 'bg-indigo-500/15 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs font-extrabold uppercase">Nequi (QR / Transf.)</p>
                      <p className="text-[10px] text-stone-500">Transferencia bancaria</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* NEQUI INSTRUCTIONS & VOUCHER UPLOAD */}
              {abonoMetodo === 'Nequi' && (
                <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-stone-950 border border-indigo-200 dark:border-indigo-900/60 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                        Número Nequi Claudipan: <strong className="font-mono text-sm">312 456 7890</strong>
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Titular: Panadería Claudipan S.A.S
                      </p>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-indigo-200 text-center">
                      <QrCode className="w-8 h-8 text-indigo-900 mx-auto" />
                      <span className="text-[8px] font-bold text-stone-500">QR NEQUI</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-indigo-200/60 dark:border-stone-800">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Número de Aprobación / Referencia Nequi *
                      </label>
                      <input
                        type="text"
                        value={abonoReferencia}
                        onChange={(e) => setAbonoReferencia(e.target.value)}
                        placeholder="Ej. M98765432"
                        className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Captura del Comprobante
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => abonoFileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800"
                        >
                          <Camera className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{abonoComprobanteBase64 ? 'Cambiar Captura' : 'Subir Comprobante'}</span>
                        </button>
                        {abonoComprobanteBase64 && (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Adjuntado
                          </span>
                        )}
                        <input
                          ref={abonoFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAbonoFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Concept input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Concepto / Observación (Opcional)
                </label>
                <input
                  type="text"
                  value={abonoConcepto}
                  onChange={(e) => setAbonoConcepto(e.target.value)}
                  placeholder="Ej. Abono nómina / pago quincenal..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAbonoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAbono}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingAbono ? 'Procesando...' : `Registrar Abono de ${formatCurrency(abonoMonto)}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
