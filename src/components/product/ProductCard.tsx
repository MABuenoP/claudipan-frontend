import React, { useState } from 'react';
import { Star, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Product } from '../../services/productService';
import { formatCurrency } from '../../utils/helpers';
import { useCart } from '../../hooks/useCart';
import { Button } from '../ui/Button';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white dark:bg-stone-900/90 border border-amber-200/80 dark:border-stone-800 hover:border-amber-500/60 dark:hover:border-amber-500/50 rounded-3xl overflow-hidden transition-all duration-300 shadow-md shadow-amber-950/5 dark:shadow-glow flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-amber-100/50 dark:bg-stone-950">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 dark:from-stone-950 via-transparent to-transparent opacity-80" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.isFreshToday && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-stone-950 font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow-md">
              <Sparkles className="w-3 h-3" />
              Recién Horneado
            </span>
          )}
          {product.isPopular && (
            <span className="bg-white/90 dark:bg-stone-950/80 backdrop-blur-md text-amber-800 dark:text-amber-300 font-bold text-[10px] uppercase px-2.5 py-1 rounded-full border border-amber-300/60 dark:border-amber-500/30">
              Favorito
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            className={`absolute top-3 right-3 p-2.5 bg-white/90 dark:bg-stone-950/80 backdrop-blur-md hover:bg-amber-100 dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400 rounded-2xl border border-amber-200/80 dark:border-stone-700 transition-all duration-200 ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            title="Vista rápida"
            aria-label="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5">
            <span className="capitalize font-medium text-amber-700 dark:text-amber-500/90">{product.category}</span>
            <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-stone-400 dark:text-stone-500 font-normal">({product.reviewsCount})</span>
            </div>
          </div>

          <h3 className="font-heading font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Variant attributes badges */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {product.marca && (
              <span className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                {product.marca}
              </span>
            )}
            {product.sabor && (
              <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                {product.sabor}
              </span>
            )}
            {product.presentacion && (
              <span className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                {product.presentacion}
              </span>
            )}
            {product.tamano && (
              <span className="bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                {product.tamano}
              </span>
            )}
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Bottom price and add to cart */}
        <div className="flex items-center justify-between pt-3 border-t border-amber-200/60 dark:border-stone-800/80 mt-auto">
          <div>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-semibold">Precio</span>
            <span className="text-lg font-heading font-extrabold text-amber-700 dark:text-amber-400">
              {formatCurrency(product.price)}
            </span>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => addItem(product)}
            leftIcon={<ShoppingBag className="w-4 h-4" />}
          >
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
};
