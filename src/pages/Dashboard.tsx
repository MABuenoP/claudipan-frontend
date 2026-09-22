import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/helpers';
import { User, Package, MapPin, Phone, Mail, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { useFeedback } from '../hooks/useFeedback';
import { pedidoService, Pedido } from '../services/pedidoService';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useFeedback();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchPedidos = async () => {
    setLoading(true);
    const res = await pedidoService.getPedidos();
    if (res.success && res.data) {
      setPedidos(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPedidos();
    }
  }, [isAuthenticated]);

  const handleUpdateEstado = async (id: number, nuevoEstado: string) => {
    const res = await pedidoService.updateEstado(id, nuevoEstado);
    if (res.success) {
      showSuccess(`El pedido #${id} ahora se encuentra en estado: ${nuevoEstado}`, 'Estado Actualizado');
      fetchPedidos();
    } else {
      showError(res.message || 'No se pudo actualizar el estado del pedido', 'Error al Actualizar');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-sm">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-stone-900 dark:text-stone-100">Acceso Requerido</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">Inicia sesión con tu cuenta para ver tus pedidos y perfil.</p>
        <Link to="/login">
          <Button variant="primary" size="lg">Iniciar Sesión</Button>
        </Link>
      </div>
    );
  }

  const canEditState = user?.rol === 'Administrador' || user?.rol === 'Secretaria' || user?.rol === 'Tecnico';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-200/50 via-amber-100/40 to-amber-200/50 dark:from-stone-900 dark:via-amber-950/40 dark:to-stone-900 border border-amber-300/80 dark:border-amber-500/20 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-2xl flex items-center justify-center border-2 border-amber-500 shadow-lg">
            {user?.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-bold text-stone-900 dark:text-stone-100">{user?.nombre}</h1>
              <span className="bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                {user?.rol}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPedidos}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-amber-500 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            Actualizar Pedidos
          </button>
          <Link to="/catalog">
            <Button variant="primary" size="sm">Explorar Catálogo</Button>
          </Link>
        </div>
      </div>

      {/* Main content columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-stone-900 dark:text-stone-100">
              {user?.rol === 'Cliente' ? 'Mis Pedidos Recientes' : 'Gestión General de Pedidos Claudipan'}
            </h2>
            <span className="text-xs text-stone-500 font-bold">{pedidos.length} pedidos</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800">
              Cargando historial de pedidos...
            </div>
          ) : pedidos.length === 0 ? (
            <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm space-y-3 bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800">
              <Package className="w-10 h-10 mx-auto text-amber-500 opacity-60" />
              <p>No se encontraron pedidos registrados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 p-5 rounded-3xl space-y-3 hover:border-amber-400 dark:hover:border-amber-500/30 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200/80 dark:border-stone-800 pb-3 gap-2">
                    <div>
                      <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 font-mono">Pedido #{ord.id}</span>
                      <span className="text-[11px] text-stone-500 block">
                        {new Date(ord.fechaPedido).toLocaleString('es-CO')} • {ord.clienteNombre} {ord.esInvitado ? '(Invitado)' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        ord.estado === 'Entregado'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : ord.estado === 'Cancelado'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                      }`}>
                        {ord.estado}
                      </span>

                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-xl border ${
                        ord.tipoPago === 'Credito_Fiado' || ord.tipoPago === 'Credito_Deuda'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : ord.tipoPago === 'Nequi'
                          ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      }`}>
                        {ord.tipoPago === 'Credito_Fiado' || ord.tipoPago === 'Credito_Deuda' 
                          ? 'Fiado (Crédito)' 
                          : ord.tipoPago === 'Nequi' 
                          ? 'Contado Nequi' 
                          : 'Contado Efectivo'}
                      </span>
                    </div>
                  </div>

                  {/* Detalle de productos */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Productos solicitados:</span>
                    <div className="flex flex-wrap gap-2">
                      {ord.detalles.map((d, idx) => (
                        <span key={idx} className="bg-amber-100/60 dark:bg-stone-950 text-stone-800 dark:text-stone-300 text-xs px-2.5 py-1 rounded-xl border border-amber-200/80 dark:border-stone-800 font-medium">
                          {d.cantidad}x {d.productoNombre} ({formatCurrency(d.precioUnitario || 0)})
                        </span>
                      ))}
                    </div>
                  </div>

                  {ord.referenciaPago && (
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 font-mono flex items-center gap-1.5">
                      <span>Referencia Nequi: <strong>{ord.referenciaPago}</strong></span>
                    </p>
                  )}

                  {ord.direccionEntrega && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{ord.direccionEntrega}</span>
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-amber-100 dark:border-stone-800 gap-3">
                    <div className="flex items-center gap-2">
                      {canEditState && (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-stone-500 font-bold">Cambiar Estado:</span>
                          <select
                            value={ord.estado}
                            onChange={(e) => handleUpdateEstado(ord.id, e.target.value)}
                            className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 text-xs font-bold px-2 py-1 rounded-xl border border-stone-200 dark:border-stone-700"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En preparación">En preparación</option>
                            <option value="Listo">Listo</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-stone-500 dark:text-stone-400 block">Total del Pedido</span>
                      <span className="text-xl font-heading font-extrabold text-amber-700 dark:text-amber-400">
                        {formatCurrency(ord.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {pedidos.length > 0 && (
                <div className="pt-2">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={pedidos.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                    itemLabel="pedidos"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info Details Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xl font-heading font-bold text-stone-900 dark:text-stone-100">Información del Perfil</h2>
          <div className="bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300">
              <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-stone-900 dark:text-stone-200">Dirección Registrada</span>
                <span>{user?.direccion || 'No especificada'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300">
              <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-stone-900 dark:text-stone-200">Teléfono Móvil</span>
                <span>{user?.telefono || 'No especificado'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300">
              <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-stone-900 dark:text-stone-200">Correo Electrónico</span>
                <span>{user?.email}</span>
              </div>
            </div>

            {user?.rol === 'Cliente' && (
              <div className="pt-3 border-t border-amber-200/80 dark:border-stone-800 text-xs space-y-1">
                <p className="text-stone-600 dark:text-stone-400">Cupo de Crédito: <strong className="text-stone-900 dark:text-stone-100">${user?.limiteCredito?.toLocaleString('es-CO')}</strong></p>
                <p className="text-stone-600 dark:text-stone-400">Deuda Pendiente: <strong className="text-red-600 dark:text-red-400">${user?.deudaActual?.toLocaleString('es-CO')}</strong></p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
