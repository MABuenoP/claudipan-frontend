import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Clock, Award } from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/mockData';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';

export const Home: React.FC = () => {
  const featuredProducts = MOCK_PRODUCTS.filter((p) => p.isPopular).slice(0, 4);

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-950/40 via-stone-900/60 to-stone-950 border-b border-amber-500/20 pt-12 pb-20 rounded-b-[40px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                100% Masa Madre Natural & Horneo Diarios
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-stone-100 tracking-tight leading-tight">
                El Arte del Pan <br />
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  Recién Horneado
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 max-w-2xl leading-relaxed">
                Descubre el auténtico sabor artesanal con nuestras recetas tradicionales fermentadas pacientemente. Croissants crujientes, panes de miga esponjosa y café de origen.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/catalog">
                  <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Explorar Catálogo
                  </Button>
                </Link>
                <Link to="/catalog?category=combos">
                  <Button size="lg" variant="outline">
                    Ver Combos Desayuno
                  </Button>
                </Link>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-stone-800/80 max-w-lg">
                <div>
                  <span className="block text-2xl font-heading font-extrabold text-amber-400">36h</span>
                  <span className="text-xs text-stone-400 font-medium">Fermentación Lenta</span>
                </div>
                <div>
                  <span className="block text-2xl font-heading font-extrabold text-amber-400">100%</span>
                  <span className="text-xs text-stone-400 font-medium">Mantequilla Orgánica</span>
                </div>
                <div>
                  <span className="block text-2xl font-heading font-extrabold text-amber-400">+15k</span>
                  <span className="text-xs text-stone-400 font-medium">Clientes Felices</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-glow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80"
                  alt="Pan de masa madre artesanal Claudipan"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-60" />

                {/* Floating badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-stone-900/90 backdrop-blur-md rounded-2xl border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Recién Horneado</p>
                      <p className="text-sm font-semibold text-stone-100">Pan de Masa Madre Tradicional</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                    $14.500 COP
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-stone-900/80 border border-stone-800 rounded-3xl space-y-3 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-bold text-stone-100">Horneo Diario 2 Veces al Día</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Garantizamos productos calientes y crujientes a primera hora de la mañana y en la tarde.
            </p>
          </div>

          <div className="p-6 bg-stone-900/80 border border-stone-800 rounded-3xl space-y-3 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-bold text-stone-100">Ingredientes 100% Orgánicos</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Harinas de alta pureza sin aditivos ni conservantes químicos. Saludables y naturales.
            </p>
          </div>

          <div className="p-6 bg-stone-900/80 border border-stone-800 rounded-3xl space-y-3 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-bold text-stone-100">Entrega Rápida & Segura</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Empacados en bolsas térmicas ecológicas para conservar el aroma y crocancia original.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500">Selección de la Casa</span>
            <h2 className="text-3xl font-heading font-extrabold text-stone-100 mt-1">Los Más Deseados de Claudipan</h2>
          </div>
          <Link to="/catalog">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Ver todos los productos
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Promotional Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 p-8 sm:p-12 text-stone-950 shadow-glow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="bg-stone-950 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full">
              Oferta Especial Desayuno
            </span>
            <h3 className="text-2xl sm:text-4xl font-heading font-extrabold text-stone-950 leading-tight">
              ¡Pide tu combo con 15% de descuento en tu primer pedido!
            </h3>
            <p className="text-stone-900 font-medium text-sm">
              Usa el código <span className="font-extrabold bg-stone-950 text-amber-400 px-2 py-0.5 rounded-lg">CLAUDI15</span> al finalizar tu compra.
            </p>
          </div>
          <Link to="/catalog?category=combos">
            <Button size="lg" className="bg-stone-950 text-amber-400 hover:bg-stone-900 shadow-xl">
              Aprovechar Descuento
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
};
