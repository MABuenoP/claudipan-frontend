import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { contabilidadService } from '../services/contabilidadService';
import { TransaccionDeuda } from '../services/pedidoService';
import { Pagination } from '../components/ui/Pagination';

export const MyDebts: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [transacciones, setTransacciones] = useState<TransaccionDeuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchDeudas = async () => {
    setLoading(true);
    await refreshProfile();
    const res = await contabilidadService.getMisDeudas();
    if (res.success && res.data) {
      setTransacciones(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeudas();
  }, []);

  const cupoDisponible = (user?.limiteCredito || 0) - (user?.deudaActual || 0);

  return (
    <div className="min-h-screen bg-[#FFFBEB]/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent">
              Mis Deudas y Crédito
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              Consulta tu cupo de crédito otorgado y el historial de cargos y abonos.
            </p>
          </div>
          <button
            onClick={fetchDeudas}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-amber-500 transition-all shadow-sm self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            Actualizar Estado
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Cupo de Crédito Total</span>
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
              ${(user?.limiteCredito || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">Cupo asignado por Claudipan</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Deuda Pendiente Actual</span>
              <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className={`text-3xl font-heading font-extrabold ${(user?.deudaActual || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              ${(user?.deudaActual || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">Monto adeudado a la fecha</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Cupo Disponible para Compras</span>
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400">
              ${Math.max(0, cupoDisponible).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">Disponible para pedidos a crédito</p>
          </div>
        </div>

        {/* Dynamic Credit Formula Card */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-sm">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span>Regla de Fiado y Tope Dinámico Claudipan</span>
          </div>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            Puedes realizar compras a crédito ("fiar") siempre que no superes tu cupo disponible. Cada vez que pagas o abonas a tu deuda, tu cupo disponible se restablece inmediatamente.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2 font-mono font-bold text-xs text-stone-900 dark:text-stone-100">
            <span className="bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-stone-800">
              Tope Máximo: ${(user?.limiteCredito || 0).toLocaleString('es-CO')}
            </span>
            <span className="text-amber-700 dark:text-amber-400">-</span>
            <span className="bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-red-300 dark:border-stone-800 text-red-600 dark:text-red-400">
              Fiado Actual: ${(user?.deudaActual || 0).toLocaleString('es-CO')}
            </span>
            <span className="text-amber-700 dark:text-amber-400">=</span>
            <span className="bg-emerald-500 text-white dark:bg-emerald-600 px-3 py-1.5 rounded-xl">
              Cupo Disponible: ${Math.max(0, cupoDisponible).toLocaleString('es-CO')}
            </span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-amber-200/80 dark:border-stone-800">
            <h2 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100">
              Historial de Transacciones de Crédito
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Cargos por compras a crédito y abonos realizados a tu saldo
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm">
              Cargando historial de cartera...
            </div>
          ) : transacciones.length === 0 ? (
            <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-amber-500 opacity-60" />
              <p>No registras transacciones de deuda o crédito hasta el momento.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-700 dark:text-stone-300">
                <thead className="bg-amber-500/10 dark:bg-stone-800/80 text-xs uppercase font-extrabold text-stone-600 dark:text-stone-400 border-b border-amber-200/80 dark:border-stone-800">
                  <tr>
                    <th className="py-3.5 px-6">Tipo</th>
                    <th className="py-3.5 px-6">Concepto</th>
                    <th className="py-3.5 px-6">Pedido ID</th>
                    <th className="py-3.5 px-6">Fecha</th>
                    <th className="py-3.5 px-6 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 dark:divide-stone-800">
                  {transacciones.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((t) => (
                    <tr key={t.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-4 px-6 font-bold">
                        {t.tipo === 'Cargo_Deuda' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Cargo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <ArrowDownLeft className="w-3.5 h-3.5" /> Abono
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-medium text-stone-900 dark:text-stone-100">
                        {t.concepto}
                      </td>
                      <td className="py-4 px-6 text-stone-500 dark:text-stone-400">
                        {t.pedidoId ? `#${t.pedidoId}` : '-'}
                      </td>
                      <td className="py-4 px-6 text-stone-500 dark:text-stone-400 text-xs">
                        {new Date(t.fecha).toLocaleString('es-CO')}
                      </td>
                      <td className={`py-4 px-6 text-right font-extrabold ${
                        t.tipo === 'Cargo_Deuda' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {t.tipo === 'Cargo_Deuda' ? '+' : '-'}${t.monto.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 border-t border-amber-200/80 dark:border-stone-800">
                <Pagination
                  currentPage={currentPage}
                  totalItems={transacciones.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  itemLabel="transacciones de crédito"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
