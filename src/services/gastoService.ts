import { api, ApiResponse } from './api';

export interface Gasto {
  id: number;
  tipoGasto: 'ServicioPublico' | 'Nomina' | 'Insumo' | 'Mantenimiento' | 'Varios' | string;
  categoriaGasto: string;
  descripcion: string;
  monto: number;
  fechaGasto: string;
  beneficiario?: string;
  metodoPago: string;
  numeroComprobante?: string;
  responsableUsuarioId?: number;
  responsableUsuarioNombre?: string;
}

export const gastoService = {
  getAll: async (params?: { tipoGasto?: string; categoriaGasto?: string; fechaInicio?: string; fechaFin?: string }): Promise<ApiResponse<Gasto[]>> => {
    const q = new URLSearchParams();
    if (params?.tipoGasto) q.append('tipoGasto', params.tipoGasto);
    if (params?.categoriaGasto) q.append('categoriaGasto', params.categoriaGasto);
    if (params?.fechaInicio) q.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) q.append('fechaFin', params.fechaFin);
    const qs = q.toString();
    return await api.get<Gasto[]>(`/gastos${qs ? `?${qs}` : ''}`);
  },

  getById: async (id: number): Promise<ApiResponse<Gasto>> => {
    return await api.get<Gasto>(`/gastos/${id}`);
  },

  create: async (data: Partial<Gasto>): Promise<ApiResponse<Gasto>> => {
    return await api.post<Gasto>('/gastos', data);
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/gastos/${id}`);
  },
};
