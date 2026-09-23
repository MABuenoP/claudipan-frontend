import React, { useState, useEffect } from 'react';
import { gastoService, Gasto } from '../services/gastoService';
import { formatCurrency } from '../utils/helpers';
import { 
  Receipt, Plus, Zap, Droplet, Users, Wrench, 
  Trash2, RefreshCw, X, DollarSign, 
  Edit2, AlertCircle, Info, Calculator, FileSpreadsheet, Sparkles, Brush, Search
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../hooks/useFeedback';
import { exportToExcel } from '../utils/excelExport';
import { LoadingModal } from '../components/ui/LoadingModal';

export const GastosNomina: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showConfirm } = useFeedback();
  const userRole = user?.rol || '';
  const canExportExcel = userRole === 'Administrador' || userRole === 'Gerente' || userRole === 'Contador' || userRole === 'Contable';
  const canManage = userRole === 'Administrador' || userRole === 'Gerente' || userRole === 'Contador' || userRole === 'Contable';

  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [visibleMobileCount, setVisibleMobileCount] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal 1: Selector de Tipo de Gasto
  const [showSelectorModal, setShowSelectorModal] = useState(false);

  // Modal 2: Formulario Crear / Editar
  const [showModal, setShowModal] = useState(false);
  const [editingGastoId, setEditingGastoId] = useState<number | null>(null);
  const [tipoGasto, setTipoGasto] = useState<string>('ServicioPublico');
  const [categoriaGasto, setCategoriaGasto] = useState<string>('Luz');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState<number>(180000);
  const [beneficiario, setBeneficiario] = useState('Electrificadora de Santander ESSA');
  const [metodoPago, setMetodoPago] = useState('Transferencia');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Specific Payroll Fields
  const [sueldoBase, setSueldoBase] = useState<number>(1400000);
  const [horasExtrasBonos, setHorasExtrasBonos] = useState<number>(0);
  const [deducciones, setDeducciones] = useState<number>(0);
  const [cargoEmpleado, setCargoEmpleado] = useState<string>('Panadero Principal');
  const [periodoNomina, setPeriodoNomina] = useState<string>('1ra Quincena');

  // Specific Maintenance Fields
  const [equipoIntervenido, setEquipoIntervenido] = useState<string>('Horno Rotatorio a Gas');
  const [tipoMantenimiento, setTipoMantenimiento] = useState<string>('Preventivo');
  const [tecnicoEmpresa, setTecnicoEmpresa] = useState<string>('Servicio Técnico Especializado Hornos Santander');

  // Specific Cleaning / Supplies Fields
  const [articuloLimpieza, setArticuloLimpieza] = useState<string>('Detergente Industrial & Desengrasante de Bandejas');

  const fetchGastos = async () => {
    setLoading(true);
    const res = await gastoService.getAll();
    if (res.success && res.data) {
      setGastos(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGastos();
  }, []);

  // Open modal in Create Mode with sensible defaults for the selected type
  const handleOpenCreateModal = (forcedTipo?: string) => {
    setEditingGastoId(null);
    const targetTipo = forcedTipo || (
      selectedFilter === 'servicios' ? 'ServicioPublico' :
      selectedFilter === 'nomina' ? 'Nomina' :
      selectedFilter === 'limpieza' ? 'Limpieza' :
      selectedFilter === 'mantenimiento' ? 'Mantenimiento' : 'ServicioPublico'
    );

    setTipoGasto(targetTipo);

    if (targetTipo === 'ServicioPublico') {
      setCategoriaGasto('Luz');
      setBeneficiario('Electrificadora de Santander ESSA');
      setMonto(180000);
      setDescripcion('Factura mensual de energía eléctrica - Claudipan');
      setNumeroComprobante(`REC-ESSA-${Math.floor(Math.random()*90000+10000)}`);
      setMetodoPago('Transferencia');
    } else if (targetTipo === 'Nomina') {
      setCategoriaGasto('Nomina');
      setCargoEmpleado('Panadero Principal');
      setBeneficiario('Carlos Andrés Rodríguez');
      setPeriodoNomina('1ra Quincena Mes');
      setSueldoBase(850000);
      setHorasExtrasBonos(50000);
      setDeducciones(0);
      const total = 850000 + 50000 - 0;
      setMonto(total);
      setDescripcion(`Pago de Nómina: Panadero Principal - 1ra Quincena`);
      setNumeroComprobante(`NOM-${Math.floor(Math.random()*9000+1000)}`);
      setMetodoPago('Transferencia');
    } else if (targetTipo === 'Limpieza') {
      setCategoriaGasto('Aseo');
      setArticuloLimpieza('Detergente Industrial & Desengrasante de Bandejas');
      setBeneficiario('Distribuidora de Químicos y Aseo Santander');
      setMonto(75000);
      setDescripcion('Compra de insumos de limpieza y desinfección de bandejas');
      setNumeroComprobante(`LIMP-${Math.floor(Math.random()*9000+1000)}`);
      setMetodoPago('Efectivo');
    } else if (targetTipo === 'Mantenimiento') {
      setCategoriaGasto('Mantenimiento');
      setEquipoIntervenido('Horno Rotatorio a Gas');
      setTipoMantenimiento('Preventivo');
      setTecnicoEmpresa('Técnicos Industriales Hornos Santander');
      setBeneficiario('Técnicos Industriales Hornos Santander');
      setMonto(220000);
      setDescripcion('Mantenimiento preventivo, calibración de quemadores y termostato');
      setNumeroComprobante(`MNT-${Math.floor(Math.random()*9000+1000)}`);
      setMetodoPago('Transferencia');
    } else {
      setCategoriaGasto('Varios');
      setBeneficiario('Distribuidora Local');
      setMonto(50000);
      setDescripcion('Gastos varios de operación y suministros');
      setNumeroComprobante(`REC-${Math.floor(Math.random()*90000+10000)}`);
      setMetodoPago('Efectivo');
    }

    setShowModal(true);
  };

  // Open modal in Edit Mode prefilling existing data
  const handleOpenEditModal = (g: Gasto) => {
    setEditingGastoId(g.id);
    setTipoGasto(g.tipoGasto);
    setCategoriaGasto(g.categoriaGasto);
    setDescripcion(g.descripcion);
    setMonto(g.monto);
    setBeneficiario(g.beneficiario || '');
    setMetodoPago(g.metodoPago);
    setNumeroComprobante(g.numeroComprobante || '');

    if (g.tipoGasto === 'Nomina') {
      setSueldoBase(g.monto);
      setHorasExtrasBonos(0);
      setDeducciones(0);
      setPeriodoNomina('Periodo Liquidado');
      setCargoEmpleado(g.categoriaGasto || 'Empleado');
    } else if (g.tipoGasto === 'Mantenimiento') {
      setEquipoIntervenido(g.categoriaGasto || 'Horno Rotatorio');
      setTecnicoEmpresa(g.beneficiario || '');
    } else if (g.tipoGasto === 'Limpieza') {
      setArticuloLimpieza(g.categoriaGasto || 'Insumos de Aseo');
    }

    setShowModal(true);
  };

  const handleEliminarGasto = async (id: number) => {
    const confirmed = await showConfirm(
      `¿Estás seguro de que deseas eliminar el registro de gasto #${id}? Esta acción afectará el historial contable.`,
      'Eliminar Registro de Gasto'
    );
    if (!confirmed) return;

    const res = await gastoService.delete(id);
    if (res.success) {
      fetchGastos();
      showSuccess('Registro de gasto eliminado correctamente.', 'Gasto Eliminado');
    } else {
      showError(res.message || 'Error al eliminar el gasto', 'Error al Eliminar');
    }
  };

  // Recalculate Payroll Net amount dynamically
  const handleRecalcularNomina = (base: number, bonos: number, deduc: number) => {
    const net = Math.max(0, base + bonos - deduc);
    setMonto(net);
    setDescripcion(`Liquidación de Nómina: ${cargoEmpleado} (${beneficiario}) - ${periodoNomina} [Base: ${formatCurrency(base)}, Extras: ${formatCurrency(bonos)}, Deduc: ${formatCurrency(deduc)}]`);
  };

  const handleSubmitGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let finalDescripcion = descripcion;
    if (tipoGasto === 'Nomina') {
      finalDescripcion = descripcion || `Pago de Nómina: ${cargoEmpleado} (${beneficiario}) - ${periodoNomina}`;
    } else if (tipoGasto === 'Mantenimiento') {
      finalDescripcion = descripcion || `Mantenimiento ${tipoMantenimiento}: ${equipoIntervenido}`;
    } else if (tipoGasto === 'Limpieza') {
      finalDescripcion = descripcion || `Insumos de Aseo: ${articuloLimpieza}`;
    } else if (tipoGasto === 'ServicioPublico') {
      finalDescripcion = descripcion || `Factura de ${categoriaGasto} - ${beneficiario}`;
    }

    const payload = {
      tipoGasto,
      categoriaGasto: tipoGasto === 'Mantenimiento' 
        ? equipoIntervenido 
        : (tipoGasto === 'Nomina' ? cargoEmpleado : (tipoGasto === 'Limpieza' ? articuloLimpieza : categoriaGasto)),
      descripcion: finalDescripcion,
      monto,
      beneficiario: tipoGasto === 'Mantenimiento' ? tecnicoEmpresa : beneficiario,
      metodoPago,
      numeroComprobante: numeroComprobante || `REC-${Math.floor(Math.random()*90000+10000)}`
    };

    let res;
    if (editingGastoId) {
      res = await gastoService.update(editingGastoId, payload);
    } else {
      res = await gastoService.create(payload);
    }

    setIsSubmitting(false);

    if (res.success) {
      setShowModal(false);
      setEditingGastoId(null);
      fetchGastos();
      showSuccess(
        editingGastoId ? 'Registro de gasto/pago actualizado exitosamente.' : 'Gasto registrado exitosamente e impactado en contabilidad P&G.',
        'Registro Guardado'
      );
    } else {
      showError(res.message || 'Error al procesar el gasto', 'Error al Guardar');
    }
  };

  const filteredGastos = gastos.filter(g => {
    const matchFilter = (
      selectedFilter === 'todos' ||
      (selectedFilter === 'servicios' && g.tipoGasto === 'ServicioPublico') ||
      (selectedFilter === 'nomina' && g.tipoGasto === 'Nomina') ||
      (selectedFilter === 'limpieza' && g.tipoGasto === 'Limpieza') ||
      (selectedFilter === 'mantenimiento' && g.tipoGasto === 'Mantenimiento') ||
      g.tipoGasto === selectedFilter
    );

    if (!matchFilter) return false;

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    return (
      g.numeroComprobante?.toLowerCase().includes(term) ||
      g.descripcion?.toLowerCase().includes(term) ||
      g.beneficiario?.toLowerCase().includes(term) ||
      g.categoriaGasto?.toLowerCase().includes(term) ||
      g.metodoPago?.toLowerCase().includes(term) ||
      g.monto.toString().includes(term)
    );
  });

  const paginatedGastos = filteredGastos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);
  const totalServicios = gastos.filter(g => g.tipoGasto === 'ServicioPublico').reduce((acc, g) => acc + g.monto, 0);
  const totalNomina = gastos.filter(g => g.tipoGasto === 'Nomina').reduce((acc, g) => acc + g.monto, 0);
  const totalMantenimiento = gastos.filter(g => g.tipoGasto === 'Mantenimiento' || g.tipoGasto === 'Limpieza').reduce((acc, g) => acc + g.monto, 0);

  const getIconForCategory = (tipo: string, cat: string) => {
    if (tipo === 'Nomina') return <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    if (tipo === 'Mantenimiento') return <Wrench className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
    if (tipo === 'Limpieza') return <Brush className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
    
    switch (cat.toLowerCase()) {
      case 'luz':
      case 'energia':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'agua':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'gas':
        return <Zap className="w-4 h-4 text-orange-500" />;
      default:
        return <Receipt className="w-4 h-4 text-rose-500" />;
    }
  };

  // Excel Export Handler
  const handleExportExcel = () => {
    exportToExcel<Gasto>({
      filename: 'Gastos_Nomina_Servicios_Claudipan',
      sheetName: 'Gastos y Nómina',
      title: 'Reporte Oficial de Gastos Operativos, Nómina y Servicios Públicos - Claudipan',
      data: filteredGastos,
      columns: [
        { header: 'ID / Comprobante', accessor: (g) => g.numeroComprobante || `REC-${g.id}`, width: 18 },
        { header: 'Fecha', accessor: (g) => new Date(g.fechaGasto).toLocaleDateString('es-CO'), width: 14 },
        { header: 'Tipo de Gasto', accessor: (g) => g.tipoGasto, width: 18 },
        { header: 'Categoría', accessor: (g) => g.categoriaGasto, width: 18 },
        { header: 'Concepto / Descripción', accessor: (g) => g.descripcion, width: 35 },
        { header: 'Beneficiario / Empleado', accessor: (g) => g.beneficiario || 'N/A', width: 28 },
        { header: 'Método de Pago', accessor: (g) => g.metodoPago, width: 16 },
        { header: 'Monto ($ COP)', accessor: (g) => g.monto, width: 16 },
      ],
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner - Single Clean Row */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-rose-100 shadow-inner">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-black tracking-tight">
                Servicios Públicos, Nómina & Mantenimiento
              </h1>
              <span className="text-[10px] bg-rose-300 text-rose-950 px-2.5 py-0.5 rounded-full font-black uppercase">
                Gastos Operativos Claudipan
              </span>
            </div>
            <p className="text-xs text-rose-100 mt-1">
              Registro y control de facturas de Luz (ESSA), Agua, Gas Natural, liquidación de Nómina y mantenimiento de hornos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchGastos}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all text-white cursor-pointer"
            title="Refrescar gastos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-rose-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-700 dark:text-rose-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Total Gastos</p>
            <p className="text-2xl font-heading font-extrabold text-rose-700 dark:text-rose-400 font-mono">
              {formatCurrency(totalGastos)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-rose-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Servicios (Luz/Agua/Gas)</p>
            <p className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100 font-mono">
              {formatCurrency(totalServicios)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-rose-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Nómina & Sueldos</p>
            <p className="text-2xl font-heading font-extrabold text-purple-700 dark:text-purple-400 font-mono">
              {formatCurrency(totalNomina)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-rose-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-700 dark:text-orange-400 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Mantenimiento & Aseo</p>
            <p className="text-2xl font-heading font-extrabold text-orange-700 dark:text-orange-400 font-mono">
              {formatCurrency(totalMantenimiento)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs Line */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-rose-200/80 dark:border-stone-800">
        {[
          { id: 'todos', label: `Todos los Gastos (${gastos.length})`, icon: Receipt },
          { id: 'servicios', label: 'Servicios Públicos', icon: Zap },
          { id: 'nomina', label: 'Nómina & Sueldos', icon: Users },
          { id: 'limpieza', label: 'Limpieza & Aseo', icon: Brush },
          { id: 'mantenimiento', label: 'Mantenimiento & Otros', icon: Wrench }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setSelectedFilter(tab.id); setCurrentPage(1); setVisibleMobileCount(10); }}
              className={`pb-2 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                selectedFilter === tab.id
                  ? 'border-rose-600 text-rose-700 dark:text-rose-400 font-black'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Top Bar: Search on Left + Actions on Right (Horizontal single-line) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-rose-200/80 dark:border-stone-800 shadow-sm">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            setCurrentPage(1);
            setVisibleMobileCount(10);
          }}
          className="flex items-center gap-2 flex-1 max-w-md"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                setVisibleMobileCount(10);
              }}
              placeholder={
                selectedFilter === 'servicios' ? 'Buscar por factura ESSA, gas, agua o monto...' :
                selectedFilter === 'nomina' ? 'Buscar por empleado, cargo, periodo o sueldo...' :
                selectedFilter === 'limpieza' ? 'Buscar por producto de aseo, proveedor o costo...' :
                selectedFilter === 'mantenimiento' ? 'Buscar por equipo, técnico, repuesto o costo...' :
                'Buscar por comprobante, empleado, concepto o monto...'
              }
              className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs px-3.5 py-2 pl-9 rounded-2xl border border-rose-200/80 dark:border-stone-800 focus:outline-none focus:border-rose-500 shadow-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCurrentPage(1); setVisibleMobileCount(10); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold px-4 whitespace-nowrap"
          >
            Buscar
          </Button>
        </form>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {canExportExcel && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              onClick={handleExportExcel}
              className="text-emerald-700 dark:text-emerald-300 border-emerald-600 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-sm whitespace-nowrap"
            >
              Exportar a Excel
            </Button>
          )}

          {canManage && (
            <>
              {selectedFilter === 'todos' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowSelectorModal(true)}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Gasto
                </Button>
              )}

              {selectedFilter === 'servicios' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => handleOpenCreateModal('ServicioPublico')}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Servicio
                </Button>
              )}

              {selectedFilter === 'nomina' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => handleOpenCreateModal('Nomina')}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Nómina
                </Button>
              )}

              {selectedFilter === 'limpieza' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => handleOpenCreateModal('Limpieza')}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Compras
                </Button>
              )}

              {selectedFilter === 'mantenimiento' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => handleOpenCreateModal('Mantenimiento')}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Gasto
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 1. Desktop HTML Table View (hidden on mobile) */}
      <div className="hidden md:block responsive-table-container bg-white dark:bg-stone-900 border border-rose-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-rose-50/70 dark:bg-stone-950 text-stone-700 dark:text-stone-300 text-[11px] font-black uppercase tracking-wider border-b border-rose-200/80 dark:border-stone-800">
              <th className="py-3 px-4">Comprobante / Fecha</th>
              <th className="py-3 px-4">Categoría & Concepto</th>
              <th className="py-3 px-4">Beneficiario / Empleado / Técnico</th>
              <th className="py-3 px-4">Método Pago</th>
              <th className="py-3 px-4 text-right">Monto Pagado</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-100/60 dark:divide-stone-800 text-xs">
            {paginatedGastos.map(g => (
              <tr key={g.id} className="hover:bg-rose-50/40 dark:hover:bg-stone-800/40 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-mono font-bold text-rose-700 dark:text-rose-400">{g.numeroComprobante || `REC-${g.id}`}</p>
                  <p className="text-[10px] text-stone-500">{new Date(g.fechaGasto).toLocaleDateString('es-CO')}</p>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {getIconForCategory(g.tipoGasto, g.categoriaGasto)}
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">{g.descripcion}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${
                        g.tipoGasto === 'Nomina' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                        g.tipoGasto === 'Limpieza' ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800' :
                        g.tipoGasto === 'Mantenimiento' ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800' :
                        'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {g.categoriaGasto}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-stone-700 dark:text-stone-300 font-medium">
                  {g.beneficiario || 'Empresa / Empleado'}
                </td>
                <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                  <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md font-mono text-[11px]">
                    {g.metodoPago}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-black text-rose-700 dark:text-rose-400 text-sm">
                  {formatCurrency(g.monto)}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(g)}
                      className="p-1.5 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                      title="Editar registro de gasto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEliminarGasto(g.id)}
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredGastos.length > 0 && (
          <div className="p-4 border-t border-rose-200/80 dark:border-stone-800">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredGastos.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              itemLabel="gastos"
            />
          </div>
        )}
      </div>

      {/* 2. Mobile CardView (visible only on mobile, 10 in 10 dynamic loading) */}
      <div className="md:hidden space-y-3">
        {filteredGastos.slice(0, visibleMobileCount).map(g => (
          <div 
            key={g.id}
            className="bg-white dark:bg-stone-900 border border-rose-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-rose-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                {getIconForCategory(g.tipoGasto, g.categoriaGasto)}
                <span className="font-mono font-black text-rose-700 dark:text-rose-400 text-xs">
                  {g.numeroComprobante || `REC-${g.id}`}
                </span>
              </div>
              <span className="text-[10px] text-stone-500 font-medium">
                {new Date(g.fechaGasto).toLocaleDateString('es-CO')}
              </span>
            </div>

            <div>
              <p className="font-bold text-stone-900 dark:text-stone-100 text-xs">{g.descripcion}</p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-stone-600 dark:text-stone-400">
                <span>Beneficiario: <strong>{g.beneficiario || 'N/A'}</strong></span>
                <span className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono text-[10px]">{g.metodoPago}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-rose-100 dark:border-stone-800">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold">Monto:</span>
                <p className="text-base font-mono font-black text-rose-700 dark:text-rose-400">
                  {formatCurrency(g.monto)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(g)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-400 text-xs font-bold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => handleEliminarGasto(g.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Borrar
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Mobile Dynamic 10-in-10 Loader */}
        {visibleMobileCount < filteredGastos.length && (
          <div className="pt-2 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibleMobileCount(prev => prev + 10)}
              className="w-full text-rose-700 dark:text-rose-400 border-rose-300 dark:border-stone-700"
            >
              Cargar 10 más (Mostrando {Math.min(visibleMobileCount, filteredGastos.length)} de {filteredGastos.length})
            </Button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Selector de Tipo de Gasto (Aparece antes del formulario) */}
      {/* ========================================================================= */}
      {showSelectorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" /> Selecciona el Tipo de Gasto
                </h3>
                <p className="text-xs text-stone-500">¿Qué tipo de desembolso u obligación deseas asentar en contabilidad?</p>
              </div>
              <button onClick={() => setShowSelectorModal(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Card 1: Nómina */}
              <button
                type="button"
                onClick={() => {
                  setShowSelectorModal(false);
                  handleOpenCreateModal('Nomina');
                }}
                className="p-4 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 hover:border-purple-500 hover:shadow-lg transition-all text-left flex items-start gap-3 group cursor-pointer"
              >
                <div className="p-3 bg-purple-600 text-white rounded-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-purple-900 dark:text-purple-300">Gasto por Nómina</h4>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">Sueldos, horas extras, quincenas y aportes de panaderos y dependientes.</p>
                </div>
              </button>

              {/* Card 2: Servicio Público */}
              <button
                type="button"
                onClick={() => {
                  setShowSelectorModal(false);
                  handleOpenCreateModal('ServicioPublico');
                }}
                className="p-4 rounded-2xl border-2 border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-500 hover:shadow-lg transition-all text-left flex items-start gap-3 group cursor-pointer"
              >
                <div className="p-3 bg-amber-600 text-white rounded-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-amber-900 dark:text-amber-300">Gasto por Servicio Público</h4>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">Facturas de Luz (ESSA), Agua de Bucaramanga, Gas Natural Hornos e Internet.</p>
                </div>
              </button>

              {/* Card 3: Limpieza */}
              <button
                type="button"
                onClick={() => {
                  setShowSelectorModal(false);
                  handleOpenCreateModal('Limpieza');
                }}
                className="p-4 rounded-2xl border-2 border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 hover:border-teal-500 hover:shadow-lg transition-all text-left flex items-start gap-3 group cursor-pointer"
              >
                <div className="p-3 bg-teal-600 text-white rounded-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <Brush className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-teal-900 dark:text-teal-300">Gasto por Limpieza</h4>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">Detergentes industriales, aseo de bandejas, desinfección y artículos de higiene.</p>
                </div>
              </button>

              {/* Card 4: Mantenimiento u Otros */}
              <button
                type="button"
                onClick={() => {
                  setShowSelectorModal(false);
                  handleOpenCreateModal('Mantenimiento');
                }}
                className="p-4 rounded-2xl border-2 border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20 hover:border-orange-500 hover:shadow-lg transition-all text-left flex items-start gap-3 group cursor-pointer"
              >
                <div className="p-3 bg-orange-600 text-white rounded-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-orange-900 dark:text-orange-300">Otros Gastos / Mantenimiento</h4>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">Repuestos de hornos, amasadoras, calibraciones técnicas y gastos varios.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Formulario Completo de Registro / Edición */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-rose-300 dark:border-stone-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  tipoGasto === 'Nomina' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' :
                  tipoGasto === 'Limpieza' ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300' :
                  tipoGasto === 'Mantenimiento' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300' :
                  'bg-rose-500/20 text-rose-700 dark:text-rose-400'
                }`}>
                  {tipoGasto === 'Nomina' ? <Users className="w-5 h-5" /> :
                   tipoGasto === 'Limpieza' ? <Brush className="w-5 h-5" /> :
                   tipoGasto === 'Mantenimiento' ? <Wrench className="w-5 h-5" /> :
                   <Receipt className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                    {editingGastoId ? `Editar Gasto #${editingGastoId}` : 'Registrar Nuevo Gasto / Pago'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {tipoGasto === 'Nomina' ? 'Gestión de salarios y liquidaciones de panadería' :
                     tipoGasto === 'Limpieza' ? 'Insumos de aseo, desinfección y mantenimiento sanitario' :
                     tipoGasto === 'Mantenimiento' ? 'Control de reparaciones y hornos industriales' :
                     'Facturas de servicios públicos y gastos fijos'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitGasto} className="space-y-4">
              
              {/* Type Switcher */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Tipo de Gasto</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoGasto('ServicioPublico');
                      setCategoriaGasto('Luz');
                      setBeneficiario('Electrificadora de Santander ESSA');
                    }}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      tipoGasto === 'ServicioPublico'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                        : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    ⚡ Servicios
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoGasto('Nomina');
                      setCategoriaGasto('Nomina');
                      setCargoEmpleado('Panadero Principal');
                      setBeneficiario('Carlos Andrés Rodríguez');
                    }}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      tipoGasto === 'Nomina'
                        ? 'bg-purple-600 text-white border-purple-700 shadow-md'
                        : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    👥 Nómina
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoGasto('Limpieza');
                      setCategoriaGasto('Aseo');
                      setArticuloLimpieza('Detergente Industrial');
                      setBeneficiario('Distribuidora de Químicos y Aseo');
                    }}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      tipoGasto === 'Limpieza'
                        ? 'bg-teal-600 text-white border-teal-700 shadow-md'
                        : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    🧹 Limpieza
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoGasto('Mantenimiento');
                      setCategoriaGasto('Mantenimiento');
                      setEquipoIntervenido('Horno Rotatorio a Gas');
                      setBeneficiario('Técnicos Industriales Santander');
                    }}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      tipoGasto === 'Mantenimiento'
                        ? 'bg-orange-600 text-white border-orange-700 shadow-md'
                        : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    🛠️ Otros
                  </button>
                </div>
              </div>

              {/* ----------------- SUB-FORM 1: SERVICIOS PÚBLICOS ----------------- */}
              {tipoGasto === 'ServicioPublico' && (
                <div className="space-y-3 bg-amber-50/50 dark:bg-stone-950/50 p-4 rounded-2xl border border-amber-200/80 dark:border-stone-800">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Servicio Público</label>
                      <select
                        value={categoriaGasto}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setCategoriaGasto(cat);
                          if (cat === 'Luz') setBeneficiario('Electrificadora de Santander ESSA');
                          if (cat === 'Agua') setBeneficiario('Acueducto Municipal');
                          if (cat === 'Gas') setBeneficiario('Gas Natural Vanti');
                          if (cat === 'Internet') setBeneficiario('Claro / Movistar Telecomunicaciones');
                        }}
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                      >
                        <option value="Luz">Luz / Energía Eléctrica (ESSA)</option>
                        <option value="Agua">Agua & Alcantarillado</option>
                        <option value="Gas">Gas Natural Hornos</option>
                        <option value="Internet">Internet / Telefonía</option>
                        <option value="Aseo">Aseo & Recolección</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Empresa Prestadora</label>
                      <input
                        type="text"
                        required
                        value={beneficiario}
                        onChange={(e) => setBeneficiario(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- SUB-FORM 2: NÓMINA & SUELDOS ----------------- */}
              {tipoGasto === 'Nomina' && (
                <div className="space-y-3 bg-purple-50/50 dark:bg-stone-950/50 p-4 rounded-2xl border border-purple-200/80 dark:border-stone-800">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Empleado / Beneficiario *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Carlos Andrés Rodríguez"
                        value={beneficiario}
                        onChange={(e) => setBeneficiario(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Cargo / Puesto</label>
                      <select
                        value={cargoEmpleado}
                        onChange={(e) => setCargoEmpleado(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                      >
                        <option value="Panadero Principal">Panadero Principal</option>
                        <option value="Auxiliar de Panadería">Auxiliar de Panadería</option>
                        <option value="Hornero">Hornero de Turno</option>
                        <option value="Vendedora Mostrador / POS">Vendedora Mostrador / POS</option>
                        <option value="Administrador">Administrador de Tienda</option>
                        <option value="Aseo y Mantenimiento">Aseo y Mantenimiento</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Sueldo Base ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={sueldoBase}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSueldoBase(val);
                          handleRecalcularNomina(val, horasExtrasBonos, deducciones);
                        }}
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Extras / Bonos ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={horasExtrasBonos}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setHorasExtrasBonos(val);
                          handleRecalcularNomina(sueldoBase, val, deducciones);
                        }}
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold text-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Deducciones ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={deducciones}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDeducciones(val);
                          handleRecalcularNomina(sueldoBase, horasExtrasBonos, val);
                        }}
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold text-red-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Periodo de Liquidación</label>
                    <select
                      value={periodoNomina}
                      onChange={(e) => {
                        setPeriodoNomina(e.target.value);
                        handleRecalcularNomina(sueldoBase, horasExtrasBonos, deducciones);
                      }}
                      className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                    >
                      <option value="1ra Quincena">1ra Quincena del Mes (Día 1 al 15)</option>
                      <option value="2da Quincena">2da Quincena del Mes (Día 16 al 30/31)</option>
                      <option value="Mensualidad Completa">Mensualidad Completa</option>
                      <option value="Liquidación / Jornal Diario">Liquidación / Jornal Diario</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ----------------- SUB-FORM 3: LIMPIEZA & ASEO ----------------- */}
              {tipoGasto === 'Limpieza' && (
                <div className="space-y-3 bg-teal-50/50 dark:bg-stone-950/50 p-4 rounded-2xl border border-teal-200/80 dark:border-stone-800">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Artículo / Insumo de Aseo</label>
                      <input
                        type="text"
                        required
                        value={articuloLimpieza}
                        onChange={(e) => setArticuloLimpieza(e.target.value)}
                        placeholder="Ej. Detergente industrial, desinfectante..."
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Proveedor / Tienda</label>
                      <input
                        type="text"
                        required
                        value={beneficiario}
                        onChange={(e) => setBeneficiario(e.target.value)}
                        placeholder="Distribuidora de Aseo..."
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- SUB-FORM 4: MANTENIMIENTO ----------------- */}
              {tipoGasto === 'Mantenimiento' && (
                <div className="space-y-3 bg-orange-50/50 dark:bg-stone-950/50 p-4 rounded-2xl border border-orange-200/80 dark:border-stone-800">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Equipo Intervenido</label>
                      <select
                        value={equipoIntervenido}
                        onChange={(e) => setEquipoIntervenido(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                      >
                        <option value="Horno Rotatorio a Gas">Horno Rotatorio a Gas (Principal)</option>
                        <option value="Horno de Gaveta Eléctrico">Horno de Gaveta Eléctrico</option>
                        <option value="Amasadora Industrial 25Kg">Amasadora Industrial 25Kg</option>
                        <option value="Cilindradora de Masa">Cilindradora de Masa</option>
                        <option value="Cuarto de Crecimiento / Leudado">Cuarto de Crecimiento / Leudado</option>
                        <option value="Nevera / Vitrina Refrigerada">Nevera / Vitrina Refrigerada</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Tipo de Intervención</label>
                      <select
                        value={tipoMantenimiento}
                        onChange={(e) => setTipoMantenimiento(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                      >
                        <option value="Preventivo">Preventivo (Limpieza quemadores, calibración)</option>
                        <option value="Correctivo">Correctivo (Cambio de repuestos, falla urgente)</option>
                        <option value="Instalación">Instalación y Adecuación</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Técnico / Taller Responsable</label>
                    <input
                      type="text"
                      required
                      value={tecnicoEmpresa}
                      onChange={(e) => setTecnicoEmpresa(e.target.value)}
                      placeholder="Empresa de mantenimiento o técnico certificado"
                      className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                    />
                  </div>
                </div>
              )}

              {/* General Concept & Details */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Detalle / Concepto del Gasto *</label>
                <input
                  type="text"
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción detallada del pago..."
                  className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-medium"
                />
              </div>

              {/* Monto, Método de Pago, Comprobante */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase text-rose-700 dark:text-rose-400">Total a Pagar ($) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={monto}
                    onChange={(e) => setMonto(Number(e.target.value))}
                    className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-rose-400 dark:border-rose-600 font-mono font-black text-sm text-rose-700 dark:text-rose-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Método Pago</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                  >
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Nequi">Nequi / Daviplata</option>
                    <option value="Efectivo">Efectivo de Caja Menor</option>
                    <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">N° Comprobante</label>
                  <input
                    type="text"
                    value={numeroComprobante}
                    onChange={(e) => setNumeroComprobante(e.target.value)}
                    placeholder="Auto-generado"
                    className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1 cursor-pointer"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold cursor-pointer"
                  isLoading={isSubmitting}
                >
                  {editingGastoId ? 'Guardar' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
