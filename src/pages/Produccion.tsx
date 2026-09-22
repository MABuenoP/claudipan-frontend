import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { produccionService, OrdenProduccion, RecetaProduccion } from '../services/produccionService';
import { insumoService, Insumo } from '../services/insumoService';
import { productService, Product } from '../services/productService';
import { formatCurrency } from '../utils/helpers';
import { 
  Flame, BookOpen, PackageCheck, AlertTriangle, Plus, 
  CheckCircle2, Play, Clock, RefreshCw, X, ChevronRight,
  TrendingUp, Sparkles, Scale, Layers
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Produccion: React.FC = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'ordenes' | 'recetas' | 'insumos'>('ordenes');
  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([]);
  const [recetas, setRecetas] = useState<RecetaProduccion[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedRecetaModal, setSelectedRecetaModal] = useState<RecetaProduccion | null>(null);

  // Modal Nueva Orden
  const [showNuevaOrdenModal, setShowNuevaOrdenModal] = useState(false);
  const [productoId, setProductoId] = useState<number>(1);
  const [recetaId, setRecetaId] = useState<number | undefined>(undefined);
  const [cantidadProgramada, setCantidadProgramada] = useState<number>(50);
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Entregar Produccion
  const [ordenAEntregar, setOrdenAEntregar] = useState<OrdenProduccion | null>(null);
  const [cantidadProducida, setCantidadProducida] = useState<number>(50);
  const [obsEntrega, setObsEntrega] = useState('Horneado en punto, calidad óptima Claudipan');

  const fetchData = async () => {
    setLoading(true);
    const [resOrd, resRec, resIns, resProd] = await Promise.all([
      produccionService.getAllOrdenes(),
      produccionService.getAllRecetas(),
      insumoService.getAll(),
      productService.getProducts()
    ]);

    if (resOrd.success && resOrd.data) setOrdenes(resOrd.data);
    if (resRec.success && resRec.data) setRecetas(resRec.data);
    if (resIns.success && resIns.data) setInsumos(resIns.data);
    if (resProd.success && resProd.data) setProductos(resProd.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIniciarOrden = async (id: number) => {
    const res = await produccionService.iniciarOrden(id);
    if (res.success) {
      fetchData();
    } else {
      alert(res.message || 'Error al iniciar la orden de producción');
    }
  };

  const handleCrearOrden = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await produccionService.createOrden({
      productoId,
      recetaId,
      cantidadProgramada,
      observaciones
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowNuevaOrdenModal(false);
      setObservaciones('');
      fetchData();
    } else {
      alert(res.message || 'Error al crear la orden');
    }
  };

  const handleEntregarProduccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenAEntregar) return;

    setIsSubmitting(true);
    const res = await produccionService.entregarProduccion(ordenAEntregar.id, {
      cantidadProducida,
      observaciones: obsEntrega
    });
    setIsSubmitting(false);

    if (res.success) {
      setOrdenAEntregar(null);
      fetchData();
      alert(`¡Producción entregada exitosamente! Se agregaron ${cantidadProducida} unidades al inventario y se descontaron los insumos.`);
    } else {
      alert(res.message || 'Error al entregar la producción');
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">PENDIENTE</span>;
      case 'En_Proceso':
      case 'En Proceso':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-500/30 animate-pulse">EN HORNO / PREPARACIÓN</span>;
      case 'Entregada':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">ENTREGADA A STOCK</span>;
      case 'Cancelada':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/30">CANCELADA</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-stone-500/20 text-stone-700 dark:text-stone-300">{estado}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-amber-200 shadow-inner">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-black tracking-tight">
                Módulo de Panadería & Producción
              </h1>
              <span className="text-[10px] bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full font-bold uppercase">
                Área de Horneado
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-1">
              Fórmulas maestras, control de insumos y entrega directa al inventario mostrador
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all text-white"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              if (productos.length > 0) setProductoId(productos[0].id);
              setShowNuevaOrdenModal(true);
            }}
            className="bg-white text-stone-950 hover:bg-amber-100 font-extrabold shadow-lg"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Nueva Orden de Pan
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Órdenes Activas</p>
            <p className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
              {ordenes.filter(o => o.estado !== 'Entregada' && o.estado !== 'Cancelada').length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Unidades Horneadas</p>
            <p className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
              {ordenes.reduce((acc, o) => acc + (o.cantidadProducida || 0), 0)} u.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Fórmulas Registradas</p>
            <p className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
              {recetas.length} recetas
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-amber-200/80 dark:border-stone-800 gap-2">
        <button
          onClick={() => setActiveTab('ordenes')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ordenes'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Clock className="w-4 h-4" /> Órdenes de Producción ({ordenes.length})
        </button>

        <button
          onClick={() => setActiveTab('recetas')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'recetas'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Fórmulas & Rendimientos ({recetas.length})
        </button>

        <button
          onClick={() => setActiveTab('insumos')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'insumos'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Scale className="w-4 h-4" /> Stock de Materia Prima ({insumos.length})
        </button>
      </div>

      {/* Tab 1: Ordenes de Producción */}
      {activeTab === 'ordenes' && (
        <div className="space-y-4">
          <div className="responsive-table-container bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-100/50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 text-[11px] font-black uppercase tracking-wider border-b border-amber-200/80 dark:border-stone-800">
                  <th className="py-3 px-4">Código / Fecha</th>
                  <th className="py-3 px-4">Producto a Hornear</th>
                  <th className="py-3 px-4">Panadero</th>
                  <th className="py-3 px-4 text-center">Prog. / Prod.</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800 text-xs">
                {ordenes.map(ord => (
                  <tr key={ord.id} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40 transition-colors">
                    <td data-label="Código / Fecha" className="py-3 px-4">
                      <p className="font-mono font-bold text-amber-700 dark:text-amber-400">{ord.codigoOrden}</p>
                      <p className="text-[10px] text-stone-500">{new Date(ord.fechaOrden).toLocaleDateString('es-CO')}</p>
                    </td>
                    <td data-label="Producto" className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                      {ord.productoNombre}
                    </td>
                    <td data-label="Panadero" className="py-3 px-4 text-stone-600 dark:text-stone-400">
                      {ord.panaderoNombre || 'Panadero Turno'}
                    </td>
                    <td data-label="Prog. / Prod." className="py-3 px-4 text-center font-mono">
                      <span className="font-bold">{ord.cantidadProgramada}</span> / <span className="text-emerald-600 font-bold">{ord.cantidadProducida} u.</span>
                    </td>
                    <td data-label="Estado" className="py-3 px-4 text-center">
                      {getEstadoBadge(ord.estado)}
                    </td>
                    <td data-label="Acciones" className="py-3 px-4 text-right space-x-2">
                      {ord.estado === 'Pendiente' && (
                        <button
                          onClick={() => handleIniciarOrden(ord.id)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Play className="w-3 h-3" /> Iniciar Horno
                        </button>
                      )}
                      {ord.estado === 'En_Proceso' && (
                        <button
                          onClick={() => {
                            setOrdenAEntregar(ord);
                            setCantidadProducida(ord.cantidadProgramada);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition-all"
                        >
                          <PackageCheck className="w-3 h-3" /> Entregar a Stock
                        </button>
                      )}
                      {ord.estado === 'Entregada' && (
                        <span className="text-[11px] text-stone-400 italic">Despachado a Vitrina</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Fórmulas y Recetas */}
      {activeTab === 'recetas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recetas.map(rec => (
            <div 
              key={rec.id} 
              className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4 hover:border-amber-500 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-400 font-extrabold text-[10px] uppercase">
                    Fórmula Maestra
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-500">
                    Rinde: {rec.rendimientoUnidades} u.
                  </span>
                </div>
                
                <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                  {rec.nombreReceta}
                </h3>
                <p className="text-xs text-stone-500">{rec.descripcion || `Fórmula para ${rec.productoNombre}`}</p>
                
                {/* Ingredients summary */}
                <div className="p-3 bg-amber-50/60 dark:bg-stone-950 rounded-2xl border border-amber-200/60 dark:border-stone-800 space-y-1.5 text-xs">
                  <p className="font-bold text-[11px] text-stone-700 dark:text-stone-300">Insumos Requeridos:</p>
                  {rec.detalles && rec.detalles.length > 0 ? (
                    <ul className="space-y-1 text-[11px] text-stone-600 dark:text-stone-400">
                      {rec.detalles.map((d, i) => (
                        <li key={i} className="flex justify-between">
                          <span>• {d.insumoNombre || `Insumo #${d.insumoId}`}</span>
                          <span className="font-mono font-bold">{d.cantidadNecesaria} {d.unidadMedida}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[10px] text-stone-400 italic">Detalles cargados en servidor</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-amber-200/80 dark:border-stone-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 block">Costo Estimado Unitario</span>
                  <span className="font-mono font-black text-amber-700 dark:text-amber-400">
                    {formatCurrency(rec.costoUnitarioEstimado || 250)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProductoId(rec.productoId);
                    setRecetaId(rec.id);
                    setCantidadProgramada(rec.rendimientoUnidades);
                    setShowNuevaOrdenModal(true);
                  }}
                >
                  Hornear Lote
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Stock de Insumos */}
      {activeTab === 'insumos' && (
        <div className="space-y-4">
          <div className="responsive-table-container bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-100/50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 text-[11px] font-black uppercase tracking-wider border-b border-amber-200/80 dark:border-stone-800">
                  <th className="py-3 px-4">Materia Prima / Insumo</th>
                  <th className="py-3 px-4">Unidad</th>
                  <th className="py-3 px-4 text-center">Stock Actual</th>
                  <th className="py-3 px-4 text-center">Stock Mínimo</th>
                  <th className="py-3 px-4 text-right">Costo Unitario</th>
                  <th className="py-3 px-4 text-center">Alerta Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800 text-xs">
                {insumos.map(ins => (
                  <tr key={ins.id} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40 transition-colors">
                    <td data-label="Insumo" className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                      {ins.nombre}
                    </td>
                    <td data-label="Unidad" className="py-3 px-4 text-stone-600 dark:text-stone-400">
                      {ins.unidadMedida}
                    </td>
                    <td data-label="Stock Actual" className="py-3 px-4 text-center font-mono font-bold">
                      {ins.stockActual}
                    </td>
                    <td data-label="Stock Mínimo" className="py-3 px-4 text-center font-mono text-stone-500">
                      {ins.stockMinimo}
                    </td>
                    <td data-label="Costo Unitario" className="py-3 px-4 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                      {formatCurrency(ins.costoUnitario)}
                    </td>
                    <td data-label="Alerta" className="py-3 px-4 text-center">
                      {ins.stockActual <= ins.stockMinimo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/30 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> REABASTECER
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> ÓPTIMO
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Nueva Orden de Producción */}
      {showNuevaOrdenModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" /> Programar Horneado de Pan
              </h3>
              <button onClick={() => setShowNuevaOrdenModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearOrden} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Producto de Panadería</label>
                <select
                  value={productoId}
                  onChange={(e) => setProductoId(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold"
                >
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({formatCurrency(p.precio)}) - Stock actual: {p.stock} u.
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Cantidad a Producir (Unidades)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidadProgramada}
                  onChange={(e) => setCantidadProgramada(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Observaciones del Panadero</label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Turno mañana, pan caliente para vitrina..."
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => setShowNuevaOrdenModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1"
                  isLoading={isSubmitting}
                >
                  Crear Orden
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Entregar Producción a Inventario */}
      {ordenAEntregar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-heading font-extrabold text-lg text-emerald-600 flex items-center gap-2">
                <PackageCheck className="w-5 h-5" /> Entregar a Vitrina Mostrador
              </h3>
              <button onClick={() => setOrdenAEntregar(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300">
              Confirmar entrega del lote <strong>{ordenAEntregar.productoNombre}</strong> ({ordenAEntregar.codigoOrden}).
            </p>

            <form onSubmit={handleEntregarProduccion} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Unidades Listas y Horneadas</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidadProducida}
                  onChange={(e) => setCantidadProducida(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold text-sm"
                />
                <span className="text-[10px] text-stone-500">Programadas originalmente: {ordenAEntregar.cantidadProgramada} u.</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Nota de Calidad</label>
                <input
                  type="text"
                  value={obsEntrega}
                  onChange={(e) => setObsEntrega(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => setOrdenAEntregar(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  isLoading={isSubmitting}
                >
                  Confirmar & Cargar Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
