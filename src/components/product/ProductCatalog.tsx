import React, { useState, useMemo } from 'react';
import { Product } from '../../services/productService';
import { ProductCard } from './ProductCard';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/helpers';
import { Search, SlidersHorizontal, ShoppingBag, Star, Check, Tag, X } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  initialCategory?: string;
  initialSearch?: string;
  initialOffersOnly?: boolean;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  initialCategory = 'all',
  initialSearch = '',
  initialOffersOnly = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all'); // all, 500, 1000, 2000-5000, 5000+
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [onlyOffers, setOnlyOffers] = useState<boolean>(initialOffersOnly);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high'>('recommended');
  
  const [selectedProduct, setSelectedProduct] = useState<Product | any | null>(null);
  const [selectedQty, setSelectedQty] = useState<number>(1);

  const { addItem } = useCart();

  // Extract unique brands, flavors, sizes dynamically from products
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => { if (p.marca) set.add(p.marca); });
    return Array.from(set);
  }, [products]);

  const flavors = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => { if (p.sabor) set.add(p.sabor); });
    return Array.from(set);
  }, [products]);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => { if (p.tamano) set.add(p.tamano); });
    return Array.from(set);
  }, [products]);

  const categories = useMemo(() => {
    const map = new Map<number, string>();
    products.forEach(p => {
      if (p.categoriaId && p.categoriaNombre) {
        map.set(p.categoriaId, p.categoriaNombre);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id: id.toString(), name }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const pName = p.nombre || (p as any).name || '';
        const pDesc = p.descripcion || (p as any).description || '';
        const pPrice = p.precio !== undefined ? p.precio : (p as any).price || 0;
        const pCatId = p.categoriaId ? p.categoriaId.toString() : '';
        const isOffer = p.enOferta || (p.precioOferta !== undefined && p.precioOferta > 0);

        // Search text
        if (searchQuery.trim()) {
          const s = searchQuery.toLowerCase();
          const match = pName.toLowerCase().includes(s) ||
                        pDesc.toLowerCase().includes(s) ||
                        (p.marca && p.marca.toLowerCase().includes(s)) ||
                        (p.sabor && p.sabor.toLowerCase().includes(s)) ||
                        (p.tamano && p.tamano.toLowerCase().includes(s)) ||
                        (p.presentacion && p.presentacion.toLowerCase().includes(s));
          if (!match) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (selectedCategory.match(/^\d+$/)) {
            if (pCatId !== selectedCategory) return false;
          } else {
            const catName = p.categoriaNombre?.toLowerCase() || '';
            if (!catName.includes(selectedCategory.toLowerCase())) return false;
          }
        }

        // Price range
        if (selectedPriceRange === '500' && pPrice > 500) return false;
        if (selectedPriceRange === '1000' && (pPrice <= 500 || pPrice > 1000)) return false;
        if (selectedPriceRange === '2000-5000' && (pPrice <= 1000 || pPrice > 5000)) return false;
        if (selectedPriceRange === '5000+' && pPrice <= 5000) return false;

        // Brand filter
        if (selectedBrand !== 'all' && p.marca?.toLowerCase() !== selectedBrand.toLowerCase()) return false;

        // Flavor filter
        if (selectedFlavor !== 'all' && p.sabor?.toLowerCase() !== selectedFlavor.toLowerCase()) return false;

        // Size filter
        if (selectedSize !== 'all' && p.tamano?.toLowerCase() !== selectedSize.toLowerCase()) return false;

        // Only offers filter
        if (onlyOffers && !isOffer) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.enOferta && a.precioOferta ? a.precioOferta : (a.precio || 0);
        const priceB = b.enOferta && b.precioOferta ? b.precioOferta : (b.precio || 0);
        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        return 0; // recommended
      });
  }, [products, selectedCategory, searchQuery, selectedPriceRange, selectedBrand, selectedFlavor, selectedSize, onlyOffers, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedPriceRange('all');
    setSelectedBrand('all');
    setSelectedFlavor('all');
    setSelectedSize('all');
    setOnlyOffers(false);
  };

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery || selectedPriceRange !== 'all' || selectedBrand !== 'all' || selectedFlavor !== 'all' || selectedSize !== 'all' || onlyOffers;

  const handleOpenModal = (prod: any) => {
    setSelectedProduct(prod);
    setSelectedQty(1);
  };

  const handleAddToCartFromModal = () => {
    if (selectedProduct) {
      addItem(selectedProduct, selectedQty);
      setSelectedProduct(null);
    }
  };

  return (
    <section className="space-y-6">
      
      {/* Search & Comprehensive Filters Panel */}
      <div className="bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 p-4 sm:p-6 rounded-3xl space-y-4 backdrop-blur-md shadow-sm transition-colors duration-300">
        
        {/* Top Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar por pan, sabor, marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs px-4 py-2.5 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500/60"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Offer toggle */}
            <button
              type="button"
              onClick={() => setOnlyOffers(!onlyOffers)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
                onlyOffers
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-red-50 dark:bg-stone-950 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-900 hover:bg-red-100'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Solo Ofertas
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 text-xs px-3 py-2 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500/60 font-semibold"
              >
                <option value="recommended">Recomendados</option>
                <option value="price-low">Precio: Menor a Mayor</option>
                <option value="price-high">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Categoría:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-100/60 dark:bg-stone-950 text-stone-700 dark:text-stone-300 hover:bg-amber-200'
              }`}
            >
              🍞 Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-100/60 dark:bg-stone-950 text-stone-700 dark:text-stone-300 hover:bg-amber-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters (Precio, Marca, Sabor, Tamaño) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          {/* Precio */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Rango de Precio</label>
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 p-2 rounded-xl border border-amber-200/80 dark:border-stone-800 font-medium"
            >
              <option value="all">Todos los precios</option>
              <option value="500">Panes de $500</option>
              <option value="1000">Panes de $1.000</option>
              <option value="2000-5000">Panes de $2.000 a $5.000</option>
              <option value="5000+">Especiales &gt; $5.000</option>
            </select>
          </div>

          {/* Marca */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Marca</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 p-2 rounded-xl border border-amber-200/80 dark:border-stone-800 font-medium"
            >
              <option value="all">Todas las marcas</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Sabor */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Sabor</label>
            <select
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 p-2 rounded-xl border border-amber-200/80 dark:border-stone-800 font-medium"
            >
              <option value="all">Todos los sabores</option>
              {flavors.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Tamaño */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Tamaño</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 p-2 rounded-xl border border-amber-200/80 dark:border-stone-800 font-medium"
            >
              <option value="all">Todos los tamaños</option>
              {sizes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filters badge */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
            <span className="text-stone-500">Mostrando {filteredProducts.length} productos filtrados</span>
            <button
              onClick={clearFilters}
              className="text-amber-700 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar todos los filtros
            </button>
          </div>
        )}

      </div>

      {/* Grid Results */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white/60 dark:bg-stone-900/40 border border-amber-200/80 dark:border-stone-800/80 rounded-3xl space-y-4">
          <span className="text-5xl">🥐</span>
          <h3 className="text-lg font-heading font-bold text-stone-800 dark:text-stone-200">No encontramos productos con estos filtros</h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
            Prueba cambiando los criterios de búsqueda, marca, sabor o rango de precio.
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Restablecer Filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={handleOpenModal}
            />
          ))}
        </div>
      )}

      {/* Quick View Detail Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.nombre || selectedProduct?.name}
      >
        {selectedProduct && (
          <div className="space-y-5">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-amber-100/50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800">
              <img
                src={selectedProduct.imagenUrl || selectedProduct.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop'}
                alt={selectedProduct.nombre || selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                {selectedProduct.enOferta && selectedProduct.precioOferta ? (
                  <div>
                    <span className="text-xs text-stone-400 line-through block font-bold">
                      {formatCurrency(selectedProduct.precio || selectedProduct.price)}
                    </span>
                    <span className="text-2xl font-heading font-extrabold text-red-600 dark:text-red-400">
                      {formatCurrency(selectedProduct.precioOferta)}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-heading font-extrabold text-amber-700 dark:text-amber-400">
                    {formatCurrency(selectedProduct.precio || selectedProduct.price)}
                  </span>
                )}
              </div>
              <span className="px-2.5 py-1 bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-300 dark:border-stone-700">
                Stock: {selectedProduct.stock || 10}
              </span>
            </div>

            <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
              {selectedProduct.descripcion || selectedProduct.description}
            </p>

            {/* Variants / Specifications */}
            <div className="bg-amber-50/70 dark:bg-stone-950 p-3.5 rounded-2xl border border-amber-200/80 dark:border-stone-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Detalles del Producto</h4>
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                {selectedProduct.marca && (
                  <span className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-xl">
                    <strong>Marca:</strong> {selectedProduct.marca}
                  </span>
                )}
                {selectedProduct.sabor && (
                  <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                    <strong>Sabor:</strong> {selectedProduct.sabor}
                  </span>
                )}
                {selectedProduct.presentacion && (
                  <span className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-xl">
                    <strong>Presentación:</strong> {selectedProduct.presentacion}
                  </span>
                )}
                {selectedProduct.tamano && (
                  <span className="bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                    <strong>Tamaño:</strong> {selectedProduct.tamano}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector & Add */}
            <div className="flex items-center justify-between pt-4 border-t border-amber-200/80 dark:border-stone-800 gap-4">
              <div className="flex items-center border border-amber-200/80 dark:border-stone-800 bg-amber-50 dark:bg-stone-950 rounded-2xl">
                <button
                  onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:text-amber-600 font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-stone-900 dark:text-stone-100">{selectedQty}</span>
                <button
                  onClick={() => setSelectedQty((q) => q + 1)}
                  className="px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:text-amber-600 font-bold"
                >
                  +
                </button>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCartFromModal}
                leftIcon={<ShoppingBag className="w-5 h-5" />}
                className="flex-1"
              >
                Agregar al Carrito • {formatCurrency(((selectedProduct.enOferta && selectedProduct.precioOferta) ? selectedProduct.precioOferta : (selectedProduct.precio || selectedProduct.price)) * selectedQty)}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};
