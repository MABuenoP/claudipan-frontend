import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { Product } from '../data/mockData';
import { ProductCatalog } from '../components/product/ProductCatalog';
import { Spinner } from '../components/ui/Spinner';
import { Store, Flame } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-200/50 via-amber-100/40 to-amber-200/50 dark:from-stone-900 dark:via-amber-950/40 dark:to-stone-900 border border-amber-300/80 dark:border-amber-500/20 p-8 sm:p-10 rounded-3xl space-y-3 shadow-sm transition-colors duration-300">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          Nuestra Vitrina Artesanal
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
          Catálogo Completo Claudipan
        </h1>
        <p className="text-stone-700 dark:text-stone-300 text-sm max-w-xl">
          Selección fresca de panes de masa madre, hojaldres laminados, repostería y café especial.
        </p>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">Cargando delicias recién horneadas...</p>
        </div>
      ) : (
        <ProductCatalog
          products={products}
          initialCategory={categoryParam}
          initialSearch={searchParam}
        />
      )}
    </div>
  );
};
