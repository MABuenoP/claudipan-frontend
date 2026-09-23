import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, Activity, Search, RefreshCw, 
  FileSpreadsheet, Eye, X, Globe, User, Clock, Filter, 
  Layers, ArrowRight, CheckCircle2, AlertTriangle, Trash2, Edit3, PlusCircle, LogIn
} from 'lucide-react';
import { auditoriaService, RegistroAuditoria } from '../services/auditoriaService';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../hooks/useFeedback';
import { exportToExcel } from '../utils/excelExport';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { LoadingModal } from '../components/ui/LoadingModal';

export const Auditoria: React.FC = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useFeedback();

  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccion, setSelectedAccion] = useState('');
  const [selectedFormulario, setSelectedFormulario] = useState('');
  const [selectedTabla, setSelectedTabla] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  // Detail Modal
  const [selectedAudit, setSelectedAudit] = useState<RegistroAuditoria | null>(null);

  const fetchAuditoria = async () => {
    setLoading(true);
    try {
      const res: any = await auditoriaService.getAll({
        tabla: selectedTabla || undefined,
        accion: selectedAccion || undefined,
        formulario: selectedFormulario || undefined,
        busqueda: searchTerm || undefined,
      });

      if (Array.isArray(res)) {
        setRegistros(res);
      } else if (res?.data && Array.isArray(res.data)) {
        setRegistros(res.data);
      } else if (res?.success && res.data) {
        setRegistros(res.data);
      } else {
        showError(res?.message || 'Error al cargar registros de auditoría');
      }
    } catch (err: any) {
      showError(err?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditoria();
  }, [selectedAccion, selectedFormulario, selectedTabla]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAuditoria();
  };

  // KPIs
  const totalMovimientos = registros.length;
  const totalLogins = registros.filter(r => r.accion.toLowerCase().includes('sesión') || r.accion.toLowerCase().includes('login')).length;
  const totalModificaciones = registros.filter(r => r.accion.toLowerCase().includes('modific') || r.accion.toLowerCase().includes('crear')).length;
  const ipsUnicas = new Set(registros.map(r => r.direccionIp).filter(Boolean)).size;

  // Filtered & Paginated records
  const filteredRegistros = registros.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.usuarioEmail && r.usuarioEmail.toLowerCase().includes(term)) ||
      (r.usuarioNombre && r.usuarioNombre.toLowerCase().includes(term)) ||
      (r.direccionIp && r.direccionIp.toLowerCase().includes(term)) ||
      (r.formulario && r.formulario.toLowerCase().includes(term)) ||
      (r.tablaAfectada && r.tablaAfectada.toLowerCase().includes(term)) ||
      (r.registroId && r.registroId.toLowerCase().includes(term)) ||
      (r.valoresNuevos && r.valoresNuevos.toLowerCase().includes(term))
    );
  });

  const totalPages = Math.ceil(filteredRegistros.length / PAGE_SIZE) || 1;
  const paginatedRegistros = filteredRegistros.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleExportExcel = () => {
    exportToExcel({
      filename: `Auditoria_Claudipan_${new Date().toISOString().slice(0, 10)}`,
      title: 'Bitácora de Auditoría & Control de Movimientos',
      data: filteredRegistros,
      columns: [
        { header: 'ID', accessor: r => r.id, width: 8 },
        { header: 'Fecha', accessor: r => new Date(r.fecha).toLocaleString('es-CO'), width: 20 },
        { header: 'Usuario', accessor: r => r.usuarioNombre || r.usuarioEmail, width: 22 },
        { header: 'Email', accessor: r => r.usuarioEmail, width: 25 },
        { header: 'Rol', accessor: r => r.usuarioRol || 'N/A', width: 14 },
        { header: 'Dirección IP', accessor: r => r.direccionIp || '127.0.0.1', width: 16 },
        { header: 'Formulario Origen', accessor: r => r.formulario || 'N/A', width: 28 },
        { header: 'Acción', accessor: r => r.accion, width: 16 },
        { header: 'Tabla Afectada', accessor: r => r.tablaAfectada, width: 18 },
        { header: 'Registro ID', accessor: r => r.registroId || 'N/A', width: 12 },
        { header: 'Valores Anteriores', accessor: r => r.valoresAnteriores || '', width: 35 },
        { header: 'Valores Nuevos', accessor: r => r.valoresNuevos || '', width: 35 },
      ]
    });
    showSuccess('Exportación de auditoría completada.');
  };

  const getActionBadge = (accion: string) => {
    const a = accion.toLowerCase();
    if (a.includes('sesión') || a.includes('login')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
          <LogIn className="w-3 h-3" />
          {accion}
        </span>
      );
    }
    if (a.includes('crear') || a.includes('registro')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
          <PlusCircle className="w-3 h-3" />
          {accion}
        </span>
      );
    }
    if (a.includes('modificar') || a.includes('editar') || a.includes('ajuste')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
          <Edit3 className="w-3 h-3" />
          {accion}
        </span>
      );
    }
    if (a.includes('eliminar') || a.includes('baja') || a.includes('fallido')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30">
          <Trash2 className="w-3 h-3" />
          {accion}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
        <Activity className="w-3 h-3" />
        {accion}
      </span>
    );
  };

  const parseJsonSafe = (str?: string) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };

  // Restrict to Administrador
  if (user?.rol !== 'Administrador') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-600 flex items-center justify-center mx-auto border-2 border-red-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Acceso Exclusivo para Administrador</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          La Bitácora de Auditoría y control de movimientos e IPs contiene información de seguridad reservada únicamente para el rol de <strong>Administrador</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-amber-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
                Bitácora de Auditoría
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Registro integral de entradas (Direcciones IP), modificaciones en tablas y formularios de origen.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={fetchAuditoria}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block">Total Movimientos</span>
          <p className="text-2xl font-heading font-extrabold text-purple-700 dark:text-purple-400">{totalMovimientos}</p>
          <span className="text-[11px] text-stone-400">Eventos auditados</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block">Entradas / Logins</span>
          <p className="text-2xl font-heading font-extrabold text-blue-700 dark:text-blue-400">{totalLogins}</p>
          <span className="text-[11px] text-stone-400">Accesos con IP</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block">Cambios de Datos</span>
          <p className="text-2xl font-heading font-extrabold text-amber-700 dark:text-amber-400">{totalModificaciones}</p>
          <span className="text-[11px] text-stone-400">Crear / Modificar</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block">Direcciones IP</span>
          <p className="text-2xl font-heading font-extrabold text-emerald-700 dark:text-emerald-400">{ipsUnicas}</p>
          <span className="text-[11px] text-stone-400">IPs activas únicas</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por usuario, correo, dirección IP, formulario, ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </form>

          {/* Form Filter */}
          <div className="min-w-[180px]">
            <select
              value={selectedFormulario}
              onChange={(e) => setSelectedFormulario(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              <option value="">Todos los Formularios</option>
              <option value="Login">Formulario de Login</option>
              <option value="Registro">Formulario de Registro</option>
              <option value="Productos">Formulario de Productos</option>
              <option value="Categorías">Formulario de Categorías</option>
              <option value="Usuarios">Formulario de Usuarios</option>
              <option value="Insumos">Formulario de Insumos</option>
              <option value="Producción">Módulo de Producción</option>
              <option value="Carrito">Carrito de Compras</option>
              <option value="Despacho">Despacho de Pedidos</option>
              <option value="POS">Caja Rápida POS</option>
              <option value="Compras">Compras Proveedores</option>
              <option value="Gastos">Servicios & Nómina</option>
              <option value="Bajas">Bajas & Mermas</option>
              <option value="Deudas">Gestión de Deudas</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="min-w-[150px]">
            <select
              value={selectedAccion}
              onChange={(e) => setSelectedAccion(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              <option value="">Todas las Acciones</option>
              <option value="Inicio de Sesión">Inicio de Sesión</option>
              <option value="Intento Fallido de Login">Login Fallido</option>
              <option value="Registro de Usuario">Registro de Usuario</option>
              <option value="Crear">Crear</option>
              <option value="Modificar">Modificar</option>
              <option value="Eliminar">Eliminar</option>
            </select>
          </div>

          {/* Table Filter */}
          <div className="min-w-[150px]">
            <select
              value={selectedTabla}
              onChange={(e) => setSelectedTabla(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              <option value="">Todas las Tablas</option>
              <option value="Usuarios">Usuarios</option>
              <option value="Productos">Productos</option>
              <option value="Categorias">Categorías</option>
              <option value="Insumos">Insumos</option>
              <option value="Pedidos">Pedidos</option>
              <option value="OrdenesProduccion">Órdenes Producción</option>
              <option value="Compras">Compras</option>
              <option value="Gastos">Gastos</option>
              <option value="BajasProductos">Bajas Productos</option>
              <option value="TransaccionesDeuda">Transacciones Deuda</option>
            </select>
          </div>

          {(searchTerm || selectedAccion || selectedFormulario || selectedTabla) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedAccion('');
                setSelectedFormulario('');
                setSelectedTabla('');
              }}
              className="text-xs text-purple-700 dark:text-purple-400 font-bold hover:underline px-2"
            >
              Limpiar filtros
            </button>
          )}

        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl shadow-sm overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-amber-200/80 dark:border-stone-800 bg-amber-50/50 dark:bg-stone-950/60 text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Dirección IP</th>
                <th className="py-3 px-4">Formulario / Origen</th>
                <th className="py-3 px-4">Acción</th>
                <th className="py-3 px-4">Tabla</th>
                <th className="py-3 px-4">Reg. ID</th>
                <th className="py-3 px-4 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-xs">
              {paginatedRegistros.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-500 space-y-2">
                    <Activity className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto" />
                    <p className="font-bold text-sm">No se encontraron registros de auditoría</p>
                    <p className="text-xs">Prueba ajustando los filtros de búsqueda o realiza acciones en el sistema.</p>
                  </td>
                </tr>
              ) : (
                paginatedRegistros.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40 transition-colors">
                    
                    {/* Fecha */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-medium">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{new Date(item.fecha).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'medium' })}</span>
                      </div>
                    </td>

                    {/* Usuario */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {item.usuarioNombre ? item.usuarioNombre.charAt(0).toUpperCase() : item.usuarioEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate max-w-[150px]">
                          <span className="font-bold text-stone-900 dark:text-stone-100 block truncate">
                            {item.usuarioNombre || item.usuarioEmail}
                          </span>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {item.usuarioRol ? `${item.usuarioRol} • ` : ''}{item.usuarioEmail}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Dirección IP */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-[11px] font-bold text-stone-800 dark:text-stone-200">
                        <Globe className="w-3 h-3 text-indigo-500" />
                        {item.direccionIp || '127.0.0.1'}
                      </span>
                    </td>

                    {/* Formulario / Origen */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 font-semibold text-[11px]">
                        {item.formulario || 'Sistema Interno'}
                      </span>
                    </td>

                    {/* Acción */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(item.accion)}
                    </td>

                    {/* Tabla Afectada */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-stone-700 dark:text-stone-300 font-bold bg-stone-50 dark:bg-stone-950 px-2 py-0.5 rounded-lg border border-stone-200 dark:border-stone-800">
                        {item.tablaAfectada}
                      </span>
                    </td>

                    {/* ID Registro */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-stone-500 font-mono">
                        {item.registroId ? `#${item.registroId}` : '—'}
                      </span>
                    </td>

                    {/* Botón Ver Detalle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedAudit(item)}
                        className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-purple-500/20 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        title="Ver detalles completos del cambio"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-amber-200/80 dark:border-stone-800 flex justify-between items-center">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredRegistros.length}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => setCurrentPage(page)}
              itemLabel="movimientos"
            />
          </div>
        )}

      </div>

      {/* DETAIL MODAL */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-500/30">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-stone-900 dark:text-stone-100">
                    Detalle del Movimiento #{selectedAudit.id}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {new Date(selectedAudit.fecha).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs">
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">Usuario</span>
                <strong className="text-stone-900 dark:text-stone-100 block truncate">
                  {selectedAudit.usuarioNombre || selectedAudit.usuarioEmail}
                </strong>
                <span className="text-[10px] text-stone-400">{selectedAudit.usuarioRol || 'Rol no definido'}</span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">Dirección IP</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {selectedAudit.direccionIp || '127.0.0.1'}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">Formulario / Origen</span>
                <span className="font-semibold text-amber-800 dark:text-amber-300 block truncate">
                  {selectedAudit.formulario || 'Sistema'}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">Acción Realizada</span>
                <div className="pt-0.5">{getActionBadge(selectedAudit.accion)}</div>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">Tabla Afectada</span>
                <strong className="font-mono">{selectedAudit.tablaAfectada}</strong>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">ID del Registro</span>
                <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                  {selectedAudit.registroId ? `#${selectedAudit.registroId}` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Changed Values Diff Box */}
            <div className="space-y-4">
              
              {/* Valores Anteriores */}
              {selectedAudit.valoresAnteriores && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Valores Anteriores (Antes del Cambio)
                  </span>
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-950 dark:text-red-200 overflow-x-auto max-h-48">
                    <pre className="whitespace-pre-wrap break-all text-[11px]">
                      {typeof parseJsonSafe(selectedAudit.valoresAnteriores) === 'object' 
                        ? JSON.stringify(parseJsonSafe(selectedAudit.valoresAnteriores), null, 2)
                        : selectedAudit.valoresAnteriores}
                    </pre>
                  </div>
                </div>
              )}

              {/* Valores Nuevos */}
              {selectedAudit.valoresNuevos && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Valores Nuevos / Resultado de la Operación
                  </span>
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-950 dark:text-emerald-200 overflow-x-auto max-h-48">
                    <pre className="whitespace-pre-wrap break-all text-[11px]">
                      {typeof parseJsonSafe(selectedAudit.valoresNuevos) === 'object' 
                        ? JSON.stringify(parseJsonSafe(selectedAudit.valoresNuevos), null, 2)
                        : selectedAudit.valoresNuevos}
                    </pre>
                  </div>
                </div>
              )}

              {!selectedAudit.valoresAnteriores && !selectedAudit.valoresNuevos && (
                <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-500 text-xs text-center">
                  No se registraron cambios de propiedades específicos para este movimiento.
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2 border-t border-stone-200 dark:border-stone-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedAudit(null)}>
                Cerrar
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Loading indicator */}
      <LoadingModal
        isLoading={loading}
        message="Consultando Bitácora de Auditoría"
        submessage="Cargando historial de entradas (IPs) y cambios en tablas..."
      />

    </div>
  );
};
