import { api, ApiResponse } from './api';

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

  getMisDeudas: async (): Promise<ApiResponse<any[]>> => {
    return await api.get<any[]>('/contabilidad/mis-deudas');
  },
};
