import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-800 dark:bg-stone-900 border-t border-stone-700 dark:border-stone-800 text-stone-200 pt-16 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-700/80 dark:border-stone-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Claudipan Logo" className="w-12 h-12 rounded-xl border border-amber-500/40 object-cover shadow-sm" />
              <div>
                <h3 className="text-xl font-heading font-extrabold text-amber-400 tracking-tight">CLAUDIPAN</h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Panadería & Pastelería</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-stone-300 font-normal">
              El verdadero sabor artesanal hecho con masa madre natural, ingredientes 100% orgánicos y la dedicación de nuestros maestros panaderos.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-heading font-extrabold text-amber-400 uppercase tracking-wider">Enlaces Rápidos</h4>
            <ul className="space-y-2.5 text-xs text-stone-300 font-medium">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500">•</span> Inicio
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500">•</span> Catálogo de Panes & Hojaldres
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500">•</span> Carrito de Compras
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500">•</span> Mi Cuenta & Pedidos
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours & Delivery */}
          <div className="space-y-3">
            <h4 className="text-sm font-heading font-extrabold text-amber-400 uppercase tracking-wider">Horarios de Horneo</h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium">Lun - Sáb: 6:00 AM - 8:00 PM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium">Domingos: 7:00 AM - 6:00 PM</span>
              </div>
              <p className="text-[11px] text-amber-200/90 font-semibold bg-stone-900/60 p-2.5 rounded-xl border border-stone-700/60 mt-1">
                🔥 ¡Lotes de pan caliente horneados a las 7:00 AM y 4:00 PM todos los días!
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-heading font-extrabold text-amber-400 uppercase tracking-wider">Contacto & Ubicación</h4>
            <div className="space-y-2.5 text-xs text-stone-300 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Calle 93 # 12-45, Chapinero Norte, Bogotá - Colombia</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+57 (601) 345-6789 / +57 312 456 7890</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>pedidos@claudipan.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 font-medium gap-4">
          <p>© 2026 Claudipan S.A.S. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            Hecho con <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> por el equipo Claudipan
          </p>
        </div>
      </div>
    </footer>
  );
};
