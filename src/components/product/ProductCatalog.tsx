import React, { useState, useMemo } from 'react';
import { Product } from '../../data/mockData';
import { CATEGORIES } from '../../utils/constants';
import { ProductCard } from './ProductCard';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/helpers';
import { Search, SlidersHorizontal, ShoppingBag, Star, Check } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  initialCategory?: string;
  initialSearch?: string;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  initialCategory = 'all',
  initialSearch = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'rating'>('recommended');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQty, setSelectedQty] = useState<number>(1);

  const { addItem } = useCart();

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch =
          !searchQuery ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // recommended
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleOpenModal = (prod: Product) => {
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
    <section className="space-y-8">
      {/* Category Filter Pills & Search Controls */}
      <div className="bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 p-4 sm:p-6 rounded-3xl space-y-4 backdrop-blur-md shadow-sm transition-colors duration-300">
        
        {/* Top Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Filtrar por nombre o ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs px-4 py-3 pl-10 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500/60"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 text-xs px-4 py-2.5 rounded-2xl border border-amber-200/80 dark:border-stone-800 focus:outline-none focus:border-amber-500/60 font-medium"
            >
              <option value="recommended">Recomendados</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
              <option value="rating">Mejor Valorados</option>
            </select>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-amber-100/60 dark:bg-stone-950/80 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-200/60 dark:hover:bg-stone-800 border border-amber-200/80 dark:border-stone-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Grid Results */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white/60 dark:bg-stone-900/40 border border-amber-200/80 dark:border-stone-800/80 rounded-3xl space-y-4">
          <span className="text-5xl">🥐</span>
          <h3 className="text-lg font-heading font-bold text-stone-800 dark:text-stone-200">No encontramos productos</h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
            Prueba cambiando los filtros o buscando con un término diferente.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          >
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
        title={selectedProduct?.name}
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-amber-100/50 dark:bg-stone-950 border border-amber-200/80 dark:border-stone-800">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-heading font-extrabold text-amber-700 dark:text-amber-400">
                {formatCurrency(selectedProduct.price)}
              </span>
              <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{selectedProduct.rating}</span>
                <span className="text-stone-500 dark:text-stone-400">({selectedProduct.reviewsCount} reseñas)</span>
              </div>
            </div>

            <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Ingredients list */}
            <div>
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Ingredientes Selección</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-amber-100/60 dark:bg-stone-950 text-stone-800 dark:text-stone-300 text-xs px-3 py-1 rounded-xl border border-amber-200/80 dark:border-stone-800"
                  >
                    <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Add */}
            <div className="flex items-center justify-between pt-4 border-t border-amber-200/80 dark:border-stone-800 gap-4">
              <div className="flex items-center border border-amber-200/80 dark:border-stone-800 bg-amber-50 dark:bg-stone-950 rounded-2xl">
                <button
                  onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-stone-900 dark:text-stone-100">{selectedQty}</span>
                <button
                  onClick={() => setSelectedQty((q) => q + 1)}
                  className="px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-bold"
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
                Agregar al Carrito • {formatCurrency(selectedProduct.price * selectedQty)}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};
