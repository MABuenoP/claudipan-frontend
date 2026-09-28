import { api, ApiResponse } from './api';
import { Pedido, TransaccionDeuda } from './pedidoService';

export interface ResumenContable {
  totalVentas: number;
  totalCobrado: number;
  carteraPorCobrar: number;
  totalComprasProveedores: number;
  totalGastosServicios: number;
  totalGastosNomina: number;
  totalOtrosGastos: number;
  totalPerdidasBajas: number;
  utilidadBruta: number;
  utilidadNeta: number;
  totalPedidos: number;
  totalClientesConDeuda: number;
}

export interface EstadoResultados {
  ingresosVentas: number;
  costoVentas: number;
  gananciaBruta: number;
  gastosServiciosPublicos: number;
  gastosNomina: number;
  otrosGastosOperativos: number;
  totalGastosOperativos: number;
  perdidasBajasMermas: number;
  gananciaNeta: number;
  margenNetoPorcentaje: number;
}

export interface ReporteProductoRotacion {
  productoId: number;
  nombre: string;
  categoriaNombre: string;
  precio: number;
  cantidadVendida: number;
  totalVentasGeneradas: number;
  cantidadDadaDeBaja: number;
  perdidasGeneradas: number;
  stockActual: number;
  estadoRotacion: 'Alta_Rotacion' | 'Baja_Rotacion' | 'Rezago' | 'Con_Perdidas' | 'Normal' | string;
}

export interface MisDeudasResumen {
  usuarioId: number;
  clienteNombre: string;
  limiteCredito: number;
  deudaActual: number;
  cupoDisponible: number;
  totalCompras: number;
  totalComprasFiadas: number;
  totalComprasContado: number;
  totalAbonos: number;
  cantidadPedidos: number;
  pedidos: Pedido[];
  transacciones: TransaccionDeuda[];
}

export interface AsientoContable {
  id: number;
  fecha: string;
  comprobante: string;
  tipoOperacion: string;
  tercero: string;
  detalle: string;
  cuentaCodigo: string;
  cuentaNombre: string;
  debito: number;
  credito: number;
}

export interface CuentaMayor {
  codigo: string;
  nombre: string;
  clase: string;
  naturaleza: string;
  totalDebito: number;
  totalCredito: number;
  saldoFinal: number;
}

export interface LibroVentaItem {
  pedidoId: number;
  codigoPedido: string;
  fecha: string;
  cliente: string;
  tipoPago: string;
  estado: string;
  total: number;
}

export interface LibroCarteraItem {
  usuarioId: number;
  nombre: string;
  cedula: string;
  telefono: string;
  limiteCredito: number;
  deudaActual: number;
  cupoDisponible: number;
  porcentajeUso: number;
  totalAbonos: number;
  ultimoMovimiento?: string;
}

export interface LibroCompraItem {
  compraId: number;
  factura: string;
  proveedor: string;
  fecha: string;
  insumo: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

export interface LibroBajaItem {
  bajaId: number;
  fecha: string;
  producto: string;
  cantidad: number;
  costoUnitario: number;
  costoPerdidaTotal: number;
  motivo: string;
}

export interface LibrosContables {
  libroDiario: AsientoContable[];
  libroMayor: CuentaMayor[];
  libroVentas: LibroVentaItem[];
  libroCartera: LibroCarteraItem[];
  libroCompras: LibroCompraItem[];
  libroBajas: LibroBajaItem[];
  estadoResultados: EstadoResultados;
  totalDebitosDiario: number;
  totalCreditosDiario: number;
  estaCuadrado: boolean;
}

export const contabilidadService = {
  getResumen: async (): Promise<ApiResponse<ResumenContable>> => {
    return await api.get<ResumenContable>('/contabilidad/resumen');
  },

  getEstadoResultados: async (fechaInicio?: string, fechaFin?: string): Promise<ApiResponse<EstadoResultados>> => {
    const q = new URLSearchParams();
    if (fechaInicio) q.append('fechaInicio', fechaInicio);
    if (fechaFin) q.append('fechaFin', fechaFin);
    const qs = q.toString();
    return await api.get<EstadoResultados>(`/contabilidad/estado-resultados${qs ? `?${qs}` : ''}`);
  },

  getMasVendidos: async (top: number = 10): Promise<ApiResponse<ReporteProductoRotacion[]>> => {
    return await api.get<ReporteProductoRotacion[]>(`/contabilidad/mas-vendidos?top=${top}`);
  },

  getRezagosOPerdidas: async (): Promise<ApiResponse<ReporteProductoRotacion[]>> => {
    return await api.get<ReporteProductoRotacion[]>('/contabilidad/rezagos-perdidas');
  },

  getCreditos: async (usuarioId?: number): Promise<ApiResponse<any[]>> => {
    return await api.get<any[]>(`/contabilidad/creditos${usuarioId ? `?usuarioId=${usuarioId}` : ''}`);
  },

  getMisDeudas: async (): Promise<ApiResponse<MisDeudasResumen>> => {
    return await api.get<MisDeudasResumen>('/contabilidad/mis-deudas');
  },

  getLibrosContables: async (fechaInicio?: string, fechaFin?: string): Promise<ApiResponse<LibrosContables>> => {
    const q = new URLSearchParams();
    if (fechaInicio) q.append('fechaInicio', fechaInicio);
    if (fechaFin) q.append('fechaFin', fechaFin);
    const qs = q.toString();
    return await api.get<LibrosContables>(`/contabilidad/libros-contables${qs ? `?${qs}` : ''}`);
  },
};
