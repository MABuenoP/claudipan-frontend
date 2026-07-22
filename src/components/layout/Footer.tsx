import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-950 border-t border-amber-500/20 text-stone-300 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Claudipan Logo" className="w-12 h-12 rounded-xl border border-amber-500/30 object-cover" />
              <div>
                <h3 className="text-xl font-heading font-extrabold text-amber-400">CLAUDIPAN</h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Panadería & Pastelería</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-stone-400">
              El verdadero sabor artesanal hecho con masa madre natural, ingredientes 100% orgánicos y la dedicación de nuestros maestros panaderos.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-heading font-bold text-amber-400 uppercase tracking-wider">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-amber-400 transition-colors">Catálogo de Panes & Hojaldres</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-amber-400 transition-colors">Carrito de Compras</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-amber-400 transition-colors">Mi Cuenta & Pedidos</Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours & Delivery */}
          <div className="space-y-3">
            <h4 className="text-sm font-heading font-bold text-amber-400 uppercase tracking-wider">Horarios de Horneo</h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Lun - Sáb: 6:00 AM - 8:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Domingos: 7:00 AM - 6:00 PM</span>
              </div>
              <p className="text-[11px] text-stone-500 pt-1">
                🔥 ¡Lotes de pan caliente horneados a las 7:00 AM y 4:00 PM todos los días!
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-heading font-bold text-amber-400 uppercase tracking-wider">Contacto & Ubicación</h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Calle 93 # 12-45, Chapinero Norte, Bogotá - Colombia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+57 (601) 345-6789 / +57 312 456 7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>pedidos@claudipan.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 Claudipan S.A.S. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> por el equipo Claudipan
          </p>
        </div>
      </div>
    </footer>
  );
};
