import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../hooks/useFeedback';
import { pedidoService, Pedido } from '../services/pedidoService';
import { formatCurrency } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { LoadingModal } from '../components/ui/LoadingModal';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  DollarSign,
  CreditCard,
  Smartphone,
  Printer,
  X,
  AlertTriangle,
  FileText,
  User,
  ShieldCheck,
  Edit,
  ArrowRight,
  Package
} from 'lucide-react';

export const Pedidos: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useFeedback();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<'Todos' | 'Pendiente' | 'Entregado'>('Pendiente');
  const [filterTipoPago, setFilterTipoPago] = useState<string>('Todos');

  // Modal Ver Ticket
  const [selectedPedidoTicket, setSelectedPedidoTicket] = useState<Pedido | null>(null);

  // Modal Entregar Pedido
  const [pedidoToDeliver, setPedidoToDeliver] = useState<Pedido | null>(null);
  const [deliverTipoPago, setDeliverTipoPago] = useState<'Efectivo' | 'Transferencia' | 'Credito_Fiado'>('Efectivo');
  const [deliverReferencia, setDeliverReferencia] = useState('');
  const [deliverObservaciones, setDeliverObservaciones] = useState('');
  const [isDelivering, setIsDelivering] = useState(false);

  // Modal Editar Pedido
  const [pedidoToEdit, setPedidoToEdit] = useState<Pedido | null>(null);
  const [editDireccion, setEditDireccion] = useState('');
  const [editMetodoEntrega, setEditMetodoEntrega] = useState('Mostrador');
  const [editObservaciones, setEditObservaciones] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const res = await pedidoService.getAll();
      if (res.success && res.data) {
        setPedidos(res.data);
      }
    } catch {
      showError('Error al cargar la lista de pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  // Filtered pedidos
  const filteredPedidos = pedidos.filter((p) => {
    const matchesEstado = filterEstado === 'Todos' || p.estado === filterEstado;
    const matchesTipoPago = filterTipoPago === 'Todos' || p.tipoPago === filterTipoPago;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (p.codigoTicket && p.codigoTicket.toLowerCase().includes(query)) ||
      p.clienteNombre.toLowerCase().includes(query) ||
      (p.id.toString().includes(query));

    return matchesEstado && matchesTipoPago && matchesSearch;
  });

  // Open Deliver Modal
  const handleOpenDeliver = (pedido: Pedido) => {
    setPedidoToDeliver(pedido);
    const validTipoPago = (pedido.tipoPago === 'Credito_Fiado' && !pedido.esInvitado) 
      ? 'Credito_Fiado' 
      : pedido.tipoPago === 'Nequi' || pedido.tipoPago === 'Transferencia'
      ? 'Transferencia'
      : 'Efectivo';
    setDeliverTipoPago(validTipoPago);
    setDeliverReferencia(pedido.referenciaPago || '');
    setDeliverObservaciones(pedido.observaciones || '');
  };

  // Confirm Deliver
  const handleConfirmDeliver = async () => {
    if (!pedidoToDeliver) return;

    if (deliverTipoPago === 'Credito_Fiado' && pedidoToDeliver.esInvitado) {
      showWarning('El Cliente de Paso no puede comprar a crédito. Debe pagar en efectivo o transferencia.');
      return;
    }

    setIsDelivering(true);
    try {
      const res = await pedidoService.entregar(pedidoToDeliver.id, {
        tipoPago: deliverTipoPago,
        referenciaPago: deliverReferencia.trim() || undefined,
        observaciones: deliverObservaciones.trim() || undefined
      });

      if (res.success) {
        showSuccess(
          `¡Pedido #${pedidoToDeliver.id} entregado con éxito! Se descontó del inventario de productos y se registró la venta.`
        );
        setPedidoToDeliver(null);
        await fetchPedidos();
      } else {
        showError(res.message || 'Error al procesar la entrega del pedido');
      }
    } catch (err: any) {
      showError(err.message || 'Error al comunicar con el servidor');
    } finally {
      setIsDelivering(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (pedido: Pedido) => {
    setPedidoToEdit(pedido);
    setEditDireccion(pedido.direccionEntrega || '');
    setEditMetodoEntrega(pedido.metodoEntrega || 'Mostrador');
    setEditObservaciones(pedido.observaciones || '');
  };

  // Confirm Edit
  const handleConfirmEdit = async () => {
    if (!pedidoToEdit) return;

    setIsUpdating(true);
    try {
      const res = await pedidoService.updatePedido(pedidoToEdit.id, {
        direccionEntrega: editDireccion,
        metodoEntrega: editMetodoEntrega,
        observaciones: editObservaciones
      });

      if (res.success) {
        showSuccess(`Pedido #${pedidoToEdit.id} actualizado correctamente`);
        setPedidoToEdit(null);
        await fetchPedidos();
      } else {
        showError(res.message || 'Error al actualizar el pedido');
      }
    } catch (err: any) {
      showError(err.message || 'Error de conexión');
    } finally {
      setIsUpdating(false);
    }
  };

  const printTicket = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
                Gestión de Pedidos & Despachos
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Verifica compras, formas de pago y entrega productos descontando stock en tiempo real
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchPedidos}
          className="self-start sm:self-auto cursor-pointer"
        >
          Actualizar Lista
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* State Tabs */}
        <div className="flex bg-amber-100/60 dark:bg-stone-900 p-1 rounded-2xl border border-amber-200/80 dark:border-stone-800 self-start">
          {(['Pendiente', 'Entregado', 'Todos'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFilterEstado(estado)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                filterEstado === estado
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {estado === 'Pendiente' ? '⏳ Pendientes' : estado === 'Entregado' ? '✅ Entregados' : '📋 Todos'}
            </button>
          ))}
        </div>

        {/* Search & Payment Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-md ml-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Ticket, cliente o ID..."
              className="w-full bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs px-3.5 py-2.5 pl-9 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>

          <select
            value={filterTipoPago}
            onChange={(e) => setFilterTipoPago(e.target.value)}
            className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs px-3 py-2.5 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500 shadow-sm cursor-pointer"
          >
            <option value="Todos">Todos los Pagos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Nequi">Nequi / Transferencia</option>
            <option value="Credito_Fiado">Crédito (Fiado)</option>
          </select>
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 dark:text-stone-400">
            Cargando pedidos...
          </div>
        ) : filteredPedidos.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto" />
            <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
              No se encontraron pedidos con los filtros seleccionados
            </p>
            <p className="text-xs text-stone-500">
              Prueba cambiando el estado o el término de búsqueda
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/70 dark:bg-stone-950/60 border-b border-amber-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 uppercase tracking-wider font-extrabold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Ticket / ID</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Entrega</th>
                  <th className="py-3.5 px-4">Pago</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 dark:divide-stone-800/60 text-stone-800 dark:text-stone-200">
                {filteredPedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40 transition-colors">
                    
                    {/* Ticket */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-stone-800 px-2 py-1 rounded-lg border border-amber-300/50 dark:border-stone-700">
                        {pedido.codigoTicket || `#${pedido.id}`}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400">
                      {new Date(pedido.fechaPedido).toLocaleDateString()} {new Date(pedido.fechaPedido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Cliente */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        {pedido.clienteNombre}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {pedido.esInvitado ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">Cliente de Paso</span>
                        ) : (
                          <span>Registrado • {pedido.clienteEmail}</span>
                        )}
                      </div>
                    </td>

                    {/* Entrega */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {pedido.metodoEntrega === 'Domicilio' ? (
                          <>
                            <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-semibold text-blue-700 dark:text-blue-300">Domicilio (+{formatCurrency(pedido.costoEnvio || 5000)})</span>
                          </>
                        ) : (
                          <>
                            <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-semibold text-amber-800 dark:text-amber-300">Mostrador</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Pago */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold">
                        {pedido.tipoPago === 'Credito_Fiado' ? (
                          <span className="text-amber-700 dark:text-amber-400">Crédito (Fiado)</span>
                        ) : pedido.tipoPago === 'Nequi' ? (
                          <span className="text-indigo-600 dark:text-indigo-400">Nequi / Transferencia</span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400">Efectivo</span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {pedido.estadoPago === 'Pagado' ? (
                          <span className="text-emerald-600 font-semibold">✓ Pagado</span>
                        ) : (
                          <span className="text-amber-600 font-semibold">⏳ Pendiente de Cobro</span>
                        )}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 text-right font-extrabold text-stone-900 dark:text-stone-100">
                      {formatCurrency(pedido.total)}
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          pedido.estado === 'Entregado'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40 animate-pulse'
                        }`}
                      >
                        {pedido.estado === 'Entregado' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Entregado
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" /> Pendiente
                          </>
                        )}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Ver Ticket */}
                        <button
                          onClick={() => setSelectedPedidoTicket(pedido)}
                          title="Ver Ticket de Reclamo"
                          className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-amber-700 dark:text-amber-400 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Editar */}
                        {pedido.estado === 'Pendiente' && (
                          <button
                            onClick={() => handleOpenEdit(pedido)}
                            title="Editar Datos de Entrega"
                            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* Entregar */}
                        {pedido.estado === 'Pendiente' && (
                          <button
                            onClick={() => handleOpenDeliver(pedido)}
                            title="Entregar y Despachar Pedido"
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Entregar
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: VER TICKET DE RECLAMO                       */}
      {/* ---------------------------------------------------- */}
      {selectedPedidoTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-600/40 rounded-3xl shadow-2xl p-6 text-stone-900 dark:text-stone-100 animate-scale-up space-y-5 print:shadow-none print:border-none print:p-0">
            
            <button
              onClick={() => setSelectedPedidoTicket(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ticket Header */}
            <div className="text-center space-y-1 border-b border-dashed border-amber-300 pb-4">
              <div className="text-2xl font-extrabold tracking-tight text-amber-800 dark:text-amber-400">
                🥐 CLAUDIPAN ARTESANAL 🥖
              </div>
              <p className="text-[11px] text-stone-500">
                Proyecto Formativo SENA ADSO • Cra 5 # 10-20
              </p>
              <div className="mt-3 py-2 px-4 bg-amber-50 dark:bg-stone-800 rounded-2xl border border-amber-200 dark:border-stone-700 inline-block">
                <span className="block text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 tracking-wider">
                  Ticket de Reclamo / Pedido
                </span>
                <span className="font-mono text-2xl font-black text-amber-900 dark:text-amber-200 tracking-widest">
                  {selectedPedidoTicket.codigoTicket || `#${selectedPedidoTicket.id}`}
                </span>
              </div>
            </div>

            {/* Ticket Info */}
            <div className="space-y-2 text-xs border-b border-dashed border-amber-300 pb-3 text-stone-700 dark:text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-500">Fecha y Hora:</span>
                <span className="font-semibold">
                  {new Date(selectedPedidoTicket.fechaPedido).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Cliente:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {selectedPedidoTicket.clienteNombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Forma de Entrega:</span>
                <span className="font-bold text-amber-800 dark:text-amber-400">
                  {selectedPedidoTicket.metodoEntrega === 'Domicilio' ? '🛵 Envío a Domicilio' : '🏪 Retiro en Mostrador'}
                </span>
              </div>
              {selectedPedidoTicket.direccionEntrega && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Dirección:</span>
                  <span className="font-medium text-right max-w-[200px] truncate">
                    {selectedPedidoTicket.direccionEntrega}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Forma de Pago:</span>
                <span className="font-bold">
                  {selectedPedidoTicket.tipoPago === 'Credito_Fiado' ? 'Crédito (Fiado)' : selectedPedidoTicket.tipoPago}
                </span>
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-2 border-b border-dashed border-amber-300 pb-4 text-xs">
              <div className="font-bold text-[11px] text-stone-500 uppercase tracking-wider mb-2">
                Productos Solicitados
              </div>
              {selectedPedidoTicket.detalles.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span>
                    <strong className="text-amber-800 dark:text-amber-400">{item.cantidad}x</strong>{' '}
                    {item.productoNombre}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(item.subtotal || (item.precioUnitario || 0) * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
              <div className="flex justify-between">
                <span>Subtotal Productos:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedPedidoTicket.total - (selectedPedidoTicket.costoEnvio || 0))}
                </span>
              </div>
              {selectedPedidoTicket.costoEnvio ? (
                <div className="flex justify-between text-blue-600 font-semibold">
                  <span>Costo de Envío:</span>
                  <span>+{formatCurrency(selectedPedidoTicket.costoEnvio)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-extrabold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-800">
                <span>TOTAL:</span>
                <span className="text-amber-800 dark:text-amber-300">
                  {formatCurrency(selectedPedidoTicket.total)}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex gap-3 print:hidden">
              <Button
                variant="secondary"
                size="md"
                onClick={printTicket}
                className="flex-1 cursor-pointer"
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Imprimir Ticket
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setSelectedPedidoTicket(null)}
                className="cursor-pointer"
              >
                Cerrar
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: ENTREGAR Y CONFIRMAR PAGO DEL PEDIDO        */}
      {/* ---------------------------------------------------- */}
      {pedidoToDeliver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-600/40 rounded-3xl shadow-2xl p-6 text-stone-900 dark:text-stone-100 animate-scale-up space-y-5">
            
            <button
              onClick={() => setPedidoToDeliver(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-200/80 dark:border-stone-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Entregar Pedido #{pedidoToDeliver.id}
                </h3>
                <p className="text-xs text-stone-500">
                  Ticket: <strong className="font-mono text-amber-700 dark:text-amber-400">{pedidoToDeliver.codigoTicket || `#${pedidoToDeliver.id}`}</strong> • {pedidoToDeliver.clienteNombre}
                </p>
              </div>
            </div>

            {/* Resumen de Productos a Descontar */}
            <div className="p-3.5 bg-amber-50/60 dark:bg-stone-950/60 rounded-2xl border border-amber-200/80 dark:border-stone-800 space-y-2 text-xs">
              <div className="font-bold text-[11px] text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                Productos a Despachar (Se descontarán del Stock):
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {pedidoToDeliver.detalles.map((det, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {det.cantidad}x {det.productoNombre}
                    </span>
                    <span className="text-stone-500">
                      {formatCurrency((det.precioUnitario || 0) * det.cantidad)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-amber-200 dark:border-stone-800 flex justify-between font-bold text-sm">
                <span>Total a Cancelar:</span>
                <span className="text-amber-800 dark:text-amber-300">
                  {formatCurrency(pedidoToDeliver.total)}
                </span>
              </div>
            </div>

            {/* Opciones de Confirmación de Pago */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                Confirmar Medio de Pago del Cliente:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliverTipoPago('Efectivo')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    deliverTipoPago === 'Efectivo'
                      ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                  }`}
                >
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs block">Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliverTipoPago('Transferencia')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    deliverTipoPago === 'Transferencia'
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                  <span className="text-xs block">Transferencia</span>
                </button>

                <button
                  type="button"
                  disabled={pedidoToDeliver.esInvitado}
                  onClick={() => setDeliverTipoPago('Credito_Fiado')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    pedidoToDeliver.esInvitado
                      ? 'opacity-40 cursor-not-allowed border-stone-200 dark:border-stone-800'
                      : deliverTipoPago === 'Credito_Fiado'
                      ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold shadow-sm cursor-pointer'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 cursor-pointer'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <span className="text-xs block">A Crédito</span>
                </button>
              </div>

              {pedidoToDeliver.esInvitado && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                  ℹ️ El Cliente de Paso no puede comprar a crédito. Solo aplica Efectivo o Transferencia.
                </p>
              )}
            </div>

            {/* Referencia si es Transferencia */}
            {deliverTipoPago === 'Transferencia' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Número de Aprobación o Referencia
                </label>
                <input
                  type="text"
                  value={deliverReferencia}
                  onChange={(e) => setDeliverReferencia(e.target.value)}
                  placeholder="Ej. Nequi #123456"
                  className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs px-3.5 py-2.5 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Observaciones */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Observaciones de Entrega
              </label>
              <input
                type="text"
                value={deliverObservaciones}
                onChange={(e) => setDeliverObservaciones(e.target.value)}
                placeholder="Notas de entrega o despacho..."
                className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs px-3.5 py-2.5 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleConfirmDeliver}
                className="w-full cursor-pointer shadow-lg shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white"
                isLoading={isDelivering}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Entregar & Descontar de Inventario
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPedidoToDeliver(null)}
                className="cursor-pointer text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                Cancelar
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: EDITAR PEDIDO PENDIENTE                     */}
      {/* ---------------------------------------------------- */}
      {pedidoToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-600/40 rounded-3xl shadow-2xl p-6 text-stone-900 dark:text-stone-100 animate-scale-up space-y-4">
            
            <button
              onClick={() => setPedidoToEdit(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-amber-200 pb-2">
              Editar Pedido #{pedidoToEdit.id}
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Método de Entrega
                </label>
                <select
                  value={editMetodoEntrega}
                  onChange={(e) => setEditMetodoEntrega(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs px-3.5 py-2.5 rounded-2xl border border-amber-200 dark:border-stone-800"
                >
                  <option value="Mostrador">Retiro en Mostrador</option>
                  <option value="Domicilio">Envío a Domicilio</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Dirección de Entrega
                </label>
                <input
                  type="text"
                  value={editDireccion}
                  onChange={(e) => setEditDireccion(e.target.value)}
                  placeholder="Dirección..."
                  className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs px-3.5 py-2.5 rounded-2xl border border-amber-200 dark:border-stone-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Observaciones
                </label>
                <input
                  type="text"
                  value={editObservaciones}
                  onChange={(e) => setEditObservaciones(e.target.value)}
                  placeholder="Notas adicionales..."
                  className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-xs px-3.5 py-2.5 rounded-2xl border border-amber-200 dark:border-stone-800"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={handleConfirmEdit}
                isLoading={isUpdating}
                className="w-full cursor-pointer"
              >
                Guardar Cambios
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPedidoToEdit(null)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
