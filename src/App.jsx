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
import { Accounting } from './pages/Accounting';
import { AdminTables } from './pages/AdminTables';

export const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toastMessage, dismissToast } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6ED] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

      {/* Mobile Drawer Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Page Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mis-deudas" element={<MyDebts />} />
          <Route path="/contabilidad" element={<Accounting />} />
          <Route path="/admin/tables" element={<AdminTables />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Toast Notifications */}
      <Toast message={toastMessage} onClose={dismissToast} />
    </div>
  );
};

export default App;
