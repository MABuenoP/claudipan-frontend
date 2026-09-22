import React, { useState, useEffect } from 'react';
import { bajaService, BajaProducto } from '../services/bajaService';
import { productService, Product } from '../services/productService';
import { formatCurrency } from '../utils/helpers';
import { 
  Trash2, Plus, AlertTriangle, RefreshCw, X, 
  DollarSign, PackageX, Calendar, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const BajasMermas: React.FC = () => {
  const [bajas, setBajas] = useState<BajaProducto[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Nueva Baja
  const [showModal, setShowModal] = useState(false);
  const [productoId, setProductoId] = useState<number>(1);
  const [cantidad, setCantidad] = useState<number>(5);
  const [motivo, setMotivo] = useState<string>('Vencimiento');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [resBajas, resProd] = await Promise.all([
      bajaService.getAll(),
      productService.getProducts()
    ]);

    if (resBajas.success && resBajas.data) setBajas(resBajas.data);
    if (resProd.success && resProd.data) setProductos(resProd.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCrearBaja = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await bajaService.create({
      productoId,
      cantidad,
      motivo,
      observaciones
    });

    setIsSubmitting(false);

    if (res.success) {
      setShowModal(false);
      setObservaciones('');
      fetchData();
      alert('Baja registrada exitosamente. Se descontaron las unidades del inventario y se contabilizó la pérdida.');
    } else {
      alert(res.message || 'Error al registrar la baja');
    }
  };

  const totalPerdida = bajas.reduce((acc, b) => acc + (b.costoPerdidaTotal || 0), 0);
  const totalUnidades = bajas.reduce((acc, b) => acc + (b.cantidad || 0), 0);

  const getMotivoBadge = (mot: string) => {
    switch (mot) {
      case 'Vencimiento':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/30">VENCIMIENTO</span>;
      case 'ProduccionDefectuosa':
      case 'Defectuoso':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">HORNEADO DEFECTUOSO</span>;
      case 'Danado':
      case 'Averia':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30">AVERÍA / ROTURA</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-500/20 text-stone-700 dark:text-stone-300">{mot}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-800 via-rose-700 to-amber-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-rose-100 shadow-inner">
            <Trash2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-black tracking-tight">
                Control de Bajas & Mermas de Panadería
              </h1>
              <span className="text-[10px] bg-red-400 text-stone-950 px-2.5 py-0.5 rounded-full font-bold uppercase">
                Auditoría de Desperdicios
              </span>
            </div>
            <p className="text-xs text-rose-100 mt-1">
              Registro de producto no vendido, mermas de horneado y deducción directa del inventario
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all text-white"
            title="Refrescar bajas"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              if (productos.length > 0) setProductoId(productos[0].id);
              setShowModal(true);
            }}
            className="bg-white text-stone-950 hover:bg-red-50 font-extrabold shadow-lg"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Registrar Baja / Descarte
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-red-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-700 dark:text-red-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Pérdida Monetaria Total</p>
            <p className="text-2xl font-heading font-extrabold text-red-700 dark:text-red-400 font-mono">
              {formatCurrency(totalPerdida)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-red-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <PackageX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Unidades Descartadas</p>
            <p className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100 font-mono">
              {totalUnidades} u.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-red-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-500/20 text-stone-700 dark:text-stone-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Registros de Bajas</p>
            <p className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100 font-mono">
              {bajas.length} eventos
            </p>
          </div>
        </div>
      </div>

      {/* Write-offs Table */}
      <div className="responsive-table-container bg-white dark:bg-stone-900 border border-red-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-red-50/70 dark:bg-stone-950 text-stone-700 dark:text-stone-300 text-[11px] font-black uppercase tracking-wider border-b border-red-200/80 dark:border-stone-800">
              <th className="py-3 px-4">Fecha / Id</th>
              <th className="py-3 px-4">Producto Descartado</th>
              <th className="py-3 px-4 text-center">Cantidad</th>
              <th className="py-3 px-4 text-center">Motivo</th>
              <th className="py-3 px-4 text-right">Costo Unitario</th>
              <th className="py-3 px-4 text-right">Pérdida Total</th>
              <th className="py-3 px-4">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-100/60 dark:divide-stone-800 text-xs">
            {bajas.map(b => (
              <tr key={b.id} className="hover:bg-red-50/40 dark:hover:bg-stone-800/40 transition-colors">
                <td data-label="Fecha / Id" className="py-3 px-4">
                  <p className="font-mono font-bold text-red-700 dark:text-red-400">BAJA-#{b.id}</p>
                  <p className="text-[10px] text-stone-500">{new Date(b.fechaBaja).toLocaleDateString('es-CO')}</p>
                </td>
                <td data-label="Producto" className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                  {b.productoNombre}
                </td>
                <td data-label="Cantidad" className="py-3 px-4 text-center font-mono font-bold text-red-600">
                  -{b.cantidad} u.
                </td>
                <td data-label="Motivo" className="py-3 px-4 text-center">
                  {getMotivoBadge(b.motivo)}
                </td>
                <td data-label="Costo Unitario" className="py-3 px-4 text-right font-mono text-stone-600 dark:text-stone-400">
                  {formatCurrency(b.costoUnitario)}
                </td>
                <td data-label="Pérdida Total" className="py-3 px-4 text-right font-mono font-black text-red-700 dark:text-red-400 text-sm">
                  {formatCurrency(b.costoPerdidaTotal)}
                </td>
                <td data-label="Observaciones" className="py-3 px-4 text-stone-500 text-[11px] italic">
                  {b.observaciones || 'Sin notas'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Registrar Nueva Baja */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-red-300 dark:border-stone-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-heading font-extrabold text-base text-red-700 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Registrar Baja / Merma
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearBaja} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Producto a Descartar</label>
                <select
                  value={productoId}
                  onChange={(e) => setProductoId(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                >
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (Stock actual: {p.stock} u.)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Cantidad Descartada</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Motivo</label>
                  <select
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                  >
                    <option value="Vencimiento">Vencimiento / No vendido</option>
                    <option value="ProduccionDefectuosa">Merma / Defecto de Horno</option>
                    <option value="Averia">Avería / Rotura de empaque</option>
                    <option value="Devolucion">Devolución de Cliente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Observaciones / Justificación</label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Pan del día anterior no apto para venta fresca..."
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                />
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
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                  isLoading={isSubmitting}
                >
                  Descontar de Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
