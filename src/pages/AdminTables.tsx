import React, { useState, useEffect } from 'react';
import {
  Package, Layers, Plus, Edit2, Trash2, CheckCircle2, AlertCircle,
  RefreshCw, Search, X, FileSpreadsheet, ChevronDown
} from 'lucide-react';
import { productService, Product, ProductCreateRequest } from '../services/productService';
import { categoryService, Categoria, CategoriaCreateRequest } from '../services/categoryService';
import { Pagination } from '../components/ui/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../hooks/useFeedback';
import { exportToExcel } from '../utils/excelExport';
import { Button } from '../components/ui/Button';
import { LoadingModal } from '../components/ui/LoadingModal';

export const AdminTables: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError, showWarning, showConfirm } = useFeedback();
  const canExportExcel = currentUser?.rol === 'Administrador' || currentUser?.rol === 'Gerente' || currentUser?.rol === 'Contador' || currentUser?.rol === 'Contable';

  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [loading, setLoading] = useState(true);

  // Entities
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);

  // Search & Mobile 10-in-10 states
  const [searchProdInput, setSearchProdInput] = useState('');
  const [searchProdTerm, setSearchProdTerm] = useState('');
  const [visibleProdsMobile, setVisibleProdsMobile] = useState(10);

  const [searchCatInput, setSearchCatInput] = useState('');
  const [searchCatTerm, setSearchCatTerm] = useState('');
  const [visibleCatsMobile, setVisibleCatsMobile] = useState(10);

  // Pagination states (10 per page for tables)
  const [pageProducts, setPageProducts] = useState(1);
  const [pageCategories, setPageCategories] = useState(1);
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

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    const [resProd, resCat] = await Promise.all([
      productService.getAllProducts(),
      categoryService.getAllCategories(),
    ]);

    if (resProd.success && resProd.data) setProducts(resProd.data);
    if (resCat.success && resCat.data) setCategories(resCat.data);

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
      showSuccess(res.message || 'Producto guardado con éxito en el catálogo.', 'Producto Guardado');
      setIsProductModalOpen(false);
      fetchAllData();
    } else {
      setMessage({ type: 'error', text: res.message || 'Error al guardar el producto' });
      showError(res.message || 'Error al guardar el producto', 'Error al Guardar');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const confirmed = await showConfirm(
      '¿Está seguro de que desea eliminar este producto del catálogo? Los pedidos anteriores mantendrán su historial.',
      'Eliminar Producto'
    );
    if (!confirmed) return;

    const res = await productService.deleteProduct(id);
    if (res.success) {
      setMessage({ type: 'success', text: 'Producto eliminado con éxito' });
      showSuccess('Producto eliminado con éxito del catálogo.', 'Producto Eliminado');
      fetchAllData();
    } else {
      showError(res.message || 'Error al eliminar el producto', 'Error al Eliminar');
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
      showSuccess(res.message || 'Categoría guardada con éxito.', 'Categoría Guardada');
      setIsCategoryModalOpen(false);
      fetchAllData();
    } else {
      setMessage({ type: 'error', text: res.message || 'Error al guardar la categoría' });
      showError(res.message || 'Error al guardar la categoría', 'Error al Guardar');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const confirmed = await showConfirm(
      '¿Está seguro de que desea eliminar esta categoría? Los productos asociados podrían quedar sin categoría asignada.',
      'Eliminar Categoría'
    );
    if (!confirmed) return;

    const res = await categoryService.deleteCategory(id);
    if (res.success) {
      setMessage({ type: 'success', text: 'Categoría eliminada con éxito' });
      showSuccess('Categoría eliminada con éxito.', 'Categoría Eliminada');
      fetchAllData();
    } else {
      showError(res.message || 'Error al eliminar categoría', 'Error al Eliminar');
    }
  };

  // Filtering
  const filteredProducts = products.filter(p => {
    if (!searchProdTerm) return true;
    const term = searchProdTerm.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(term) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
      (p.marca && p.marca.toLowerCase().includes(term)) ||
      (p.sabor && p.sabor.toLowerCase().includes(term)) ||
      (p.presentacion && p.presentacion.toLowerCase().includes(term))
    );
  });

  const filteredCategories = categories.filter(c => {
    if (!searchCatTerm) return true;
    const term = searchCatTerm.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(term) ||
      (c.descripcion && c.descripcion.toLowerCase().includes(term)) ||
      `#${c.id}`.includes(term)
    );
  });

  // Excel Exports
  const handleExportProducts = () => {
    exportToExcel<Product>({
      filename: 'Catalogo_Productos_Claudipan',
      sheetName: 'Productos',
      title: 'Reporte Oficial de Catálogo de Productos - Claudipan',
      data: filteredProducts,
      columns: [
        { header: 'ID', accessor: (p) => p.id, width: 10 },
        { header: 'Nombre Producto', accessor: (p) => p.nombre, width: 28 },
        { header: 'Marca', accessor: (p) => p.marca || '', width: 16 },
        { header: 'Sabor / Variedad', accessor: (p) => p.sabor || '', width: 18 },
        { header: 'Presentación', accessor: (p) => p.presentacion || '', width: 16 },
        { header: 'Precio ($ COP)', accessor: (p) => p.precio, width: 18 },
        { header: 'Stock Actual', accessor: (p) => p.stock, width: 14 },
        { header: 'Estado', accessor: (p) => p.disponible ? 'Disponible' : 'Agotado', width: 14 },
      ],
    });
  };

  const handleExportCategories = () => {
    exportToExcel<Categoria>({
      filename: 'Categorias_Productos_Claudipan',
      sheetName: 'Categorias',
      title: 'Reporte Oficial de Categorías de Productos - Claudipan',
      data: filteredCategories,
      columns: [
        { header: 'ID', accessor: (c) => c.id, width: 10 },
        { header: 'Nombre Categoría', accessor: (c) => c.nombre, width: 30 },
        { header: 'Descripción', accessor: (c) => c.descripcion || '', width: 45 },
      ],
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB]/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent">
              Administración de Maestros
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              Control de Catálogo de Productos y Categorías del Sistema Claudipan.
            </p>
          </div>

          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-amber-500 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            Actualizar Tablas
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl border text-sm font-medium flex items-center gap-3 ${message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
              : 'bg-red-500/10 text-red-800 dark:text-red-300 border-red-500/30'
            }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-amber-200/80 dark:border-stone-800 gap-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 pb-3 px-2 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'products'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 dark:border-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
          >
            <Package className="w-4 h-4" />
            Productos ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 pb-3 px-2 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'categories'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 dark:border-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
          >
            <Layers className="w-4 h-4" />
            Categorías ({categories.length})
          </button>
        </div>

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Top Bar: Search on Left + Actions on Right */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchProdTerm(searchProdInput);
                  setPageProducts(1);
                }}
                className="flex items-center gap-2 flex-1 max-w-md"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre, marca, variedad..."
                    value={searchProdInput}
                    onChange={(e) => {
                      setSearchProdInput(e.target.value);
                      if (e.target.value === '') setSearchProdTerm('');
                    }}
                    className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {searchProdInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchProdInput('');
                        setSearchProdTerm('');
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
                    onClick={handleExportProducts}
                    className="text-emerald-700 dark:text-emerald-300 border-emerald-600 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-sm whitespace-nowrap"
                  >
                    Exportar a Excel
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
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
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Producto
                </Button>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
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
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-400 italic">
                          No se encontraron productos.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.slice((pageProducts - 1) * PAGE_SIZE_TABLE, pageProducts * PAGE_SIZE_TABLE).map((p) => (
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:block">
              <Pagination
                currentPage={pageProducts}
                totalItems={filteredProducts.length}
                pageSize={PAGE_SIZE_TABLE}
                onPageChange={setPageProducts}
                itemLabel="productos"
              />
            </div>

            {/* Mobile CardView (10 en 10) */}
            <div className="md:hidden space-y-3">
              {filteredProducts.slice(0, visibleProdsMobile).map(p => (
                <div key={p.id} className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={p.imagenUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100'} alt={p.nombre} className="w-12 h-12 rounded-xl object-cover border border-amber-300" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{p.nombre}</h4>
                      <p className="font-mono font-black text-emerald-600 text-sm">${p.precio.toLocaleString('es-CO')}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${p.disponible ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                      {p.disponible ? 'Disponible' : 'Agotado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-100 dark:border-stone-800">
                    <span className="text-stone-500 font-semibold">Stock: <strong className="font-mono text-stone-800 dark:text-stone-200">{p.stock} u.</strong></span>
                    <div className="space-x-1">
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
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {visibleProdsMobile < filteredProducts.length && (
                <div className="pt-2 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVisibleProdsMobile(prev => prev + 10)}
                    className="w-full text-amber-700 dark:text-amber-400 border-amber-500 font-bold"
                  >
                    <ChevronDown className="w-4 h-4 mr-1" /> Cargar 10 productos más ({visibleProdsMobile} de {filteredProducts.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Categories */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            {/* Top Bar: Search on Left + Action on Right */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchCatTerm(searchCatInput);
                  setPageCategories(1);
                }}
                className="flex items-center gap-2 flex-1 max-w-md"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar categoría..."
                    value={searchCatInput}
                    onChange={(e) => {
                      setSearchCatInput(e.target.value);
                      if (e.target.value === '') setSearchCatTerm('');
                    }}
                    className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {searchCatInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchCatInput('');
                        setSearchCatTerm('');
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
                    onClick={handleExportCategories}
                    className="text-emerald-700 dark:text-emerald-300 border-emerald-600 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-sm whitespace-nowrap"
                  >
                    Exportar a Excel
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    setEditingCategoryId(null);
                    setCategoryForm({ nombre: '', descripcion: '' });
                    setIsCategoryModalOpen(true);
                  }}
                  className="bg-amber-800 hover:bg-amber-700 text-white font-extrabold shadow-sm whitespace-nowrap"
                >
                  Categoría
                </Button>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
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
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-stone-400 italic">
                          No se encontraron categorías.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.slice((pageCategories - 1) * PAGE_SIZE_TABLE, pageCategories * PAGE_SIZE_TABLE).map((c) => (
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:block">
              <Pagination
                currentPage={pageCategories}
                totalItems={filteredCategories.length}
                pageSize={PAGE_SIZE_TABLE}
                onPageChange={setPageCategories}
                itemLabel="categorías"
              />
            </div>

            {/* Mobile CardView (10 en 10) */}
            <div className="md:hidden space-y-3">
              {filteredCategories.slice(0, visibleCatsMobile).map(c => (
                <div key={c.id} className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{c.nombre}</span>
                    <span className="text-xs font-mono text-stone-400">#{c.id}</span>
                  </div>
                  <p className="text-xs text-stone-500">{c.descripcion || 'Sin descripción'}</p>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-100 dark:border-stone-800">
                    <button
                      onClick={() => {
                        setEditingCategoryId(c.id);
                        setCategoryForm({ nombre: c.nombre, descripcion: c.descripcion || '' });
                        setIsCategoryModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

              {visibleCatsMobile < filteredCategories.length && (
                <div className="pt-2 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVisibleCatsMobile(prev => prev + 10)}
                    className="w-full text-amber-700 dark:text-amber-400 border-amber-500 font-bold"
                  >
                    <ChevronDown className="w-4 h-4 mr-1" /> Cargar 10 categorías más ({visibleCatsMobile} de {filteredCategories.length})
                  </Button>
                </div>
              )}
            </div>
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
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold">Guardar</button>
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
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
