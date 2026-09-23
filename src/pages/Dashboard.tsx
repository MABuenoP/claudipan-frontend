import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Package, AlertTriangle, DollarSign,
  ShoppingCart, Box, ChefHat, BarChart2, RefreshCw, Award, Layers,
  AlertCircle, CheckCircle2, Clock, Flame, Percent,
  Eye, Search, Sparkles, Filter, X, ArrowUpDown, ChevronRight, Calendar,
  PackageCheck, Printer, Store, ArrowUpRight, ShoppingBag, Receipt, Check
} from 'lucide-react';
import { contabilidadService, ResumenContable, ReporteProductoRotacion } from '../services/contabilidadService';
import { productService, Product } from '../services/productService';
import { insumoService, Insumo } from '../services/insumoService';
import { authService, UsuarioAdmin } from '../services/authService';
import { produccionService, OrdenProduccion } from '../services/produccionService';
import { pedidoService, Pedido } from '../services/pedidoService';
import { ProductCard } from '../components/product/ProductCard';
import { formatCurrency } from '../utils/helpers';
import { LoadingModal } from '../components/ui/LoadingModal';
import { Button } from '../components/ui/Button';

const COLORS = {
  primary: '#d97706', secondary: '#92400e', success: '#059669',
  danger: '#dc2626', info: '#2563eb', purple: '#7c3aed', muted: '#78716c',
};
const PIE_COLORS = ['#d97706','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#ec4899','#14b8a6'];

const KpiCard: React.FC<{
  icon: React.ReactNode; label: string; value: string|number;
  sub?: string; color?: string; trend?: 'up'|'down'|'neutral';
}> = ({ icon, label, value, sub, color='text-amber-600', trend }) => (
  <div className="bg-white dark:bg-stone-900/80 border border-amber-200/70 dark:border-stone-800 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-amber-500/40 transition-all">
    <div className="flex items-center justify-between">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-950/30 ${color}`}>{icon}</span>
      {trend && (
        <span className={`text-xs font-bold flex items-center gap-0.5 ${trend==='up'?'text-emerald-600':trend==='down'?'text-red-500':'text-stone-400'}`}>
          {trend==='up'?<TrendingUp className="w-3.5 h-3.5"/>:trend==='down'?<TrendingDown className="w-3.5 h-3.5"/>:null}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-extrabold font-heading mt-0.5 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Panel: React.FC<{title:string; icon?:React.ReactNode; children:React.ReactNode; className?:string}> = ({
  title, icon, children, className=''
}) => (
  <div className={`bg-white dark:bg-stone-900/80 border border-amber-200/70 dark:border-stone-800 rounded-2xl p-5 shadow-sm ${className}`}>
    <h3 className="text-sm font-extrabold text-stone-700 dark:text-stone-200 uppercase tracking-wide flex items-center gap-2 mb-4">
      {icon && <span className="text-amber-600">{icon}</span>}
      {title}
    </h3>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label, currency=false }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-700 rounded-xl p-3 shadow-xl text-xs">
        <p className="font-bold text-stone-700 dark:text-stone-200 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{color:p.color}} className="font-semibold">
            {p.name}: {currency ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


// ============================================================
// DASHBOARD ADMIN / GERENTE
// ============================================================
const DashboardAdmin: React.FC = () => {
  const [resumen, setResumen] = useState<ResumenContable|null>(null);
  const [masVendidos, setMasVendidos] = useState<ReporteProductoRotacion[]>([]);
  const [rezagos, setRezagos] = useState<ReporteProductoRotacion[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const [r1,r2,r3,r4,r5,r6] = await Promise.all([
      contabilidadService.getResumen(),
      contabilidadService.getMasVendidos(8),
      contabilidadService.getRezagosOPerdidas(),
      productService.getAll(),
      insumoService.getAll(false),
      authService.getAllUsers(),
    ]);
    if (r1.success && r1.data) setResumen(r1.data);
    if (r2.success && r2.data) setMasVendidos(r2.data);
    if (r3.success && r3.data) setRezagos(r3.data);
    if (r4.success && r4.data) setProductos(r4.data);
    if (r5.success && r5.data) setInsumos(r5.data);
    if (r6.success && r6.data) setUsuarios(r6.data);
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  const clientes = useMemo(() => usuarios.filter(u => u.rol==='Cliente'), [usuarios]);
  const clientesConDeuda = useMemo(() => clientes.filter(u => u.deudaActual>0).sort((a,b)=>b.deudaActual-a.deudaActual), [clientes]);
  const clientesEnMora = useMemo(() => clientes.filter(u => u.deudaActual>u.limiteCredito), [clientes]);
  const stockBajo = productos.filter(p => p.stock < 10);

  const barMasVendidos = masVendidos.slice(0,8).map(p => ({
    nombre: p.nombre.length>14 ? p.nombre.substring(0,14)+'...' : p.nombre,
    Vendidos: p.cantidadVendida,
  }));
  const barMenosVendidos = rezagos.slice(0,8).map(p => ({
    nombre: p.nombre.length>14 ? p.nombre.substring(0,14)+'...' : p.nombre,
    Vendidos: p.cantidadVendida,
    Perdidas: p.perdidasGeneradas,
  }));
  const pieDeuda = clientesConDeuda.slice(0,6).map(c => ({
    name: c.nombre.split(' ')[0], value: c.deudaActual,
  }));

  if (loading) return (
    <>
      <LoadingModal isLoading={true} message="Cargando Panel General" submessage="Ventas, inventario, clientes y estadisticas" />
      <div className="h-96" />
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">Panel de Control</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Vision general de Claudipan</p>
        </div>
        <button onClick={reload} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm">
          <RefreshCw className="w-3.5 h-3.5"/> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard icon={<DollarSign className="w-5 h-5"/>} label="Total Ventas" value={formatCurrency(resumen?.totalVentas??0)} color="text-amber-600" trend="up"/>
        <KpiCard icon={<ShoppingCart className="w-5 h-5"/>} label="Pedidos Totales" value={resumen?.totalPedidos??0} color="text-blue-600"/>
        <KpiCard icon={<AlertTriangle className="w-5 h-5"/>} label="Cartera por Cobrar" value={formatCurrency(resumen?.carteraPorCobrar??0)} color="text-red-500" trend="down"/>
        <KpiCard icon={<TrendingUp className="w-5 h-5"/>} label="Utilidad Neta" value={formatCurrency(resumen?.utilidadNeta??0)} color="text-emerald-600" trend="up"/>
        <KpiCard icon={<Users className="w-5 h-5"/>} label="Clientes con Deuda" value={clientesConDeuda.length} sub={`${clientesEnMora.length} en mora`} color="text-orange-500"/>
        <KpiCard icon={<Package className="w-5 h-5"/>} label="Productos" value={productos.length} sub={`${stockBajo.length} con stock bajo`} color="text-violet-600"/>
        <KpiCard icon={<Layers className="w-5 h-5"/>} label="Insumos" value={insumos.length} sub={`${insumos.filter(i=>i.stockActual<=i.stockMinimo).length} bajo minimo`} color="text-teal-600"/>
        <KpiCard icon={<Percent className="w-5 h-5"/>} label="Total Cobrado" value={formatCurrency(resumen?.totalCobrado??0)} color="text-emerald-500"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Productos Mas Vendidos" icon={<TrendingUp className="w-4 h-4"/>}>
          {barMasVendidos.length===0 ? (
            <p className="text-xs text-stone-400 text-center py-8">Sin datos de ventas aun</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barMasVendidos} margin={{top:5,right:5,left:0,bottom:50}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4"/>
                <XAxis dataKey="nombre" tick={{fontSize:10,fill:'#78716c'}} angle={-35} textAnchor="end"/>
                <YAxis tick={{fontSize:10,fill:'#78716c'}}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="Vendidos" fill={COLORS.primary} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
        <Panel title="Productos con Rezago y Perdidas" icon={<TrendingDown className="w-4 h-4"/>}>
          {barMenosVendidos.length===0 ? (
            <p className="text-xs text-stone-400 text-center py-8">Sin productos en rezago</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barMenosVendidos} margin={{top:5,right:5,left:0,bottom:50}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4"/>
                <XAxis dataKey="nombre" tick={{fontSize:10,fill:'#78716c'}} angle={-35} textAnchor="end"/>
                <YAxis tick={{fontSize:10,fill:'#78716c'}}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="Vendidos" fill={COLORS.muted} radius={[4,4,0,0]}/>
                <Bar dataKey="Perdidas" fill={COLORS.danger} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Distribucion de Deudas" icon={<DollarSign className="w-4 h-4"/>}>
          {pieDeuda.length===0 ? (
            <p className="text-xs text-stone-400 text-center py-8">No hay clientes con deuda</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieDeuda} cx="50%" cy="50%" outerRadius={75} dataKey="value" nameKey="name" label={({name,percent}:any)=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieDeuda.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={(val:any)=>formatCurrency(val)}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </Panel>
        <Panel title="Clientes con Mas Deuda" icon={<AlertTriangle className="w-4 h-4"/>} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-amber-100 dark:border-stone-800">
                  <th className="text-left pb-2 font-bold text-stone-500">Cliente</th>
                  <th className="text-right pb-2 font-bold text-stone-500">Deuda</th>
                  <th className="text-right pb-2 font-bold text-stone-500">Limite</th>
                  <th className="text-center pb-2 font-bold text-stone-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50 dark:divide-stone-800/50">
                {clientesConDeuda.slice(0,8).map(c=>(
                  <tr key={c.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-2 font-semibold text-stone-700 dark:text-stone-300">{c.nombre}</td>
                    <td className="py-2 text-right font-bold text-red-600">{formatCurrency(c.deudaActual)}</td>
                    <td className="py-2 text-right text-stone-500">{formatCurrency(c.limiteCredito)}</td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${c.deudaActual>c.limiteCredito?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>
                        {c.deudaActual>c.limiteCredito?'MORA':'FIADO'}
                      </span>
                    </td>
                  </tr>
                ))}
                {clientesConDeuda.length===0 && <tr><td colSpan={4} className="text-center py-6 text-stone-400">Sin clientes con deuda</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {clientesEnMora.length>0 && (
        <Panel title={`Clientes en Mora (${clientesEnMora.length})`} icon={<AlertCircle className="w-4 h-4"/>}>
          <div className="flex flex-wrap gap-2">
            {clientesEnMora.map(c=>(
              <span key={c.id} className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 text-xs px-3 py-1.5 rounded-xl font-bold">
                {c.nombre} - {formatCurrency(c.deudaActual)}
              </span>
            ))}
          </div>
        </Panel>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Inventario de Productos" icon={<Package className="w-4 h-4"/>}>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {productos.slice(0,20).map(p=>(
              <div key={p.id} className="flex items-center gap-3">
                <span className="flex-1 text-xs text-stone-600 dark:text-stone-300 font-medium truncate">{p.nombre}</span>
                <div className="w-24 bg-stone-100 dark:bg-stone-800 rounded-full h-2">
                  <div className={`h-2 rounded-full ${p.stock>20?'bg-emerald-500':p.stock>5?'bg-amber-500':'bg-red-500'}`} style={{width:`${Math.min(100,(p.stock/50)*100)}%`}}/>
                </div>
                <span className={`text-xs font-extrabold w-8 text-right ${p.stock>20?'text-emerald-600':p.stock>5?'text-amber-600':'text-red-600'}`}>{p.stock}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Inventario de Insumos" icon={<Layers className="w-4 h-4"/>}>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {insumos.slice(0,20).map(ins=>{
              const pct=ins.stockMinimo>0?Math.min(100,(ins.stockActual/(ins.stockMinimo*3))*100):50;
              const bajo=ins.stockActual<=ins.stockMinimo;
              return (
                <div key={ins.id} className="flex items-center gap-3">
                  <span className="flex-1 text-xs text-stone-600 dark:text-stone-300 font-medium truncate">{ins.nombre}</span>
                  <div className="w-24 bg-stone-100 dark:bg-stone-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${bajo?'bg-red-500':'bg-teal-500'}`} style={{width:`${pct}%`}}/>
                  </div>
                  <span className={`text-xs font-extrabold w-16 text-right ${bajo?'text-red-600':'text-teal-600'}`}>{ins.stockActual} {ins.unidadMedida}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD CONTABLE
// ============================================================
const DashboardContable: React.FC = () => {
  const [resumen, setResumen] = useState<ResumenContable|null>(null);
  const [masVendidos, setMasVendidos] = useState<ReporteProductoRotacion[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const [r1,r2] = await Promise.all([
      contabilidadService.getResumen(),
      contabilidadService.getMasVendidos(10),
    ]);
    if (r1.success && r1.data) setResumen(r1.data);
    if (r2.success && r2.data) setMasVendidos(r2.data);
    setLoading(false);
  };
  useEffect(()=>{ reload(); },[]);

  const gastosData = resumen ? [
    {name:'Servicios Publicos', value:resumen.totalGastosServicios},
    {name:'Nomina', value:resumen.totalGastosNomina},
    {name:'Otros Gastos', value:resumen.totalOtrosGastos},
    {name:'Perdidas Bajas', value:resumen.totalPerdidasBajas},
    {name:'Compras Prov', value:resumen.totalComprasProveedores},
  ].filter(d=>d.value>0) : [];

  if (loading) return (
    <>
      <LoadingModal isLoading={true} message="Cargando Estado Financiero" submessage="P&G, cartera, gastos y analisis contable" />
      <div className="h-96" />
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">Estado Financiero</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Resumen contable de Claudipan</p>
        </div>
        <button onClick={reload} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm">
          <RefreshCw className="w-3.5 h-3.5"/> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard icon={<DollarSign className="w-5 h-5"/>} label="Total Ventas" value={formatCurrency(resumen?.totalVentas??0)} color="text-amber-600" trend="up"/>
        <KpiCard icon={<CheckCircle2 className="w-5 h-5"/>} label="Total Cobrado" value={formatCurrency(resumen?.totalCobrado??0)} color="text-emerald-600"/>
        <KpiCard icon={<AlertTriangle className="w-5 h-5"/>} label="Cartera Pendiente" value={formatCurrency(resumen?.carteraPorCobrar??0)} color="text-red-500" trend="down"/>
        <KpiCard icon={<TrendingUp className="w-5 h-5"/>} label="Utilidad Bruta" value={formatCurrency(resumen?.utilidadBruta??0)} color="text-blue-600"/>
        <KpiCard icon={<Award className="w-5 h-5"/>} label="Utilidad Neta" value={formatCurrency(resumen?.utilidadNeta??0)} color="text-violet-600" trend={resumen&&resumen.utilidadNeta>=0?'up':'down'}/>
        <KpiCard icon={<ShoppingCart className="w-5 h-5"/>} label="Compras a Prov" value={formatCurrency(resumen?.totalComprasProveedores??0)} color="text-orange-500"/>
        <KpiCard icon={<Users className="w-5 h-5"/>} label="Clientes con Deuda" value={resumen?.totalClientesConDeuda??0} color="text-red-500"/>
        <KpiCard icon={<Package className="w-5 h-5"/>} label="Total Pedidos" value={resumen?.totalPedidos??0} color="text-teal-600"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Distribucion de Gastos" icon={<BarChart2 className="w-4 h-4"/>}>
          {gastosData.length===0 ? (
            <p className="text-xs text-stone-400 text-center py-8">Sin gastos registrados</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={gastosData} cx="50%" cy="50%" outerRadius={75} innerRadius={35} dataKey="value" nameKey="name">
                    {gastosData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(val:any)=>formatCurrency(val)}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {gastosData.map((d,i)=>(
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{background:PIE_COLORS[i%PIE_COLORS.length]}}/>
                      <span className="text-stone-600 dark:text-stone-400">{d.name}</span>
                    </span>
                    <span className="font-bold text-stone-700 dark:text-stone-300">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
        <Panel title="Top Productos por Ingresos" icon={<Award className="w-4 h-4"/>} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-amber-100 dark:border-stone-800">
                  <th className="text-left pb-2 font-bold text-stone-500">#</th>
                  <th className="text-left pb-2 font-bold text-stone-500">Producto</th>
                  <th className="text-right pb-2 font-bold text-stone-500">Uds Vendidas</th>
                  <th className="text-right pb-2 font-bold text-stone-500">Ingresos</th>
                  <th className="text-right pb-2 font-bold text-stone-500">Perdidas</th>
                  <th className="text-center pb-2 font-bold text-stone-500">Rotacion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50 dark:divide-stone-800/50">
                {masVendidos.slice(0,10).map((p,i)=>(
                  <tr key={p.productoId} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-2 font-extrabold text-amber-600">#{i+1}</td>
                    <td className="py-2 font-semibold text-stone-700 dark:text-stone-300">{p.nombre}</td>
                    <td className="py-2 text-right font-bold text-stone-700">{p.cantidadVendida}</td>
                    <td className="py-2 text-right font-bold text-emerald-600">{formatCurrency(p.totalVentasGeneradas)}</td>
                    <td className="py-2 text-right font-bold text-red-500">{p.perdidasGeneradas>0?formatCurrency(p.perdidasGeneradas):'--'}</td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${p.estadoRotacion==='Alta_Rotacion'?'bg-emerald-100 text-emerald-700':p.estadoRotacion==='Baja_Rotacion'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>
                        {p.estadoRotacion.replace('_',' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {masVendidos.length===0 && <tr><td colSpan={6} className="text-center py-6 text-stone-400">Sin datos de ventas</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD CLIENTE - MIS PEDIDOS & COMPRAS
// ============================================================
interface PurchasedProductItem {
  productoId: number;
  nombre: string;
  categoriaNombre: string;
  imagenUrl: string;
  descripcion: string;
  marca?: string;
  sabor?: string;
  presentacion?: string;
  tamano?: string;
  stock: number;
  enOferta: boolean;
  precioOferta?: number;
  precioNormal: number;
  cantidadTotal: number;
  totalGastado: number;
  ultimoPrecioPagado: number;
  ultimaFechaCompra: string;
  primerFechaCompra: string;
  pedidosCount: number;
  pedidosHistorial: {
    pedidoId: number;
    codigoTicket?: string;
    fecha: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    estado: string;
    tipoPago: string;
  }[];
  catalogProduct: Product;
}

const MisComprasCliente: React.FC = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros & Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState<'mas_comprados' | 'reciente' | 'mayor_gasto' | 'nombre'>('mas_comprados');
  const [activeTab, setActiveTab] = useState<'productos' | 'pedidos'>('productos');

  // Modal Ver Completo (Identico al box del catalogo)
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [selectedItemStats, setSelectedItemStats] = useState<PurchasedProductItem | null>(null);

  // Modal Ver Ticket de Pedido
  const [selectedPedidoTicket, setSelectedPedidoTicket] = useState<Pedido | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const [rPedidos, rProds] = await Promise.all([
        pedidoService.getAll(),
        productService.getAll()
      ]);
      if (rPedidos.success && rPedidos.data) setPedidos(rPedidos.data);
      if (rProds.success && rProds.data) setCatalogProducts(rProds.data);
    } catch (e) {
      console.error('Error cargando compras del cliente:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  // Consolidar todos los productos comprados a partir de los pedidos del cliente
  const purchasedItems = useMemo(() => {
    const map = new Map<number, PurchasedProductItem>();
    const catalogMap = new Map<number, Product>();
    catalogProducts.forEach(p => catalogMap.set(p.id, p));

    pedidos.forEach(pedido => {
      if (pedido.estado === 'Cancelado') return;

      (pedido.detalles || []).forEach(det => {
        const prodId = det.productoId;
        const cp = catalogMap.get(prodId);

        const qty = det.cantidad || 0;
        const unitPrice = det.precioUnitario || cp?.precio || 0;
        const subtotal = det.subtotal || (qty * unitPrice);

        if (!map.has(prodId)) {
          const fallbackProduct: Product = {
            id: prodId,
            nombre: cp?.nombre || det.productoNombre || 'Producto Artesanal',
            descripcion: cp?.descripcion || 'Delicioso producto elaborado artesanalmente con la receta tradicional de Claudipan.',
            precio: cp?.precio || unitPrice,
            precioOferta: cp?.precioOferta,
            enOferta: cp?.enOferta || false,
            stock: cp?.stock !== undefined ? cp.stock : 10,
            imagenUrl: cp?.imagenUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop',
            categoriaId: cp?.categoriaId || 1,
            categoriaNombre: cp?.categoriaNombre || 'Panadería',
            marca: cp?.marca,
            sabor: cp?.sabor,
            presentacion: cp?.presentacion,
            tamano: cp?.tamano,
            disponible: cp?.disponible !== undefined ? cp.disponible : true,
          };

          map.set(prodId, {
            productoId: prodId,
            nombre: fallbackProduct.nombre,
            categoriaNombre: fallbackProduct.categoriaNombre || 'Panadería',
            imagenUrl: fallbackProduct.imagenUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop',
            descripcion: fallbackProduct.descripcion || '',
            marca: fallbackProduct.marca,
            sabor: fallbackProduct.sabor,
            presentacion: fallbackProduct.presentacion,
            tamano: fallbackProduct.tamano,
            stock: fallbackProduct.stock,
            enOferta: fallbackProduct.enOferta || false,
            precioOferta: fallbackProduct.precioOferta,
            precioNormal: fallbackProduct.precio,
            cantidadTotal: qty,
            totalGastado: subtotal,
            ultimoPrecioPagado: unitPrice,
            ultimaFechaCompra: pedido.fechaPedido,
            primerFechaCompra: pedido.fechaPedido,
            pedidosCount: 1,
            pedidosHistorial: [{
              pedidoId: pedido.id,
              codigoTicket: pedido.codigoTicket,
              fecha: pedido.fechaPedido,
              cantidad: qty,
              precioUnitario: unitPrice,
              subtotal,
              estado: pedido.estado,
              tipoPago: pedido.tipoPago
            }],
            catalogProduct: cp || fallbackProduct
          });
        } else {
          const item = map.get(prodId)!;
          item.cantidadTotal += qty;
          item.totalGastado += subtotal;
          item.pedidosCount += 1;
          if (new Date(pedido.fechaPedido) > new Date(item.ultimaFechaCompra)) {
            item.ultimaFechaCompra = pedido.fechaPedido;
            item.ultimoPrecioPagado = unitPrice;
          }
          item.pedidosHistorial.push({
            pedidoId: pedido.id,
            codigoTicket: pedido.codigoTicket,
            fecha: pedido.fechaPedido,
            cantidad: qty,
            precioUnitario: unitPrice,
            subtotal,
            estado: pedido.estado,
            tipoPago: pedido.tipoPago
          });
        }
      });
    });

    return Array.from(map.values());
  }, [pedidos, catalogProducts]);

  // Estadísticas globales del cliente
  const stats = useMemo(() => {
    const totalInvertido = purchasedItems.reduce((acc, p) => acc + p.totalGastado, 0);
    const totalUnidades = purchasedItems.reduce((acc, p) => acc + p.cantidadTotal, 0);
    const variedadProductos = purchasedItems.length;
    const totalPedidosValidos = pedidos.filter(p => p.estado !== 'Cancelado').length;
    return { totalInvertido, totalUnidades, variedadProductos, totalPedidosValidos };
  }, [purchasedItems, pedidos]);

  // Lista de categorías únicas para el filtro
  const categories = useMemo(() => {
    const set = new Set<string>();
    purchasedItems.forEach(i => {
      if (i.categoriaNombre) set.add(i.categoriaNombre);
    });
    return ['Todas', ...Array.from(set)];
  }, [purchasedItems]);

  // Productos filtrados y ordenados
  const filteredItems = useMemo(() => {
    let result = [...purchasedItems];

    if (selectedCategory !== 'Todas') {
      result = result.filter(i => i.categoriaNombre === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(i =>
        i.nombre.toLowerCase().includes(q) ||
        i.categoriaNombre.toLowerCase().includes(q) ||
        (i.marca && i.marca.toLowerCase().includes(q)) ||
        (i.sabor && i.sabor.toLowerCase().includes(q)) ||
        (i.presentacion && i.presentacion.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'mas_comprados') return b.cantidadTotal - a.cantidadTotal;
      if (sortBy === 'reciente') return new Date(b.ultimaFechaCompra).getTime() - new Date(a.ultimaFechaCompra).getTime();
      if (sortBy === 'mayor_gasto') return b.totalGastado - a.totalGastado;
      if (sortBy === 'nombre') return a.nombre.localeCompare(b.nombre);
      return 0;
    });

    return result;
  }, [purchasedItems, selectedCategory, searchQuery, sortBy]);

  // Abrir modal con la ficha idéntica al catálogo
  const handleOpenModal = (item: PurchasedProductItem) => {
    setSelectedProductModal(item.catalogProduct);
    setSelectedItemStats(item);
  };

  if (loading) {
    return (
      <>
        <LoadingModal isLoading={true} message="Cargando Tus Pedidos y Compras" submessage="Consultando productos adquiridos y registros" />
        <div className="h-96" />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/20 dark:via-transparent p-6 rounded-3xl border border-amber-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/30">
              Mi Cuenta de Cliente
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
            Mis Pedidos & Compras
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            {user?.nombre ? `Hola, ${user.nombre.split(' ')[0]}. ` : ''}
            Aquí tienes el resumen detallado de los productos que has comprado en Claudipan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md"
          >
            <Store className="w-4 h-4" /> Catálogo de Panes
          </Link>
          <Link
            to="/mis-deudas"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md"
          >
            <DollarSign className="w-4 h-4" /> Mis Deudas / Fiado
          </Link>
          <button
            onClick={reload}
            className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-sm"
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          icon={<ShoppingBag className="w-5 h-5 text-emerald-600" />}
          label="Total Invertido"
          value={formatCurrency(stats.totalInvertido)}
          sub="en todas tus compras"
          color="text-emerald-600 dark:text-emerald-400"
          trend="up"
        />
        <KpiCard
          icon={<Package className="w-5 h-5 text-amber-600" />}
          label="Variedad de Productos"
          value={stats.variedadProductos}
          sub="referencias compradas"
          color="text-amber-600 dark:text-amber-400"
        />
        <KpiCard
          icon={<Layers className="w-5 h-5 text-blue-600" />}
          label="Unidades Adquiridas"
          value={stats.totalUnidades}
          sub="unidades en total"
          color="text-blue-600 dark:text-blue-400"
        />
        <KpiCard
          icon={<Clock className="w-5 h-5 text-purple-600" />}
          label="Pedidos Realizados"
          value={stats.totalPedidosValidos}
          sub="órdenes registradas"
          color="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* PESTAÑAS: PRODUCTOS COMPRADOS VS HISTORIAL DE PEDIDOS */}
      <div className="flex border-b border-amber-200/80 dark:border-stone-800">
        <button
          onClick={() => setActiveTab('productos')}
          className={`flex items-center gap-2 px-5 py-3 font-heading font-extrabold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'productos'
              ? 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Productos Comprados ({purchasedItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex items-center gap-2 px-5 py-3 font-heading font-extrabold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'pedidos'
              ? 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Historial de Pedidos ({pedidos.length})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCTOS COMPRADOS (TABLA + MODAL IDÉNTICO AL CATÁLOGO) */}
      {activeTab === 'productos' && (
        <div className="space-y-4">
          {purchasedItems.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white dark:bg-stone-900/80 border border-amber-200/80 dark:border-stone-800 rounded-3xl p-10 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
                Aún no tienes compras registradas
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                Cuando compres en nuestra panadería física o a través de la tienda virtual, verás aquí la lista completa de tus productos, con la opción de ver su ficha idéntica al catálogo y agregarlos nuevamente al carrito.
              </p>
              <div className="pt-2">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md"
                >
                  <Sparkles className="w-4 h-4" /> Explorar Catálogo de Panes
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* BARRA DE BÚSQUEDA Y FILTROS */}
              <div className="bg-white dark:bg-stone-900/80 border border-amber-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar producto por nombre, categoría, sabor..."
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-amber-200/60 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 outline-none text-stone-900 dark:text-stone-100 placeholder-stone-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category select */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-600 shrink-0" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-amber-200/60 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-700 dark:text-stone-200 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'Todas' ? 'Todas las categorías' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort select */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-amber-600 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-amber-200/60 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-700 dark:text-stone-200 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  >
                    <option value="mas_comprados">Más Comprados</option>
                    <option value="reciente">Última Compra (Reciente)</option>
                    <option value="mayor_gasto">Mayor Inversión ($)</option>
                    <option value="nombre">Nombre (A - Z)</option>
                  </select>
                </div>
              </div>

              {/* TABLA PRINCIPAL DE PRODUCTOS COMPRADOS (DESKTOP & TABLET) */}
              <div className="bg-white dark:bg-stone-900/80 border border-amber-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 border-b border-amber-100 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h3 className="font-heading font-extrabold text-sm sm:text-base text-stone-800 dark:text-stone-200">
                      Tus Productos Comprados ({filteredItems.length})
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
                    Haz clic en <span className="font-bold text-amber-600">"Ver Completo"</span> para ver la ficha del catálogo
                  </p>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center text-stone-400 text-xs sm:text-sm">
                    No se encontraron productos con los filtros aplicados.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm text-left">
                      <thead className="bg-amber-50/70 dark:bg-stone-800/50 text-[11px] font-extrabold uppercase tracking-wider text-stone-600 dark:text-stone-400 border-b border-amber-100 dark:border-stone-800">
                        <tr>
                          <th className="py-3 px-4">Producto</th>
                          <th className="py-3 px-3 text-center">Unidades Compradas</th>
                          <th className="py-3 px-3 text-right">Último Precio</th>
                          <th className="py-3 px-3 text-right">Total Invertido</th>
                          <th className="py-3 px-3 text-center">Última Compra</th>
                          <th className="py-3 px-4 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800/60">
                        {filteredItems.map((item) => (
                          <tr
                            key={item.productoId}
                            className="hover:bg-amber-50/60 dark:hover:bg-stone-800/40 transition-colors group cursor-pointer"
                            onClick={() => handleOpenModal(item)}
                          >
                            {/* Columna Producto */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-amber-100 dark:bg-stone-800 border border-amber-200/80 dark:border-stone-700 shrink-0 shadow-sm relative group-hover:scale-105 transition-transform duration-200">
                                  <img
                                    src={item.imagenUrl}
                                    alt={item.nombre}
                                    className="w-full h-full object-cover"
                                    onError={(e: any) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop';
                                    }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-heading font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                                    {item.nombre}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/40 px-2 py-0.2 rounded-md">
                                      {item.categoriaNombre}
                                    </span>
                                    {item.sabor && (
                                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.2 rounded">
                                        {item.sabor}
                                      </span>
                                    )}
                                    {item.presentacion && (
                                      <span className="text-[10px] text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-1.5 py-0.2 rounded">
                                        {item.presentacion}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Columna Unidades */}
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-extrabold px-2.5 py-1 rounded-xl text-xs shadow-xs">
                                {item.cantidadTotal} uds
                              </span>
                              <span className="block text-[10px] text-stone-400 mt-0.5">
                                en {item.pedidosCount} {item.pedidosCount === 1 ? 'pedido' : 'pedidos'}
                              </span>
                            </td>

                            {/* Columna Último Precio */}
                            <td className="py-3 px-3 text-right">
                              <span className="font-bold text-stone-700 dark:text-stone-300">
                                {formatCurrency(item.ultimoPrecioPagado)}
                              </span>
                            </td>

                            {/* Columna Total Invertido */}
                            <td className="py-3 px-3 text-right">
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                                {formatCurrency(item.totalGastado)}
                              </span>
                            </td>

                            {/* Columna Última Compra */}
                            <td className="py-3 px-3 text-center">
                              <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 block">
                                {new Date(item.ultimaFechaCompra).toLocaleDateString('es-CO', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              {item.pedidosHistorial[item.pedidosHistorial.length - 1]?.codigoTicket && (
                                <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                                  #{item.pedidosHistorial[item.pedidosHistorial.length - 1].codigoTicket}
                                </span>
                              )}
                            </td>

                            {/* Columna Acciones */}
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenModal(item);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md"
                                title="Ver ficha idéntica al catálogo"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver Completo</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: HISTORIAL DE PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div className="bg-white dark:bg-stone-900/80 border border-amber-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-amber-100 dark:border-stone-800 flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-sm sm:text-base text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              Órdenes y Tickets ({pedidos.length})
            </h3>
            <span className="text-xs text-stone-400">Tus pedidos registrados</span>
          </div>

          {pedidos.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs sm:text-sm">
              No tienes órdenes registradas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-amber-50/70 dark:bg-stone-800/50 text-[11px] font-extrabold uppercase tracking-wider text-stone-600 dark:text-stone-400 border-b border-amber-100 dark:border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-3">Fecha</th>
                    <th className="py-3 px-3 text-center">Items</th>
                    <th className="py-3 px-3 text-right">Total</th>
                    <th className="py-3 px-3 text-center">Pago</th>
                    <th className="py-3 px-3 text-center">Estado</th>
                    <th className="py-3 px-4 text-center">Ticket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/60 dark:divide-stone-800/60">
                  {pedidos.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {p.codigoTicket || `#${p.id}`}
                      </td>
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-300">
                        {new Date(p.fechaPedido).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-stone-600 dark:text-stone-300">
                        {p.detalles?.reduce((acc, d) => acc + (d.cantidad || 0), 0) || 0} uds
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.total)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {p.tipoPago}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            p.estado === 'Entregado'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : p.estado === 'Cancelado'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {p.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedPedidoTicket(p)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 hover:text-amber-600 transition-colors"
                          title="Ver Ticket de Pedido"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: VER COMPLETO (IDENTICO AL BOX DEL CATÁLOGO)            */}
      {/* ============================================================ */}
      {selectedProductModal && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => {
            setSelectedProductModal(null);
            setSelectedItemStats(null);
          }}
        >
          <div
            className="bg-white dark:bg-stone-900 border border-amber-200/90 dark:border-stone-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-amber-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                    Ficha del Producto
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Vista completa idéntica a la vitrina del catálogo
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedProductModal(null);
                  setSelectedItemStats(null);
                }}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* EXACT CATALOG BOX (ProductCard) */}
            <div className="w-full mx-auto max-w-sm sm:max-w-md">
              <ProductCard product={selectedProductModal} />
            </div>

            {/* Resumen de tu historial con este producto */}
            {selectedItemStats && (
              <div className="mt-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Tu Historial con este Producto
                  </span>
                  <span className="text-[11px] bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-full font-extrabold">
                    {selectedItemStats.pedidosCount} {selectedItemStats.pedidosCount === 1 ? 'pedido' : 'pedidos'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-white/80 dark:bg-stone-900/80 p-2.5 rounded-xl border border-amber-200/50 dark:border-stone-800">
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">Total Comprado</p>
                    <p className="font-extrabold text-amber-700 dark:text-amber-400 text-sm mt-0.5">
                      {selectedItemStats.cantidadTotal} uds
                    </p>
                  </div>
                  <div className="bg-white/80 dark:bg-stone-900/80 p-2.5 rounded-xl border border-amber-200/50 dark:border-stone-800">
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">Total Invertido</p>
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                      {formatCurrency(selectedItemStats.totalGastado)}
                    </p>
                  </div>
                  <div className="bg-white/80 dark:bg-stone-900/80 p-2.5 rounded-xl border border-amber-200/50 dark:border-stone-800">
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">Último Precio</p>
                    <p className="font-extrabold text-stone-700 dark:text-stone-300 text-sm mt-0.5">
                      {formatCurrency(selectedItemStats.ultimoPrecioPagado)}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-stone-500 dark:text-stone-400 pt-1 text-center">
                  Última compra registrada el:{' '}
                  <span className="font-semibold text-stone-700 dark:text-stone-200">
                    {new Date(selectedItemStats.ultimaFechaCompra).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </p>
              </div>
            )}

            {/* Botón de cierre */}
            <div className="mt-4 pt-3 border-t border-amber-100 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => {
                  setSelectedProductModal(null);
                  setSelectedItemStats(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs transition-colors"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: VER TICKET DE PEDIDO (DE PESTAÑA HISTORIAL)             */}
      {/* ============================================================ */}
      {selectedPedidoTicket && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedPedidoTicket(null)}
        >
          <div
            className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                  Ticket de Pedido
                </h3>
                <p className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">
                  {selectedPedidoTicket.codigoTicket || `#${selectedPedidoTicket.id}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedPedidoTicket(null)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Fecha:</span>
                <span className="font-bold text-stone-700 dark:text-stone-300">
                  {new Date(selectedPedidoTicket.fechaPedido).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Estado:</span>
                <span className="font-extrabold text-amber-600">{selectedPedidoTicket.estado}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Método de Pago:</span>
                <span className="font-bold text-stone-700 dark:text-stone-300">{selectedPedidoTicket.tipoPago}</span>
              </div>

              {/* Items del pedido */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                <p className="font-bold text-stone-700 dark:text-stone-300 mb-2">Productos:</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(selectedPedidoTicket.detalles || []).map((det, idx) => (
                    <div key={idx} className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                      <span>{det.productoNombre || `Producto #${det.productoId}`} x{det.cantidad}</span>
                      <span className="font-bold">{formatCurrency(det.subtotal || ((det.precioUnitario || 0) * det.cantidad))}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between text-sm">
                <span className="font-extrabold text-stone-900 dark:text-stone-100">Total Pedido:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                  {formatCurrency(selectedPedidoTicket.total)}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => setSelectedPedidoTicket(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold"
              >
                Cerrar Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// DASHBOARD CLIENTE / VENDEDOR
// ============================================================
const DashboardCatalogo: React.FC = () => {
  const { user } = useAuth();
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    productService.getAll().then(r=>{ if(r.success&&r.data) setProductos(r.data); setLoading(false); });
  },[]);

  const productosOferta = useMemo(()=>productos.filter(p=>p.enOferta&&p.disponible),[productos]);
  const porCategoria = useMemo(()=>{
    const map: Record<string,Product[]>={};
    productos.filter(p=>p.disponible).forEach(p=>{
      const cat=p.categoriaNombre||'Sin Categoria';
      if(!map[cat]) map[cat]=[];
      map[cat].push(p);
    });
    return map;
  },[productos]);

  if (loading) return (
    <>
      <LoadingModal isLoading={true} message="Cargando Catalogo" submessage="Productos, ofertas y categorias" />
      <div className="h-96" />
    </>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
          Bienvenido{user?.nombre?`, ${user.nombre.split(' ')[0]}`:''}!
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Explora los mejores productos de Claudipan</p>
      </div>

      {productosOferta.length>0 && (
        <div>
          <h2 className="text-sm font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wide flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4"/> Ofertas Especiales
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {productosOferta.slice(0,8).map(p=>(
              <div key={p.id} className="bg-white dark:bg-stone-900/80 border-2 border-amber-400 rounded-2xl p-4 relative hover:shadow-lg hover:scale-[1.02] transition-all">
                <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">OFERTA</span>
                {p.imagenUrl ? (
                  <img src={p.imagenUrl} alt={p.nombre} className="w-full h-24 object-cover rounded-xl mb-3"/>
                ) : (
                  <div className="w-full h-24 bg-amber-100 dark:bg-amber-950/30 rounded-xl mb-3 flex items-center justify-center">
                    <Package className="w-8 h-8 text-amber-400"/>
                  </div>
                )}
                <p className="text-xs font-bold text-stone-700 dark:text-stone-200 leading-tight">{p.nombre}</p>
                <p className="text-[10px] text-stone-400 mb-2">{p.categoriaNombre}</p>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-amber-600">{formatCurrency(p.precioOferta??p.precio)}</span>
                  {p.precioOferta && <span className="text-xs text-stone-400 line-through">{formatCurrency(p.precio)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.entries(porCategoria).map(([cat,prods])=>(
        <div key={cat}>
          <h2 className="text-sm font-extrabold text-stone-600 dark:text-stone-300 uppercase tracking-wide flex items-center gap-2 mb-3">
            <Box className="w-4 h-4 text-amber-600"/> {cat}
            <span className="text-amber-500 font-normal normal-case text-xs">({prods.length} productos)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {prods.slice(0,5).map(p=>(
              <div key={p.id} className="bg-white dark:bg-stone-900/80 border border-amber-200/70 dark:border-stone-800 rounded-xl p-3 hover:shadow-md hover:border-amber-400 transition-all cursor-pointer">
                {p.imagenUrl ? (
                  <img src={p.imagenUrl} alt={p.nombre} className="w-full h-20 object-cover rounded-lg mb-2"/>
                ) : (
                  <div className="w-full h-20 bg-amber-50 dark:bg-amber-950/20 rounded-lg mb-2 flex items-center justify-center">
                    <Package className="w-6 h-6 text-amber-300"/>
                  </div>
                )}
                <p className="text-xs font-bold text-stone-700 dark:text-stone-200 leading-tight truncate">{p.nombre}</p>
                <p className="text-xs font-extrabold text-amber-600 mt-1">{formatCurrency(p.precio)}</p>
                <p className="text-[10px] text-stone-400">Stock: {p.stock}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-center pt-2">
        <Link to="/catalog" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-md hover:shadow-lg">
          <Package className="w-4 h-4"/> Ver Catalogo Completo
        </Link>
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD PANADERO
// ============================================================
const DashboardPanadero: React.FC = () => {
  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const res = await produccionService.getAllOrdenes();
    if (res.success && res.data) setOrdenes(res.data);
    setLoading(false);
  };
  useEffect(()=>{ reload(); },[]);

  const stats = useMemo(()=>{
    const entregadas = ordenes.filter(o=>o.estado==='Entregada');
    const byProd: Record<string,{nombre:string;cantidad:number;cantMalas:number}> = {};
    entregadas.forEach(o=>{
      const k = String(o.productoId);
      if (!byProd[k]) byProd[k]={nombre:o.productoNombre,cantidad:0,cantMalas:0};
      byProd[k].cantidad += o.cantidadProducida||0;
      byProd[k].cantMalas += o.cantMalasCondiciones||0;
    });
    const productosList = Object.values(byProd).sort((a,b)=>b.cantidad-a.cantidad);
    return {
      productosList,
      totalProducido: productosList.reduce((s,p)=>s+p.cantidad,0),
      totalPerdidas: productosList.reduce((s,p)=>s+p.cantMalas,0),
      entregadas,
    };
  },[ordenes]);

  const ultimas10 = useMemo(()=>[...ordenes].sort((a,b)=>new Date(b.fechaOrden).getTime()-new Date(a.fechaOrden).getTime()).slice(0,10),[ordenes]);
  const barProd = stats.productosList.slice(0,8).map(p=>({
    nombre: p.nombre.length>14?p.nombre.substring(0,14)+'...':p.nombre,
    Producidas: p.cantidad, Perdidas: p.cantMalas,
  }));
  const pieProd = stats.productosList.slice(0,6).map(p=>({name:p.nombre.split(' ')[0],value:p.cantidad}));
  const estadoColors: Record<string,string> = {
    Pendiente:'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300',
    Preparando:'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    Horneando:'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
    Entregada:'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    Cancelada:'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  };

  if (loading) return (
    <>
      <LoadingModal isLoading={true} message="Cargando Panel del Panadero" submessage="Ordenes de produccion y estadisticas de horno" />
      <div className="h-96" />
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">Panel del Panadero</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Estadisticas de produccion en Claudipan</p>
        </div>
        <button onClick={reload} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm">
          <RefreshCw className="w-3.5 h-3.5"/> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard icon={<ChefHat className="w-5 h-5"/>} label="Total Ordenes" value={ordenes.length} color="text-amber-600"/>
        <KpiCard icon={<CheckCircle2 className="w-5 h-5"/>} label="Entregadas" value={stats.entregadas.length} color="text-emerald-600"/>
        <KpiCard icon={<Package className="w-5 h-5"/>} label="Uds Producidas" value={stats.totalProducido} color="text-blue-600"/>
        <KpiCard icon={<AlertTriangle className="w-5 h-5"/>} label="Uds Perdidas" value={stats.totalPerdidas} sub="malas condiciones" color="text-red-500" trend="down"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Produccion por Producto" icon={<BarChart2 className="w-4 h-4"/>}>
          {barProd.length===0 ? (
            <p className="text-xs text-stone-400 text-center py-8">Sin producciones entregadas aun</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barProd} margin={{top:5,right:5,left:0,bottom:50}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4"/>
                <XAxis dataKey="nombre" tick={{fontSize:10,fill:'#78716c'}} angle={-35} textAnchor="end"/>
                <YAxis tick={{fontSize:10,fill:'#78716c'}}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="Producidas" fill={COLORS.primary} radius={[4,4,0,0]}/>
                <Bar dataKey="Perdidas" fill={COLORS.danger} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
        <Panel title="Distribucion de Producciones" icon={<Award className="w-4 h-4"/>}>
          {pieProd.length===0 ? (
            <p className="text-xs text-stone-400 text-center py-8">Sin datos de produccion</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieProd} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({name,percent}:any)=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieProd.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip/>
                <Legend wrapperStyle={{fontSize:11}}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      <Panel title="Ultimas 10 Producciones" icon={<Clock className="w-4 h-4"/>}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-amber-100 dark:border-stone-800">
                <th className="text-left pb-2 font-bold text-stone-500">Codigo</th>
                <th className="text-left pb-2 font-bold text-stone-500">Producto</th>
                <th className="text-right pb-2 font-bold text-stone-500">Progr.</th>
                <th className="text-right pb-2 font-bold text-stone-500">Prod.</th>
                <th className="text-right pb-2 font-bold text-stone-500">Perd.</th>
                <th className="text-center pb-2 font-bold text-stone-500">Estado</th>
                <th className="text-left pb-2 font-bold text-stone-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 dark:divide-stone-800/50">
              {ultimas10.map(o=>(
                <tr key={o.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="py-2 font-mono text-amber-700 dark:text-amber-400 font-bold text-[11px]">{o.codigoOrden}</td>
                  <td className="py-2 font-semibold text-stone-700 dark:text-stone-300">{o.productoNombre}</td>
                  <td className="py-2 text-right text-stone-500">{o.cantidadProgramada}</td>
                  <td className="py-2 text-right font-bold text-emerald-600">{o.cantidadProducida||'--'}</td>
                  <td className="py-2 text-right font-bold text-red-500">{o.cantMalasCondiciones||'--'}</td>
                  <td className="py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${estadoColors[o.estado]||'bg-stone-100 text-stone-600'}`}>
                      {o.estado}
                    </span>
                  </td>
                  <td className="py-2 text-stone-400">{new Date(o.fechaOrden).toLocaleDateString('es-CO')}</td>
                </tr>
              ))}
              {ultimas10.length===0 && <tr><td colSpan={7} className="text-center py-6 text-stone-400">Sin ordenes registradas</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      {stats.productosList.some(p=>p.cantMalas>0) && (
        <Panel title="Perdidas por Producto (Malas Condiciones)" icon={<AlertTriangle className="w-4 h-4"/>}>
          <div className="space-y-2">
            {stats.productosList.filter(p=>p.cantMalas>0).map((p,i)=>(
              <div key={i} className="flex items-center gap-3">
                <span className="flex-1 text-xs text-stone-600 dark:text-stone-300 font-medium truncate">{p.nombre}</span>
                <div className="flex-1 bg-stone-100 dark:bg-stone-800 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-red-500" style={{width:`${Math.min(100,(p.cantMalas/Math.max(p.cantidad,1))*100)}%`}}/>
                </div>
                <span className="text-xs font-extrabold text-red-600 w-16 text-right">{p.cantMalas} uds</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

// ============================================================
// ROUTER PRINCIPAL POR ROL
// ============================================================
export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-sm">
          <Users className="w-10 h-10"/>
        </div>
        <h2 className="text-2xl font-heading font-bold text-stone-900 dark:text-stone-100">Acceso Requerido</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">Inicia sesion para ver tu panel personalizado.</p>
        <Link to="/login" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md">
          Iniciar Sesion
        </Link>
      </div>
    );
  }

  const rol = user.rol;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {(rol==='Administrador'||rol==='Gerente') && <DashboardAdmin/>}
      {rol==='Contable' && <DashboardContable/>}
      {rol==='Cliente' && <MisComprasCliente/>}
      {rol==='Vendedor' && <DashboardCatalogo/>}
      {rol==='Panadero' && <DashboardPanadero/>}
      {!['Administrador','Gerente','Contable','Cliente','Vendedor','Panadero'].includes(rol) && (
        <div className="text-center py-20 space-y-3">
          <BarChart2 className="w-12 h-12 text-amber-500 mx-auto opacity-50"/>
          <h2 className="text-xl font-bold text-stone-700 dark:text-stone-300">Panel en configuracion</h2>
          <p className="text-sm text-stone-500">Tu rol ({rol}) no tiene un panel configurado.</p>
        </div>
      )}
    </div>
  );
};
