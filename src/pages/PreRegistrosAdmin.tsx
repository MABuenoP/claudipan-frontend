import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck, UserX, Eye, Search, X,
  FileSpreadsheet, RefreshCw, Shield, DollarSign,
  CreditCard, CheckCircle2, AlertCircle, Phone, Mail, MapPin,
  Calendar, Lock, Clock, EyeOff, UserPlus, FileText, Check, AlertTriangle
} from 'lucide-react';
import {
  authService,
  PreRegistroAdmin
} from '../services/authService';
import { Pagination } from '../components/ui/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../hooks/useFeedback';
import { exportToExcel } from '../utils/excelExport';
import { Button } from '../components/ui/Button';
import { LoadingModal } from '../components/ui/LoadingModal';

export const PreRegistrosAdmin: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError, showConfirm } = useFeedback();

  const canManage = currentUser?.rol === 'Administrador' || currentUser?.rol === 'Gerente';

  const [preRegistros, setPreRegistros] = useState<PreRegistroAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionLoadingMessage, setActionLoadingMessage] = useState('Procesando solicitud...');

  // Search & Filter
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<PreRegistroAdmin | null>(null);
  const [showPlainPasswordView, setShowPlainPasswordView] = useState(false);

  // Fetch pre-registros
  const fetchPreRegistros = async () => {
    try {
      setLoading(true);
      const res = await authService.getAllPreRegistros();
      if (res.success && res.data) {
        setPreRegistros(res.data);
      } else {
        showError('No se pudieron cargar los pre-registros: ' + (res.message || 'Error desconocido'));
      }
    } catch (err: any) {
      showError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreRegistros();
  }, []);

  // Filtered PreRegistros
  const filteredPreRegistros = useMemo(() => {
    return preRegistros.filter((item) => {
      const term = searchTerm.toLowerCase().trim();
      const fullName = [
        item.primerNombre,
        item.segundoNombre,
        item.primerApellido,
        item.segundoApellido
      ].filter(Boolean).join(' ') || item.nombre;

      const matchesSearch =
        !term ||
        fullName.toLowerCase().includes(term) ||
        (item.cedula && item.cedula.toLowerCase().includes(term)) ||
        item.email.toLowerCase().includes(term) ||
        (item.telefono && item.telefono.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === 'todos' ||
        item.estado.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [preRegistros, searchTerm, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPreRegistros.length / PAGE_SIZE);
  const paginatedPreRegistros = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPreRegistros.slice(start, start + PAGE_SIZE);
  }, [filteredPreRegistros, currentPage]);

  // Metrics
  const stats = useMemo(() => {
    const total = preRegistros.length;
    const pendientes = preRegistros.filter(p => p.estado.toLowerCase() === 'pendiente').length;
    const validados = preRegistros.filter(p => p.estado.toLowerCase() === 'validado').length;
    const cancelados = preRegistros.filter(p => p.estado.toLowerCase() === 'cancelado').length;
    const expirados = preRegistros.filter(p => p.estado.toLowerCase() === 'expirado').length;
    return { total, pendientes, validados, cancelados, expirados };
  }, [preRegistros]);

  // Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleOpenViewModal = (record: PreRegistroAdmin) => {
    setViewingRecord(record);
    setShowPlainPasswordView(false);
    setIsViewModalOpen(true);
  };

  const handleValidate = async (record: PreRegistroAdmin) => {
    if (record.estado.toLowerCase() !== 'pendiente') {
      showError(`Este registro ya se encuentra en estado "${record.estado}"`);
      return;
    }

    const fullName = [record.primerNombre, record.segundoNombre, record.primerApellido, record.segundoApellido].filter(Boolean).join(' ') || record.nombre;

    const confirmed = await showConfirm(
      `Se creará una cuenta de Usuario ACTIVA para ${fullName} (${record.email}) en la tabla Usuarios. Su contraseña será cifrada en MD5 con máxima seguridad.`,
      '¿Aprobar y Validar Pre-Registro?'
    );

    if (!confirmed) return;

    try {
      setActionLoadingMessage('Validando pre-registro y protegiendo clave con MD5...');
      setActionLoading(true);
      const res = await authService.validatePreRegistroAdmin(record.id);
      if (res.success) {
        showSuccess(res.message || `¡Usuario ${record.email} validado y activado exitosamente!`);
        if (isViewModalOpen) setIsViewModalOpen(false);
        fetchPreRegistros();
      } else {
        showError(res.message || 'No se pudo validar el pre-registro');
      }
    } catch (err: any) {
      showError(err.message || 'Error al validar el pre-registro');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAdmin = async (record: PreRegistroAdmin) => {
    if (record.estado.toLowerCase() !== 'pendiente') {
      showError(`Este registro ya se encuentra en estado "${record.estado}"`);
      return;
    }

    const confirmed = await showConfirm(
      `El pre-registro de ${record.email} pasará a estado Cancelado y no podrá ser activado.`,
      '¿Cancelar Pre-Registro?'
    );

    if (!confirmed) return;

    try {
      setActionLoadingMessage('Cancelando pre-registro...');
      setActionLoading(true);
      const res = await authService.cancelPreRegistroAdmin(record.id);
      if (res.success) {
        showSuccess('Pre-registro cancelado correctamente');
        if (isViewModalOpen) setIsViewModalOpen(false);
        fetchPreRegistros();
      } else {
        showError(res.message || 'No se pudo cancelar el pre-registro');
      }
    } catch (err: any) {
      showError(err.message || 'Error al cancelar el pre-registro');
    } finally {
      setActionLoading(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredPreRegistros.length === 0) {
      showError('No hay pre-registros para exportar con los filtros seleccionados');
      return;
    }

    exportToExcel({
      filename: `PreRegistros_Claudipan_${new Date().toISOString().slice(0, 10)}`,
      title: 'Reporte de Pre-Registros de Usuarios',
      data: filteredPreRegistros,
      columns: [
        { header: 'ID', accessor: (i) => i.id },
        { header: 'Nombre Completo', accessor: (i) => [i.primerNombre, i.segundoNombre, i.primerApellido, i.segundoApellido].filter(Boolean).join(' ') || i.nombre },
        { header: 'Cédula', accessor: (i) => i.cedula || 'N/A' },
        { header: 'Email', accessor: (i) => i.email },
        { header: 'Teléfono', accessor: (i) => i.telefono || 'N/A' },
        { header: 'Dirección', accessor: (i) => i.direccion || 'N/A' },
        { header: 'Redes Sociales', accessor: (i) => i.redesSociales || 'N/A' },
        { header: 'Cupo Crédito', accessor: (i) => i.limiteCredito },
        { header: 'Estado', accessor: (i) => i.estado },
        { header: 'Fecha Creación', accessor: (i) => new Date(i.fechaCreacion).toLocaleString('es-CO') },
        { header: 'Fecha Expiración', accessor: (i) => new Date(i.fechaExpiracion).toLocaleString('es-CO') },
      ],
    });
    showSuccess('Exportación a Excel completada con éxito');
  };

  const getStatusBadge = (estado: string) => {
    const est = estado.toLowerCase();
    switch (est) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pendiente
          </span>
        );
      case 'validado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Validado
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <UserX className="w-3.5 h-3.5" />
            Cancelado
          </span>
        );
      case 'expirado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-500/10 text-stone-600 dark:text-stone-400 border border-stone-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Expirado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Loading Modal */}
      <LoadingModal isLoading={actionLoading} message={actionLoadingMessage} />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Gestión de Pre-Registros
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Revisión, edición y validación de solicitudes para migrarlas a Usuarios con clave cifrada en MD5.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={fetchPreRegistros}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-amber-500 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Refrescar solicitudes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            onClick={handleExportExcel}
            className="!py-2.5 !px-3.5 text-emerald-700 dark:text-emerald-300 border-emerald-600 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-sm text-xs font-bold"
          >
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Total Solicitudes
          </div>
          <div className="mt-1 text-2xl font-black text-stone-900 dark:text-stone-100">
            {stats.total}
          </div>
        </div>

        <div
          onClick={() => { setStatusFilter('Pendiente'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white dark:bg-stone-900 p-4 rounded-xl border transition-all ${
            statusFilter === 'Pendiente'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30 dark:bg-amber-950/20'
              : 'border-stone-200 dark:border-stone-800 hover:border-amber-300'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>Pendientes</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.pendientes}
          </div>
        </div>

        <div
          onClick={() => { setStatusFilter('Validado'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white dark:bg-stone-900 p-4 rounded-xl border transition-all ${
            statusFilter === 'Validado'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20'
              : 'border-stone-200 dark:border-stone-800 hover:border-emerald-300'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <span>Validados</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.validados}
          </div>
        </div>

        <div
          onClick={() => { setStatusFilter('Cancelado'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white dark:bg-stone-900 p-4 rounded-xl border transition-all ${
            statusFilter === 'Cancelado'
              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20'
              : 'border-stone-200 dark:border-stone-800 hover:border-rose-300'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>Cancelados / Exp.</span>
            <UserX className="w-4 h-4" />
          </div>
          <div className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
            {stats.cancelados + stats.expirados}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula, correo o teléfono..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Buscar
          </Button>
        </form>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {['todos', 'Pendiente', 'Validado', 'Cancelado', 'Expirado'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter.toLowerCase() === status.toLowerCase()
                  ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {status === 'todos' ? 'Todos' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 dark:text-stone-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
            <p className="font-medium">Cargando pre-registros...</p>
          </div>
        ) : paginatedPreRegistros.length === 0 ? (
          <div className="p-12 text-center text-stone-500 dark:text-stone-400">
            <UserCheck className="w-12 h-12 mx-auto mb-3 text-stone-300 dark:text-stone-600" />
            <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
              No se encontraron pre-registros
            </h3>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'todos'
                ? 'Prueba modificando tus términos de búsqueda o filtros seleccionados.'
                : 'Aún no hay solicitudes de pre-registro registradas en la base de datos.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700 dark:text-stone-300">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3.5 px-4">Solicitante</th>
                  <th className="py-3.5 px-4">Documento / Contacto</th>
                  <th className="py-3.5 px-4">Dirección</th>
                  <th className="py-3.5 px-4">Cupo Crédito</th>
                  <th className="py-3.5 px-4">Fecha Creación</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {paginatedPreRegistros.map((item) => {
                  const fullName = [item.primerNombre, item.segundoNombre, item.primerApellido, item.segundoApellido].filter(Boolean).join(' ') || item.nombre;
                  const isPending = item.estado.toLowerCase() === 'pendiente';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      {/* Solicitante */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                            {item.primerNombre ? item.primerNombre.charAt(0) : item.nombre?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900 dark:text-stone-100">
                              {fullName}
                            </div>
                            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{item.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Documento / Contacto */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-900 dark:text-stone-100">
                          {item.cedula ? `CC ${item.cedula}` : <span className="text-stone-400 italic">Sin cédula</span>}
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{item.telefono || 'Sin teléfono'}</span>
                        </div>
                      </td>

                      {/* Dirección */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-stone-600 dark:text-stone-300 truncate max-w-[180px]" title={item.direccion}>
                          {item.direccion || <span className="text-stone-400 italic">Sin dirección</span>}
                        </div>
                        {item.redesSociales && (
                          <div className="text-[11px] text-stone-400 truncate max-w-[180px]">
                            {item.redesSociales}
                          </div>
                        )}
                      </td>

                      {/* Cupo Crédito */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-0.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{Number(item.limiteCredito || 0).toLocaleString('es-CO')}</span>
                        </div>
                      </td>

                      {/* Fecha Creación */}
                      <td className="py-3.5 px-4 text-xs text-stone-500 dark:text-stone-400">
                        <div>{new Date(item.fechaCreacion).toLocaleDateString('es-CO')}</div>
                        <div className="text-[11px] text-stone-400">
                          {new Date(item.fechaCreacion).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(item.estado)}
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. Ver Datos */}
                          <button
                            onClick={() => handleOpenViewModal(item)}
                            title="Ver datos completos de la solicitud"
                            className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. Validar (Crear en Usuarios con MD5) */}
                          {canManage && isPending && (
                            <button
                              onClick={() => handleValidate(item)}
                              title="Validar y migrar a Usuarios (clave MD5)"
                              className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Validar</span>
                            </button>
                          )}

                          {/* 3. Cancelar PreRegistro */}
                          {canManage && isPending && (
                            <button
                              onClick={() => handleCancelAdmin(item)}
                              title="Rechazar y cancelar solicitud"
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredPreRegistros.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
            itemLabel="pre-registros"
          />
        </div>
      </div>

      {/* ================= MODAL: VER DATOS COMPLETOS ================= */}
      {isViewModalOpen && viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    Detalles del Pre-Registro #{viewingRecord.id}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Información capturada durante la solicitud de registro
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Header Profile preview */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {viewingRecord.primerNombre?.charAt(0) || viewingRecord.nombre?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    {[viewingRecord.primerNombre, viewingRecord.segundoNombre, viewingRecord.primerApellido, viewingRecord.segundoApellido].filter(Boolean).join(' ') || viewingRecord.nombre}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{viewingRecord.email}</span>
                  </div>
                </div>
                <div>
                  {getStatusBadge(viewingRecord.estado)}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="text-xs text-stone-500 block mb-0.5">Cédula / Identificación</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {viewingRecord.cedula || 'No registrada'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="text-xs text-stone-500 block mb-0.5">Teléfono</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {viewingRecord.telefono || 'No registrado'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="text-xs text-stone-500 block mb-0.5">Dirección de Entrega / Residencia</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {viewingRecord.direccion || 'No registrada'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="text-xs text-stone-500 block mb-0.5">Redes Sociales</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {viewingRecord.redesSociales || 'No registrada'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="text-xs text-stone-500 block mb-0.5">Cupo de Crédito Asignado</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ${Number(viewingRecord.limiteCredito || 0).toLocaleString('es-CO')} COP
                  </span>
                </div>

                {/* Password field with reveal toggle */}
                <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="text-xs text-stone-500 block mb-0.5">Contraseña registrada</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-stone-800 dark:text-stone-200">
                      {showPlainPasswordView ? (viewingRecord.passwordPlana || '(Vacía)') : '••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPlainPasswordView(!showPlainPasswordView)}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                      title={showPlainPasswordView ? 'Ocultar' : 'Ver contraseña'}
                    >
                      {showPlainPasswordView ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="text-xs text-stone-500 block mb-0.5">Fecha de Creación</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {new Date(viewingRecord.fechaCreacion).toLocaleString('es-CO')}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="text-xs text-stone-500 block mb-0.5">Fecha de Expiración</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {new Date(viewingRecord.fechaExpiracion).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              {/* Security note */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Seguridad Criptográfica MD5: </span>
                  Al oprimir el botón de Validar, el sistema tomará la contraseña de este pre-registro y la codificará en MD5 antes de insertarla permanentemente en la tabla Usuarios.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="!py-2.5 !px-4 text-xs font-bold rounded-2xl cursor-pointer"
              >
                Cerrar
              </Button>

              <div className="flex items-center gap-2">
                {canManage && viewingRecord.estado.toLowerCase() === 'pendiente' && (
                  <Button
                    variant="primary"
                    onClick={() => handleValidate(viewingRecord)}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    className="!py-2.5 !px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-emerald-700/20 cursor-pointer flex items-center gap-1.5"
                  >
                    Validar Usuario (MD5)
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PreRegistrosAdmin;
