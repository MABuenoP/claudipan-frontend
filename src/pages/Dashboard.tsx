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
  AlertCircle, CheckCircle2, Clock, Flame, Percent
} from 'lucide-react';
import { contabilidadService, ResumenContable, ReporteProductoRotacion } from '../services/contabilidadService';
import { productService, Product } from '../services/productService';
import { insumoService, Insumo } from '../services/insumoService';
import { authService, UsuarioAdmin } from '../services/authService';
import { produccionService, OrdenProduccion } from '../services/produccionService';
import { formatCurrency } from '../utils/helpers';
import { LoadingModal } from '../components/ui/LoadingModal';

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
      {(rol==='Cliente'||rol==='Vendedor') && <DashboardCatalogo/>}
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
