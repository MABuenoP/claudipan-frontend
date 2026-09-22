import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Clock, Award, Tag, Percent, TrendingUp, Star } from 'lucide-react';
import { productService, Product } from '../services/productService';
import { contabilidadService } from '../services/contabilidadService';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';

export const Home: React.FC = () => {
  const [topSellers, setTopSellers] = useState<Product[]>([]);
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allRes, offersRes] = await Promise.all([
          productService.getAll(),
          productService.getAll({ soloOfertas: true }),
        ]);

        if (allRes.success && allRes.data) {
          // Tomar los 4 productos de mayor venta del catálogo
          // Filtramos primero los panes más populares y tradicionales
          const bestSellers = allRes.data
            .filter(p => p.precio === 500 || p.precio === 1000 || p.precio === 2000 || p.nombre.toLowerCase().includes('queso') || p.nombre.toLowerCase().includes('coca'))
            .slice(0, 4);

          setTopSellers(bestSellers.length === 4 ? bestSellers : allRes.data.slice(0, 4));
        }

        if (offersRes.success && offersRes.data) {
          // Tomar exactamente 4 ofertas especiales destacadas
          setOfferProducts(offersRes.data.slice(0, 4));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-200/40 via-amber-100/20 to-transparent dark:from-amber-950/40 dark:via-stone-900/60 dark:to-stone-950 border-b border-amber-200/80 dark:border-amber-500/20 pt-10 pb-16 rounded-b-[40px] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Panadería Tradicional & Artesanal SENA ADSO
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                El Arte del Pan <br />
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-400 dark:via-amber-300 dark:to-amber-500 bg-clip-text text-transparent">
                  Fresco & Horneado
                </span>
              </h1>

              <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 max-w-2xl leading-relaxed font-normal">
                Panes económicos desde <strong>$500</strong> y <strong>$1.000</strong> (bolitas, cemas, alargados de queso, leche, dulce, cascaritas), panes especiales familiares de <strong>$2.000</strong> y <strong>$5.000</strong>, pan para perros y hamburguesas, gaseosas y lácteos de las mejores marcas.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link to="/catalog">
                  <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Explorar Catálogo (Paginado de 12 en 12)
                  </Button>
                </Link>
                <Link to="/catalog?ofertas=true">
                  <Button size="lg" variant="secondary" leftIcon={<Percent className="w-4 h-4 text-red-500" />}>
                    Ver Ofertas Especiales
                  </Button>
                </Link>
              </div>

              {/* Price Badges Quick Access */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-4">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">Precios:</span>
                <Link to="/catalog?maxPrecio=500" className="px-3 py-1 bg-amber-100 dark:bg-stone-800 hover:bg-amber-200 text-amber-900 dark:text-amber-300 text-xs font-extrabold rounded-lg border border-amber-300 dark:border-stone-700 transition-colors">
                  Panes $500
                </Link>
                <Link to="/catalog?minPrecio=501&maxPrecio=1000" className="px-3 py-1 bg-amber-100 dark:bg-stone-800 hover:bg-amber-200 text-amber-900 dark:text-amber-300 text-xs font-extrabold rounded-lg border border-amber-300 dark:border-stone-700 transition-colors">
                  Panes $1.000
                </Link>
                <Link to="/catalog?minPrecio=1001&maxPrecio=5000" className="px-3 py-1 bg-amber-100 dark:bg-stone-800 hover:bg-amber-200 text-amber-900 dark:text-amber-300 text-xs font-extrabold rounded-lg border border-amber-300 dark:border-stone-700 transition-colors">
                  $2.000 y $5.000
                </Link>
                <Link to="/catalog?marca=Coca-Cola" className="px-3 py-1 bg-red-100 dark:bg-red-950/40 hover:bg-red-200 text-red-800 dark:text-red-300 text-xs font-extrabold rounded-lg border border-red-300 dark:border-red-900 transition-colors">
                  Gaseosas
                </Link>
                <Link to="/catalog?marca=Alpina" className="px-3 py-1 bg-blue-100 dark:bg-blue-950/40 hover:bg-blue-200 text-blue-800 dark:text-blue-300 text-xs font-extrabold rounded-lg border border-blue-300 dark:border-blue-900 transition-colors">
                  Lácteos
                </Link>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-amber-300/80 dark:border-amber-500/30 shadow-xl dark:shadow-glow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80"
                  alt="Pan de masa madre artesanal Claudipan"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 dark:from-stone-950 via-transparent to-transparent opacity-60" />

                {/* Floating badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl border border-amber-200/80 dark:border-amber-500/30 flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Recién Horneado</p>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Pan Redondo de Queso</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-amber-800 dark:text-amber-400 bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/30">
                    $1.000 COP
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 1: 4 PRODUCTOS DE MAYOR VENTA DEL CATÁLOGO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Los Favoritos de Nuestros Clientes
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
              4 Productos de Mayor Venta
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Los productos más solicitados diariamente en mostrador por su frescura, sabor y precio.
            </p>
          </div>
          <Link to="/catalog">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Ver catálogo completo
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topSellers.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* SECTION 2: 4 OFERTAS ESPECIALES HASTA AGOTAR EXISTENCIAS */}
      {offerProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-500/15 via-amber-500/10 to-orange-500/15 border border-red-500/30 dark:border-red-500/20 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/30 animate-bounce">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600 dark:text-red-400 block">
                    ¡Precios de Locura!
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
                    4 Ofertas Especiales Hasta Agotar Existencias
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    Aprovecha descuentos únicos en panes seleccionados, combos familiares y bebidas.
                  </p>
                </div>
              </div>
              <Link to="/catalog?ofertas=true">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Ver todas las ofertas
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {offerProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-stone-900/80 border border-amber-200/80 dark:border-stone-800 rounded-3xl space-y-3 hover:border-amber-500/60 shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100">Horneo Diario y Frescura</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Panes crujientes recién salidos del horno para el desayuno y la tarde con insumos de primera calidad.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-stone-900/80 border border-amber-200/80 dark:border-stone-800 rounded-3xl space-y-3 hover:border-amber-500/60 shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100">Cupo para Fiar a Clientes</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Inscríbete como Cliente con tus datos y obtén tu cupo de crédito para fiar hasta por $500.000, el cual se restablece al abonar.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-stone-900/80 border border-amber-200/80 dark:border-stone-800 rounded-3xl space-y-3 hover:border-amber-500/60 shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100">Proveedores Certificados</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Aliados oficiales: Coca-Cola, Postobón, Alpina, Colanta, Levapan y Harinera del Valle con frescura garantizada.
            </p>
          </div>
        </div>
      </section>

      {/* Promotional Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="bg-white/20 backdrop-blur-md text-amber-100 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border border-white/30">
              Sistema de Gestión Integral Claudipan
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white leading-tight">
              ¿Eres panadero, vendedor, contador o cliente?
            </h3>
            <p className="text-amber-100 font-normal text-sm">
              Inicia sesión con tu rol para acceder a órdenes de producción, punto de venta POS, estados contables P&G o tu cupo de crédito para fiar.
            </p>
          </div>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="shadow-xl">
              Ingresar al Sistema
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
};
