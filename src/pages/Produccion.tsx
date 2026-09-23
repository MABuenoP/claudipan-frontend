import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  produccionService, 
  OrdenProduccion, 
  RecetaProduccion, 
  PreChequeoInsumosResponse 
} from '../services/produccionService';
import { insumoService, Insumo } from '../services/insumoService';
import { productService, Product } from '../services/productService';
import { formatCurrency } from '../utils/helpers';
import { 
  Flame, BookOpen, PackageCheck, AlertTriangle, Plus, 
  CheckCircle2, Play, Clock, RefreshCw, X, ChevronRight,
  Sparkles, Scale, Layers, Recycle, ShieldAlert, CheckCircle,
  Timer, ArrowRight, Info, AlertOctagon, ChefHat, FileSpreadsheet,
  Search, ChevronDown, Eye
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { useFeedback } from '../hooks/useFeedback';
import { exportToExcel } from '../utils/excelExport';
import { LoadingModal } from '../components/ui/LoadingModal';

export const Produccion: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useFeedback();
  
  // Roles
  const userRole = user?.rol || 'Panadero';
  const canCreateOrders = userRole === 'Administrador' || userRole === 'Gerente';
  const canExecuteOrders = userRole === 'Panadero' || userRole === 'Administrador';
  const canExportExcel = userRole === 'Administrador' || userRole === 'Gerente' || userRole === 'Contador' || userRole === 'Contable';

  const [activeTab, setActiveTab] = useState<'ordenes' | 'recetas' | 'transformacion' | 'insumos'>('ordenes');
  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([]);
  const [recetas, setRecetas] = useState<RecetaProduccion[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  
  // Search States
  const [searchOrdenesInput, setSearchOrdenesInput] = useState('');
  const [searchOrdenesTerm, setSearchOrdenesTerm] = useState('');
  const [visibleOrdenesMobile, setVisibleOrdenesMobile] = useState(10);

  const [searchRecetasInput, setSearchRecetasInput] = useState('');
  const [searchRecetasTerm, setSearchRecetasTerm] = useState('');
  const [visibleRecetasMobile, setVisibleRecetasMobile] = useState(10);

  const [searchInsumosInput, setSearchInsumosInput] = useState('');
  const [searchInsumosTerm, setSearchInsumosTerm] = useState('');
  const [visibleInsumosMobile, setVisibleInsumosMobile] = useState(10);

  const [searchTransInput, setSearchTransInput] = useState('');
  const [searchTransTerm, setSearchTransTerm] = useState('');
  const [visibleTransMobile, setVisibleTransMobile] = useState(10);

  // Pagination
  const [pageOrdenes, setPageOrdenes] = useState(1);
  const [pageRecetas, setPageRecetas] = useState(1);
  const [pageInsumos, setPageInsumos] = useState(1);
  const [pageTransformacion, setPageTransformacion] = useState(1);

  const PAGE_SIZE_TABLE = 10;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal 1: Nueva Orden (Solo Gerente / Admin) con Pre-chequeo de existencias
  const [showNuevaOrdenModal, setShowNuevaOrdenModal] = useState(false);
  const [nuevoProductoId, setNuevoProductoId] = useState<number>(1);
  const [nuevoRecetaId, setNuevoRecetaId] = useState<number | undefined>(undefined);
  const [nuevaCantidadProgramada, setNuevaCantidadProgramada] = useState<number>(50);
  const [nuevasObservaciones, setNuevasObservaciones] = useState('');
  const [preChequeoData, setPreChequeoData] = useState<PreChequeoInsumosResponse | null>(null);
  const [loadingPreChequeo, setLoadingPreChequeo] = useState(false);

  // Modal 2: Paso 1 - Cargar Insumos (Panadero)
  const [ordenParaCargar, setOrdenParaCargar] = useState<OrdenProduccion | null>(null);
  const [obsCargue, setObsCargue] = useState('Insumos pesados y verificados');

  // Modal 3: Paso 2 - Masa a Punto -> Pasar a Horneando (Panadero)
  const [ordenParaHornear, setOrdenParaHornear] = useState<OrdenProduccion | null>(null);
  const [obsHorneando, setObsHorneando] = useState('Masa leudada en punto óptimo');

  // Modal 4: Paso 3 - Finalizar y Cuantificar Calidad (Panadero)
  const [ordenACuantificar, setOrdenACuantificar] = useState<OrdenProduccion | null>(null);
  const [cantOptima, setCantOptima] = useState<number>(45);
  const [cantBuenas, setCantBuenas] = useState<number>(5);
  const [cantMalas, setCantMalas] = useState<number>(0);
  const [destinoMalas, setDestinoMalas] = useState<'Transformacion' | 'Desecho'>('Transformacion');
  const [obsCuantificar, setObsCuantificar] = useState('Horneado con corteza dorada y miga suave');

  // Modal 5: Transformar Harina de Pan & Pastas Negras
  const [showTransformarModal, setShowTransformarModal] = useState(false);
  const [tipoTransformacion, setTipoTransformacion] = useState<'Harina de Pan' | 'Pastas Negras'>('Harina de Pan');
  const [cantTransformar, setCantTransformar] = useState<number>(20);
  const [obsTransformar, setObsTransformar] = useState('');

  // Modal 6: Ver Ingredientes de una Fórmula Maestra
  const [selectedRecetaVer, setSelectedRecetaVer] = useState<RecetaProduccion | null>(null);

  // Modal 7: + Nueva Fórmula Maestra
  const [showNuevaRecetaModal, setShowNuevaRecetaModal] = useState(false);
  const [nuevaRecetaNombre, setNuevaRecetaNombre] = useState('');
  const [nuevaRecetaProductoId, setNuevaRecetaProductoId] = useState<number>(1);
  const [nuevaRecetaRendimiento, setNuevaRecetaRendimiento] = useState<number>(50);
  const [nuevaRecetaDescripcion, setNuevaRecetaDescripcion] = useState('');
  const [nuevaRecetaDetalles, setNuevaRecetaDetalles] = useState<Array<{ insumoId: number; cantidadNecesaria: number; unidadMedida: string }>>([]);

  // Modal 8: + Nuevo Insumo
  const [showNuevoInsumoModal, setShowNuevoInsumoModal] = useState(false);
  const [nuevoInsumoNombre, setNuevoInsumoNombre] = useState('');
  const [nuevoInsumoUnidad, setNuevoInsumoUnidad] = useState('Kg');
  const [nuevoInsumoStockInicial, setNuevoInsumoStockInicial] = useState<number>(0);
  const [nuevoInsumoStockMinimo, setNuevoInsumoStockMinimo] = useState<number>(5);
  const [nuevoInsumoCostoUnitario, setNuevoInsumoCostoUnitario] = useState<number>(1000);
  const [nuevoInsumoProveedor, setNuevoInsumoProveedor] = useState('');

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
    if (resProd.success && resProd.data) {
      setProductos(resProd.data);
      if (resProd.data.length > 0) {
        setNuevoProductoId(resProd.data[0].id);
        setNuevaRecetaProductoId(resProd.data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pre-chequeo dinámico al cambiar producto o cantidad en modal de creación
  useEffect(() => {
    if (showNuevaOrdenModal && nuevoProductoId > 0 && nuevaCantidadProgramada > 0) {
      const timer = setTimeout(async () => {
        setLoadingPreChequeo(true);
        const res = await produccionService.preChequeoInsumos({
          productoId: nuevoProductoId,
          recetaId: nuevoRecetaId,
          cantidadProgramada: nuevaCantidadProgramada
        });
        if (res.success && res.data) {
          setPreChequeoData(res.data);
        }
        setLoadingPreChequeo(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showNuevaOrdenModal, nuevoProductoId, nuevoRecetaId, nuevaCantidadProgramada]);

  // Manejador: Crear Orden (Gerente / Admin)
  const handleCrearOrden = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await produccionService.createOrden({
      productoId: nuevoProductoId,
      recetaId: nuevoRecetaId,
      cantidadProgramada: nuevaCantidadProgramada,
      observaciones: nuevasObservaciones
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowNuevaOrdenModal(false);
      setNuevasObservaciones('');
      fetchData();
      showSuccess('¡Orden de producción creada exitosamente! Ha quedado en estado PENDIENTE para que el panadero inicie el cargue.', 'Orden Creada');
    } else {
      showError(res.message || 'Error al crear la orden de producción', 'Error de Producción');
    }
  };

  // Manejador: Crear Orden de Transformación (Harina / Pastas)
  const handleCrearTransformacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let targetProd = productos.find(p => p.nombre.toLowerCase().includes(tipoTransformacion.toLowerCase()));
    if (!targetProd) {
      targetProd = productos[0];
    }
    const res = await produccionService.createOrden({
      productoId: targetProd?.id || 1,
      cantidadProgramada: cantTransformar,
      observaciones: `Transformación: ${tipoTransformacion}. ${obsTransformar}`
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowTransformarModal(false);
      setObsTransformar('');
      fetchData();
      showSuccess(`¡Orden de transformación para ${tipoTransformacion} creada con éxito!`, 'Transformación Programada');
    } else {
      showError(res.message || 'Error al crear orden de transformación', 'Error de Transformación');
    }
  };

  // Manejador: Crear Nueva Fórmula Maestra
  const handleCrearReceta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaRecetaNombre.trim()) {
      showWarning('Por favor ingrese el nombre de la fórmula maestra.', 'Campo Requerido');
      return;
    }
    if (nuevaRecetaDetalles.length === 0) {
      showWarning('Debe agregar al menos un ingrediente / insumo a la fórmula.', 'Ingredientes Requeridos');
      return;
    }
    setIsSubmitting(true);
    const res = await produccionService.createReceta({
      productoId: nuevaRecetaProductoId,
      nombreReceta: nuevaRecetaNombre,
      descripcion: nuevaRecetaDescripcion,
      rendimientoUnidades: nuevaRecetaRendimiento,
      detalles: nuevaRecetaDetalles.map(d => ({
        insumoId: d.insumoId,
        cantidadNecesaria: d.cantidadNecesaria,
        unidadMedida: d.unidadMedida
      }))
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowNuevaRecetaModal(false);
      setNuevaRecetaNombre('');
      setNuevaRecetaDescripcion('');
      setNuevaRecetaRendimiento(50);
      setNuevaRecetaDetalles([]);
      fetchData();
      showSuccess('¡Fórmula maestra creada y guardada exitosamente!', 'Fórmula Creada');
    } else {
      showError(res.message || 'Error al crear fórmula maestra', 'Error de Receta');
    }
  };

  // Manejador: Crear Nuevo Insumo en Bodega
  const handleCrearInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoInsumoNombre.trim()) {
      showWarning('Por favor ingrese el nombre del insumo.', 'Campo Requerido');
      return;
    }
    setIsSubmitting(true);
    const res = await insumoService.create({
      nombre: nuevoInsumoNombre,
      unidadMedida: nuevoInsumoUnidad,
      stockActual: nuevoInsumoStockInicial,
      stockMinimo: nuevoInsumoStockMinimo,
      costoUnitario: nuevoInsumoCostoUnitario,
      proveedorPrincipal: nuevoInsumoProveedor,
      activo: true
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowNuevoInsumoModal(false);
      setNuevoInsumoNombre('');
      setNuevoInsumoStockInicial(0);
      setNuevoInsumoStockMinimo(5);
      setNuevoInsumoCostoUnitario(1000);
      setNuevoInsumoProveedor('');
      fetchData();
      showSuccess('¡Insumo registrado exitosamente en el inventario de bodega!', 'Insumo Creado');
    } else {
      showError(res.message || 'Error al registrar insumo', 'Error de Insumo');
    }
  };

  // Manejador: Paso 1 Panadero - Cargar Insumos & Iniciar Preparación
  const handleConfirmarCargueInsumos = async () => {
    if (!ordenParaCargar) return;
    setIsSubmitting(true);
    const res = await produccionService.cargarInsumos(ordenParaCargar.id, {
      observaciones: obsCargue
    });
    setIsSubmitting(false);

    if (res.success) {
      setOrdenParaCargar(null);
      fetchData();
      showSuccess(res.message || 'Insumos descontados y orden en preparación.', 'Cargue Exitoso');
    } else {
      showError(res.message || 'Error al cargar insumos', 'Error de Cargue');
    }
  };

  // Manejador: Paso 2 Panadero - Masa a Punto -> Pasar a Horneando
  const handleConfirmarPasarHorneando = async () => {
    if (!ordenParaHornear) return;
    setIsSubmitting(true);
    const res = await produccionService.pasarHorneando(ordenParaHornear.id, {
      observaciones: obsHorneando
    });
    setIsSubmitting(false);

    if (res.success) {
      setOrdenParaHornear(null);
      fetchData();
      showSuccess('¡Masa a punto confirmada! La orden ha entrado a la cámara de HORNEANDO.', 'Etapa Horneando');
    } else {
      showError(res.message || 'Error al pasar a horneando', 'Error de Horneado');
    }
  };

  // Manejador: Paso 3 Panadero - Culminar Horneado & Cuantificar Calidad
  const handleConfirmarCuantificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenACuantificar) return;

    const total = cantOptima + cantBuenas + cantMalas;
    if (total <= 0) {
      showWarning('Debe especificar al menos una (1) unidad producida para cuantificar.', 'Cantidad Requerida');
      return;
    }

    setIsSubmitting(true);
    const res = await produccionService.finalizarYCuantificar(ordenACuantificar.id, {
      cantOptima,
      cantBuenasCondiciones: cantBuenas,
      cantMalasCondiciones: cantMalas,
      destinoMalasCondiciones: destinoMalas,
      observaciones: obsCuantificar
    });
    setIsSubmitting(false);

    if (res.success) {
      setOrdenACuantificar(null);
      fetchData();
      showSuccess(res.message || '¡Producción entregada y cuantificada exitosamente!', 'Producción Culminada');
    } else {
      showError(res.message || 'Error al finalizar producción', 'Error de Finalización');
    }
  };

  // Badges de Estado
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" /> PENDIENTE
          </span>
        );
      case 'Preparando':
      case 'En_Preparacion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/30 animate-pulse">
            <ChefHat className="w-3 h-3" /> PREPARANDO MASA
          </span>
        );
      case 'Horneando':
      case 'En_Proceso':
      case 'En Proceso':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-500/30 animate-pulse">
            <Flame className="w-3 h-3 text-orange-600 animate-bounce" /> HORNEANDO
          </span>
        );
      case 'Entregada':
      case 'Finalizada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> ENTREGADA A VITRINA
          </span>
        );
      case 'Cancelada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/30">
            <X className="w-3 h-3" /> CANCELADA
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-stone-500/20 text-stone-700 dark:text-stone-300 border border-stone-500/30">
            {estado}
          </span>
        );
    }
  };

  // Insumos en déficit negativo o en alerta
  const insumosNegativos = insumos.filter(i => i.stockActual < 0);
  const insumosTransformacion = insumos.find(i => i.nombre.includes('Transformación') || i.nombre.includes('Miga de Pan'));

  // Filtered lists based on search
  const filteredOrdenes = ordenes.filter(o => {
    if (!searchOrdenesTerm) return true;
    const term = searchOrdenesTerm.toLowerCase();
    return (
      o.codigoOrden.toLowerCase().includes(term) ||
      o.productoNombre.toLowerCase().includes(term) ||
      (o.recetaNombre && o.recetaNombre.toLowerCase().includes(term)) ||
      (o.panaderoNombre && o.panaderoNombre.toLowerCase().includes(term)) ||
      o.estado.toLowerCase().includes(term) ||
      (o.observaciones && o.observaciones.toLowerCase().includes(term))
    );
  });

  const ordenesTransformacion = ordenes.filter(o => 
    o.productoNombre.toLowerCase().includes('harina de pan') || 
    o.productoNombre.toLowerCase().includes('pastas negras') ||
    o.observaciones?.toLowerCase().includes('transformaci')
  );

  const filteredTransformaciones = ordenesTransformacion.filter(o => {
    if (!searchTransTerm) return true;
    const term = searchTransTerm.toLowerCase();
    return (
      o.codigoOrden.toLowerCase().includes(term) ||
      o.productoNombre.toLowerCase().includes(term) ||
      (o.panaderoNombre && o.panaderoNombre.toLowerCase().includes(term)) ||
      o.estado.toLowerCase().includes(term) ||
      (o.observaciones && o.observaciones.toLowerCase().includes(term))
    );
  });

  const filteredRecetas = recetas.filter(r => {
    if (!searchRecetasTerm) return true;
    const term = searchRecetasTerm.toLowerCase();
    return (
      r.nombreReceta.toLowerCase().includes(term) ||
      r.productoNombre.toLowerCase().includes(term) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(term)) ||
      `#F-${r.id}`.toLowerCase().includes(term)
    );
  });

  const filteredInsumos = insumos.filter(i => {
    if (!searchInsumosTerm) return true;
    const term = searchInsumosTerm.toLowerCase();
    return (
      i.nombre.toLowerCase().includes(term) ||
      i.unidadMedida.toLowerCase().includes(term) ||
      `#${i.id}`.includes(term)
    );
  });

  // Excel Exports
  const handleExportExcelOrdenes = () => {
    exportToExcel<OrdenProduccion>({
      filename: 'Ordenes_Produccion_Panaderia_Claudipan',
      sheetName: 'Órdenes Producción',
      title: 'Reporte Oficial de Órdenes de Producción y Panadería - Claudipan',
      data: filteredOrdenes,
      columns: [
        { header: 'Código Orden', accessor: (o) => o.codigoOrden, width: 16 },
        { header: 'Fecha Programada', accessor: (o) => new Date(o.fechaOrden).toLocaleDateString('es-CO'), width: 16 },
        { header: 'Producto', accessor: (o) => o.productoNombre, width: 25 },
        { header: 'Fórmula / Receta', accessor: (o) => o.recetaNombre || 'Estándar', width: 25 },
        { header: 'Panadero Asignado', accessor: (o) => o.panaderoNombre || 'Panadero Turno', width: 22 },
        { header: 'Cant. Programada', accessor: (o) => o.cantidadProgramada, width: 16 },
        { header: 'Cant. Producida', accessor: (o) => o.cantidadProducida, width: 16 },
        { header: 'Estado', accessor: (o) => o.estado, width: 16 },
        { header: 'Observaciones', accessor: (o) => o.observaciones || '', width: 30 },
      ],
    });
  };

  const handleExportExcelTransformaciones = () => {
    exportToExcel<OrdenProduccion>({
      filename: 'Ordenes_Transformacion_Claudipan',
      sheetName: 'Transformaciones',
      title: 'Reporte Oficial de Transformación y Reutilización - Claudipan',
      data: filteredTransformaciones,
      columns: [
        { header: 'Código', accessor: (o) => o.codigoOrden, width: 16 },
        { header: 'Fecha', accessor: (o) => new Date(o.fechaOrden).toLocaleDateString('es-CO'), width: 16 },
        { header: 'Producto / Transformación', accessor: (o) => o.productoNombre, width: 28 },
        { header: 'Cant. Programada', accessor: (o) => o.cantidadProgramada, width: 18 },
        { header: 'Cant. Producida', accessor: (o) => o.cantidadProducida, width: 18 },
        { header: 'Panadero', accessor: (o) => o.panaderoNombre || 'Panadero Turno', width: 22 },
        { header: 'Estado', accessor: (o) => o.estado, width: 16 },
        { header: 'Observaciones', accessor: (o) => o.observaciones || '', width: 30 },
      ],
    });
  };

  const handleExportExcelRecetas = () => {
    exportToExcel<RecetaProduccion>({
      filename: 'Formulas_Maestras_Produccion_Claudipan',
      sheetName: 'Formulas',
      title: 'Reporte Oficial de Fórmulas Maestras y Rendimientos - Claudipan',
      data: filteredRecetas,
      columns: [
        { header: 'ID', accessor: (r) => r.id, width: 10 },
        { header: 'Nombre Fórmula', accessor: (r) => r.nombreReceta, width: 28 },
        { header: 'Producto Base', accessor: (r) => r.productoNombre, width: 24 },
        { header: 'Rendimiento Esperado (un)', accessor: (r) => r.rendimientoUnidades, width: 22 },
        { header: 'Costo Unit. Estimado ($)', accessor: (r) => r.costoUnitarioEstimado || 0, width: 20 },
        { header: 'Costo Total Insumos ($)', accessor: (r) => r.costoTotalInsumos || 0, width: 20 },
        { header: 'Cant. Ingredientes', accessor: (r) => r.detalles?.length || 0, width: 18 },
      ],
    });
  };

  const handleExportExcelInsumos = () => {
    exportToExcel<Insumo>({
      filename: 'Bodega_Insumos_MateriasPrimas_Claudipan',
      sheetName: 'Insumos',
      title: 'Reporte Oficial de Bodega de Insumos y Materias Primas - Claudipan',
      data: filteredInsumos,
      columns: [
        { header: 'ID', accessor: (i) => i.id, width: 10 },
        { header: 'Materia Prima / Insumo', accessor: (i) => i.nombre, width: 28 },
        { header: 'Unidad de Medida', accessor: (i) => i.unidadMedida, width: 18 },
        { header: 'Stock Actual', accessor: (i) => i.stockActual, width: 16 },
        { header: 'Stock Mínimo', accessor: (i) => i.stockMinimo, width: 16 },
        { header: 'Costo Unitario ($)', accessor: (i) => i.costoUnitario, width: 18 },
      ],
    });
  };

  // Paginated Data for desktop
  const paginatedOrdenes = filteredOrdenes.slice((pageOrdenes - 1) * PAGE_SIZE_TABLE, pageOrdenes * PAGE_SIZE_TABLE);
  const paginatedTransformaciones = filteredTransformaciones.slice((pageTransformacion - 1) * PAGE_SIZE_TABLE, pageTransformacion * PAGE_SIZE_TABLE);
  const paginatedRecetas = filteredRecetas.slice((pageRecetas - 1) * PAGE_SIZE_TABLE, pageRecetas * PAGE_SIZE_TABLE);
  const paginatedInsumos = filteredInsumos.slice((pageInsumos - 1) * PAGE_SIZE_TABLE, pageInsumos * PAGE_SIZE_TABLE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner (Sin botón de orden superior) */}
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
              <span className="text-[10px] bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                {userRole === 'Panadero' ? 'Mesa de Trabajo Panadero' : 'Supervisión & Programación'}
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-1">
              Flujo integral: Cargue de insumos con giro en negativo $\rightarrow$ Masa en preparación $\rightarrow$ Horno $\rightarrow$ Cuantificación y Transformación
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all text-white cursor-pointer"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alerta Destacada: Insumos Girados en Negativo */}
      {insumosNegativos.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 rounded-3xl shadow-lg border border-red-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <ShieldAlert className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h4 className="font-heading font-black text-sm uppercase tracking-wide">
                ¡Alerta de Inventario en Negativo ({insumosNegativos.length} Insumos Faltantes)!
              </h4>
              <p className="text-xs text-red-100">
                Se ha despachado producción con existencias deficitarias. Gerencia / Administración debe gestionar la compra inmediata:
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {insumosNegativos.map(ins => (
              <span key={ins.id} className="px-3 py-1 bg-white text-red-700 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" /> {ins.nombre}: <strong className="font-mono">{ins.stockActual} {ins.unidadMedida}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Órdenes Totales</p>
            <p className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
              {ordenes.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-700 dark:text-orange-400 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">En Horneado / Prep.</p>
            <p className="text-2xl font-heading font-extrabold text-orange-700 dark:text-orange-400">
              {ordenes.filter(o => o.estado === 'Horneando' || o.estado === 'Preparando' || o.estado === 'En_Proceso').length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Panes Horneados</p>
            <p className="text-2xl font-heading font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
              {ordenes.reduce((acc, o) => acc + (o.cantidadProducida || 0), 0)} u.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Pan Transformación</p>
            <p className="text-2xl font-heading font-extrabold text-teal-700 dark:text-teal-400 font-mono">
              {insumosTransformacion ? insumosTransformacion.stockActual : 0} Kg
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-amber-200/80 dark:border-stone-800 max-w-full">
        <button
          onClick={() => setActiveTab('ordenes')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ordenes'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Clock className="w-4 h-4" /> Mesa de Órdenes ({ordenes.length})
        </button>

        <button
          onClick={() => setActiveTab('transformacion')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'transformacion'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Recycle className="w-4 h-4" /> Transformación & Reutilización ({ordenesTransformacion.length})
        </button>

        <button
          onClick={() => setActiveTab('recetas')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'recetas'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Fórmulas Maestras ({recetas.length})
        </button>

        <button
          onClick={() => setActiveTab('insumos')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'insumos'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Scale className="w-4 h-4" /> Bodega de Insumos ({insumos.length})
        </button>
      </div>

      {/* Tab 1: Mesa de Órdenes de Producción */}
      {activeTab === 'ordenes' && (
        <div className="space-y-4">
          {/* Top Bar: Search on Left + Actions on Right (Horizontal single-line) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setSearchOrdenesTerm(searchOrdenesInput);
                setPageOrdenes(1);
              }}
              className="flex items-center gap-2 flex-1 max-w-md"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar orden por código, producto, panadero..."
                  value={searchOrdenesInput}
                  onChange={(e) => {
                    setSearchOrdenesInput(e.target.value);
                    if (e.target.value === '') setSearchOrdenesTerm('');
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                {searchOrdenesInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOrdenesInput('');
                      setSearchOrdenesTerm('');
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
                  onClick={handleExportExcelOrdenes}
                  className="text-emerald-700 dark:text-emerald-300 border-emerald-600 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-sm whitespace-nowrap"
                >
                  Exportar a Excel
                </Button>
              )}
              {canCreateOrders && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    if (productos.length > 0) setNuevoProductoId(productos[0].id);
                    setShowNuevaOrdenModal(true);
                  }}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Orden
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block responsive-table-container bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-100/50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 text-[11px] font-black uppercase tracking-wider border-b border-amber-200/80 dark:border-stone-800">
                  <th className="py-3 px-4">Código / Fecha</th>
                  <th className="py-3 px-4">Producto a Hornear</th>
                  <th className="py-3 px-4">Panadero Asignado</th>
                  <th className="py-3 px-4 text-center">Prog. / Real</th>
                  <th className="py-3 px-4 text-center">Estado del Lote</th>
                  <th className="py-3 px-4 text-right">Flujo Panadero</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800 text-xs">
                {paginatedOrdenes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400 italic">
                      No se encontraron órdenes de producción.
                    </td>
                  </tr>
                ) : (
                  paginatedOrdenes.map(ord => (
                    <tr key={ord.id} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-mono font-bold text-amber-700 dark:text-amber-400">{ord.codigoOrden}</p>
                        <p className="text-[10px] text-stone-400">{new Date(ord.fechaOrden).toLocaleDateString('es-CO')}</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                        {ord.productoNombre}
                        {ord.recetaNombre && (
                          <p className="text-[10px] text-stone-500 font-normal">Fórmula: {ord.recetaNombre}</p>
                        )}
                        {ord.observaciones && (
                          <p className="text-[10px] text-stone-400 italic mt-0.5">{ord.observaciones}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                        {ord.panaderoNombre || 'Panadero de Turno'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="font-bold text-stone-900 dark:text-stone-100">{ord.cantidadProgramada} u.</span>
                        {ord.cantidadProducida > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-[10px]">
                            Real: {ord.cantidadProducida} u.
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getEstadoBadge(ord.estado)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canExecuteOrders && ord.estado === 'Pendiente' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setOrdenParaCargar(ord);
                              setObsCargue('Insumos pesados y verificados en bodega');
                            }}
                            className="bg-purple-700 hover:bg-purple-600 text-white font-bold text-[11px]"
                          >
                            1. Cargar Insumos
                          </Button>
                        )}

                        {canExecuteOrders && (ord.estado === 'Preparando' || ord.estado === 'En_Preparacion') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setOrdenParaHornear(ord);
                              setObsHorneando('Masa leudada en punto óptimo');
                            }}
                            className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px]"
                          >
                            2. Masa a Punto
                          </Button>
                        )}

                        {canExecuteOrders && (ord.estado === 'Horneando' || ord.estado === 'En_Proceso' || ord.estado === 'En Proceso') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setOrdenACuantificar(ord);
                              setCantOptima(ord.cantidadProgramada);
                              setCantBuenas(0);
                              setCantMalas(0);
                              setObsCuantificar('Lote culminado con dorado homogéneo');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            3. Cuantificar Lote
                          </Button>
                        )}

                        {ord.estado === 'Entregada' && (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Culminada
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination */}
          <div className="hidden md:block">
            <Pagination
              currentPage={pageOrdenes}
              totalItems={filteredOrdenes.length}
              pageSize={PAGE_SIZE_TABLE}
              onPageChange={setPageOrdenes}
              itemLabel="órdenes de producción"
            />
          </div>

          {/* Mobile CardView (10 en 10) */}
          <div className="md:hidden space-y-3">
            {filteredOrdenes.slice(0, visibleOrdenesMobile).map(ord => (
              <div key={ord.id} className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">{ord.codigoOrden}</span>
                  {getEstadoBadge(ord.estado)}
                </div>
                <h4 className="font-heading font-black text-sm text-stone-900 dark:text-stone-100">{ord.productoNombre}</h4>
                <p className="text-xs text-stone-500">Programada: <strong className="font-mono">{ord.cantidadProgramada} u.</strong> | Real: <strong className="font-mono text-emerald-600">{ord.cantidadProducida || 0} u.</strong></p>
                <p className="text-xs text-stone-500">Panadero: <strong className="text-stone-700 dark:text-stone-300">{ord.panaderoNombre || 'Panadero Turno'}</strong></p>

                {canExecuteOrders && (
                  <div className="pt-2 border-t border-amber-100 dark:border-stone-800 flex justify-end">
                    {ord.estado === 'Pendiente' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setOrdenParaCargar(ord);
                          setObsCargue('Insumos pesados y verificados en bodega');
                        }}
                        className="w-full bg-purple-700 text-white font-bold text-xs"
                      >
                        1. Cargar Insumos
                      </Button>
                    )}
                    {(ord.estado === 'Preparando' || ord.estado === 'En_Preparacion') && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setOrdenParaHornear(ord);
                          setObsHorneando('Masa leudada en punto óptimo');
                        }}
                        className="w-full bg-orange-600 text-white font-bold text-xs"
                      >
                        2. Masa a Punto
                      </Button>
                    )}
                    {(ord.estado === 'Horneando' || ord.estado === 'En_Proceso') && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setOrdenACuantificar(ord);
                          setCantOptima(ord.cantidadProgramada);
                          setCantBuenas(0);
                          setCantMalas(0);
                        }}
                        className="w-full bg-emerald-600 text-white font-bold text-xs"
                      >
                        3. Cuantificar Lote
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {visibleOrdenesMobile < filteredOrdenes.length && (
              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleOrdenesMobile(prev => prev + 10)}
                  className="w-full text-amber-700 dark:text-amber-400 border-amber-500 font-bold"
                >
                  <ChevronDown className="w-4 h-4 mr-1" /> Cargar 10 órdenes más ({visibleOrdenesMobile} de {filteredOrdenes.length})
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Centro de Transformación (Harina de Pan & Pastas Negras) */}
      {activeTab === 'transformacion' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-stone-900 text-white p-6 rounded-3xl border border-teal-500/30 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-400/30 text-teal-300">
                <Recycle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-black">Centro de Transformación y Reutilización Gastronómica</h3>
                <p className="text-xs text-teal-100">
                  Aprovechamiento de panes de horneado en mala condición para la elaboración de <strong>Harina de Pan</strong> y <strong>Pastas Negras Tradicionales</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-teal-200 font-bold uppercase">Materia Prima Disponible</p>
                  <p className="text-2xl font-mono font-black">{insumosTransformacion?.stockActual || 0} Kg</p>
                  <p className="text-[10px] text-teal-300">Pan de Transformación acumulado</p>
                </div>
                <Recycle className="w-10 h-10 text-teal-300 opacity-60" />
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-teal-200 font-bold uppercase">Impacto Contable de Merma</p>
                  <p className="text-2xl font-mono font-black text-emerald-300">100% Recuperado</p>
                  <p className="text-[10px] text-teal-300">Evita pérdidas por desecho en balance P&G</p>
                </div>
                <PackageCheck className="w-10 h-10 text-emerald-300 opacity-60" />
              </div>
            </div>
          </div>

          {/* Top Bar for Transformación */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setSearchTransTerm(searchTransInput);
                setPageTransformacion(1);
              }}
              className="flex items-center gap-2 flex-1 max-w-md"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar orden de transformación..."
                  value={searchTransInput}
                  onChange={(e) => {
                    setSearchTransInput(e.target.value);
                    if (e.target.value === '') setSearchTransTerm('');
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                {searchTransInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTransInput('');
                      setSearchTransTerm('');
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
                  onClick={handleExportExcelTransformaciones}
                  className="text-emerald-700 dark:text-emerald-300 border-emerald-600 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-sm whitespace-nowrap"
                >
                  Exportar a Excel
                </Button>
              )}
              {canCreateOrders && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowTransformarModal(true)}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Transformar
                </Button>
              )}
            </div>
          </div>

          {/* Table of Transformation Orders */}
          <div className="hidden md:block responsive-table-container bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-100/50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 text-[11px] font-black uppercase tracking-wider border-b border-amber-200/80 dark:border-stone-800">
                  <th className="py-3 px-4">Código / Fecha</th>
                  <th className="py-3 px-4">Tipo Transformación / Producto</th>
                  <th className="py-3 px-4">Panadero Asignado</th>
                  <th className="py-3 px-4 text-center">Cant. Producida</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Flujo / Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800 text-xs">
                {paginatedTransformaciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400 italic">
                      Por ahora no hay órdenes de producir Harina de Pan ni Pastas Negras registradas. Utilice el botón <strong>"+ Transformar"</strong> para registrar una nueva orden de transformación.
                    </td>
                  </tr>
                ) : (
                  paginatedTransformaciones.map(ord => (
                    <tr key={ord.id} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-mono font-bold text-teal-700 dark:text-teal-400">{ord.codigoOrden}</p>
                        <p className="text-[10px] text-stone-400">{new Date(ord.fechaOrden).toLocaleDateString('es-CO')}</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                        {ord.productoNombre}
                        {ord.observaciones && <p className="text-[10px] text-stone-400 font-normal">{ord.observaciones}</p>}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                        {ord.panaderoNombre || 'Panadero Turno'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-emerald-700 dark:text-emerald-400">
                        {ord.cantidadProducida || ord.cantidadProgramada} u.
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getEstadoBadge(ord.estado)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canExecuteOrders && ord.estado === 'Pendiente' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setOrdenParaCargar(ord);
                              setObsCargue('Pan de transformación pesado y molido');
                            }}
                            className="bg-purple-700 text-white font-bold text-[11px]"
                          >
                            Cargar Pan
                          </Button>
                        )}
                        {ord.estado === 'Entregada' && (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Culminada
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination for Transformación */}
          {filteredTransformaciones.length > 0 && (
            <div className="hidden md:block">
              <Pagination
                currentPage={pageTransformacion}
                totalItems={filteredTransformaciones.length}
                pageSize={PAGE_SIZE_TABLE}
                onPageChange={setPageTransformacion}
                itemLabel="órdenes de transformación"
              />
            </div>
          )}

          {/* Mobile CardView (10 en 10) for Transformación */}
          <div className="md:hidden space-y-3">
            {filteredTransformaciones.slice(0, visibleTransMobile).map(ord => (
              <div key={ord.id} className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-teal-200 dark:border-stone-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">{ord.codigoOrden}</span>
                  {getEstadoBadge(ord.estado)}
                </div>
                <h4 className="font-heading font-black text-sm text-stone-900 dark:text-stone-100">{ord.productoNombre}</h4>
                <p className="text-xs text-stone-500">Cantidad: <strong className="font-mono">{ord.cantidadProgramada} u.</strong></p>
                <p className="text-xs text-stone-500">Panadero: <strong className="text-stone-700 dark:text-stone-300">{ord.panaderoNombre || 'Panadero Turno'}</strong></p>
              </div>
            ))}

            {visibleTransMobile < filteredTransformaciones.length && (
              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleTransMobile(prev => prev + 10)}
                  className="w-full text-teal-700 dark:text-teal-400 border-teal-500 font-bold"
                >
                  <ChevronDown className="w-4 h-4 mr-1" /> Cargar 10 transformaciones más ({visibleTransMobile} de {filteredTransformaciones.length})
                </Button>
              </div>
            )}
          </div>

          {/* Recipe Cards Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-white dark:bg-stone-900 border border-teal-300 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-800 dark:text-teal-300 rounded-full font-black text-[10px] uppercase">
                  Fórmula de Transformación #1
                </span>
                <span className="font-mono text-xs font-bold text-stone-500">Rendimiento: 20 paquetes (500g)</span>
              </div>
              <h3 className="text-lg font-heading font-extrabold text-stone-900 dark:text-stone-100">
                Harina de Pan Claudipan
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                <strong>Procedimiento:</strong> Tostado en horno de leña a baja temperatura (120°C) de las piezas de pan de transformación hasta secado completo. Posterior molienda fina y tamizado para empacar en presentaciones de 500g para rebozados y cocina.
              </p>
              <div className="p-3 bg-teal-50/60 dark:bg-stone-950 rounded-2xl border border-teal-200 dark:border-stone-800 text-xs">
                <p className="font-bold text-stone-700 dark:text-stone-300">Insumo Requerido:</p>
                <p className="text-stone-600 dark:text-stone-400 mt-0.5">• Pan de Transformación: <strong>5.00 Kg</strong></p>
              </div>
              {canCreateOrders && (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full bg-teal-700 hover:bg-teal-600 text-white font-bold cursor-pointer"
                  onClick={() => {
                    setTipoTransformacion('Harina de Pan');
                    setCantTransformar(20);
                    setShowTransformarModal(true);
                  }}
                >
                  Fabricar Harina
                </Button>
              )}
            </div>

            <div className="bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-full font-black text-[10px] uppercase">
                  Fórmula de Transformación #2
                </span>
                <span className="font-mono text-xs font-bold text-stone-500">Rendimiento: 30 unidades</span>
              </div>
              <h3 className="text-lg font-heading font-extrabold text-stone-900 dark:text-stone-100">
                Pastas Negras Tradicionales
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                <strong>Procedimiento:</strong> Hidratación y cocción de pan de transformación en almíbar espeso de panela quemada con canela y clavo de olor. Moldeado en piezas compactas y horneado breve a 180°C para caramelización artesanal.
              </p>
              <div className="p-3 bg-amber-50/60 dark:bg-stone-950 rounded-2xl border border-amber-200 dark:border-stone-800 text-xs">
                <p className="font-bold text-stone-700 dark:text-stone-300">Insumos Requeridos:</p>
                <p className="text-stone-600 dark:text-stone-400 mt-0.5">• Pan de Transformación: <strong>4.00 Kg</strong></p>
              </div>
              {canCreateOrders && (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold cursor-pointer"
                  onClick={() => {
                    setTipoTransformacion('Pastas Negras');
                    setCantTransformar(30);
                    setShowTransformarModal(true);
                  }}
                >
                  Fabricar Pastas
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Fórmulas Maestras */}
      {activeTab === 'recetas' && (
        <div className="space-y-4">
          {/* Top Bar: Search on Left + Actions on Right (Horizontal single-line) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setSearchRecetasTerm(searchRecetasInput);
                setPageRecetas(1);
              }}
              className="flex items-center gap-2 flex-1 max-w-md"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar fórmula por código, nombre, producto..."
                  value={searchRecetasInput}
                  onChange={(e) => {
                    setSearchRecetasInput(e.target.value);
                    if (e.target.value === '') setSearchRecetasTerm('');
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                {searchRecetasInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchRecetasInput('');
                      setSearchRecetasTerm('');
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
                  onClick={handleExportExcelRecetas}
                  className="text-emerald-700 dark:text-emerald-300 border-emerald-600 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-sm whitespace-nowrap"
                >
                  Exportar a Excel
                </Button>
              )}
              {canCreateOrders && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowNuevaRecetaModal(true)}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Fórmula
                </Button>
              )}
            </div>
          </div>

          {/* Desktop HTML Data Table */}
          <div className="hidden md:block responsive-table-container bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-100/50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 text-[11px] font-black uppercase tracking-wider border-b border-amber-200/80 dark:border-stone-800">
                  <th className="py-3 px-4">Código / Fórmula</th>
                  <th className="py-3 px-4">Producto Base</th>
                  <th className="py-3 px-4 text-center">Rendimiento Esperado</th>
                  <th className="py-3 px-4 text-center">Ingredientes</th>
                  <th className="py-3 px-4 text-right">Costo Unit. Estimado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800 text-xs">
                {paginatedRecetas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400 italic">
                      No se encontraron recetas ni fórmulas maestras.
                    </td>
                  </tr>
                ) : (
                  paginatedRecetas.map(rec => (
                    <tr key={rec.id} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                        <div className="font-mono text-[10px] text-stone-400">#F-{rec.id}</div>
                        <div className="font-extrabold text-amber-700 dark:text-amber-400">{rec.nombreReceta}</div>
                        {rec.descripcion && (
                          <div className="text-[10px] text-stone-500 font-normal">{rec.descripcion}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-700 dark:text-stone-300 font-medium">
                        {rec.productoNombre}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-stone-800 dark:text-stone-200">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black">
                          {rec.rendimientoUnidades} unidades
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />}
                          onClick={() => setSelectedRecetaVer(rec)}
                          className="border-amber-300 dark:border-stone-700 text-amber-800 dark:text-amber-300 text-[11px] font-bold shadow-none cursor-pointer"
                        >
                          Ver ({rec.detalles?.length || 0})
                        </Button>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-amber-700 dark:text-amber-400">
                        {formatCurrency(rec.costoUnitarioEstimado || 250)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canCreateOrders && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setNuevoProductoId(rec.productoId);
                              setNuevoRecetaId(rec.id);
                              setNuevaCantidadProgramada(rec.rendimientoUnidades);
                              setShowNuevaOrdenModal(true);
                            }}
                            className="bg-amber-800 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Programar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination */}
          <div className="hidden md:block">
            <Pagination
              currentPage={pageRecetas}
              totalItems={filteredRecetas.length}
              pageSize={PAGE_SIZE_TABLE}
              onPageChange={setPageRecetas}
              itemLabel="recetas y fórmulas"
            />
          </div>

          {/* Mobile CardView (10 en 10) */}
          <div className="md:hidden space-y-3">
            {filteredRecetas.slice(0, visibleRecetasMobile).map(rec => (
              <div key={rec.id} className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-stone-400">#F-{rec.id}</span>
                    <h4 className="font-heading font-black text-sm text-stone-900 dark:text-stone-100">{rec.nombreReceta}</h4>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">{formatCurrency(rec.costoUnitarioEstimado || 250)}</span>
                </div>
                <p className="text-xs text-stone-500">Producto: <strong className="text-stone-700 dark:text-stone-300">{rec.productoNombre}</strong></p>
                <p className="text-xs text-stone-500">Rendimiento: <strong className="font-mono text-amber-700">{rec.rendimientoUnidades} u.</strong></p>

                <div className="pt-2 border-t border-amber-100 dark:border-stone-800 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedRecetaVer(rec)}
                    className="flex-1 border-amber-300 text-amber-800 dark:text-amber-300 font-bold text-xs"
                  >
                    Ver ({rec.detalles?.length || 0})
                  </Button>

                  {canCreateOrders && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setNuevoProductoId(rec.productoId);
                        setNuevoRecetaId(rec.id);
                        setNuevaCantidadProgramada(rec.rendimientoUnidades);
                        setShowNuevaOrdenModal(true);
                      }}
                      className="flex-1 bg-amber-800 text-white font-bold text-xs"
                    >
                      Programar
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {visibleRecetasMobile < filteredRecetas.length && (
              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleRecetasMobile(prev => prev + 10)}
                  className="w-full text-amber-700 dark:text-amber-400 border-amber-500 font-bold"
                >
                  <ChevronDown className="w-4 h-4 mr-1" /> Cargar 10 fórmulas más ({visibleRecetasMobile} de {filteredRecetas.length})
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Stock de Insumos & Giro en Negativo */}
      {activeTab === 'insumos' && (
        <div className="space-y-4">
          {/* Top Bar: Search on Left + Actions on Right (Horizontal single-line) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setSearchInsumosTerm(searchInsumosInput);
                setPageInsumos(1);
              }}
              className="flex items-center gap-2 flex-1 max-w-md"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar insumo o materia prima..."
                  value={searchInsumosInput}
                  onChange={(e) => {
                    setSearchInsumosInput(e.target.value);
                    if (e.target.value === '') setSearchInsumosTerm('');
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                {searchInsumosInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInsumosInput('');
                      setSearchInsumosTerm('');
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
                  onClick={handleExportExcelInsumos}
                  className="text-emerald-700 dark:text-emerald-300 border-emerald-600 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-sm whitespace-nowrap"
                >
                  Exportar a Excel
                </Button>
              )}
              {canCreateOrders && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowNuevoInsumoModal(true)}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Insumo
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block responsive-table-container bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-100/50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 text-[11px] font-black uppercase tracking-wider border-b border-amber-200/80 dark:border-stone-800">
                  <th className="py-3 px-4">Materia Prima / Insumo</th>
                  <th className="py-3 px-4">Unidad</th>
                  <th className="py-3 px-4 text-center">Stock Actual</th>
                  <th className="py-3 px-4 text-center">Stock Mínimo</th>
                  <th className="py-3 px-4 text-right">Costo Unitario</th>
                  <th className="py-3 px-4 text-center">Estado de Existencias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800 text-xs">
                {paginatedInsumos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400 italic">
                      No se encontraron materias primas ni insumos.
                    </td>
                  </tr>
                ) : (
                  paginatedInsumos.map(ins => (
                    <tr key={ins.id} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                        {ins.nombre}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                        {ins.unidadMedida}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span className={ins.stockActual < 0 ? 'text-red-600 dark:text-red-400 font-black' : ''}>
                          {ins.stockActual}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-stone-500">
                        {ins.stockMinimo}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                        {formatCurrency(ins.costoUnitario)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {ins.stockActual < 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-600 text-white animate-pulse">
                            <AlertOctagon className="w-3 h-3" /> SALDO NEGATIVO (COMPRAR)
                          </span>
                        ) : ins.stockActual <= ins.stockMinimo ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" /> BAJO MÍNIMO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> ÓPTIMO
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination */}
          <div className="hidden md:block">
            <Pagination
              currentPage={pageInsumos}
              totalItems={filteredInsumos.length}
              pageSize={PAGE_SIZE_TABLE}
              onPageChange={setPageInsumos}
              itemLabel="insumos y materias primas"
            />
          </div>

          {/* Mobile CardView (10 en 10) */}
          <div className="md:hidden space-y-3">
            {filteredInsumos.slice(0, visibleInsumosMobile).map(ins => (
              <div key={ins.id} className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-black text-sm text-stone-900 dark:text-stone-100">{ins.nombre}</h4>
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">{formatCurrency(ins.costoUnitario)}/{ins.unidadMedida}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Stock Actual: <strong className={`font-mono ${ins.stockActual < 0 ? 'text-red-600' : 'text-stone-800 dark:text-stone-200'}`}>{ins.stockActual} {ins.unidadMedida}</strong></span>
                  <span className="text-stone-500">Mínimo: <strong className="font-mono">{ins.stockMinimo}</strong></span>
                </div>
              </div>
            ))}

            {visibleInsumosMobile < filteredInsumos.length && (
              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleInsumosMobile(prev => prev + 10)}
                  className="w-full text-amber-700 dark:text-amber-400 border-amber-500 font-bold"
                >
                  <ChevronDown className="w-4 h-4 mr-1" /> Cargar 10 insumos más ({visibleInsumosMobile} de {filteredInsumos.length})
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Programar Orden de Panadería */}
      {showNuevaOrdenModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" /> Programar Orden de Panadería (Gerencia / Admin)
              </h3>
              <button onClick={() => setShowNuevaOrdenModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearOrden} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Producto de Panadería</label>
                  <select
                    value={nuevoProductoId}
                    onChange={(e) => setNuevoProductoId(Number(e.target.value))}
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
                    value={nuevaCantidadProgramada}
                    onChange={(e) => setNuevaCantidadProgramada(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Pre-chequeo interactivo de materias primas */}
              <div className="bg-amber-50/70 dark:bg-stone-950 p-4 rounded-2xl border border-amber-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 uppercase text-[11px]">
                    <Scale className="w-4 h-4 text-amber-600" /> Pre-chequeo de Existencias en Bodega
                  </span>
                  {loadingPreChequeo ? (
                    <span className="text-[10px] text-stone-400 animate-pulse">Calculando insumos...</span>
                  ) : preChequeoData?.tieneDeficit ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                      ⚠️ Habrá déficit (Giro en Negativo)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                      ✅ Insumos completos en bodega
                    </span>
                  )}
                </div>

                {preChequeoData?.insumos && preChequeoData.insumos.length > 0 ? (
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="text-stone-500 font-bold border-b border-stone-200 dark:border-stone-800 pb-1">
                          <th>Insumo</th>
                          <th className="text-center">Requerido</th>
                          <th className="text-center">Stock Actual</th>
                          <th className="text-center">Proyección</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800">
                        {preChequeoData.insumos.map((item, idx) => (
                          <tr key={idx} className="py-1">
                            <td className="py-1 font-bold text-stone-800 dark:text-stone-200">{item.insumoNombre}</td>
                            <td className="py-1 text-center font-mono">{item.cantidadRequerida.toFixed(2)} {item.unidadMedida}</td>
                            <td className="py-1 text-center font-mono">{item.stockActualBodega.toFixed(2)} {item.unidadMedida}</td>
                            <td className="py-1 text-center font-mono font-bold">
                              {item.esDeficit ? (
                                <span className="text-red-600 dark:text-red-400 font-black">
                                  {item.stockResultante.toFixed(2)} (Déficit)
                                </span>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  {item.stockResultante.toFixed(2)}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-500 italic">
                    Sin receta específica vinculada. Se utilizará el costo base de producción.
                  </p>
                )}

                <p className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  Nota: El sistema permite emitir la orden aun si faltan insumos (girará en negativo) para que la producción no se detenga mientras Gerencia adquiere la materia prima.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Instrucciones / Observaciones para el Panadero</label>
                <textarea
                  rows={2}
                  value={nuevasObservaciones}
                  onChange={(e) => setNuevasObservaciones(e.target.value)}
                  placeholder="Turno mañana, pan caliente para vitrina central..."
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
                  className="flex-1 bg-amber-800 hover:bg-amber-700 text-white font-bold"
                  isLoading={isSubmitting}
                >
                  Crear Orden
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ver Ingredientes de la Fórmula Maestra */}
      {selectedRecetaVer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" /> Ingredientes de la Fórmula: {selectedRecetaVer.nombreReceta}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Fórmula ID: <strong className="font-mono">#F-{selectedRecetaVer.id}</strong> | Producto Base: <strong>{selectedRecetaVer.productoNombre}</strong> | Rendimiento: <strong className="text-amber-700 dark:text-amber-400">{selectedRecetaVer.rendimientoUnidades} unidades</strong>
                </p>
              </div>
              <button onClick={() => setSelectedRecetaVer(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase">
                Tabla de Insumos Cargados para {selectedRecetaVer.rendimientoUnidades} unidades de salida:
              </p>

              <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-100/60 dark:bg-stone-950 text-[10px] font-black uppercase text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="py-2.5 px-3">ID Fórmula</th>
                      <th className="py-2.5 px-3">ID Insumo</th>
                      <th className="py-2.5 px-3">Nombre Insumo</th>
                      <th className="py-2.5 px-3 text-center">Cantidad</th>
                      <th className="py-2.5 px-3 text-center">Unidad</th>
                      <th className="py-2.5 px-3 text-right">Costo Unit.</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {selectedRecetaVer.detalles && selectedRecetaVer.detalles.length > 0 ? (
                      selectedRecetaVer.detalles.map((det, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40">
                          <td className="py-2.5 px-3 font-mono text-stone-400">#F-{selectedRecetaVer.id}</td>
                          <td className="py-2.5 px-3 font-mono text-stone-500">#{det.insumoId}</td>
                          <td className="py-2.5 px-3 font-bold text-stone-900 dark:text-stone-100">{det.insumoNombre || `Insumo #${det.insumoId}`}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700 dark:text-amber-400">{det.cantidadNecesaria}</td>
                          <td className="py-2.5 px-3 text-center text-stone-500">{det.unidadMedida}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-stone-600 dark:text-stone-400">{formatCurrency(det.costoUnitarioInsumo || 0)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900 dark:text-stone-100">{formatCurrency(det.costoSubtotal || (det.cantidadNecesaria * (det.costoUnitarioInsumo || 0)))}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-stone-400 italic">No hay ingredientes registrados para esta fórmula.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center p-3 bg-amber-50/60 dark:bg-stone-950 rounded-2xl border border-amber-200 dark:border-stone-800 text-xs">
                <span className="font-bold text-stone-700 dark:text-stone-300">Costo Total Estimado del Lote:</span>
                <span className="font-mono font-black text-amber-700 dark:text-amber-400 text-sm">
                  {formatCurrency(selectedRecetaVer.costoTotalInsumos || (selectedRecetaVer.costoUnitarioEstimado * selectedRecetaVer.rendimientoUnidades) || 0)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedRecetaVer(null)}
                className="bg-amber-800 hover:bg-amber-700 text-white font-bold px-6 cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: + Nueva Fórmula Maestra */}
      {showNuevaRecetaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" /> Crear Nueva Fórmula Maestra
              </h3>
              <button onClick={() => setShowNuevaRecetaModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearReceta} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Nombre de la Fórmula</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pan Francés Tradicional x50"
                    value={nuevaRecetaNombre}
                    onChange={(e) => setNuevaRecetaNombre(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Producto Base Asignado</label>
                  <select
                    value={nuevaRecetaProductoId}
                    onChange={(e) => setNuevaRecetaProductoId(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                  >
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Rendimiento / Cantidad Esperada de Salida</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={nuevaRecetaRendimiento}
                    onChange={(e) => setNuevaRecetaRendimiento(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Descripción / Observaciones</label>
                  <input
                    type="text"
                    placeholder="Ej. Tiempo de amasado 15 min, horneado 200°C"
                    value={nuevaRecetaDescripcion}
                    onChange={(e) => setNuevaRecetaDescripcion(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>
              </div>

              {/* Ingredientes Dinámicos */}
              <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-700 dark:text-stone-300 uppercase">Ingredientes e Insumos Requeridos</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => {
                      if (insumos.length > 0) {
                        setNuevaRecetaDetalles([
                          ...nuevaRecetaDetalles,
                          { insumoId: insumos[0].id, cantidadNecesaria: 1, unidadMedida: insumos[0].unidadMedida }
                        ]);
                      }
                    }}
                    className="text-amber-800 border-amber-400 text-[11px] cursor-pointer"
                  >
                    Agregar Insumo
                  </Button>
                </div>

                {nuevaRecetaDetalles.length === 0 ? (
                  <p className="text-stone-400 italic text-[11px] py-2">Haga clic en "+ Agregar Insumo" para especificar los insumos de la fórmula.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {nuevaRecetaDetalles.map((det, index) => (
                      <div key={index} className="flex items-center gap-2 bg-stone-50 dark:bg-stone-950 p-2 rounded-xl border border-stone-200 dark:border-stone-800">
                        <select
                          value={det.insumoId}
                          onChange={(e) => {
                            const insId = Number(e.target.value);
                            const found = insumos.find(i => i.id === insId);
                            const updated = [...nuevaRecetaDetalles];
                            updated[index].insumoId = insId;
                            if (found) updated[index].unidadMedida = found.unidadMedida;
                            setNuevaRecetaDetalles(updated);
                          }}
                          className="flex-1 bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-bold"
                        >
                          {insumos.map(i => (
                            <option key={i.id} value={i.id}>{i.nombre} ({i.unidadMedida})</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={det.cantidadNecesaria}
                          onChange={(e) => {
                            const updated = [...nuevaRecetaDetalles];
                            updated[index].cantidadNecesaria = Number(e.target.value);
                            setNuevaRecetaDetalles(updated);
                          }}
                          className="w-24 bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-center font-mono font-bold text-xs"
                          placeholder="Cantidad"
                        />

                        <span className="w-12 text-center text-[10px] text-stone-500 font-bold">{det.unidadMedida}</span>

                        <button
                          type="button"
                          onClick={() => {
                            setNuevaRecetaDetalles(nuevaRecetaDetalles.filter((_, i) => i !== index));
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1 cursor-pointer"
                  onClick={() => setShowNuevaRecetaModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1 bg-amber-800 hover:bg-amber-700 text-white font-bold cursor-pointer"
                  isLoading={isSubmitting}
                >
                  Guardar Fórmula
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: + Nuevo Insumo */}
      {showNuevoInsumoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" /> Registrar Nuevo Insumo en Bodega
              </h3>
              <button onClick={() => setShowNuevoInsumoModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearInsumo} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Nombre de la Materia Prima / Insumo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Harina de Trigo Especial, Levadura Fresca..."
                  value={nuevoInsumoNombre}
                  onChange={(e) => setNuevoInsumoNombre(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Unidad de Medida</label>
                  <select
                    value={nuevoInsumoUnidad}
                    onChange={(e) => setNuevoInsumoUnidad(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                  >
                    <option value="Kg">Kilogramos (Kg)</option>
                    <option value="Gramos">Gramos (Gr)</option>
                    <option value="Litros">Litros (Lt)</option>
                    <option value="Mililitros">Mililitros (Ml)</option>
                    <option value="Unidades">Unidades (Un)</option>
                    <option value="Bulto">Bulto (50 Kg)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Costo Unitario ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={nuevoInsumoCostoUnitario}
                    onChange={(e) => setNuevoInsumoCostoUnitario(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={nuevoInsumoStockInicial}
                    onChange={(e) => setNuevoInsumoStockInicial(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Stock Mínimo (Alerta)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={nuevoInsumoStockMinimo}
                    onChange={(e) => setNuevoInsumoStockMinimo(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Proveedor Principal (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Harinera del Santander..."
                  value={nuevoInsumoProveedor}
                  onChange={(e) => setNuevoInsumoProveedor(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1 cursor-pointer"
                  onClick={() => setShowNuevoInsumoModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1 bg-amber-800 hover:bg-amber-700 text-white font-bold cursor-pointer"
                  isLoading={isSubmitting}
                >
                  Guardar Insumo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: + Transformar (Harina / Pastas) */}
      {showTransformarModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-teal-400 dark:border-stone-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-heading font-extrabold text-lg text-teal-700 dark:text-teal-400 flex items-center gap-2">
                <Recycle className="w-5 h-5" /> Nueva Orden de Transformación
              </h3>
              <button onClick={() => setShowTransformarModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearTransformacion} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Seleccione Tipo de Transformación</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoTransformacion('Harina de Pan');
                      setCantTransformar(20);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      tipoTransformacion === 'Harina de Pan'
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 shadow-sm font-bold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <p className="font-black text-xs">Harina de Pan</p>
                    <p className="text-[10px] text-stone-500">5 Kg Pan $\rightarrow$ 20 paq (500g)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTipoTransformacion('Pastas Negras');
                      setCantTransformar(30);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      tipoTransformacion === 'Pastas Negras'
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 shadow-sm font-bold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <p className="font-black text-xs">Pastas Negras</p>
                    <p className="text-[10px] text-stone-500">4 Kg Pan $\rightarrow$ 30 unidades</p>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Cantidad a Fabricar (Unidades/Paquetes)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantTransformar}
                  onChange={(e) => setCantTransformar(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-teal-50/60 dark:bg-stone-950 rounded-2xl border border-teal-200 dark:border-stone-800 space-y-1">
                <p className="font-bold text-teal-900 dark:text-teal-300 uppercase text-[10px]">Consumo Estimado de Pan de Transformación:</p>
                <p className="font-mono font-bold text-xs text-stone-800 dark:text-stone-200">
                  {tipoTransformacion === 'Harina de Pan'
                    ? `${((cantTransformar / 20) * 5).toFixed(2)} Kg de Pan de Transformación`
                    : `${((cantTransformar / 30) * 4).toFixed(2)} Kg de Pan de Transformación`}
                </p>
                <p className="text-[10px] text-stone-500">Stock disponible en bodega: {insumosTransformacion?.stockActual || 0} Kg</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Observaciones del Lote</label>
                <input
                  type="text"
                  placeholder="Turno tarde, secado en leña..."
                  value={obsTransformar}
                  onChange={(e) => setObsTransformar(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1 cursor-pointer"
                  onClick={() => setShowTransformarModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1 bg-teal-700 hover:bg-teal-600 text-white font-bold cursor-pointer"
                  isLoading={isSubmitting}
                >
                  Crear Orden
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
