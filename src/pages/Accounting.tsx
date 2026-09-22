import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Users, PlusCircle, RefreshCw, AlertCircle, 
  ArrowDownLeft, ArrowUpRight, CheckCircle2, Search, X, FileSpreadsheet, ChevronDown 
} from 'lucide-react';
import { contabilidadService, ResumenContable } from '../services/contabilidadService';
import { pedidoService, TransaccionDeuda } from '../services/pedidoService';
import { authService, UsuarioAdmin } from '../services/authService';
import { Pagination } from '../components/ui/Pagination';
import { exportToExcel } from '../utils/excelExport';
import { Button } from '../components/ui/Button';

export const Accounting: React.FC = () => {
  const [resumen, setResumen] = useState<ResumenContable | null>(null);
  const [transacciones, setTransacciones] = useState<TransaccionDeuda[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
  
  // Search and mobile view
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleMobile, setVisibleMobile] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Form states for registrar abono
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | ''>('');
  const [montoAbono, setMontoAbono] = useState('');
  const [conceptoAbono, setConceptoAbono] = useState('Abono a cartera de cliente');
  const [submittingAbono, setSubmittingAbono] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [resResumen, resTrans, resUsers] = await Promise.all([
      contabilidadService.getResumen(),
      pedidoService.getDeudas(),
      authService.getAllUsers(),
    ]);

    if (resResumen.success && resResumen.data) setResumen(resResumen.data);
    if (resTrans.success && resTrans.data) setTransacciones(resTrans.data);
    if (resUsers.success && resUsers.data) setUsuarios(resUsers.data);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuarioId || !montoAbono) return;

    setSubmittingAbono(true);
    setFormMessage(null);

    const res = await pedidoService.registrarAbono({
      usuarioId: Number(selectedUsuarioId),
      monto: parseFloat(montoAbono),
      concepto: conceptoAbono,
    });

    setSubmittingAbono(false);

    if (res.success) {
      setFormMessage({ type: 'success', text: res.message || 'Abono registrado con éxito' });
      setMontoAbono('');
      fetchData();
      setTimeout(() => {
        setIsAbonoModalOpen(false);
        setFormMessage(null);
      }, 1500);
    } else {
      setFormMessage({ type: 'error', text: res.message || 'Error al registrar el abono' });
    }
  };

  const filteredTransacciones = transacciones.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (t.usuarioNombre && t.usuarioNombre.toLowerCase().includes(term)) ||
      (t.concepto && t.concepto.toLowerCase().includes(term)) ||
      (t.tipo && t.tipo.toLowerCase().includes(term)) ||
      (t.pedidoId && t.pedidoId.toString().includes(term))
    );
  });

  const handleExportExcel = () => {
    exportToExcel<TransaccionDeuda>({
      filename: 'Movimientos_Contables_Cartera_Claudipan',
      sheetName: 'Libro Diario Cartera',
      title: 'Reporte Oficial de Movimientos de Cartera y Abonos - Claudipan',
      data: filteredTransacciones,
      columns: [
        { header: 'ID Movimiento', accessor: (t) => `#${t.id}`, width: 14 },
        { header: 'Fecha', accessor: (t) => new Date(t.fecha).toLocaleString('es-CO'), width: 20 },
        { header: 'Tipo', accessor: (t) => t.tipo === 'Cargo_Deuda' ? 'Cargo a Crédito' : 'Abono Recibido', width: 18 },
        { header: 'Cliente', accessor: (t) => t.usuarioNombre || `Usuario #${t.usuarioId}`, width: 28 },
        { header: 'Concepto / Detalle', accessor: (t) => t.concepto, width: 32 },
        { header: 'Pedido Relacionado', accessor: (t) => t.pedidoId ? `#${t.pedidoId}` : '-', width: 16 },
        { header: 'Monto ($ COP)', accessor: (t) => t.monto, width: 18 },
      ],
    });
  };

  const selectedUserObj = usuarios.find(u => u.id === Number(selectedUsuarioId));

  return (
    <div className="min-h-screen bg-[#FFFBEB]/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent">
              Sistema Contable y Cartera
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              Módulo exclusivo de Contabilidad, Gerencia y Administración para gestión de cartera, cobros y abonos.
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
              onClick={() => setIsAbonoModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Registrar Abono a Cliente
            </button>
          </div>
        </div>

        {/* Resumen KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Ventas Totales</span>
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
              ${(resumen?.totalVentas || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">{resumen?.totalPedidos || 0} pedidos procesados</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Recaudo Efectivo</span>
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400">
              ${(resumen?.totalCobrado || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">Dinero ingresado a caja</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Cartera Por Cobrar</span>
              <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-3xl font-heading font-extrabold text-red-600 dark:text-red-400">
              ${(resumen?.carteraPorCobrar || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">{resumen?.totalClientesConDeuda || 0} clientes pendientes</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Base Clientes Registrados</span>
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
              {usuarios.filter(u => u.rol === 'Cliente').length}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">Clientes en plataforma</p>
          </div>
        </div>

        {/* Transactions list */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-amber-200/80 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100">
                Libro Diario de Movimientos de Cartera
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Historial general de cargos a crédito y abonos recibidos
              </p>
            </div>

            {/* Top Bar: Search on Left + Export on Right */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchTerm(searchInput);
                  setCurrentPage(1);
                }}
                className="flex items-center gap-2"
              >
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar cliente, concepto..."
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      if (e.target.value === '') setSearchTerm('');
                    }}
                    className="w-56 pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        setSearchTerm('');
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

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="text-emerald-700 dark:text-emerald-300 border-emerald-600 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-sm whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1 text-emerald-600" /> Exportar a Excel
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm">
              Cargando movimientos contables...
            </div>
          ) : filteredTransacciones.length === 0 ? (
            <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-amber-500 opacity-60" />
              <p>No se registran movimientos con los filtros aplicados.</p>
            </div>
          ) : (
            <div>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-700 dark:text-stone-300">
                  <thead className="bg-amber-500/10 dark:bg-stone-800/80 text-xs uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                    <tr>
                      <th className="py-3.5 px-6">Tipo</th>
                      <th className="py-3.5 px-6">Cliente</th>
                      <th className="py-3.5 px-6">Concepto</th>
                      <th className="py-3.5 px-6">Pedido</th>
                      <th className="py-3.5 px-6">Fecha</th>
                      <th className="py-3.5 px-6 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 dark:divide-stone-800">
                    {filteredTransacciones.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((t) => (
                      <tr key={t.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold">
                          {t.tipo === 'Cargo_Deuda' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                              <ArrowUpRight className="w-3.5 h-3.5" /> Cargo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                              <ArrowDownLeft className="w-3.5 h-3.5" /> Abono
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-bold text-stone-900 dark:text-stone-100">
                          {t.usuarioNombre || `Usuario #${t.usuarioId}`}
                        </td>
                        <td className="py-4 px-6 text-stone-700 dark:text-stone-300">
                          {t.concepto}
                        </td>
                        <td className="py-4 px-6 text-stone-500 dark:text-stone-400">
                          {t.pedidoId ? `#${t.pedidoId}` : '-'}
                        </td>
                        <td className="py-4 px-6 text-stone-500 dark:text-stone-400 text-xs">
                          {new Date(t.fecha).toLocaleString('es-CO')}
                        </td>
                        <td className={`py-4 px-6 text-right font-extrabold ${
                          t.tipo === 'Cargo_Deuda' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {t.tipo === 'Cargo_Deuda' ? '+' : '-'}${t.monto.toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="p-4 border-t border-amber-200/80 dark:border-stone-800">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredTransacciones.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                    itemLabel="movimientos contables"
                  />
                </div>
              </div>

              {/* Mobile CardView (10 en 10) */}
              <div className="md:hidden p-4 space-y-3">
                {filteredTransacciones.slice(0, visibleMobile).map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-amber-50/40 dark:bg-stone-950 border border-amber-200/60 dark:border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                        {t.usuarioNombre || `Usuario #${t.usuarioId}`}
                      </span>
                      {t.tipo === 'Cargo_Deuda' ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                          Cargo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          Abono
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400">{t.concepto}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-amber-200/40 dark:border-stone-800 text-xs">
                      <span className="text-[10px] text-stone-400">{new Date(t.fecha).toLocaleString('es-CO')}</span>
                      <span className={`font-mono font-black text-sm ${
                        t.tipo === 'Cargo_Deuda' ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {t.tipo === 'Cargo_Deuda' ? '+' : '-'}${t.monto.toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                ))}

                {visibleMobile < filteredTransacciones.length && (
                  <div className="pt-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVisibleMobile(prev => prev + 10)}
                      className="w-full text-amber-700 dark:text-amber-400 border-amber-500 font-bold"
                    >
                      <ChevronDown className="w-4 h-4 mr-1" /> Cargar 10 movimientos más ({visibleMobile} de {filteredTransacciones.length})
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Registrar Abono */}
      {isAbonoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-2xl p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-amber-200/80 dark:border-stone-800 pb-4">
              <h3 className="text-xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
                Registrar Abono a Cartera
              </h3>
              <button
                onClick={() => setIsAbonoModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-bold"
              >
                ✕
              </button>
            </div>

            {formMessage && (
              <div className={`p-4 rounded-2xl border text-sm font-medium flex items-center gap-3 ${
                formMessage.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' 
                  : 'bg-red-500/10 text-red-800 dark:text-red-300 border-red-500/30'
              }`}>
                {formMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <span>{formMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleRegisterAbono} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Seleccionar Cliente
                </label>
                <select
                  value={selectedUsuarioId}
                  onChange={(e) => setSelectedUsuarioId(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="">-- Seleccionar cliente con cartera --</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.email}) - Deuda actual: ${u.deudaActual.toLocaleString('es-CO')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUserObj && (
                <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-stone-800 text-xs space-y-1">
                  <p className="text-stone-800 dark:text-stone-200">
                    Cupo total: <strong>${selectedUserObj.limiteCredito.toLocaleString('es-CO')}</strong>
                  </p>
                  <p className="text-red-600 dark:text-red-400 font-bold">
                    Deuda pendiente actual: ${selectedUserObj.deudaActual.toLocaleString('es-CO')}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Monto a Abonar ($)
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={montoAbono}
                  onChange={(e) => setMontoAbono(e.target.value)}
                  placeholder="Ej. 50000"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Concepto / Detalle
                </label>
                <input
                  type="text"
                  value={conceptoAbono}
                  onChange={(e) => setConceptoAbono(e.target.value)}
                  placeholder="Ej. Pago en caja efectivo"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAbonoModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingAbono}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {submittingAbono ? 'Registrando...' : 'Confirmar Abono'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
