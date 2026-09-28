import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, Users, PlusCircle, RefreshCw, AlertCircle, 
  ArrowDownLeft, ArrowUpRight, CheckCircle2, Search, X, FileSpreadsheet,
  BookOpen, Scale, ShoppingBag, ShoppingCart, AlertOctagon, BarChart3,
  Calendar, Filter, ShieldCheck, Check, Phone, Eye, CreditCard
} from 'lucide-react';
import { 
  contabilidadService, ResumenContable, LibrosContables, AsientoContable,
  CuentaMayor, LibroVentaItem, LibroCarteraItem, LibroCompraItem, LibroBajaItem,
  EstadoResultados
} from '../services/contabilidadService';
import { pedidoService } from '../services/pedidoService';
import { authService, UsuarioAdmin } from '../services/authService';
import { Pagination } from '../components/ui/Pagination';
import { exportToExcel } from '../utils/excelExport';
import { Button } from '../components/ui/Button';

type TabLibro = 'diario' | 'mayor' | 'ventas' | 'cartera' | 'compras' | 'bajas' | 'pyg';

export const Accounting: React.FC = () => {
  const [resumen, setResumen] = useState<ResumenContable | null>(null);
  const [libros, setLibros] = useState<LibrosContables | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  // Active accounting book tab
  const [activeTab, setActiveTab] = useState<TabLibro>('diario');

  // Date filters
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Search input per tab
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal for registering abono to client
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | ''>('');
  const [montoAbono, setMontoAbono] = useState('');
  const [metodoPagoAbono, setMetodoPagoAbono] = useState('Efectivo');
  const [conceptoAbono, setConceptoAbono] = useState('Abono a cartera de cliente');
  const [referenciaAbono, setReferenciaAbono] = useState('');
  const [submittingAbono, setSubmittingAbono] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResumen, resLibros, resUsers] = await Promise.all([
        contabilidadService.getResumen(),
        contabilidadService.getLibrosContables(fechaInicio || undefined, fechaFin || undefined),
        authService.getAllUsers(),
      ]);

      if (resResumen.success && resResumen.data) setResumen(resResumen.data);
      if (resLibros.success && resLibros.data) setLibros(resLibros.data);
      if (resUsers.success && resUsers.data) setUsuarios(resUsers.data);
    } catch (err) {
      console.error('Error al cargar libros contables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    setCurrentPage(1);
    setSearchInput('');
    setSearchTerm('');
  }, [activeTab]);

  // Quick Date Helpers
  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setFechaInicio(today);
    setFechaFin(today);
  };

  const handleSetThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];
    setFechaInicio(firstDay);
    setFechaFin(today);
  };

  const handleClearDates = () => {
    setFechaInicio('');
    setFechaFin('');
  };

  // Open Abono Modal pre-selecting a user
  const handleOpenAbonoForUser = (userId: number, deuda: number) => {
    setSelectedUsuarioId(userId);
    setMontoAbono(deuda > 0 ? deuda.toString() : '10000');
    setConceptoAbono('Abono a saldo de fiado registrado en módulo contable');
    setIsAbonoModalOpen(true);
  };

  const handleRegisterAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuarioId || !montoAbono) return;

    setSubmittingAbono(true);
    setFormMessage(null);

    const res = await pedidoService.registrarAbono({
      usuarioId: Number(selectedUsuarioId),
      monto: parseFloat(montoAbono),
      metodoPago: metodoPagoAbono,
      concepto: conceptoAbono,
      referenciaPago: metodoPagoAbono === 'Nequi' ? referenciaAbono : undefined,
    });

    setSubmittingAbono(false);

    if (res.success) {
      setFormMessage({ type: 'success', text: res.message || 'Abono registrado con éxito y balances actualizados.' });
      setMontoAbono('');
      setReferenciaAbono('');
      await fetchData();
      setTimeout(() => {
        setIsAbonoModalOpen(false);
        setFormMessage(null);
      }, 1500);
    } else {
      setFormMessage({ type: 'error', text: res.message || 'Error al registrar el abono.' });
    }
  };

  // Filtered lists per active tab
  const filteredDiario = useMemo(() => {
    if (!libros?.libroDiario) return [];
    if (!searchTerm) return libros.libroDiario;
    const term = searchTerm.toLowerCase();
    return libros.libroDiario.filter(a => 
      a.comprobante.toLowerCase().includes(term) ||
      a.tercero.toLowerCase().includes(term) ||
      a.cuentaCodigo.toLowerCase().includes(term) ||
      a.cuentaNombre.toLowerCase().includes(term) ||
      a.detalle.toLowerCase().includes(term)
    );
  }, [libros?.libroDiario, searchTerm]);

  const filteredMayor = useMemo(() => {
    if (!libros?.libroMayor) return [];
    if (!searchTerm) return libros.libroMayor;
    const term = searchTerm.toLowerCase();
    return libros.libroMayor.filter(m => 
      m.codigo.toLowerCase().includes(term) ||
      m.nombre.toLowerCase().includes(term) ||
      m.clase.toLowerCase().includes(term)
    );
  }, [libros?.libroMayor, searchTerm]);

  const filteredVentas = useMemo(() => {
    if (!libros?.libroVentas) return [];
    if (!searchTerm) return libros.libroVentas;
    const term = searchTerm.toLowerCase();
    return libros.libroVentas.filter(v => 
      v.codigoPedido.toLowerCase().includes(term) ||
      v.cliente.toLowerCase().includes(term) ||
      v.tipoPago.toLowerCase().includes(term)
    );
  }, [libros?.libroVentas, searchTerm]);

  const filteredCartera = useMemo(() => {
    if (!libros?.libroCartera) return [];
    if (!searchTerm) return libros.libroCartera;
    const term = searchTerm.toLowerCase();
    return libros.libroCartera.filter(c => 
      c.nombre.toLowerCase().includes(term) ||
      c.cedula.toLowerCase().includes(term) ||
      c.telefono.toLowerCase().includes(term)
    );
  }, [libros?.libroCartera, searchTerm]);

  const filteredCompras = useMemo(() => {
    if (!libros?.libroCompras) return [];
    if (!searchTerm) return libros.libroCompras;
    const term = searchTerm.toLowerCase();
    return libros.libroCompras.filter(c => 
      c.factura.toLowerCase().includes(term) ||
      c.proveedor.toLowerCase().includes(term) ||
      c.insumo.toLowerCase().includes(term)
    );
  }, [libros?.libroCompras, searchTerm]);

  const filteredBajas = useMemo(() => {
    if (!libros?.libroBajas) return [];
    if (!searchTerm) return libros.libroBajas;
    const term = searchTerm.toLowerCase();
    return libros.libroBajas.filter(b => 
      b.producto.toLowerCase().includes(term) ||
      b.motivo.toLowerCase().includes(term)
    );
  }, [libros?.libroBajas, searchTerm]);

  // Export handlers customized per tab
  const handleExportExcel = () => {
    if (activeTab === 'diario') {
      exportToExcel<AsientoContable>({
        filename: 'Libro_Diario_Contable_Claudipan',
        sheetName: 'Libro Diario',
        title: 'Libro Diario Oficial - Registro Cronológico de Asientos Contables (Partida Doble)',
        data: filteredDiario,
        columns: [
          { header: 'No. Asiento', accessor: (a) => `#${a.id}`, width: 14 },
          { header: 'Fecha', accessor: (a) => new Date(a.fecha).toLocaleString('es-CO'), width: 20 },
          { header: 'Comprobante', accessor: (a) => a.comprobante, width: 16 },
          { header: 'Tipo Operación', accessor: (a) => a.tipoOperacion, width: 18 },
          { header: 'Tercero', accessor: (a) => a.tercero, width: 28 },
          { header: 'Código PUC', accessor: (a) => a.cuentaCodigo, width: 14 },
          { header: 'Cuenta Contable', accessor: (a) => a.cuentaNombre, width: 32 },
          { header: 'Detalle / Concepto', accessor: (a) => a.detalle, width: 36 },
          { header: 'Débito ($)', accessor: (a) => a.debito, width: 16 },
          { header: 'Crédito ($)', accessor: (a) => a.credito, width: 16 },
        ],
      });
    } else if (activeTab === 'mayor') {
      exportToExcel<CuentaMayor>({
        filename: 'Libro_Mayor_y_Balances_Claudipan',
        sheetName: 'Mayor y Balances',
        title: 'Libro Mayor y Balances - Estado General de Cuentas PUC',
        data: filteredMayor,
        columns: [
          { header: 'Código PUC', accessor: (m) => m.codigo, width: 14 },
          { header: 'Nombre Cuenta', accessor: (m) => m.nombre, width: 34 },
          { header: 'Clase', accessor: (m) => m.clase, width: 16 },
          { header: 'Naturaleza', accessor: (m) => m.naturaleza, width: 14 },
          { header: 'Total Débitos ($)', accessor: (m) => m.totalDebito, width: 18 },
          { header: 'Total Créditos ($)', accessor: (m) => m.totalCredito, width: 18 },
          { header: 'Saldo Final ($)', accessor: (m) => m.saldoFinal, width: 18 },
        ],
      });
    } else if (activeTab === 'ventas') {
      exportToExcel<LibroVentaItem>({
        filename: 'Libro_Auxiliar_Ventas_Claudipan',
        sheetName: 'Libro de Ventas',
        title: 'Libro Auxiliar de Ventas e Ingresos Operacionales',
        data: filteredVentas,
        columns: [
          { header: 'Ticket / Factura', accessor: (v) => v.codigoPedido, width: 18 },
          { header: 'Fecha', accessor: (v) => new Date(v.fecha).toLocaleString('es-CO'), width: 20 },
          { header: 'Cliente', accessor: (v) => v.cliente, width: 28 },
          { header: 'Método de Pago', accessor: (v) => v.tipoPago, width: 18 },
          { header: 'Estado', accessor: (v) => v.estado, width: 16 },
          { header: 'Total Facturado ($)', accessor: (v) => v.total, width: 18 },
        ],
      });
    } else if (activeTab === 'cartera') {
      exportToExcel<LibroCarteraItem>({
        filename: 'Libro_Auxiliar_Cartera_Clientes_Claudipan',
        sheetName: 'Cartera y Clientes',
        title: 'Libro Auxiliar de Cartera y Cuentas por Cobrar a Clientes (Fiados)',
        data: filteredCartera,
        columns: [
          { header: 'Cliente', accessor: (c) => c.nombre, width: 28 },
          { header: 'Identificación', accessor: (c) => c.cedula, width: 18 },
          { header: 'Teléfono', accessor: (c) => c.telefono, width: 18 },
          { header: 'Cupo Crédito ($)', accessor: (c) => c.limiteCredito, width: 18 },
          { header: 'Deuda Actual ($)', accessor: (c) => c.deudaActual, width: 18 },
          { header: 'Cupo Disponible ($)', accessor: (c) => c.cupoDisponible, width: 18 },
          { header: '% Uso Cupo', accessor: (c) => `${c.porcentajeUso.toFixed(1)}%`, width: 14 },
          { header: 'Total Abonos ($)', accessor: (c) => c.totalAbonos, width: 18 },
          { header: 'Último Movimiento', accessor: (c) => c.ultimoMovimiento ? new Date(c.ultimoMovimiento).toLocaleDateString('es-CO') : 'Sin registro', width: 20 },
        ],
      });
    } else if (activeTab === 'compras') {
      exportToExcel<LibroCompraItem>({
        filename: 'Libro_Auxiliar_Compras_Insumos_Claudipan',
        sheetName: 'Compras Proveedores',
        title: 'Libro Auxiliar de Compras de Materias Primas e Insumos',
        data: filteredCompras,
        columns: [
          { header: 'Factura', accessor: (c) => c.factura, width: 18 },
          { header: 'Proveedor', accessor: (c) => c.proveedor, width: 28 },
          { header: 'Fecha', accessor: (c) => new Date(c.fecha).toLocaleString('es-CO'), width: 20 },
          { header: 'Insumo', accessor: (c) => c.insumo, width: 24 },
          { header: 'Cantidad', accessor: (c) => c.cantidad, width: 14 },
          { header: 'Precio Unitario ($)', accessor: (c) => c.precioUnitario, width: 16 },
          { header: 'Total Compra ($)', accessor: (c) => c.total, width: 18 },
        ],
      });
    } else if (activeTab === 'bajas') {
      exportToExcel<LibroBajaItem>({
        filename: 'Libro_Bajas_y_Mermas_Claudipan',
        sheetName: 'Bajas y Mermas',
        title: 'Libro Auxiliar de Bajas, Mermas y Desperdicios de Panadería',
        data: filteredBajas,
        columns: [
          { header: 'ID Baja', accessor: (b) => `#${b.bajaId}`, width: 14 },
          { header: 'Fecha', accessor: (b) => new Date(b.fecha).toLocaleString('es-CO'), width: 20 },
          { header: 'Producto', accessor: (b) => b.producto, width: 28 },
          { header: 'Cantidad', accessor: (b) => b.cantidad, width: 14 },
          { header: 'Costo Unitario ($)', accessor: (b) => b.costoUnitario, width: 16 },
          { header: 'Costo Pérdida ($)', accessor: (b) => b.costoPerdidaTotal, width: 18 },
          { header: 'Motivo', accessor: (b) => b.motivo, width: 30 },
        ],
      });
    }
  };

  const selectedUserObj = usuarios.find(u => u.id === Number(selectedUsuarioId));

  return (
    <div className="min-h-screen bg-[#FFFBEB]/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-400/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent">
                Sistema Contable & Libros Oficiales
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
              Libro Diario, Mayor y Balances, Auxiliares de Ventas, Cartera, Compras, Mermas y P&G en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-amber-500 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Refrescar libros contables"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              <span className="hidden sm:inline">Refrescar</span>
            </button>

            <button
              onClick={() => {
                setSelectedUsuarioId('');
                setMontoAbono('10000');
                setIsAbonoModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Abono a Cartera</span>
            </button>
          </div>
        </div>

        {/* Resumen KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Ventas Facturadas</span>
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
              ${(resumen?.totalVentas || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">{resumen?.totalPedidos || 0} pedidos entregados</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Recaudo Efectivo & Nequi</span>
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400">
              ${(resumen?.totalCobrado || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Ingresos de caja y cuentas</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Cartera Fiada Por Cobrar</span>
              <CreditCard className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-2xl font-heading font-extrabold text-red-600 dark:text-red-400">
              ${(resumen?.carteraPorCobrar || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">{resumen?.totalClientesConDeuda || 0} clientes con deuda</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Utilidad Operacional Neta</span>
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className={`text-2xl font-heading font-extrabold ${(resumen?.utilidadNeta || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600'}`}>
              ${(resumen?.utilidadNeta || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Pérdidas y Ganancias (P&G)</p>
          </div>
        </div>

        {/* Global Date & Search Filters */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Quick Date Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-bold text-stone-500 dark:text-stone-400 mr-1">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Período:</span>
            </div>

            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-800 dark:text-stone-200"
              title="Fecha inicial"
            />
            <span className="text-xs text-stone-400">a</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-800 dark:text-stone-200"
              title="Fecha final"
            />

            <button
              onClick={handleSetToday}
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={handleSetThisMonth}
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Este Mes
            </button>
            {(fechaInicio || fechaFin) && (
              <button
                onClick={handleClearDates}
                className="px-2 py-1.5 rounded-xl text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                title="Limpiar fechas"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search box & Excel Export button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Filtrar libro activo..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-7 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {activeTab !== 'pyg' && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                onClick={handleExportExcel}
                className="!py-2 !px-3 text-emerald-700 dark:text-emerald-300 border-emerald-600 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-sm text-xs font-bold whitespace-nowrap"
              >
                Excel
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs for All Accounting Books */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-amber-200/80 dark:border-stone-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('diario')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'diario'
                ? 'bg-amber-800 text-white shadow-md shadow-amber-800/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Libro Diario</span>
            {libros?.estaCuadrado && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Balance Cuadrado" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('mayor')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'mayor'
                ? 'bg-amber-800 text-white shadow-md shadow-amber-800/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>2. Mayor y Balances</span>
          </button>

          <button
            onClick={() => setActiveTab('ventas')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ventas'
                ? 'bg-amber-800 text-white shadow-md shadow-amber-800/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>3. Libro de Ventas</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/15 dark:bg-white/10">
              {libros?.libroVentas.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cartera')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cartera'
                ? 'bg-amber-800 text-white shadow-md shadow-amber-800/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>4. Libro de Cartera</span>
            {(resumen?.totalClientesConDeuda || 0) > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-100">
                {resumen?.totalClientesConDeuda}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('compras')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'compras'
                ? 'bg-amber-800 text-white shadow-md shadow-amber-800/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>5. Compras e Insumos</span>
          </button>

          <button
            onClick={() => setActiveTab('bajas')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bajas'
                ? 'bg-amber-800 text-white shadow-md shadow-amber-800/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>6. Bajas y Mermas</span>
          </button>

          <button
            onClick={() => setActiveTab('pyg')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pyg'
                ? 'bg-amber-800 text-white shadow-md shadow-amber-800/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>7. Estado de Resultados (P&G)</span>
          </button>
        </div>

        {/* CONTENT TABS */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm overflow-hidden">

          {/* TAB 1: LIBRO DIARIO */}
          {activeTab === 'diario' && (
            <div>
              <div className="p-5 border-b border-amber-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
                <div>
                  <h2 className="text-base font-heading font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>Libro Diario de Asientos Contables</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-900 dark:text-amber-200">
                      Partida Doble
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Registro sistemático y cronológico de todas las operaciones económicas con cuentas del PUC.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                    libros?.estaCuadrado
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30'
                  }`}>
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>
                      {libros?.estaCuadrado 
                        ? `Balance Cuadrado: $${(libros.totalDebitosDiario).toLocaleString('es-CO')}` 
                        : 'Descuadre en Sumas Iguales'}
                    </span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-stone-500 text-sm">Cargando libro diario...</div>
              ) : filteredDiario.length === 0 ? (
                <div className="p-12 text-center text-stone-500 text-sm">No hay asientos contables en este período.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
                    <thead className="bg-amber-500/10 dark:bg-stone-800/80 uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                      <tr>
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4">Comprobante</th>
                        <th className="py-3 px-4">Tercero</th>
                        <th className="py-3 px-4">Cuenta PUC</th>
                        <th className="py-3 px-4">Detalle Operación</th>
                        <th className="py-3 px-4 text-right">Débito</th>
                        <th className="py-3 px-4 text-right">Crédito</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800/60 font-mono">
                      {filteredDiario.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((a) => (
                        <tr key={a.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="py-3 px-4 font-sans whitespace-nowrap text-stone-500">
                            {new Date(a.fecha).toLocaleDateString('es-CO')} {new Date(a.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-4 font-bold text-amber-900 dark:text-amber-300 whitespace-nowrap">
                            {a.comprobante}
                          </td>
                          <td className="py-3 px-4 font-sans font-bold text-stone-900 dark:text-stone-100 truncate max-w-[160px]">
                            {a.tercero}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-stone-900 dark:text-stone-100 mr-1.5">{a.cuentaCodigo}</span>
                            <span className="font-sans text-[11px] text-stone-500 dark:text-stone-400">{a.cuentaNombre}</span>
                          </td>
                          <td className="py-3 px-4 font-sans text-stone-600 dark:text-stone-300 truncate max-w-[220px]" title={a.detalle}>
                            {a.detalle}
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-blue-700 dark:text-blue-400">
                            {a.debito > 0 ? `$${a.debito.toLocaleString('es-CO')}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-emerald-700 dark:text-emerald-400">
                            {a.credito > 0 ? `$${a.credito.toLocaleString('es-CO')}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-stone-100 dark:bg-stone-850 font-bold border-t-2 border-stone-300 dark:border-stone-700">
                      <tr>
                        <td colSpan={5} className="py-3.5 px-4 font-sans uppercase text-right tracking-wider">
                          Sumas Iguales del Libro Diario:
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-blue-800 dark:text-blue-300 text-sm">
                          ${(libros?.totalDebitosDiario || 0).toLocaleString('es-CO')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-800 dark:text-emerald-300 text-sm">
                          ${(libros?.totalCreditosDiario || 0).toLocaleString('es-CO')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div className="p-4 border-t border-stone-200 dark:border-stone-800">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredDiario.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  itemLabel="asientos contables"
                />
              </div>
            </div>
          )}

          {/* TAB 2: LIBRO MAYOR Y BALANCES */}
          {activeTab === 'mayor' && (
            <div>
              <div className="p-5 border-b border-amber-200/80 dark:border-stone-800 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent">
                <h2 className="text-base font-heading font-extrabold text-stone-900 dark:text-stone-100">
                  Libro Mayor y Balance de Comprobación
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Consolidado de débitos, créditos y saldos netos por cada cuenta PUC del plan único de cuentas.
                </p>
              </div>

              {loading ? (
                <div className="p-12 text-center text-stone-500 text-sm">Cargando libro mayor...</div>
              ) : filteredMayor.length === 0 ? (
                <div className="p-12 text-center text-stone-500 text-sm">No hay cuentas con movimientos registrados.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
                    <thead className="bg-amber-500/10 dark:bg-stone-800/80 uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                      <tr>
                        <th className="py-3.5 px-6">Código PUC</th>
                        <th className="py-3.5 px-6">Nombre de la Cuenta</th>
                        <th className="py-3.5 px-6">Clase</th>
                        <th className="py-3.5 px-6 text-center">Naturaleza</th>
                        <th className="py-3.5 px-6 text-right">Total Débito</th>
                        <th className="py-3.5 px-6 text-right">Total Crédito</th>
                        <th className="py-3.5 px-6 text-right">Saldo Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800/60">
                      {filteredMayor.map((m) => (
                        <tr key={m.codigo} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="py-3.5 px-6 font-mono font-black text-amber-900 dark:text-amber-300">
                            {m.codigo}
                          </td>
                          <td className="py-3.5 px-6 font-bold text-stone-900 dark:text-stone-100">
                            {m.nombre}
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 uppercase">
                              {m.clase}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              m.naturaleza === 'Debito' ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            }`}>
                              {m.naturaleza}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right font-mono font-bold text-blue-700 dark:text-blue-400">
                            ${m.totalDebito.toLocaleString('es-CO')}
                          </td>
                          <td className="py-3.5 px-6 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            ${m.totalCredito.toLocaleString('es-CO')}
                          </td>
                          <td className="py-3.5 px-6 text-right font-mono font-black text-stone-900 dark:text-stone-100">
                            ${m.saldoFinal.toLocaleString('es-CO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIBRO DE VENTAS E INGRESOS */}
          {activeTab === 'ventas' && (
            <div>
              <div className="p-5 border-b border-amber-200/80 dark:border-stone-800 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-heading font-extrabold text-stone-900 dark:text-stone-100">
                    Libro Auxiliar de Ventas e Ingresos
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Historial de tickets, ventas de mostrador y pedidos procesados.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500">Facturación acumulada: </span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    ${(libros?.libroVentas.reduce((acc, v) => acc + v.total, 0) || 0).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-stone-500 text-sm">Cargando libro de ventas...</div>
              ) : filteredVentas.length === 0 ? (
                <div className="p-12 text-center text-stone-500 text-sm">No hay ventas registradas en el período.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
                    <thead className="bg-amber-500/10 dark:bg-stone-800/80 uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                      <tr>
                        <th className="py-3 px-6">Ticket / Código</th>
                        <th className="py-3 px-6">Fecha y Hora</th>
                        <th className="py-3 px-6">Cliente</th>
                        <th className="py-3 px-6">Método Pago</th>
                        <th className="py-3 px-6 text-center">Estado</th>
                        <th className="py-3 px-6 text-right">Total Facturado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800/60">
                      {filteredVentas.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((v) => (
                        <tr key={v.pedidoId} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="py-3 px-6 font-mono font-extrabold text-amber-900 dark:text-amber-300">
                            {v.codigoPedido}
                          </td>
                          <td className="py-3 px-6 text-stone-500">
                            {new Date(v.fecha).toLocaleDateString('es-CO')} {new Date(v.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-6 font-bold text-stone-900 dark:text-stone-100">
                            {v.cliente}
                          </td>
                          <td className="py-3 px-6">
                            <span className={`px-2 py-0.5 rounded-lg font-bold text-[11px] ${
                              v.tipoPago.toLowerCase().includes('fiado') 
                                ? 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30' 
                                : v.tipoPago.toLowerCase().includes('nequi')
                                ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
                                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {v.tipoPago}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-center font-bold text-[11px]">
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                              {v.estado}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right font-mono font-black text-stone-900 dark:text-stone-100 text-sm">
                            ${v.total.toLocaleString('es-CO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-4 border-t border-stone-200 dark:border-stone-800">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredVentas.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  itemLabel="ventas"
                />
              </div>
            </div>
          )}

          {/* TAB 4: LIBRO DE CARTERA (CUENTAS POR COBRAR) */}
          {activeTab === 'cartera' && (
            <div>
              <div className="p-5 border-b border-amber-200/80 dark:border-stone-800 bg-gradient-to-r from-red-500/10 via-transparent to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-heading font-extrabold text-stone-900 dark:text-stone-100">
                    Libro Auxiliar de Cartera y Cuentas por Cobrar
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Control de clientes autorizados con crédito fiado, saldos pendientes y cupos disponibles.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500">Cartera total pendiente: </span>
                  <span className="text-sm font-black text-red-600 dark:text-red-400">
                    ${(resumen?.carteraPorCobrar || 0).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-stone-500 text-sm">Cargando libro de cartera...</div>
              ) : filteredCartera.length === 0 ? (
                <div className="p-12 text-center text-stone-500 text-sm">No hay registros de clientes en cartera.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
                    <thead className="bg-amber-500/10 dark:bg-stone-800/80 uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                      <tr>
                        <th className="py-3 px-6">Cliente</th>
                        <th className="py-3 px-6">Identificación</th>
                        <th className="py-3 px-6">Cupo Crédito</th>
                        <th className="py-3 px-6">Deuda Fiado</th>
                        <th className="py-3 px-6">Cupo Disponible</th>
                        <th className="py-3 px-6 text-center">% Uso Cupo</th>
                        <th className="py-3 px-6 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800/60">
                      {filteredCartera.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((c) => (
                        <tr key={c.usuarioId} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="py-3.5 px-6 font-bold text-stone-900 dark:text-stone-100">
                            <p>{c.nombre}</p>
                            <p className="text-[10px] text-stone-400 font-normal">{c.telefono}</p>
                          </td>
                          <td className="py-3.5 px-6 font-mono text-stone-600 dark:text-stone-400">
                            {c.cedula}
                          </td>
                          <td className="py-3.5 px-6 font-mono font-bold text-blue-700 dark:text-blue-400">
                            ${c.limiteCredito.toLocaleString('es-CO')}
                          </td>
                          <td className="py-3.5 px-6 font-mono font-black text-red-600 dark:text-red-400 text-sm">
                            ${c.deudaActual.toLocaleString('es-CO')}
                          </td>
                          <td className="py-3.5 px-6 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            ${c.cupoDisponible.toLocaleString('es-CO')}
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <div className="w-24 mx-auto space-y-1">
                              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    c.porcentajeUso > 80 ? 'bg-red-500' : c.porcentajeUso > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`} 
                                  style={{ width: `${Math.min(100, c.porcentajeUso)}%` }} 
                                />
                              </div>
                              <span className="text-[10px] font-bold text-stone-500">{c.porcentajeUso.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <button
                              onClick={() => handleOpenAbonoForUser(c.usuarioId, c.deudaActual)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 transition-colors cursor-pointer"
                              title="Registrar abono para este cliente"
                            >
                              + Abonar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-4 border-t border-stone-200 dark:border-stone-800">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredCartera.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  itemLabel="clientes en cartera"
                />
              </div>
            </div>
          )}

          {/* TAB 5: LIBRO DE COMPRAS E INSUMOS */}
          {activeTab === 'compras' && (
            <div>
              <div className="p-5 border-b border-amber-200/80 dark:border-stone-800 bg-gradient-to-r from-purple-500/10 via-transparent to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-heading font-extrabold text-stone-900 dark:text-stone-100">
                    Libro Auxiliar de Compras de Insumos
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Adquisición de materias primas a proveedores para producción.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500">Total en compras: </span>
                  <span className="text-sm font-black text-purple-700 dark:text-purple-400">
                    ${(libros?.libroCompras.reduce((acc, c) => acc + c.total, 0) || 0).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-stone-500 text-sm">Cargando libro de compras...</div>
              ) : filteredCompras.length === 0 ? (
                <div className="p-12 text-center text-stone-500 text-sm">No hay compras registradas en el período.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
                    <thead className="bg-amber-500/10 dark:bg-stone-800/80 uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                      <tr>
                        <th className="py-3 px-6">Factura / Ref</th>
                        <th className="py-3 px-6">Fecha</th>
                        <th className="py-3 px-6">Proveedor</th>
                        <th className="py-3 px-6">Insumo</th>
                        <th className="py-3 px-6 text-center">Cantidad</th>
                        <th className="py-3 px-6 text-right">Precio Unitario</th>
                        <th className="py-3 px-6 text-right">Total Compra</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800/60">
                      {filteredCompras.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((c, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="py-3 px-6 font-mono font-bold text-amber-900 dark:text-amber-300">
                            {c.factura}
                          </td>
                          <td className="py-3 px-6 text-stone-500">
                            {new Date(c.fecha).toLocaleDateString('es-CO')}
                          </td>
                          <td className="py-3 px-6 font-bold text-stone-900 dark:text-stone-100">
                            {c.proveedor}
                          </td>
                          <td className="py-3 px-6 font-medium text-stone-700 dark:text-stone-300">
                            {c.insumo}
                          </td>
                          <td className="py-3 px-6 text-center font-mono font-bold">
                            {c.cantidad}
                          </td>
                          <td className="py-3 px-6 text-right font-mono text-stone-500">
                            ${c.precioUnitario.toLocaleString('es-CO')}
                          </td>
                          <td className="py-3 px-6 text-right font-mono font-black text-purple-700 dark:text-purple-400">
                            ${c.total.toLocaleString('es-CO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-4 border-t border-stone-200 dark:border-stone-800">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredCompras.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  itemLabel="compras"
                />
              </div>
            </div>
          )}

          {/* TAB 6: LIBRO DE BAJAS Y MERMAS */}
          {activeTab === 'bajas' && (
            <div>
              <div className="p-5 border-b border-amber-200/80 dark:border-stone-800 bg-gradient-to-r from-rose-500/10 via-transparent to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-heading font-extrabold text-stone-900 dark:text-stone-100">
                    Libro de Bajas, Mermas y Desperdicios
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Auditoría de panes e insumos descartados con valoración económica de la pérdida.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500">Pérdida acumulada: </span>
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                    ${(libros?.libroBajas.reduce((acc, b) => acc + b.costoPerdidaTotal, 0) || 0).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-stone-500 text-sm">Cargando bajas y mermas...</div>
              ) : filteredBajas.length === 0 ? (
                <div className="p-12 text-center text-stone-500 text-sm">No hay bajas o mermas registradas.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
                    <thead className="bg-amber-500/10 dark:bg-stone-800/80 uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                      <tr>
                        <th className="py-3 px-6">ID Baja</th>
                        <th className="py-3 px-6">Fecha</th>
                        <th className="py-3 px-6">Producto Afectado</th>
                        <th className="py-3 px-6 text-center">Cantidad</th>
                        <th className="py-3 px-6 text-right">Costo Unitario</th>
                        <th className="py-3 px-6 text-right">Pérdida Total</th>
                        <th className="py-3 px-6">Motivo Registrado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800/60">
                      {filteredBajas.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((b) => (
                        <tr key={b.bajaId} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="py-3.5 px-6 font-mono font-bold text-stone-400">
                            #{b.bajaId}
                          </td>
                          <td className="py-3.5 px-6 text-stone-500">
                            {new Date(b.fecha).toLocaleDateString('es-CO')}
                          </td>
                          <td className="py-3.5 px-6 font-bold text-stone-900 dark:text-stone-100">
                            {b.producto}
                          </td>
                          <td className="py-3.5 px-6 text-center font-mono font-bold">
                            {b.cantidad}
                          </td>
                          <td className="py-3.5 px-6 text-right font-mono text-stone-500">
                            ${b.costoUnitario.toLocaleString('es-CO')}
                          </td>
                          <td className="py-3.5 px-6 text-right font-mono font-black text-rose-600 dark:text-rose-400">
                            ${b.costoPerdidaTotal.toLocaleString('es-CO')}
                          </td>
                          <td className="py-3.5 px-6 text-stone-600 dark:text-stone-300">
                            <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                              {b.motivo}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-4 border-t border-stone-200 dark:border-stone-800">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredBajas.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  itemLabel="mermas"
                />
              </div>
            </div>
          )}

          {/* TAB 7: ESTADO DE RESULTADOS (P&G) */}
          {activeTab === 'pyg' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 dark:border-stone-800 pb-4">
                <div>
                  <h2 className="text-lg font-heading font-extrabold text-stone-900 dark:text-stone-100">
                    Estado de Resultados Integral (P&G)
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Demostración oficial de Ingresos, Costos, Gastos Operacionales y Margen de Utilidad Neta.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">Margen Neto Operacional</span>
                  <span className={`text-xl font-heading font-black ${(libros?.estadoResultados.gananciaNeta || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(libros?.estadoResultados.margenNetoPorcentaje || 0).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* P&G Breakdown Table Card */}
              <div className="max-w-3xl mx-auto rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-stone-50/50 dark:bg-stone-950/40 text-xs">
                <div className="divide-y divide-stone-200 dark:divide-stone-800">
                  {/* 1. Ingresos */}
                  <div className="p-3.5 flex items-center justify-between bg-emerald-500/10 font-bold">
                    <span className="text-stone-900 dark:text-stone-100 uppercase tracking-wider">(+) Ingresos Operacionales por Ventas</span>
                    <span className="font-mono text-sm text-emerald-800 dark:text-emerald-300">
                      ${(libros?.estadoResultados.ingresosVentas || 0).toLocaleString('es-CO')}
                    </span>
                  </div>

                  {/* 2. Costo de Ventas */}
                  <div className="p-3.5 flex items-center justify-between pl-6 text-stone-600 dark:text-stone-400">
                    <span>(-) Costo Estimado de Ventas (Materia Prima / Insumos)</span>
                    <span className="font-mono font-bold text-red-600">
                      ${(libros?.estadoResultados.costoVentas || 0).toLocaleString('es-CO')}
                    </span>
                  </div>

                  {/* 3. Utilidad Bruta */}
                  <div className="p-3.5 flex items-center justify-between bg-amber-500/10 font-extrabold">
                    <span className="text-amber-950 dark:text-amber-200 uppercase tracking-wider">(=) Utilidad Bruta</span>
                    <span className="font-mono text-sm text-amber-900 dark:text-amber-300">
                      ${(libros?.estadoResultados.gananciaBruta || 0).toLocaleString('es-CO')}
                    </span>
                  </div>

                  {/* 4. Gastos de Nómina */}
                  <div className="p-3.5 flex items-center justify-between pl-6 text-stone-600 dark:text-stone-400">
                    <span>(-) Gastos de Personal y Nómina</span>
                    <span className="font-mono font-bold text-red-600">
                      ${(libros?.estadoResultados.gastosNomina || 0).toLocaleString('es-CO')}
                    </span>
                  </div>

                  {/* 5. Gastos de Servicios */}
                  <div className="p-3.5 flex items-center justify-between pl-6 text-stone-600 dark:text-stone-400">
                    <span>(-) Gastos de Servicios Públicos (Gas del Horno, Luz, Agua)</span>
                    <span className="font-mono font-bold text-red-600">
                      ${(libros?.estadoResultados.gastosServiciosPublicos || 0).toLocaleString('es-CO')}
                    </span>
                  </div>

                  {/* 6. Otros Gastos */}
                  <div className="p-3.5 flex items-center justify-between pl-6 text-stone-600 dark:text-stone-400">
                    <span>(-) Otros Gastos Operativos</span>
                    <span className="font-mono font-bold text-red-600">
                      ${(libros?.estadoResultados.otrosGastosOperativos || 0).toLocaleString('es-CO')}
                    </span>
                  </div>

                  {/* 7. Pérdidas por Mermas */}
                  <div className="p-3.5 flex items-center justify-between pl-6 text-stone-600 dark:text-stone-400">
                    <span>(-) Pérdidas Extraordinarias por Bajas y Mermas</span>
                    <span className="font-mono font-bold text-red-600">
                      ${(libros?.estadoResultados.perdidasBajasMermas || 0).toLocaleString('es-CO')}
                    </span>
                  </div>

                  {/* 8. Utilidad Neta */}
                  <div className="p-4 flex items-center justify-between bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-black text-sm">
                    <span className="uppercase tracking-wider">(=) UTILIDAD NETA DEL EJERCICIO</span>
                    <span className="font-mono text-base">
                      ${(libros?.estadoResultados.gananciaNeta || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL: REGISTRAR ABONO A CLIENTE */}
      {isAbonoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl border border-amber-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent border-b border-amber-200/80 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-stone-900 dark:text-stone-100">
                    Registrar Abono a Cartera
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Abonar al saldo fiado y actualizar libros contables
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAbonoModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRegisterAbono} className="p-6 space-y-4">
              {formMessage && (
                <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
                  formMessage.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' 
                    : 'bg-red-500/10 text-red-800 dark:text-red-300 border-red-500/30'
                }`}>
                  {formMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <span>{formMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  1. Seleccionar Cliente *
                </label>
                <select
                  value={selectedUsuarioId}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : '';
                    setSelectedUsuarioId(id);
                    const user = usuarios.find(u => u.id === id);
                    if (user && user.deudaActual > 0) {
                      setMontoAbono(user.deudaActual.toString());
                    }
                  }}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
                >
                  <option value="">-- Selecciona el cliente --</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} (CC: {u.cedula || 'N/A'}) - Deuda: ${u.deudaActual.toLocaleString('es-CO')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUserObj && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-stone-800 border border-amber-500/20 text-xs grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase block font-bold">Cupo Asignado</span>
                    <span className="font-extrabold text-blue-700 dark:text-blue-300">
                      ${selectedUserObj.limiteCredito.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase block font-bold">Deuda Actual</span>
                    <span className="font-extrabold text-red-600">
                      ${selectedUserObj.deudaActual.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase block font-bold">Cupo Libre</span>
                    <span className="font-extrabold text-emerald-600">
                      ${Math.max(0, selectedUserObj.limiteCredito - selectedUserObj.deudaActual).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  2. Monto a Abonar ($) *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedUserObj && selectedUserObj.deudaActual > 0 && (
                    <button
                      type="button"
                      onClick={() => setMontoAbono(selectedUserObj.deudaActual.toString())}
                      className="px-2.5 py-1 rounded-xl bg-red-500/15 text-red-700 dark:text-red-300 text-xs font-bold border border-red-500/30 cursor-pointer"
                    >
                      Pagar Total (${selectedUserObj.deudaActual.toLocaleString('es-CO')})
                    </button>
                  )}
                  {[10000, 20000, 50000, 100000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMontoAbono(amt.toString())}
                      className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold border border-stone-200 dark:border-stone-700 hover:border-emerald-500 cursor-pointer"
                    >
                      ${amt.toLocaleString('es-CO')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="100"
                  step="any"
                  value={montoAbono}
                  onChange={(e) => setMontoAbono(e.target.value)}
                  placeholder="Digita el valor..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  3. Método de Pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPagoAbono('Efectivo')}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      metodoPagoAbono === 'Efectivo'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Efectivo / Caja</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPagoAbono('Nequi')}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      metodoPagoAbono === 'Nequi'
                        ? 'bg-indigo-500/15 border-indigo-500 text-indigo-900 dark:text-indigo-200'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>Nequi / Transf.</span>
                  </button>
                </div>
              </div>

              {metodoPagoAbono === 'Nequi' && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Número de Aprobación Nequi
                  </label>
                  <input
                    type="text"
                    value={referenciaAbono}
                    onChange={(e) => setReferenciaAbono(e.target.value)}
                    placeholder="Ej. M12345678"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  4. Concepto / Detalle
                </label>
                <input
                  type="text"
                  value={conceptoAbono}
                  onChange={(e) => setConceptoAbono(e.target.value)}
                  placeholder="Ej. Abono en efectivo en mostrador"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAbonoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingAbono}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
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

export default Accounting;
