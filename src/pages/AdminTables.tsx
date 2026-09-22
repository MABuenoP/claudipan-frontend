import React, { useState, useEffect } from 'react';
import { Package, Layers, Users, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { productService, Product, ProductCreateRequest } from '../services/productService';
import { categoryService, Categoria, CategoriaCreateRequest } from '../services/categoryService';
import { authService, UsuarioAdmin, UpdateUsuarioAdminRequest } from '../services/authService';
import { Pagination } from '../components/ui/Pagination';

export const AdminTables: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'users'>('products');
  const [loading, setLoading] = useState(true);

  // Entities
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [users, setUsers] = useState<UsuarioAdmin[]>([]);

  // Pagination states (10 per page for tables)
  const [pageProducts, setPageProducts] = useState(1);
  const [pageCategories, setPageCategories] = useState(1);
  const [pageUsers, setPageUsers] = useState(1);
  const PAGE_SIZE_TABLE = 10;

  // Modals & forms state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState<ProductCreateRequest>({
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imagenUrl: '',
    disponible: true,
    categoriaId: 0,
    presentacion: '',
    marca: '',
    sabor: '',
    tamano: '',
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoriaCreateRequest>({
    nombre: '',
    descripcion: '',
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userForm, setUserForm] = useState<UpdateUsuarioAdminRequest>({
    nombre: '',
    email: '',
    rol: 'Cliente',
    telefono: '',
    direccion: '',
    limiteCredito: 500000,
    activo: true,
    password: '',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    const [resProd, resCat, resUsers] = await Promise.all([
      productService.getAllProducts(),
      categoryService.getAllCategories(),
      authService.getAllUsers(),
    ]);

    if (resProd.success && resProd.data) setProducts(resProd.data);
    if (resCat.success && resCat.data) setCategories(resCat.data);
    if (resUsers.success && resUsers.data) setUsers(resUsers.data);

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers for Product CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    let res;
    if (editingProductId) {
      res = await productService.updateProduct(editingProductId, productForm);
    } else {
      res = await productService.createProduct(productForm);
    }

    if (res.success) {
      setMessage({ type: 'success', text: res.message || 'Producto guardado con éxito' });
      setIsProductModalOpen(false);
      fetchAllData();
    } else {
      setMessage({ type: 'error', text: res.message || 'Error al guardar el producto' });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este producto?')) return;
    const res = await productService.deleteProduct(id);
    if (res.success) {
      setMessage({ type: 'success', text: 'Producto eliminado con éxito' });
      fetchAllData();
    }
  };

  // Handlers for Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    let res;
    if (editingCategoryId) {
      res = await categoryService.updateCategory(editingCategoryId, categoryForm);
    } else {
      res = await categoryService.createCategory(categoryForm);
    }

    if (res.success) {
      setMessage({ type: 'success', text: res.message || 'Categoría guardada con éxito' });
      setIsCategoryModalOpen(false);
      fetchAllData();
    } else {
      setMessage({ type: 'error', text: res.message || 'Error al guardar la categoría' });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta categoría?')) return;
    const res = await categoryService.deleteCategory(id);
    if (res.success) {
      setMessage({ type: 'success', text: 'Categoría eliminada con éxito' });
      fetchAllData();
    }
  };

  // Handlers for User CRUD
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    let res;
    if (editingUserId) {
      res = await authService.updateUserAdmin(editingUserId, userForm);
    } else {
      res = await authService.createUserAdmin(userForm);
    }

    if (res.success) {
      setMessage({ type: 'success', text: res.message || 'Usuario guardado con éxito' });
      setIsUserModalOpen(false);
      fetchAllData();
    } else {
      setMessage({ type: 'error', text: res.message || 'Error al guardar el usuario' });
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('¿Está seguro de desactivar este usuario?')) return;
    const res = await authService.deleteUserAdmin(id);
    if (res.success) {
      setMessage({ type: 'success', text: 'Usuario desactivado' });
      fetchAllData();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB]/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent">
              Gestión CRUD de Tablas del Sistema
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              Módulo exclusivo de Técnicos y Administradores para mantenimiento de entidades.
            </p>
          </div>

          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-amber-500 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            Actualizar Tablas
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl border text-sm font-medium flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' 
              : 'bg-red-500/10 text-red-800 dark:text-red-300 border-red-500/30'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-amber-200/80 dark:border-stone-800 gap-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 pb-3 px-2 font-bold text-sm transition-all border-b-2 ${
              activeTab === 'products'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 dark:border-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Productos ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 pb-3 px-2 font-bold text-sm transition-all border-b-2 ${
              activeTab === 'categories'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 dark:border-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Categorías ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 pb-3 px-2 font-bold text-sm transition-all border-b-2 ${
              activeTab === 'users'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 dark:border-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Usuarios & Roles ({users.length})
          </button>
        </div>

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-amber-200/80 dark:border-stone-800 flex items-center justify-between">
                <h2 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100">Catálogo de Productos</h2>
                <button
                  onClick={() => {
                    setEditingProductId(null);
                    setProductForm({
                      nombre: '',
                      descripcion: '',
                      precio: 3500,
                      stock: 50,
                      imagenUrl: '',
                      disponible: true,
                      categoriaId: categories[0]?.id || 1,
                      presentacion: '',
                      marca: '',
                      sabor: '',
                      tamano: '',
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Producto
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-700 dark:text-stone-300">
                  <thead className="bg-amber-500/10 dark:bg-stone-800/80 text-xs uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                    <tr>
                      <th className="py-3.5 px-6">Imagen</th>
                      <th className="py-3.5 px-6">Nombre & Variedad</th>
                      <th className="py-3.5 px-6">Precio</th>
                      <th className="py-3.5 px-6">Stock</th>
                      <th className="py-3.5 px-6">Estado</th>
                      <th className="py-3.5 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 dark:divide-stone-800">
                    {products.slice((pageProducts - 1) * PAGE_SIZE_TABLE, pageProducts * PAGE_SIZE_TABLE).map((p) => (
                      <tr key={p.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="py-3 px-6">
                          <img src={p.imagenUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100'} alt={p.nombre} className="w-10 h-10 rounded-xl object-cover border border-amber-300 dark:border-stone-700" />
                        </td>
                        <td className="py-3 px-6">
                          <div className="font-bold text-stone-900 dark:text-stone-100">{p.nombre}</div>
                          {(p.presentacion || p.marca || p.sabor || p.tamano) && (
                            <div className="text-[11px] text-stone-500 dark:text-stone-400 flex flex-wrap gap-1 mt-0.5">
                              {p.marca && <span className="bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded">{p.marca}</span>}
                              {p.sabor && <span className="bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded">{p.sabor}</span>}
                              {p.presentacion && <span className="bg-amber-500/10 text-amber-700 px-1.5 py-0.5 rounded">{p.presentacion}</span>}
                              {p.tamano && <span className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">{p.tamano}</span>}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">${p.precio.toLocaleString('es-CO')}</td>
                        <td className="py-3 px-6 font-semibold">{p.stock} unidades</td>
                        <td className="py-3 px-6">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${p.disponible ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' : 'bg-stone-500/10 text-stone-600 dark:text-stone-400'}`}>
                            {p.disponible ? 'Disponible' : 'Agotado'}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProductId(p.id);
                              setProductForm({
                                nombre: p.nombre,
                                descripcion: p.descripcion,
                                precio: p.precio,
                                stock: p.stock,
                                imagenUrl: p.imagenUrl || '',
                                disponible: p.disponible,
                                categoriaId: p.categoriaId,
                                presentacion: p.presentacion || '',
                                marca: p.marca || '',
                                sabor: p.sabor || '',
                                tamano: p.tamano || '',
                              });
                              setIsProductModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-stone-800 rounded-xl transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-stone-800 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination
              currentPage={pageProducts}
              totalItems={products.length}
              pageSize={PAGE_SIZE_TABLE}
              onPageChange={setPageProducts}
              itemLabel="productos"
            />
          </div>
        )}

        {/* Tab 2: Categories */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-amber-200/80 dark:border-stone-800 flex items-center justify-between">
                <h2 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100">Categorías</h2>
                <button
                  onClick={() => {
                    setEditingCategoryId(null);
                    setCategoryForm({ nombre: '', descripcion: '' });
                    setIsCategoryModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Categoría
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-700 dark:text-stone-300">
                  <thead className="bg-amber-500/10 dark:bg-stone-800/80 text-xs uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                    <tr>
                      <th className="py-3.5 px-6">ID</th>
                      <th className="py-3.5 px-6">Nombre</th>
                      <th className="py-3.5 px-6">Descripción</th>
                      <th className="py-3.5 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 dark:divide-stone-800">
                    {categories.slice((pageCategories - 1) * PAGE_SIZE_TABLE, pageCategories * PAGE_SIZE_TABLE).map((c) => (
                      <tr key={c.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-stone-500">#{c.id}</td>
                        <td className="py-4 px-6 font-bold text-stone-900 dark:text-stone-100">{c.nombre}</td>
                        <td className="py-4 px-6 text-stone-600 dark:text-stone-400">{c.descripcion || '-'}</td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingCategoryId(c.id);
                              setCategoryForm({ nombre: c.nombre, descripcion: c.descripcion || '' });
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-stone-800 rounded-xl transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-stone-800 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination
              currentPage={pageCategories}
              totalItems={categories.length}
              pageSize={PAGE_SIZE_TABLE}
              onPageChange={setPageCategories}
              itemLabel="categorías"
            />
          </div>
        )}

        {/* Tab 3: Users */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-amber-200/80 dark:border-stone-800 flex items-center justify-between">
                <h2 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100">Usuarios & Asignación de Roles</h2>
                <button
                  onClick={() => {
                    setEditingUserId(null);
                    setUserForm({
                      nombre: '',
                      email: '',
                      rol: 'Cliente',
                      telefono: '',
                      direccion: '',
                      limiteCredito: 500000,
                      activo: true,
                      password: 'Claudipan123*',
                    });
                    setIsUserModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Usuario
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-700 dark:text-stone-300">
                  <thead className="bg-amber-500/10 dark:bg-stone-800/80 text-xs uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                    <tr>
                      <th className="py-3.5 px-6">Nombre</th>
                      <th className="py-3.5 px-6">Email</th>
                      <th className="py-3.5 px-6">Rol</th>
                      <th className="py-3.5 px-6">Cupo Crédito</th>
                      <th className="py-3.5 px-6">Deuda Actual</th>
                      <th className="py-3.5 px-6">Estado</th>
                      <th className="py-3.5 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 dark:divide-stone-800">
                    {users.slice((pageUsers - 1) * PAGE_SIZE_TABLE, pageUsers * PAGE_SIZE_TABLE).map((u) => (
                      <tr key={u.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-stone-900 dark:text-stone-100">{u.nombre}</td>
                        <td className="py-4 px-6 text-stone-600 dark:text-stone-400">{u.email}</td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                            {u.rol}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-emerald-600 dark:text-emerald-400">${u.limiteCredito.toLocaleString('es-CO')}</td>
                        <td className="py-4 px-6 font-semibold text-red-600 dark:text-red-400">${u.deudaActual.toLocaleString('es-CO')}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${u.activo ? 'bg-emerald-500/20 text-emerald-700' : 'bg-red-500/20 text-red-700'}`}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setUserForm({
                                nombre: u.nombre,
                                email: u.email,
                                rol: u.rol,
                                telefono: u.telefono || '',
                                direccion: u.direccion || '',
                                limiteCredito: u.limiteCredito,
                                activo: u.activo,
                                password: '',
                              });
                              setIsUserModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-stone-800 rounded-xl transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-stone-800 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination
              currentPage={pageUsers}
              totalItems={users.length}
              pageSize={PAGE_SIZE_TABLE}
              onPageChange={setPageUsers}
              itemLabel="usuarios"
            />
          </div>
        )}
      </div>

      {/* Modal Product */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl p-6 space-y-4 border border-amber-200 dark:border-stone-800">
            <h3 className="text-xl font-bold">{editingProductId ? 'Editar Producto' : 'Crear Producto'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={productForm.nombre}
                  onChange={(e) => setProductForm({ ...productForm, nombre: e.target.value })}
                  className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Descripción</label>
                <textarea
                  required
                  value={productForm.descripcion}
                  onChange={(e) => setProductForm({ ...productForm, descripcion: e.target.value })}
                  className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Precio ($)</label>
                  <input
                    type="number"
                    required
                    value={productForm.precio}
                    onChange={(e) => setProductForm({ ...productForm, precio: parseFloat(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Categoría</label>
                <select
                  value={productForm.categoriaId}
                  onChange={(e) => setProductForm({ ...productForm, categoriaId: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Imagen URL</label>
                <input
                  type="text"
                  value={productForm.imagenUrl}
                  onChange={(e) => setProductForm({ ...productForm, imagenUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                />
              </div>

              {/* Variant fields */}
              <div className="p-3 bg-amber-50/60 dark:bg-stone-950 rounded-2xl border border-amber-200/80 dark:border-stone-800 space-y-2">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-400 block">Variaciones y Atributos (Panes, Cafés, Gaseosas, Lácteos)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400">Presentación (e.g. Tajado / Integral)</label>
                    <input
                      type="text"
                      value={productForm.presentacion || ''}
                      onChange={(e) => setProductForm({ ...productForm, presentacion: e.target.value })}
                      placeholder="Tajado, Trenza..."
                      className="w-full p-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400">Marca (e.g. Postobón, Colanta)</label>
                    <input
                      type="text"
                      value={productForm.marca || ''}
                      onChange={(e) => setProductForm({ ...productForm, marca: e.target.value })}
                      placeholder="Marca..."
                      className="w-full p-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400">Sabor (e.g. Vainilla, Manzana)</label>
                    <input
                      type="text"
                      value={productForm.sabor || ''}
                      onChange={(e) => setProductForm({ ...productForm, sabor: e.target.value })}
                      placeholder="Sabor..."
                      className="w-full p-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400">Tamaño (e.g. Grande 500ml, Familiar)</label>
                    <input
                      type="text"
                      value={productForm.tamano || ''}
                      onChange={(e) => setProductForm({ ...productForm, tamano: e.target.value })}
                      placeholder="Grande, 1.5L..."
                      className="w-full p-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={productForm.disponible}
                  onChange={(e) => setProductForm({ ...productForm, disponible: e.target.checked })}
                />
                <label htmlFor="disponible" className="text-xs font-bold">Disponible en catálogo</label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Category */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl p-6 space-y-4 border border-amber-200 dark:border-stone-800">
            <h3 className="text-xl font-bold">{editingCategoryId ? 'Editar Categoría' : 'Crear Categoría'}</h3>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={categoryForm.nombre}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nombre: e.target.value })}
                  className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Descripción</label>
                <textarea
                  value={categoryForm.descripcion}
                  onChange={(e) => setCategoryForm({ ...categoryForm, descripcion: e.target.value })}
                  className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal User */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl p-6 space-y-4 border border-amber-200 dark:border-stone-800">
            <h3 className="text-xl font-bold">{editingUserId ? 'Editar Usuario / Rol' : 'Crear Nuevo Usuario'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={userForm.nombre}
                    onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Rol Asignado</label>
                  <select
                    value={userForm.rol}
                    onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Secretaria">Secretaria</option>
                    <option value="Tecnico">Tecnico</option>
                    <option value="Cliente">Cliente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Cupo Crédito ($)</label>
                  <input
                    type="number"
                    value={userForm.limiteCredito}
                    onChange={(e) => setUserForm({ ...userForm, limiteCredito: parseFloat(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={userForm.telefono}
                    onChange={(e) => setUserForm({ ...userForm, telefono: e.target.value })}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Contraseña (Opcional)</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Contraseña nueva..."
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={userForm.activo}
                  onChange={(e) => setUserForm({ ...userForm, activo: e.target.checked })}
                />
                <label htmlFor="activo" className="text-xs font-bold">Usuario Activo</label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
