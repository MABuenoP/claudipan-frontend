import React, { useState, useEffect } from 'react';
import { compraService, Compra } from '../services/compraService';
import { proveedorService, Proveedor } from '../services/proveedorService';
import { insumoService, Insumo } from '../services/insumoService';
import { formatCurrency } from '../utils/helpers';
import { 
  Truck, Plus, FileText, Building2, Phone, Mail, MapPin, 
  Trash2, Eye, CheckCircle2, RefreshCw, X, DollarSign, Calendar
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ComprasProveedores: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compras' | 'proveedores'>('compras');
  const [compras, setCompras] = useState<Compra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [tipoInsumosProv, setTipoInsumosProv] = useState('Harinas y Levaduras');

  const fetchData = async () => {
    setLoading(true);
    const [resComp, resProv, resIns] = await Promise.all([
      compraService.getAll(),
      proveedorService.getAll(false),
      insumoService.getAll()
    ]);

    if (resComp.success && resComp.data) setCompras(resComp.data);
    if (resProv.success && resProv.data) setProveedores(resProv.data);
    if (resIns.success && resIns.data) setInsumos(resIns.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItemRow = () => {
    if (insumos.length > 0) {
      setItemsCompra(prev => [
        ...prev, 
        { insumoId: insumos[0].id, descripcionItem: insumos[0].nombre, cantidad: 1, precioUnitario: insumos[0].costoUnitario }
      ]);
    }
  };

  const removeItemRow = (index: number) => {
    setItemsCompra(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateItemRow = (index: number, field: string, value: any) => {
    setItemsCompra(prev => {
      const updated = [...prev];
      if (field === 'insumoId') {
        const ins = insumos.find(i => i.id === Number(value));
        updated[index] = {
          ...updated[index],
          insumoId: Number(value),
          descripcionItem: ins ? ins.nombre : '',
          precioUnitario: ins ? ins.costoUnitario : 0
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const totalCalculado = itemsCompra.reduce((acc, it) => acc + (it.cantidad * it.precioUnitario), 0);

  const handleCrearCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsCompra.length === 0) {
      alert('Debe agregar al menos un ítem a la compra');
      return;
    }

    setIsSubmitting(true);
    const res = await compraService.create({
      proveedorId,
      numeroFactura: numeroFactura || `FAC-${Math.floor(Math.random()*90000+10000)}`,
      metodoPago,
      estadoPago: 'Pagado',
      observaciones,
      detalles: itemsCompra
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowNuevaCompraModal(false);
      setNumeroFactura('');
      setObservaciones('');
      fetchData();
      alert('Factura de compra registrada e inventario actualizado exitosamente.');
    } else {
      alert(res.message || 'Error al registrar la compra');
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
      tipoInsumos: tipoInsumosProv,
      activo: true
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowNuevoProvModal(false);
      setNombreProv('');
      setNitProv('');
      fetchData();
      alert('Proveedor registrado exitosamente.');
    } else {
      alert(res.message || 'Error al registrar el proveedor');
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
                Compras & Proveedores Claudipan
              </h1>
              <span className="text-[10px] bg-teal-300 text-teal-950 px-2.5 py-0.5 rounded-full font-bold uppercase">
                Cadena de Suministro
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
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all text-white"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              if (proveedores.length > 0) setProveedorId(proveedores[0].id);
              setShowNuevaCompraModal(true);
            }}
            className="bg-white text-stone-950 hover:bg-teal-50 font-extrabold shadow-lg"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Registrar Factura de Compra
          </Button>
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
            <p className="text-xs font-bold text-stone-500 uppercase">Total Compras Acumuladas</p>
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

      {/* Tabs */}
      <div className="flex border-b border-teal-200/80 dark:border-stone-800 gap-2">
        <button
          onClick={() => setActiveTab('compras')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'compras'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Facturas de Compras ({compras.length})
        </button>

        <button
          onClick={() => setActiveTab('proveedores')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'proveedores'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Directorio de Proveedores ({proveedores.length})
        </button>
      </div>

      {/* Tab 1: Compras Table */}
      {activeTab === 'compras' && (
        <div className="space-y-4">
          <div className="responsive-table-container bg-white dark:bg-stone-900 border border-teal-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
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
                {compras.map(c => (
                  <tr key={c.id} className="hover:bg-teal-50/40 dark:hover:bg-stone-800/40 transition-colors">
                    <td data-label="Factura / Fecha" className="py-3 px-4">
                      <p className="font-mono font-bold text-teal-700 dark:text-teal-400">{c.numeroFactura}</p>
                      <p className="text-[10px] text-stone-500">{new Date(c.fechaCompra).toLocaleDateString('es-CO')}</p>
                    </td>
                    <td data-label="Proveedor" className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                      {c.proveedorNombre}
                    </td>
                    <td data-label="Método" className="py-3 px-4 text-stone-600 dark:text-stone-400">
                      {c.metodoPago}
                    </td>
                    <td data-label="Estado" className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                        {c.estadoPago}
                      </span>
                    </td>
                    <td data-label="Total" className="py-3 px-4 text-right font-mono font-black text-stone-900 dark:text-stone-100 text-sm">
                      {formatCurrency(c.total)}
                    </td>
                    <td data-label="Acciones" className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCompraModal(c)}
                        className="px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-stone-800 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-stone-700 hover:bg-teal-600 hover:text-white transition-all text-[11px] font-bold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Ítems
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Proveedores Grid */}
      {activeTab === 'proveedores' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowNuevoProvModal(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              <Plus className="w-4 h-4 mr-1" /> Nuevo Proveedor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {proveedores.map(p => (
              <div 
                key={p.id}
                className="bg-white dark:bg-stone-900 border border-teal-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3 hover:border-teal-500 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-100 dark:bg-stone-800 text-teal-800 dark:text-teal-400 font-extrabold text-[10px] uppercase">
                      {p.tipoInsumos || 'Insumos Generales'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${p.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                      {p.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                    {p.nombre}
                  </h3>
                  <p className="text-xs font-mono text-stone-500">NIT: {p.nit}</p>

                  <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400 pt-1">
                    {p.contacto && <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-teal-500" /> Contacto: {p.contacto}</p>}
                    {p.telefono && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teal-500" /> {p.telefono}</p>}
                    {p.email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-teal-500" /> {p.email}</p>}
                    {p.direccion && <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-500" /> {p.direccion}, {p.ciudad || 'Colombia'}</p>}
                  </div>
                </div>

                <div className="pt-3 border-t border-teal-100 dark:border-stone-800 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-stone-400">Registrado en Claudipan</span>
                  <button 
                    onClick={() => {
                      setProveedorId(p.id);
                      setShowNuevaCompraModal(true);
                    }}
                    className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                  >
                    Nueva Factura →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Registrar Nueva Compra */}
      {showNuevaCompraModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-teal-300 dark:border-stone-700 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-heading font-extrabold text-lg text-teal-700 dark:text-teal-400 flex items-center gap-2">
                <Truck className="w-5 h-5" /> Registrar Factura de Compra
              </h3>
              <button onClick={() => setShowNuevaCompraModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearCompra} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Proveedor</label>
                  <select
                    value={proveedorId}
                    onChange={(e) => setProveedorId(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                  >
                    {proveedores.map(pr => (
                      <option key={pr.id} value={pr.id}>{pr.nombre} (NIT: {pr.nit})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Número Factura</label>
                  <input
                    type="text"
                    required
                    placeholder="FAC-12345"
                    value={numeroFactura}
                    onChange={(e) => setNumeroFactura(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Método Pago</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  >
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo de Caja</option>
                    <option value="Credito_30_Dias">Crédito 30 Días</option>
                  </select>
                </div>
              </div>

              {/* Items Line Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Ítems de la Factura (Insumos/Materia Prima)</label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Ítem
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {itemsCompra.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2.5 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800">
                      <div className="col-span-5">
                        <select
                          value={item.insumoId}
                          onChange={(e) => updateItemRow(idx, 'insumoId', e.target.value)}
                          className="w-full bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold"
                        >
                          {insumos.map(ins => (
                            <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidadMedida})</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min="1"
                          placeholder="Cant."
                          value={item.cantidad}
                          onChange={(e) => updateItemRow(idx, 'cantidad', Number(e.target.value))}
                          className="w-full bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-300 dark:border-stone-700 font-mono text-center font-bold"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Precio Unit."
                          value={item.precioUnitario}
                          onChange={(e) => updateItemRow(idx, 'precioUnitario', Number(e.target.value))}
                          className="w-full bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-300 dark:border-stone-700 font-mono text-right font-bold"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observations & Total */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-stone-200 dark:border-stone-800">
                <div className="w-full sm:w-1/2">
                  <input
                    type="text"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Observaciones de recepción (ej. Lote con fecha 2027)..."
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-stone-500 block">TOTAL FACTURA:</span>
                  <span className="text-xl font-black font-mono text-teal-700 dark:text-teal-400">
                    {formatCurrency(totalCalculado)}
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
                  Guardar Compra & Ingresar a Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ver Detalles Compra */}
      {selectedCompraModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-teal-300 dark:border-stone-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                  Factura {selectedCompraModal.numeroFactura}
                </h3>
                <p className="text-stone-500">{selectedCompraModal.proveedorNombre}</p>
              </div>
              <button onClick={() => setSelectedCompraModal(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-stone-700 dark:text-stone-300">Ítems Comprados:</p>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {selectedCompraModal.detalles?.map((det, idx) => (
                  <div key={idx} className="flex justify-between p-2 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800">
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">{det.descripcionItem || det.insumoNombre}</p>
                      <p className="text-[10px] text-stone-500">{det.cantidad} u. × {formatCurrency(det.precioUnitario)}</p>
                    </div>
                    <p className="font-mono font-bold text-teal-700 dark:text-teal-400">{formatCurrency(det.cantidad * det.precioUnitario)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
              <span className="font-bold text-stone-600">Total Facturado:</span>
              <span className="text-lg font-mono font-black text-teal-700 dark:text-teal-400">{formatCurrency(selectedCompraModal.total)}</span>
            </div>

            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => setSelectedCompraModal(null)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Registrar Nuevo Proveedor */}
      {showNuevoProvModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-teal-300 dark:border-stone-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-heading font-extrabold text-base text-teal-700 dark:text-teal-400 flex items-center gap-2">
                <Building2 className="w-5 h-5" /> Registrar Empresa Proveedora
              </h3>
              <button onClick={() => setShowNuevoProvModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearProveedor} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Razón Social / Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Harinas del Valle S.A."
                  value={nombreProv}
                  onChange={(e) => setNombreProv(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">NIT / Documento *</label>
                  <input
                    type="text"
                    required
                    placeholder="900.123.456-7"
                    value={nitProv}
                    onChange={(e) => setNitProv(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Tipo de Insumos</label>
                  <input
                    type="text"
                    placeholder="Harinas, Lácteos..."
                    value={tipoInsumosProv}
                    onChange={(e) => setTipoInsumosProv(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Contacto Asesor</label>
                  <input
                    type="text"
                    placeholder="Nombre asesor"
                    value={contactoProv}
                    onChange={(e) => setContactoProv(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Teléfono / Celular</label>
                  <input
                    type="text"
                    placeholder="310 123 4567"
                    value={telefonoProv}
                    onChange={(e) => setTelefonoProv(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 uppercase">Dirección / Sede</label>
                <input
                  type="text"
                  placeholder="Zona Industrial, Calle 10 # 20"
                  value={direccionProv}
                  onChange={(e) => setDireccionProv(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
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
                  Registrar Proveedor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
