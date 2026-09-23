import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Users, UserCheck, UserX, Eye, Edit2, Plus, Search, X,
  FileSpreadsheet, RefreshCw, Camera, Shield, DollarSign,
  CreditCard, CheckCircle2, AlertCircle, Phone, Mail, MapPin,
  Calendar, Lock, Trash2, ChevronDown, UserPlus, UserCog
} from 'lucide-react';
import { authService, UsuarioAdmin, UpdateUsuarioAdminRequest } from '../services/authService';
import { Pagination } from '../components/ui/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../hooks/useFeedback';
import { exportToExcel } from '../utils/excelExport';
import { Button } from '../components/ui/Button';
import { LoadingModal } from '../components/ui/LoadingModal';

export const Usuarios: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError, showConfirm } = useFeedback();

  const canManage = currentUser?.rol === 'Administrador' || currentUser?.rol === 'Gerente';
  const canEditCredit = currentUser?.rol === 'Administrador' || currentUser?.rol === 'Gerente';

  const [users, setUsers] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filter States
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  // Pagination (10 per page)
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<UsuarioAdmin | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Form State
  const [userForm, setUserForm] = useState<UpdateUsuarioAdminRequest & { fotoPreview?: string }>({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    nombre: '',
    cedula: '',
    email: '',
    rol: 'Cliente',
    telefono: '',
    direccion: '',
    limiteCredito: 500000,
    activo: true,
    password: '',
    fotoBase64: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authService.getAllUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        showError('No se pudieron cargar los usuarios: ' + (res.message || 'Error desconocido'));
      }
    } catch (err: any) {
      showError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Text Search (name, cedula, email, telefono, rol)
      const term = searchTerm.toLowerCase().trim();
      const fullName = [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido].filter(Boolean).join(' ') || u.nombre;
      const matchesSearch =
        !term ||
        fullName.toLowerCase().includes(term) ||
        (u.cedula && u.cedula.toLowerCase().includes(term)) ||
        u.email.toLowerCase().includes(term) ||
        (u.telefono && u.telefono.toLowerCase().includes(term)) ||
        u.rol.toLowerCase().includes(term);

      // 2. Role filter
      const matchesRole = selectedRole === 'todos' || u.rol.toLowerCase() === selectedRole.toLowerCase();

      // 3. Status filter
      const matchesStatus =
        selectedStatus === 'todos' ||
        (selectedStatus === 'activos' && u.activo) ||
        (selectedStatus === 'inactivos' && !u.activo);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  // KPIs
  const totalUsers = users.length;
  const clientUsers = users.filter((u) => u.rol === 'Cliente').length;
  const staffUsers = users.filter((u) => u.rol !== 'Cliente').length;
  const activeUsers = users.filter((u) => u.activo).length;
  const inactiveUsers = users.filter((u) => !u.activo).length;

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showError('La imagen no debe superar los 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUserForm((prev) => ({ ...prev, fotoBase64: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // Open Edit Modal
  const handleOpenEdit = (u: UsuarioAdmin) => {
    setEditingUserId(u.id);

    let pNom = u.primerNombre || '';
    let sNom = u.segundoNombre || '';
    let pApe = u.primerApellido || '';
    let sApe = u.segundoApellido || '';

    if (!pNom && !pApe && u.nombre) {
      const parts = u.nombre.trim().split(/\s+/);
      if (parts.length === 1) pNom = parts[0];
      else if (parts.length === 2) { pNom = parts[0]; pApe = parts[1]; }
      else if (parts.length === 3) { pNom = parts[0]; pApe = parts[1]; sApe = parts[2]; }
      else if (parts.length >= 4) { pNom = parts[0]; sNom = parts[1]; pApe = parts[2]; sApe = parts.slice(3).join(' '); }
    }

    setUserForm({
      primerNombre: pNom,
      segundoNombre: sNom,
      primerApellido: pApe,
      segundoApellido: sApe,
      nombre: u.nombre,
      cedula: u.cedula || '',
      email: u.email,
      rol: u.rol,
      telefono: u.telefono || '',
      direccion: u.direccion || '',
      limiteCredito: u.limiteCredito,
      activo: u.activo,
      password: '',
      fotoBase64: u.fotoBase64 || '',
    });

    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingUserId(null);
    setUserForm({
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      nombre: '',
      cedula: '',
      email: '',
      rol: 'Cliente',
      telefono: '',
      direccion: '',
      limiteCredito: 500000,
      activo: true,
      password: 'Claudipan123*',
      fotoBase64: '',
    });
    setIsEditModalOpen(true);
  };

  // Open View Modal
  const handleOpenView = (u: UsuarioAdmin) => {
    setViewingUser(u);
    setIsViewModalOpen(true);
  };

  // Save User (Create or Update)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const pNom = (userForm.primerNombre || '').trim();
    const pApe = (userForm.primerApellido || '').trim();
    if (!pNom || !pApe) {
      showError('Primer Nombre y Primer Apellido son obligatorios.');
      return;
    }

    if (!userForm.email.trim()) {
      showError('El correo electrónico es obligatorio.');
      return;
    }

    const constructedName = [pNom, (userForm.segundoNombre || '').trim(), pApe, (userForm.segundoApellido || '').trim()]
      .filter(Boolean)
      .join(' ');

    const payload: UpdateUsuarioAdminRequest = {
      ...userForm,
      primerNombre: pNom,
      segundoNombre: (userForm.segundoNombre || '').trim(),
      primerApellido: pApe,
      segundoApellido: (userForm.segundoApellido || '').trim(),
      nombre: constructedName,
      cedula: (userForm.cedula || '').trim(),
      email: userForm.email.trim(),
      limiteCredito: Number(userForm.limiteCredito) || 0,
    };

    if (editingUserId && !payload.password) {
      delete (payload as any).password;
    }

    try {
      setActionLoading(true);
      if (editingUserId) {
        const res = await authService.updateUserAdmin(editingUserId, payload);
        if (res.success) {
          showSuccess('Usuario actualizado correctamente.');
          setIsEditModalOpen(false);
          await fetchUsers();
        } else {
          showError(res.message || 'Error al actualizar usuario.');
        }
      } else {
        const res = await authService.createUserAdmin(payload);
        if (res.success) {
          showSuccess('Usuario creado exitosamente con contraseña temporal.');
          setIsEditModalOpen(false);
          await fetchUsers();
        } else {
          showError(res.message || 'Error al crear usuario.');
        }
      }
    } catch (err: any) {
      showError(err.message || 'Error en la operación.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Activate / Deactivate
  const handleToggleActive = async (u: UsuarioAdmin) => {
    const isDeactivating = u.activo;
    const actionText = isDeactivating ? 'desactivar' : 'activar';
    const confirmMessage = isDeactivating
      ? `¿Estás seguro de desactivar a "${u.nombre}"? No podrá iniciar sesión hasta que sea reactivado.`
      : `¿Deseas activar nuevamente la cuenta de "${u.nombre}"?`;

    const confirmed = await showConfirm(confirmMessage, isDeactivating ? 'Desactivar Usuario' : 'Activar Usuario');
    if (!confirmed) return;

    try {
      setActionLoading(true);
      const res = await authService.updateUserAdmin(u.id, {
        primerNombre: u.primerNombre,
        segundoNombre: u.segundoNombre,
        primerApellido: u.primerApellido,
        segundoApellido: u.segundoApellido,
        nombre: u.nombre,
        cedula: u.cedula,
        email: u.email,
        rol: u.rol,
        telefono: u.telefono,
        direccion: u.direccion,
        limiteCredito: u.limiteCredito,
        activo: !u.activo,
      });

      if (res.success) {
        showSuccess(`Usuario ${actionText}do exitosamente.`);
        await fetchUsers();
      } else {
        showError(res.message || `No se pudo ${actionText} el usuario.`);
      }
    } catch (err: any) {
      showError(err.message || `Error al ${actionText} usuario.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Export to Excel
  const handleExportUsers = () => {
    exportToExcel<UsuarioAdmin>({
      filename: 'Directorio_Usuarios_Claudipan',
      sheetName: 'Usuarios',
      title: 'Reporte Oficial de Directorio de Usuarios - Claudipan',
      data: filteredUsers,
      columns: [
        { header: 'ID', accessor: (u) => u.id, width: 8 },
        {
          header: 'Nombre Completo',
          accessor: (u) =>
            [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido].filter(Boolean).join(' ') ||
            u.nombre,
          width: 30,
        },
        { header: 'Cédula / Documento', accessor: (u) => u.cedula || 'N/A', width: 18 },
        { header: 'Correo Electrónico', accessor: (u) => u.email, width: 28 },
        { header: 'Teléfono', accessor: (u) => u.telefono || 'N/A', width: 16 },
        { header: 'Rol', accessor: (u) => u.rol, width: 16 },
        { header: 'Cupo Crédito ($)', accessor: (u) => u.limiteCredito, width: 18 },
        { header: 'Deuda Actual ($)', accessor: (u) => u.deudaActual || 0, width: 18 },
        { header: 'Dirección', accessor: (u) => u.direccion || 'N/A', width: 30 },
        { header: 'Estado', accessor: (u) => (u.activo ? 'Activo' : 'Inactivo'), width: 14 },
      ],
    });
    showSuccess('Archivo Excel generado y descargado exitosamente.');
  };

  const getRoleBadgeStyle = (rol: string) => {
    switch (rol) {
      case 'Administrador':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-400/40';
      case 'Gerente':
        return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-400/40';
      case 'Contable':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/40';
      case 'Panadero':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/40';
      case 'Vendedor':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-400/40';
      default:
        return 'bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-400/40';
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB]/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-400/30">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent">
                Gestión de Usuarios
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
              Directorio de cuentas del sistema, roles, límites de crédito fiado y control de acceso.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-amber-500 transition-all shadow-sm cursor-pointer"
              title="Refrescar usuarios"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              onClick={handleExportUsers}
              className="!py-2.5 !px-3.5 text-emerald-700 dark:text-emerald-300 border-emerald-600 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-sm text-xs font-bold"
            >
              Exportar Excel
            </Button>

            {canManage && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserPlus className="w-4 h-4" />}
                onClick={handleOpenCreate}
                className="!py-2.5 !px-4 text-xs font-extrabold shadow-md shadow-amber-700/20"
              >
                Nuevo Usuario
              </Button>
            )}
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white dark:bg-stone-900/90 p-4 rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase">Total Usuarios</p>
              <p className="text-xl sm:text-2xl font-black font-heading text-stone-900 dark:text-stone-100">{totalUsers}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900/90 p-4 rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase">Clientes</p>
              <p className="text-xl sm:text-2xl font-black font-heading text-amber-700 dark:text-amber-400">{clientUsers}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900/90 p-4 rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase">Equipo / Roles</p>
              <p className="text-xl sm:text-2xl font-black font-heading text-purple-700 dark:text-purple-300">{staffUsers}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900/90 p-4 rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase">Activos / Inactivos</p>
              <p className="text-lg sm:text-xl font-black font-heading text-emerald-600 dark:text-emerald-400">
                {activeUsers} <span className="text-xs text-red-500 font-semibold font-sans">({inactiveUsers} off)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchTerm(searchInput);
              setCurrentPage(1);
            }}
            className="flex items-center gap-2 flex-1 max-w-lg"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, cédula, correo, teléfono o rol..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (e.target.value === '') setSearchTerm('');
                }}
                className="w-full pl-10 pr-9 py-2.5 bg-stone-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearchTerm('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="!py-2.5 !px-4 text-xs font-extrabold whitespace-nowrap"
            >
              Buscar
            </Button>
          </form>

          {/* Quick Filters: Rol & Status */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-950 p-1 rounded-2xl border border-amber-200/60 dark:border-stone-800">
              <span className="text-[10px] font-bold text-stone-400 uppercase px-2">Rol:</span>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-bold text-stone-700 dark:text-stone-300 focus:outline-none pr-2 py-1 text-xs cursor-pointer"
              >
                <option value="todos">Todos los roles</option>
                <option value="Administrador">Administrador</option>
                <option value="Gerente">Gerente</option>
                <option value="Contable">Contable</option>
                <option value="Panadero">Panadero</option>
                <option value="Vendedor">Vendedor</option>
                <option value="Cliente">Cliente</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-950 p-1 rounded-2xl border border-amber-200/60 dark:border-stone-800">
              <span className="text-[10px] font-bold text-stone-400 uppercase px-2">Estado:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-bold text-stone-700 dark:text-stone-300 focus:outline-none pr-2 py-1 text-xs cursor-pointer"
              >
                <option value="todos">Todos</option>
                <option value="activos">Solo Activos</option>
                <option value="inactivos">Solo Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700 dark:text-stone-300">
              <thead className="bg-amber-500/10 dark:bg-stone-800/80 text-xs uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                <tr>
                  <th className="py-4 px-6">Usuario</th>
                  <th className="py-4 px-6">Identificación & Email</th>
                  <th className="py-4 px-6">Rol</th>
                  <th className="py-4 px-6">Cupo Crédito</th>
                  <th className="py-4 px-6">Deuda Fiado</th>
                  <th className="py-4 px-6 text-center">Estado</th>
                  <th className="py-4 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 dark:divide-stone-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400 italic">
                      No se encontraron usuarios con los criterios de búsqueda aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredUsers
                    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                    .map((u) => {
                      const displayName = [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido]
                        .filter(Boolean)
                        .join(' ') || u.nombre;

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors"
                        >
                          {/* Column 1: Avatar & Display Name */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 overflow-hidden flex items-center justify-center font-black text-amber-800 dark:text-amber-300 shrink-0 shadow-sm">
                                {u.fotoBase64 ? (
                                  <img
                                    src={u.fotoBase64}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{displayName.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-stone-900 dark:text-stone-100 truncate">
                                  {displayName}
                                </p>
                                <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-stone-400" />
                                  <span>{u.telefono || 'Sin teléfono'}</span>
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Document & Email */}
                          <td className="py-4 px-6">
                            <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                              {u.email}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              CC: {u.cedula || 'Sin registrar'}
                            </p>
                          </td>

                          {/* Column 3: Rol */}
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-xl text-xs font-black uppercase border tracking-wider ${getRoleBadgeStyle(
                                u.rol
                              )}`}
                            >
                              {u.rol}
                            </span>
                          </td>

                          {/* Column 4: Cupo Crédito */}
                          <td className="py-4 px-6 font-bold text-emerald-600 dark:text-emerald-400">
                            ${(u.limiteCredito || 0).toLocaleString('es-CO')}
                          </td>

                          {/* Column 5: Deuda Fiado */}
                          <td className="py-4 px-6 font-bold text-red-600 dark:text-red-400">
                            ${(u.deudaActual || 0).toLocaleString('es-CO')}
                          </td>

                          {/* Column 6: Estado */}
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
                                u.activo
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/40'
                                  : 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-400/40'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.activo ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                              {u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>

                          {/* Column 7: ACCIONES (Ver, Editar, Desactivar/Activar) */}
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* 1. VER */}
                              <button
                                onClick={() => handleOpenView(u)}
                                title="Ver detalles del usuario"
                                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* 2. EDITAR */}
                              {canManage && (
                                <button
                                  onClick={() => handleOpenEdit(u)}
                                  title="Editar todos los campos del usuario"
                                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}

                              {/* 3. DESACTIVAR / ACTIVAR */}
                              {canManage && (
                                <button
                                  onClick={() => handleToggleActive(u)}
                                  title={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                    u.activo
                                      ? 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  }`}
                                >
                                  {u.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredUsers.length > PAGE_SIZE && (
            <div className="p-4 border-t border-amber-200/80 dark:border-stone-800 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredUsers.length}
                pageSize={PAGE_SIZE}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EDITAR / CREAR USUARIO (CON TODOS LOS CAMPOS)  */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  {editingUserId ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                    {editingUserId ? 'Editar Información de Usuario' : 'Crear Nuevo Usuario'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {editingUserId
                      ? 'Modifica los datos personales, rol asignado, estado y cupo de crédito.'
                      : 'Ingresa los datos para registrar un nuevo integrante o cliente.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Foto de Perfil */}
              <div className="flex items-center gap-4 p-3 bg-amber-50/50 dark:bg-stone-950/50 rounded-2xl border border-amber-200/60 dark:border-stone-800">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 overflow-hidden flex items-center justify-center font-black text-xl text-amber-700 shrink-0">
                  {userForm.fotoBase64 ? (
                    <img src={userForm.fotoBase64} alt="Previsualización" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(userForm.primerNombre || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300">Foto de Perfil</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<Camera className="w-3.5 h-3.5 text-amber-600" />}
                      onClick={() => fileInputRef.current?.click()}
                      className="!py-1.5 !px-3 text-xs"
                    >
                      Subir Foto
                    </Button>
                    {userForm.fotoBase64 && (
                      <button
                        type="button"
                        onClick={() => setUserForm((prev) => ({ ...prev, fotoBase64: '' }))}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400">Formatos JPG o PNG hasta 2MB</p>
                </div>
              </div>

              {/* 4 Nombres y Apellidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                    Primer Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.primerNombre || ''}
                    onChange={(e) => setUserForm({ ...userForm, primerNombre: e.target.value })}
                    placeholder="Ej. Juan"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                    Segundo Nombre <span className="text-stone-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={userForm.segundoNombre || ''}
                    onChange={(e) => setUserForm({ ...userForm, segundoNombre: e.target.value })}
                    placeholder="Ej. Carlos"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                    Primer Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.primerApellido || ''}
                    onChange={(e) => setUserForm({ ...userForm, primerApellido: e.target.value })}
                    placeholder="Ej. Pérez"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                    Segundo Apellido <span className="text-stone-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={userForm.segundoApellido || ''}
                    onChange={(e) => setUserForm({ ...userForm, segundoApellido: e.target.value })}
                    placeholder="Ej. Gómez"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Documento y Correo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                    Cédula / Documento de Identidad
                  </label>
                  <input
                    type="text"
                    value={userForm.cedula || ''}
                    onChange={(e) => setUserForm({ ...userForm, cedula: e.target.value })}
                    placeholder="Ej. 1020304050"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Rol Asignado y Cupo de Crédito */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                    Rol en el Sistema
                  </label>
                  <select
                    value={userForm.rol}
                    onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Gerente">Gerente</option>
                    <option value="Contable">Contable</option>
                    <option value="Panadero">Panadero</option>
                    <option value="Vendedor">Vendedor</option>
                    <option value="Cliente">Cliente</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                      Cupo Crédito Fiado ($)
                    </label>
                    {!canEditCredit && (
                      <span className="text-[10px] text-amber-600 font-bold">Solo Gerente/Admin</span>
                    )}
                  </div>
                  <input
                    type="number"
                    disabled={!canEditCredit}
                    value={userForm.limiteCredito}
                    onChange={(e) =>
                      setUserForm({ ...userForm, limiteCredito: parseFloat(e.target.value) || 0 })
                    }
                    className={`w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm ${
                      !canEditCredit ? 'opacity-60 cursor-not-allowed bg-stone-100 dark:bg-stone-800' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Teléfono y Dirección */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                    Teléfono / Celular
                  </label>
                  <input
                    type="text"
                    value={userForm.telefono || ''}
                    onChange={(e) => setUserForm({ ...userForm, telefono: e.target.value })}
                    placeholder="300 123 4567"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={userForm.direccion || ''}
                    onChange={(e) => setUserForm({ ...userForm, direccion: e.target.value })}
                    placeholder="Calle # Carrera..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-300">
                  {editingUserId
                    ? 'Nueva Contraseña (deja en blanco para no modificar)'
                    : 'Contraseña Inicial'}
                </label>
                <input
                  type="password"
                  value={userForm.password || ''}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder={editingUserId ? 'Dejar en blanco para mantener la actual' : 'Mínimo 6 caracteres'}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Switch de Estado (Activo / Inactivo) */}
              <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-amber-200/60 dark:border-stone-800">
                <input
                  type="checkbox"
                  id="activoCheckbox"
                  checked={userForm.activo ?? true}
                  onChange={(e) => setUserForm({ ...userForm, activo: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="activoCheckbox" className="text-xs font-bold cursor-pointer">
                  Cuenta Activa (permitir iniciar sesión y operar en el sistema)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-200/60 dark:border-stone-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={actionLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={actionLoading}
                  className="!px-6 font-extrabold shadow-md shadow-amber-700/25"
                >
                  {editingUserId ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: VER DETALLES DE USUARIO (FICHA COMPLETA)       */}
      {/* ======================================================== */}
      {isViewModalOpen && viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                  Ficha de Usuario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Card Header */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30">
              <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white font-black text-2xl flex items-center justify-center border-2 border-white dark:border-stone-800 shadow-md shrink-0 overflow-hidden">
                {viewingUser.fotoBase64 ? (
                  <img
                    src={viewingUser.fotoBase64}
                    alt={viewingUser.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{viewingUser.nombre.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading font-black text-base text-stone-900 dark:text-stone-100 truncate">
                  {[viewingUser.primerNombre, viewingUser.segundoNombre, viewingUser.primerApellido, viewingUser.segundoApellido]
                    .filter(Boolean)
                    .join(' ') || viewingUser.nombre}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{viewingUser.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getRoleBadgeStyle(
                      viewingUser.rol
                    )}`}
                  >
                    {viewingUser.rol}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      viewingUser.activo ? 'bg-emerald-500/20 text-emerald-700' : 'bg-red-500/20 text-red-700'
                    }`}
                  >
                    {viewingUser.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800">
                <p className="text-stone-400 font-bold uppercase text-[10px]">Cédula</p>
                <p className="font-extrabold text-stone-800 dark:text-stone-200 mt-0.5">
                  {viewingUser.cedula || 'No registrada'}
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800">
                <p className="text-stone-400 font-bold uppercase text-[10px]">Teléfono</p>
                <p className="font-extrabold text-stone-800 dark:text-stone-200 mt-0.5">
                  {viewingUser.telefono || 'No registrado'}
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800">
                <p className="text-stone-400 font-bold uppercase text-[10px]">Cupo de Crédito</p>
                <p className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5 text-sm">
                  ${(viewingUser.limiteCredito || 0).toLocaleString('es-CO')}
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800">
                <p className="text-stone-400 font-bold uppercase text-[10px]">Deuda Fiado Actual</p>
                <p className="font-black text-red-600 dark:text-red-400 mt-0.5 text-sm">
                  ${(viewingUser.deudaActual || 0).toLocaleString('es-CO')}
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 sm:col-span-2">
                <p className="text-stone-400 font-bold uppercase text-[10px]">Dirección</p>
                <p className="font-extrabold text-stone-800 dark:text-stone-200 mt-0.5">
                  {viewingUser.direccion || 'Sin dirección registrada'}
                </p>
              </div>

              {viewingUser.fechaCreacion && (
                <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 sm:col-span-2">
                  <p className="text-stone-400 font-bold uppercase text-[10px]">Fecha de Registro</p>
                  <p className="font-medium text-stone-600 dark:text-stone-300 mt-0.5">
                    {new Date(viewingUser.fechaCreacion).toLocaleString('es-CO')}
                  </p>
                </div>
              )}
            </div>

            {/* Actions in View Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-amber-200/60 dark:border-stone-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsViewModalOpen(false)}
              >
                Cerrar
              </Button>
              {canManage && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Edit2 className="w-4 h-4" />}
                  onClick={() => handleOpenEdit(viewingUser)}
                  className="!px-5 font-bold"
                >
                  Editar Usuario
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal overlay during actions */}
      <LoadingModal isLoading={loading} message="Cargando directorio de usuarios" submessage="Obteniendo roles, permisos y estados" />
    </div>
  );
};

export default Usuarios;
