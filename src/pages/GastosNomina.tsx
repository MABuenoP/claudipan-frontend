import React, { useState, useEffect } from 'react';
import { gastoService, Gasto } from '../services/gastoService';
import { formatCurrency } from '../utils/helpers';
import { 
  Receipt, Plus, Zap, Droplet, Flame, Users, Wrench, 
  Trash2, RefreshCw, X, DollarSign, Calendar, FileText, CheckCircle2 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';

export const GastosNomina: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal Nuevo Gasto
  const [showModal, setShowModal] = useState(false);
  const [tipoGasto, setTipoGasto] = useState<string>('ServicioPublico');
  const [categoriaGasto, setCategoriaGasto] = useState<string>('Luz');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState<number>(180000);
  const [beneficiario, setBeneficiario] = useState('Electrificadora de Santander ESSA');
  const [metodoPago, setMetodoPago] = useState('Transferencia');
  const [numeroComprobante, setNumeroComprobante] = useState('');
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

  const handleCrearGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await gastoService.create({
      tipoGasto,
      categoriaGasto,
      descripcion: descripcion || `Pago de ${categoriaGasto} Claudipan`,
      monto,
      beneficiario,
      metodoPago,
      numeroComprobante: numeroComprobante || `REC-${Math.floor(Math.random()*90000+10000)}`
    });

    setIsSubmitting(false);

    if (res.success) {
      setShowModal(false);
      setDescripcion('');
      setNumeroComprobante('');
      fetchGastos();
      alert('Gasto registrado exitosamente e impactado en contabilidad P&G.');
    } else {
      alert(res.message || 'Error al registrar el gasto');
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

  const getIconForCategory = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'luz':
      case 'energia':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'agua':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'gas':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'nomina':
      case 'sueldo':
        return <Users className="w-4 h-4 text-purple-500" />;
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
                Servicios Públicos & Nómina Claudipan
              </h1>
              <span className="text-[10px] bg-rose-300 text-rose-950 px-2.5 py-0.5 rounded-full font-bold uppercase">
                Gastos Operativos
              </span>
            </div>
            <p className="text-xs text-rose-100 mt-1">
              Control de facturas de Luz (ESSA), Agua, Gas Natural, Salarios de panadería y mantenimiento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchGastos}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all text-white"
            title="Refrescar gastos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowModal(true)}
            className="bg-white text-stone-950 hover:bg-rose-50 font-extrabold shadow-lg"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Registrar Nuevo Gasto
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-rose-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-700 dark:text-rose-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Total Gastos Operativos</p>
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
            <p className="text-xs font-bold text-stone-500 uppercase">Servicios (Luz, Agua, Gas)</p>
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
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-rose-200/80 dark:border-stone-800 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'todos', label: 'Todos los Gastos' },
          { id: 'servicios', label: '⚡ Servicios Públicos (Luz/Agua/Gas)' },
          { id: 'nomina', label: '👥 Nómina & Personal' },
          { id: 'mantenimiento', label: '🛠️ Mantenimiento Hornos & Varios' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setSelectedFilter(tab.id); setCurrentPage(1); }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              selectedFilter === tab.id
                ? 'border-rose-600 text-rose-700 dark:text-rose-400'
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
              <th className="py-3 px-4">Beneficiario / Empresa</th>
              <th className="py-3 px-4">Método Pago</th>
              <th className="py-3 px-4 text-right">Monto Pagado</th>
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
                    {getIconForCategory(g.categoriaGasto)}
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">{g.descripcion}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-stone-800 text-rose-700 dark:text-rose-300 font-extrabold uppercase">
                        {g.categoriaGasto}
                      </span>
                    </div>
                  </div>
                </td>
                <td data-label="Beneficiario" className="py-3 px-4 text-stone-600 dark:text-stone-400">
                  {g.beneficiario || 'Empresa Prestadora'}
                </td>
                <td data-label="Método Pago" className="py-3 px-4 text-stone-600 dark:text-stone-400">
                  {g.metodoPago}
                </td>
                <td data-label="Monto" className="py-3 px-4 text-right font-mono font-black text-rose-700 dark:text-rose-400 text-sm">
                  {formatCurrency(g.monto)}
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

      {/* Modal: Registrar Nuevo Gasto */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-rose-300 dark:border-stone-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-heading font-extrabold text-base text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <Receipt className="w-5 h-5" /> Registrar Gasto Operativo
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearGasto} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Tipo de Gasto</label>
                  <select
                    value={tipoGasto}
                    onChange={(e) => setTipoGasto(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                  >
                    <option value="ServicioPublico">Servicio Público</option>
                    <option value="Nomina">Nómina / Sueldos</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Varios">Gastos Varios</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Categoría</label>
                  <select
                    value={categoriaGasto}
                    onChange={(e) => {
                      setCategoriaGasto(e.target.value);
                      if (e.target.value === 'Luz') setBeneficiario('Electrificadora ESSA');
                      if (e.target.value === 'Agua') setBeneficiario('Acueducto Municipal');
                      if (e.target.value === 'Gas') setBeneficiario('Gas Natural Vanti');
                    }}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                  >
                    <option value="Luz">Luz / Energía Eléctrica</option>
                    <option value="Agua">Agua & Alcantarillado</option>
                    <option value="Gas">Gas Natural Hornos</option>
                    <option value="Nomina">Nómina Panadero / Empleados</option>
                    <option value="Internet">Internet / Telefonía</option>
                    <option value="Mantenimiento">Reparación Hornos/Amasadora</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Concepto / Descripción *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Factura de energía eléctrica mes actual"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Monto ($ COP) *</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={monto}
                    onChange={(e) => setMonto(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Método de Pago</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  >
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo de Caja</option>
                    <option value="Debito_Automatico">Débito Automático</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Beneficiario / Entidad</label>
                  <input
                    type="text"
                    value={beneficiario}
                    onChange={(e) => setBeneficiario(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">No. Factura / Comprobante</label>
                  <input
                    type="text"
                    placeholder="REC-00123"
                    value={numeroComprobante}
                    onChange={(e) => setNumeroComprobante(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white"
                  isLoading={isSubmitting}
                >
                  Guardar Gasto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
