import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { User, Lock, ArrowRight, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('claudia@claudipan.com');
  const [password, setPassword] = useState('123456');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-stone-900/90 border border-amber-500/20 p-8 rounded-3xl space-y-6 backdrop-blur-md shadow-2xl">
        
        {/* Header logo */}
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="Claudipan" className="w-16 h-16 rounded-2xl mx-auto border border-amber-500/30 object-cover" />
          <h1 className="text-2xl font-heading font-extrabold text-stone-100">Iniciar Sesión</h1>
          <p className="text-xs text-stone-400">Bienvenido de vuelta a Claudipan Artesanal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">Correo Electrónico</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-950 text-stone-100 placeholder-stone-500 text-xs px-4 py-3 pl-10 rounded-2xl border border-stone-800 focus:outline-none focus:border-amber-500"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-950 text-stone-100 placeholder-stone-500 text-xs px-4 py-3 pl-10 rounded-2xl border border-stone-800 focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Ingresar a mi Cuenta
          </Button>
        </form>

        {/* Demo info hint */}
        <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-1 text-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> Cuenta Demo Rápida
          </span>
          <p className="text-[11px] text-stone-400">
            Credenciales precargadas automáticamente para pruebas directas.
          </p>
        </div>

      </div>
    </div>
  );
};
