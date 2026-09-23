import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/ui/Toast';
import { useCart } from './hooks/useCart';

// Pages
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { Cart } from './pages/Cart';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { MyDebts } from './pages/MyDebts';
import { VentasPOS } from './pages/VentasPOS';
import { Produccion } from './pages/Produccion';
import { ComprasProveedores } from './pages/ComprasProveedores';
import { GastosNomina } from './pages/GastosNomina';
import { BajasMermas } from './pages/BajasMermas';
import { Accounting } from './pages/Accounting';
import { AdminTables } from './pages/AdminTables';
import { ResetPassword } from './pages/ResetPassword';

export const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toastMessage, dismissToast } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6ED] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

      {/* Main Layout Container: Left Work Sidebar + Page Content */}
      <div className="flex-1 flex w-full">
        {/* Left Work Sidebar (Docked on desktop when authenticated & Drawer on mobile) */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Page Content */}
        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/mis-deudas" element={<MyDebts />} />
            <Route path="/pos" element={<VentasPOS />} />
            <Route path="/produccion" element={<Produccion />} />
            <Route path="/compras" element={<ComprasProveedores />} />
            <Route path="/gastos" element={<GastosNomina />} />
            <Route path="/bajas" element={<BajasMermas />} />
            <Route path="/contabilidad" element={<Accounting />} />
            <Route path="/admin/tables" element={<AdminTables />} />
          </Routes>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Cart Toast Notifications */}
      <Toast message={toastMessage} onClose={dismissToast} />
    </div>
  );
};

export default App;
