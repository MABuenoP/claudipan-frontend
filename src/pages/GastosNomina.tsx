import React, { useState, useEffect } from 'react';
import { gastoService, Gasto } from '../services/gastoService';
import { formatCurrency } from '../utils/helpers';
import { 
  Receipt, Plus, Zap, Droplet, Flame, Users, Wrench, 
  Trash2, RefreshCw, X, DollarSign, Calendar, FileText, CheckCircle2,
  Edit2, AlertCircle, Info, Calculator, Building2, UserCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';

export const GastosNomina: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal State (Crear / Editar)
  const [showModal, setShowModal] = useState(false);
  const [editingGastoId, setEditingGastoId] = useState<number | null>(null);
  const [tipoGasto, setTipoGasto] = useState<string>('ServicioPublico');
  const [categoriaGasto, setCategoriaGasto] = useState<string>('Luz');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState<number>(180000);
  const [beneficiario, setBeneficiario] = useState('Electrificadora de Santander ESSA');
  const [metodoPago, setMetodoPago] = useState('Transferencia');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  
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

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Open modal in Create Mode with sensible defaults for the active tab
  const handleOpenCreateModal = (forcedTipo?: string) => {
    setEditingGastoId(null);
    const targetTipo = forcedTipo || (
      selectedFilter === 'servicios' ? 'ServicioPublico' :
      selectedFilter === 'nomina' ? 'Nomina' :
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
      setDescripcion('Gastos varios de cafetería y aseo');
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
    }

    setShowModal(true);
  };

  const handleEliminarGasto = async (id: number) => {
    if (!window.confirm(`¿Estás seguro de eliminar el registro de gasto #${id}?`)) return;
    const res = await gastoService.delete(id);
    if (res.success) {
      fetchGastos();
      alert('Registro de gasto eliminado correctamente.');
    } else {
      alert(res.message || 'Error al eliminar el gasto');
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
    } else if (tipoGasto === 'ServicioPublico') {
      finalDescripcion = descripcion || `Factura de ${categoriaGasto} - ${beneficiario}`;
    }

    const payload = {
      tipoGasto,
      categoriaGasto: tipoGasto === 'Mantenimiento' ? equipoIntervenido : (tipoGasto === 'Nomina' ? cargoEmpleado : categoriaGasto),
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
      alert(editingGastoId ? 'Registro de gasto/pago actualizado exitosamente.' : 'Gasto registrado exitosamente e impactado en contabilidad P&G.');
    } else {
      alert(res.message || 'Error al procesar el gasto');
    }
  };

  const filteredGastos = gastos.filter(g => {
    if (selectedFilter === 'todos') return true;
    if (selectedFilter === 'servicios') return g.tipoGasto === 'ServicioPublico';
    if (selectedFilter === 'nomina') return g.tipoGasto === 'Nomina';
    if (selectedFilter === 'mantenimiento') return g.tipoGasto === 'Mantenimiento';
    return g.tipoGasto === selectedFilter;
  });

  const paginatedGastos = filteredGastos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);
  const totalServicios = gastos.filter(g => g.tipoGasto === 'ServicioPublico').reduce((acc, g) => acc + g.monto, 0);
  const totalNomina = gastos.filter(g => g.tipoGasto === 'Nomina').reduce((acc, g) => acc + g.monto, 0);
  const totalMantenimiento = gastos.filter(g => g.tipoGasto === 'Mantenimiento').reduce((acc, g) => acc + g.monto, 0);

  const getIconForCategory = (tipo: string, cat: string) => {
    if (tipo === 'Nomina') return <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    if (tipo === 'Mantenimiento') return <Wrench className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
    
    switch (cat.toLowerCase()) {
      case 'luz':
      case 'energia':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'agua':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'gas':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'internet':
      case 'telefonia':
        return <Building2 className="w-4 h-4 text-indigo-500" />;
      default:
        return <Receipt className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
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
              Registro y edición de facturas de Luz (ESSA), Agua, Gas Natural, liquidación de Nómina de panadería y mantenimiento de hornos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchGastos}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all text-white cursor-pointer"
            title="Refrescar gastos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {selectedFilter === 'servicios' ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleOpenCreateModal('ServicioPublico')}
              className="bg-white text-stone-950 hover:bg-rose-50 font-extrabold shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5 text-amber-600" /> Registrar Pago de Servicio
            </Button>
          ) : selectedFilter === 'nomina' ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleOpenCreateModal('Nomina')}
              className="bg-white text-stone-950 hover:bg-rose-50 font-extrabold shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5 text-purple-600" /> Registrar Pago de Nómina
            </Button>
          ) : selectedFilter === 'mantenimiento' ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleOpenCreateModal('Mantenimiento')}
              className="bg-white text-stone-950 hover:bg-rose-50 font-extrabold shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5 text-orange-600" /> Registrar Mantenimiento
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleOpenCreateModal()}
              className="bg-white text-stone-950 hover:bg-rose-50 font-extrabold shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5 text-rose-600" /> Registrar Nuevo Gasto
            </Button>
          )}
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
            <p className="text-xs font-bold text-stone-500 uppercase">Mantenimiento Hornos</p>
            <p className="text-2xl font-heading font-extrabold text-orange-700 dark:text-orange-400 font-mono">
              {formatCurrency(totalMantenimiento)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-rose-200/80 dark:border-stone-800 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'todos', label: 'Todos los Gastos' },
          { id: 'servicios', label: '⚡ Servicios Públicos (Luz/Agua/Gas)' },
          { id: 'nomina', label: '👥 Nómina & Sueldos' },
          { id: 'mantenimiento', label: '🛠️ Mantenimiento Hornos & Maquinaria' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setSelectedFilter(tab.id); setCurrentPage(1); }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === tab.id
                ? 'border-rose-600 text-rose-700 dark:text-rose-400 font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="responsive-table-container bg-white dark:bg-stone-900 border border-rose-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
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
                <td data-label="Comprobante / Fecha" className="py-3 px-4">
                  <p className="font-mono font-bold text-rose-700 dark:text-rose-400">{g.numeroComprobante || `REC-${g.id}`}</p>
                  <p className="text-[10px] text-stone-500">{new Date(g.fechaGasto).toLocaleDateString('es-CO')}</p>
                </td>
                <td data-label="Categoría" className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {getIconForCategory(g.tipoGasto, g.categoriaGasto)}
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">{g.descripcion}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${
                        g.tipoGasto === 'Nomina' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                        g.tipoGasto === 'Mantenimiento' ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800' :
                        'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {g.categoriaGasto}
                      </span>
                    </div>
                  </div>
                </td>
                <td data-label="Beneficiario" className="py-3 px-4 text-stone-700 dark:text-stone-300 font-medium">
                  {g.beneficiario || 'Empresa / Empleado'}
                </td>
                <td data-label="Método Pago" className="py-3 px-4 text-stone-600 dark:text-stone-400">
                  <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md font-mono text-[11px]">
                    {g.metodoPago}
                  </span>
                </td>
                <td data-label="Monto" className="py-3 px-4 text-right font-mono font-black text-rose-700 dark:text-rose-400 text-sm">
                  {formatCurrency(g.monto)}
                </td>
                <td data-label="Acciones" className="py-3 px-4 text-center">
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

      {/* Modal: Registrar o Editar Gasto / Pago / Nómina / Mantenimiento */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-rose-300 dark:border-stone-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  tipoGasto === 'Nomina' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' :
                  tipoGasto === 'Mantenimiento' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300' :
                  'bg-rose-500/20 text-rose-700 dark:text-rose-400'
                }`}>
                  {tipoGasto === 'Nomina' ? <Users className="w-5 h-5" /> :
                   tipoGasto === 'Mantenimiento' ? <Wrench className="w-5 h-5" /> :
                   <Receipt className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                    {editingGastoId ? `Editar Gasto #${editingGastoId}` : 'Registrar Nuevo Gasto / Pago'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {tipoGasto === 'Nomina' ? 'Gestión de salarios y liquidaciones de panadería' :
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
              
              {/* Type Selector (if creating) */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Módulo / Tipo de Gasto</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoGasto('ServicioPublico');
                      setCategoriaGasto('Luz');
                      setBeneficiario('Electrificadora de Santander ESSA');
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      tipoGasto === 'ServicioPublico'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md'
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
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
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
                      setTipoGasto('Mantenimiento');
                      setCategoriaGasto('Mantenimiento');
                      setEquipoIntervenido('Horno Rotatorio a Gas');
                      setBeneficiario('Técnicos Industriales Hornos Santander');
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      tipoGasto === 'Mantenimiento'
                        ? 'bg-orange-600 text-white border-orange-700 shadow-md'
                        : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    🛠️ Hornos / Mantenimiento
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
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Cargo / Rol</label>
                      <select
                        value={cargoEmpleado}
                        onChange={(e) => setCargoEmpleado(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                      >
                        <option value="Panadero Principal">Panadero Principal</option>
                        <option value="Maestro Hornero">Maestro Hornero</option>
                        <option value="Vendedora Mostrador">Vendedora Mostrador / POS</option>
                        <option value="Auxiliar de Panadería">Auxiliar de Panadería</option>
                        <option value="Secretaria / Administradora">Secretaria / Administradora</option>
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
                        className="w-full bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">+ Horas / Bonos</label>
                      <input
                        type="number"
                        min="0"
                        value={horasExtrasBonos}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setHorasExtrasBonos(val);
                          handleRecalcularNomina(sueldoBase, val, deducciones);
                        }}
                        className="w-full bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-300 dark:border-stone-700 font-mono text-emerald-600 dark:text-emerald-400 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">- Deducciones</label>
                      <input
                        type="number"
                        min="0"
                        value={deducciones}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDeducciones(val);
                          handleRecalcularNomina(sueldoBase, horasExtrasBonos, val);
                        }}
                        className="w-full bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-300 dark:border-stone-700 font-mono text-red-600 dark:text-red-400 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Periodo de Liquidación</label>
                    <select
                      value={periodoNomina}
                      onChange={(e) => setPeriodoNomina(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-medium"
                    >
                      <option value="1ra Quincena">1ra Quincena del Mes</option>
                      <option value="2da Quincena">2da Quincena del Mes</option>
                      <option value="Mes Completo">Mes Completo</option>
                      <option value="Jornal Diario">Jornal Diario / Turno</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ----------------- SUB-FORM 3: MANTENIMIENTO HORNOS ----------------- */}
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
                        <option value="Horno Rotatorio a Gas">Horno Rotatorio a Gas</option>
                        <option value="Horno de Gavetas / Pisos">Horno de Gavetas / Pisos</option>
                        <option value="Amasadora Espiral 25kg">Amasadora Espiral 25kg</option>
                        <option value="Batidora Planetaria">Batidora Planetaria</option>
                        <option value="Cuarto de Crecimiento">Cuarto de Crecimiento</option>
                        <option value="Refrigerador / Vitrina Pan">Refrigerador / Vitrina Pan</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Tipo de Intervención</label>
                      <select
                        value={tipoMantenimiento}
                        onChange={(e) => setTipoMantenimiento(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                      >
                        <option value="Preventivo">Preventivo / Limpieza y Calibración</option>
                        <option value="Correctivo">Correctivo / Reparación de Emergencia</option>
                        <option value="Cambio de Repuesto">Cambio de Repuestos / Quemador</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Técnico / Taller Responsable</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Técnicos de Hornos Santander SAS"
                      value={tecnicoEmpresa}
                      onChange={(e) => {
                        setTecnicoEmpresa(e.target.value);
                        setBeneficiario(e.target.value);
                      }}
                      className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                    />
                  </div>
                </div>
              )}

              {/* General Concept & Details */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Concepto / Detalle Liquidado *</label>
                <input
                  type="text"
                  required
                  placeholder="Detalle o descripción del comprobante"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-medium"
                />
              </div>

              {/* Monto Total y Método de Pago */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Monto Total a Pagar ($) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={monto}
                    onChange={(e) => setMonto(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-black text-rose-700 dark:text-rose-400 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Método de Pago</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-medium"
                  >
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo de Caja</option>
                    <option value="Debito_Automatico">Débito Automático</option>
                  </select>
                </div>
              </div>

              {/* Comprobante */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">No. Factura / Recibo / Comprobante</label>
                <input
                  type="text"
                  placeholder="REC-00123 / FACT-456"
                  value={numeroComprobante}
                  onChange={(e) => setNumeroComprobante(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono"
                />
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
                  {editingGastoId ? 'Guardar Cambios' : 'Registrar Gasto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

