import React, { useState, useEffect } from 'react';
import { compraService, Compra } from '../services/compraService';
import { proveedorService, Proveedor } from '../services/proveedorService';
import { insumoService, Insumo } from '../services/insumoService';
import { formatCurrency } from '../utils/helpers';
import { 
  Truck, Plus, FileText, Building2, Phone, Mail, MapPin, 
  Trash2, Eye, CheckCircle2, RefreshCw, X, DollarSign, Calendar, FileSpreadsheet, Search
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../hooks/useFeedback';
import { exportToExcel } from '../utils/excelExport';
import { LoadingModal } from '../components/ui/LoadingModal';

export const ComprasProveedores: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useFeedback();
  const userRole = user?.rol || '';
  const canExportExcel = userRole === 'Administrador' || userRole === 'Gerente' || userRole === 'Contador' || userRole === 'Contable';
  const canManage = userRole === 'Administrador' || userRole === 'Gerente' || userRole === 'Contador' || userRole === 'Contable';

  const [activeTab, setActiveTab] = useState<'compras' | 'proveedores'>('compras');
  const [compras, setCompras] = useState<Compra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleMobileCount, setVisibleMobileCount] = useState(10);
  const [pageCompras, setPageCompras] = useState(1);
  const [pageProveedores, setPageProveedores] = useState(1);
  const PAGE_SIZE_TABLE = 10;

  // Modal Nueva Compra
  const [showNuevaCompraModal, setShowNuevaCompraModal] = useState(false);
  const [proveedorId, setProveedorId] = useState<number>(1);
  const [numeroFactura, setNumeroFactura] = useState('');
  const [metodoPago, setMetodoPago] = useState('Transferencia');
  const [observaciones, setObservaciones] = useState('');
  const [itemsCompra, setItemsCompra] = useState<{ insumoId: number; descripcionItem: string; cantidad: number; precioUnitario: number }[]>([
    { insumoId: 1, descripcionItem: 'Bulto Harina de Trigo Especial 50kg', cantidad: 5, precioUnitario: 140000 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Ver Detalle Compra
  const [selectedCompraModal, setSelectedCompraModal] = useState<Compra | null>(null);

  // Modal Nuevo Proveedor
  const [showNuevoProvModal, setShowNuevoProvModal] = useState(false);
  const [nombreProv, setNombreProv] = useState('');
  const [nitProv, setNitProv] = useState('');
  const [contactoProv, setContactoProv] = useState('');
  const [telefonoProv, setTelefonoProv] = useState('');
  const [emailProv, setEmailProv] = useState('');
  const [direccionProv, setDireccionProv] = useState('');
  const [ciudadProv, setCiudadProv] = useState('Bucaramanga');
  const [tipoInsumosProv, setTipoInsumosProv] = useState('Harinas, Levaduras & Grasas');

  const fetchData = async () => {
    setLoading(true);
    const [resCompras, resProv, resIns] = await Promise.all([
      compraService.getAll(),
      proveedorService.getAll(),
      insumoService.getAll()
    ]);

    if (resCompras.success && resCompras.data) setCompras(resCompras.data);
    if (resProv.success && resProv.data) setProveedores(resProv.data);
    if (resIns.success && resIns.data) setInsumos(resIns.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItemCompra = () => {
    if (insumos.length === 0) return;
    setItemsCompra([...itemsCompra, {
      insumoId: insumos[0].id,
      descripcionItem: insumos[0].nombre,
      cantidad: 1,
      precioUnitario: insumos[0].costoUnitario || 10000
    }]);
  };

  const handleRemoveItemCompra = (index: number) => {
    setItemsCompra(itemsCompra.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...itemsCompra];
    if (field === 'insumoId') {
      const ins = insumos.find(i => i.id === Number(value));
      updated[index] = {
        ...updated[index],
        insumoId: Number(value),
        descripcionItem: ins ? ins.nombre : '',
        precioUnitario: ins?.costoUnitario || updated[index].precioUnitario
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setItemsCompra(updated);
  };

  const calculateTotalCompra = () => {
    return itemsCompra.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
  };

  const handleCrearCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsCompra.length === 0) {
      showWarning('Debes agregar al menos un (1) insumo a la factura de compra.', 'Factura Incompleta');
      return;
    }
    setIsSubmitting(true);

    const payload = {
      proveedorId,
      numeroFactura: numeroFactura || `FAC-${Math.floor(Math.random()*90000+10000)}`,
      metodoPago,
      observaciones,
      detalles: itemsCompra.map(it => ({
        insumoId: it.insumoId,
        descripcionItem: it.descripcionItem,
        cantidad: Number(it.cantidad),
        precioUnitario: Number(it.precioUnitario)
      }))
    };

    const res = await compraService.create(payload);
    setIsSubmitting(false);

    if (res.success) {
      setShowNuevaCompraModal(false);
      setNumeroFactura('');
      setObservaciones('');
      fetchData();
      showSuccess('Factura de compra registrada exitosamente. El inventario de insumos ha sido actualizado.', 'Compra Registrada');
    } else {
      showError(res.message || 'Error al registrar la compra', 'Error de Facturación');
    }
  };

  const handleCrearProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await proveedorService.create({
      nombre: nombreProv,
      nit: nitProv,
      contacto: contactoProv,
      telefono: telefonoProv,
      email: emailProv,
      direccion: direccionProv,
      ciudad: ciudadProv,
      tipoInsumos: tipoInsumosProv,
      activo: true
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowNuevoProvModal(false);
      setNombreProv('');
      setNitProv('');
      fetchData();
      showSuccess('Proveedor registrado exitosamente en el directorio oficial de Claudipan.', 'Proveedor Guardado');
    } else {
      showError(res.message || 'Error al registrar el proveedor', 'Error al Guardar');
    }
  };

  // Filter Compras
  const filteredCompras = compras.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.numeroFactura?.toLowerCase().includes(term) ||
      c.proveedorNombre?.toLowerCase().includes(term) ||
      c.metodoPago?.toLowerCase().includes(term) ||
      c.total.toString().includes(term)
    );
  });

  // Filter Proveedores
  const filteredProveedores = proveedores.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(term) ||
      p.nit?.toLowerCase().includes(term) ||
      p.contacto?.toLowerCase().includes(term) ||
      p.telefono?.toLowerCase().includes(term) ||
      p.ciudad?.toLowerCase().includes(term) ||
      p.tipoInsumos?.toLowerCase().includes(term)
    );
  });

  // Excel Export
  const handleExportExcel = () => {
    if (activeTab === 'compras') {
      exportToExcel<Compra>({
        filename: 'Facturas_Compras_Proveedores_Claudipan',
        sheetName: 'Facturas de Compras',
        title: 'Reporte Oficial de Facturas de Compras e Insumos - Claudipan',
        data: filteredCompras,
        columns: [
          { header: 'N° Factura', accessor: (c) => c.numeroFactura || `FAC-${c.id}`, width: 18 },
          { header: 'Fecha', accessor: (c) => new Date(c.fechaCompra).toLocaleDateString('es-CO'), width: 16 },
          { header: 'Proveedor', accessor: (c) => c.proveedorNombre, width: 28 },
          { header: 'Detalle de Insumos', accessor: (c) => c.detalles?.map(d => `${d.insumoNombre || d.descripcionItem} (${d.cantidad})`).join(', ') || 'Insumos varios', width: 35 },
          { header: 'Método de Pago', accessor: (c) => c.metodoPago, width: 16 },
          { header: 'Total Factura ($ COP)', accessor: (c) => c.total, width: 20 },
        ],
      });
    } else {
      exportToExcel<Proveedor>({
        filename: 'Directorio_Proveedores_Claudipan',
        sheetName: 'Proveedores',
        title: 'Directorio Oficial de Casas Proveedoras - Claudipan',
        data: filteredProveedores,
        columns: [
          { header: 'Empresa / Proveedor', accessor: (p) => p.nombre, width: 28 },
          { header: 'NIT / RUT', accessor: (p) => p.nit, width: 18 },
          { header: 'Contacto Comercial', accessor: (p) => p.contacto || 'N/A', width: 24 },
          { header: 'Teléfono', accessor: (p) => p.telefono || 'N/A', width: 18 },
          { header: 'Email', accessor: (p) => p.email || 'N/A', width: 26 },
          { header: 'Dirección / Ciudad', accessor: (p) => `${p.direccion || ''}, ${p.ciudad || ''}`, width: 30 },
          { header: 'Especialidad Insumos', accessor: (p) => p.tipoInsumos || 'General', width: 26 },
          { header: 'Estado', accessor: (p) => p.activo ? 'ACTIVO' : 'INACTIVO', width: 14 },
        ],
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-teal-100 shadow-inner">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-black tracking-tight">
                Compras, Facturas & Proveedores
              </h1>
              <span className="text-[10px] bg-teal-300 text-teal-950 px-2.5 py-0.5 rounded-full font-black uppercase">
                Bodega Claudipan
              </span>
            </div>
            <p className="text-xs text-teal-100 mt-1">
              Registro de facturas, recepción de insumos y directorio de casas proveedoras
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-teal-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Facturas Registradas</p>
            <p className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
              {compras.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-teal-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Monto Total Invertido</p>
            <p className="text-2xl font-heading font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
              {formatCurrency(compras.reduce((acc, c) => acc + c.total, 0))}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-teal-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Proveedores Activos</p>
            <p className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
              {proveedores.filter(p => p.activo).length} empresas
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-teal-200/80 dark:border-stone-800 pb-2">
        <button
          onClick={() => { setActiveTab('compras'); setSearchTerm(''); setVisibleMobileCount(10); }}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'compras'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Facturas de Compras ({compras.length})
        </button>

        <button
          onClick={() => { setActiveTab('proveedores'); setSearchTerm(''); setVisibleMobileCount(10); }}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'proveedores'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Directorio de Proveedores ({proveedores.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COMPRAS (Desktop Table & Mobile CardView) */}
      {/* ========================================================================= */}
      {activeTab === 'compras' && (
        <div className="space-y-4">
          {/* Top Bar: Search on Left + Actions on Right (Horizontal single-line) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-teal-200/80 dark:border-stone-800 shadow-sm">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setPageCompras(1);
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
                    setPageCompras(1);
                    setVisibleMobileCount(10);
                  }}
                  placeholder="Buscar por factura, proveedor o total..."
                  className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs px-3.5 py-2 pl-9 rounded-2xl border border-teal-200/80 dark:border-stone-800 focus:outline-none focus:border-teal-500 shadow-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(''); setPageCompras(1); setVisibleMobileCount(10); }}
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
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    if (proveedores.length > 0) setProveedorId(proveedores[0].id);
                    setShowNuevaCompraModal(true);
                  }}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Compra
                </Button>
              )}
            </div>
          </div>
          {/* Desktop Table View */}
          <div className="hidden md:block responsive-table-container bg-white dark:bg-stone-900 border border-teal-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-teal-50/70 dark:bg-stone-950 text-stone-700 dark:text-stone-300 text-[11px] font-black uppercase tracking-wider border-b border-teal-200/80 dark:border-stone-800">
                  <th className="py-3 px-4">Factura / Fecha</th>
                  <th className="py-3 px-4">Proveedor</th>
                  <th className="py-3 px-4">Método de Pago</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Total Factura</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-100/60 dark:divide-stone-800 text-xs">
                {filteredCompras.slice((pageCompras - 1) * PAGE_SIZE_TABLE, pageCompras * PAGE_SIZE_TABLE).map(c => (
                  <tr key={c.id} className="hover:bg-teal-50/40 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-teal-700 dark:text-teal-400">{c.numeroFactura}</p>
                      <p className="text-[10px] text-stone-500">{new Date(c.fechaCompra).toLocaleDateString('es-CO')}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                      {c.proveedorNombre}
                    </td>
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                      {c.metodoPago}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                        {c.estadoPago}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-stone-900 dark:text-stone-100 text-sm">
                      {formatCurrency(c.total)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCompraModal(c)}
                        className="px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-stone-800 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-stone-700 hover:bg-teal-600 hover:text-white transition-all text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Ítems
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCompras.length > 0 && (
              <div className="p-4 border-t border-teal-200/80 dark:border-stone-800">
                <Pagination
                  currentPage={pageCompras}
                  totalItems={filteredCompras.length}
                  pageSize={PAGE_SIZE_TABLE}
                  onPageChange={setPageCompras}
                  itemLabel="facturas de compras"
                />
              </div>
            )}
          </div>

          {/* Mobile CardView (10 en 10) */}
          <div className="md:hidden space-y-3">
            {filteredCompras.slice(0, visibleMobileCount).map(c => (
              <div 
                key={c.id}
                className="bg-white dark:bg-stone-900 border border-teal-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-teal-100 dark:border-stone-800">
                  <span className="font-mono font-black text-teal-700 dark:text-teal-400 text-xs">
                    {c.numeroFactura}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {new Date(c.fechaCompra).toLocaleDateString('es-CO')}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs">{c.proveedorNombre}</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Método: {c.metodoPago}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-teal-100 dark:border-stone-800">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-bold">Total:</span>
                    <p className="text-base font-mono font-black text-stone-900 dark:text-stone-100">
                      {formatCurrency(c.total)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCompraModal(c)}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver Ítems
                  </button>
                </div>
              </div>
            ))}

            {visibleMobileCount < filteredCompras.length && (
              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleMobileCount(prev => prev + 10)}
                  className="w-full text-teal-700 dark:text-teal-400 border-teal-300 dark:border-stone-700"
                >
                  Cargar 10 más (Mostrando {Math.min(visibleMobileCount, filteredCompras.length)} de {filteredCompras.length})
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROVEEDORES (Converted to Desktop Table & Mobile CardView) */}
      {/* ========================================================================= */}
      {activeTab === 'proveedores' && (
        <div className="space-y-4">
          {/* Top Bar: Search on Left + Actions on Right (Horizontal single-line) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-teal-200/80 dark:border-stone-800 shadow-sm">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setPageProveedores(1);
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
                    setPageProveedores(1);
                    setVisibleMobileCount(10);
                  }}
                  placeholder="Buscar por empresa, NIT, contacto o insumos..."
                  className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs px-3.5 py-2 pl-9 rounded-2xl border border-teal-200/80 dark:border-stone-800 focus:outline-none focus:border-teal-500 shadow-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(''); setPageProveedores(1); setVisibleMobileCount(10); }}
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
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowNuevoProvModal(true)}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Proveedor
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block responsive-table-container bg-white dark:bg-stone-900 border border-teal-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-teal-50/70 dark:bg-stone-950 text-stone-700 dark:text-stone-300 text-[11px] font-black uppercase tracking-wider border-b border-teal-200/80 dark:border-stone-800">
                  <th className="py-3 px-4">Empresa / Razón Social</th>
                  <th className="py-3 px-4">NIT / RUT</th>
                  <th className="py-3 px-4">Contacto Comercial</th>
                  <th className="py-3 px-4">Teléfono / WhatsApp</th>
                  <th className="py-3 px-4">Ubicación / Ciudad</th>
                  <th className="py-3 px-4">Especialidad Insumos</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-100/60 dark:divide-stone-800 text-xs">
                {filteredProveedores.slice((pageProveedores - 1) * PAGE_SIZE_TABLE, pageProveedores * PAGE_SIZE_TABLE).map(p => (
                  <tr key={p.id} className="hover:bg-teal-50/40 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                      {p.nombre}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600 dark:text-stone-400">
                      {p.nit}
                    </td>
                    <td className="py-3 px-4 text-stone-700 dark:text-stone-300">
                      {p.contacto || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400 font-mono">
                      {p.telefono || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                      {p.ciudad ? `${p.direccion || ''}, ${p.ciudad}` : p.direccion || 'Colombia'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-stone-800 text-teal-800 dark:text-teal-400 font-extrabold text-[10px] uppercase">
                        {p.tipoInsumos || 'Insumos Generales'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${p.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                        {p.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProveedores.length > 0 && (
              <div className="p-4 border-t border-teal-200/80 dark:border-stone-800">
                <Pagination
                  currentPage={pageProveedores}
                  totalItems={filteredProveedores.length}
                  pageSize={PAGE_SIZE_TABLE}
                  onPageChange={setPageProveedores}
                  itemLabel="proveedores"
                />
              </div>
            )}
          </div>

          {/* Mobile CardView for Proveedores (10 en 10) */}
          <div className="md:hidden space-y-3">
            {filteredProveedores.slice(0, visibleMobileCount).map(p => (
              <div 
                key={p.id}
                className="bg-white dark:bg-stone-900 border border-teal-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-teal-100 dark:border-stone-800">
                  <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-stone-800 text-teal-800 dark:text-teal-400 font-extrabold text-[10px] uppercase">
                    {p.tipoInsumos || 'Insumos'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${p.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                    {p.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">{p.nombre}</h4>
                  <p className="text-xs font-mono text-stone-500">NIT: {p.nit}</p>
                </div>

                <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1 pt-1 border-t border-teal-100 dark:border-stone-800">
                  {p.contacto && <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-teal-600" /> {p.contacto}</p>}
                  {p.telefono && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teal-600" /> {p.telefono}</p>}
                  {p.email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-teal-600" /> {p.email}</p>}
                </div>
              </div>
            ))}

            {visibleMobileCount < filteredProveedores.length && (
              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleMobileCount(prev => prev + 10)}
                  className="w-full text-teal-700 dark:text-teal-400 border-teal-300 dark:border-stone-700"
                >
                  Cargar 10 más (Mostrando {Math.min(visibleMobileCount, filteredProveedores.length)} de {filteredProveedores.length})
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Ver Detalle de Factura */}
      {selectedCompraModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-teal-300 dark:border-stone-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                    Factura #{selectedCompraModal.numeroFactura}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Proveedor: <strong>{selectedCompraModal.proveedorNombre}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedCompraModal(null)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-stone-700 dark:text-stone-300 uppercase">Ítems e Insumos Adquiridos:</p>
              <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
                {selectedCompraModal.detalles?.map(d => (
                  <div key={d.id} className="p-3 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50">
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">{d.insumoNombre || d.descripcionItem}</p>
                      <p className="text-[10px] text-stone-500 font-mono">
                        {d.cantidad} un. x {formatCurrency(d.precioUnitario)}
                      </p>
                    </div>
                    <p className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {formatCurrency(d.subtotal ?? (d.cantidad * d.precioUnitario))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="font-bold uppercase text-stone-600 dark:text-stone-400">Total Factura:</span>
              <span className="text-xl font-mono font-black text-teal-700 dark:text-teal-400">
                {formatCurrency(selectedCompraModal.total)}
              </span>
            </div>

            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => setSelectedCompraModal(null)}
            >
              Cerrar Detalle
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Nueva Factura de Compra */}
      {showNuevaCompraModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-teal-300 dark:border-stone-700 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" />
                <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                  Registrar Factura de Compra de Insumos
                </h3>
              </div>
              <button onClick={() => setShowNuevaCompraModal(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearCompra} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Casa Proveedora *</label>
                  <select
                    value={proveedorId}
                    onChange={(e) => setProveedorId(Number(e.target.value))}
                    className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                  >
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">N° Factura Física</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. FAC-89302"
                    value={numeroFactura}
                    onChange={(e) => setNumeroFactura(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold"
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
                    <option value="Efectivo">Efectivo de Contado</option>
                    <option value="Credito_30_Dias">Crédito a 30 Días</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 border-t border-stone-200 dark:border-stone-800 pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Insumos y Materias Primas a Ingresar</label>
                  <button
                    type="button"
                    onClick={handleAddItemCompra}
                    className="px-2.5 py-1 bg-teal-50 dark:bg-stone-800 text-teal-700 dark:text-teal-300 font-bold text-[11px] rounded-lg border border-teal-200 dark:border-stone-700 hover:bg-teal-100"
                  >
                    + Agregar Insumo
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {itemsCompra.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                      <div className="col-span-5">
                        <select
                          value={item.insumoId}
                          onChange={(e) => handleItemChange(index, 'insumoId', e.target.value)}
                          className="w-full bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 font-bold text-xs"
                        >
                          {insumos.map(ins => (
                            <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidadMedida})</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          required
                          value={item.cantidad}
                          onChange={(e) => handleItemChange(index, 'cantidad', Number(e.target.value))}
                          placeholder="Cant."
                          className="w-full bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 font-mono text-center font-bold text-xs"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          required
                          value={item.precioUnitario}
                          onChange={(e) => handleItemChange(index, 'precioUnitario', Number(e.target.value))}
                          placeholder="Precio Unit."
                          className="w-full bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 font-mono text-right font-bold text-xs"
                        />
                      </div>

                      <div className="col-span-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemCompra(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Observations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200 dark:border-stone-800">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Observaciones del Pedido</label>
                  <input
                    type="text"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Lote de harina #890, fecha de caducidad..."
                    className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>

                <div className="bg-teal-50 dark:bg-stone-950 p-3 rounded-2xl border border-teal-200 dark:border-stone-800 flex items-center justify-between">
                  <span className="font-black uppercase text-stone-700 dark:text-stone-300">Total a Facturar:</span>
                  <span className="text-xl font-mono font-black text-teal-700 dark:text-teal-400">
                    {formatCurrency(calculateTotalCompra())}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => setShowNuevaCompraModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white"
                  isLoading={isSubmitting}
                >
                  Guardar Compra
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Proveedor */}
      {showNuevoProvModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-teal-300 dark:border-stone-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                  Registrar Nueva Casa Proveedora
                </h3>
              </div>
              <button onClick={() => setShowNuevoProvModal(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearProveedor} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Razón Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Molinos del Oriente S.A.S."
                    value={nombreProv}
                    onChange={(e) => setNombreProv(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">NIT / Identificación *</label>
                  <input
                    type="text"
                    required
                    placeholder="900.123.456-7"
                    value={nitProv}
                    onChange={(e) => setNitProv(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Contacto Comercial</label>
                  <input
                    type="text"
                    placeholder="Nombre del asesor"
                    value={contactoProv}
                    onChange={(e) => setContactoProv(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="310 123 4567"
                    value={telefonoProv}
                    onChange={(e) => setTelefonoProv(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="ventas@proveedor.com"
                    value={emailProv}
                    onChange={(e) => setEmailProv(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Ciudad Sede</label>
                  <input
                    type="text"
                    placeholder="Bucaramanga, Girón, Floridablanca..."
                    value={ciudadProv}
                    onChange={(e) => setCiudadProv(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Especialidad de Insumos</label>
                <input
                  type="text"
                  placeholder="Harinas, levaduras, esencias, lácteos, empaques..."
                  value={tipoInsumosProv}
                  onChange={(e) => setTipoInsumosProv(e.target.value)}
                  className="w-full bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => setShowNuevoProvModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white"
                  isLoading={isSubmitting}
                >
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
