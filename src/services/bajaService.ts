import { api, ApiResponse } from './api';

export interface BajaProducto {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  motivo: 'Vencimiento' | 'Danado' | 'Averia' | 'ProduccionDefectuosa' | string;
  costoUnitario: number;
  costoPerdidaTotal: number;
  fechaBaja: string;
  usuarioId?: number;
  usuarioNombre?: string;
  observaciones?: string;
}

export const bajaService = {
  getAll: async (params?: { productoId?: number; motivo?: string }): Promise<ApiResponse<BajaProducto[]>> => {
    const q = new URLSearchParams();
    if (params?.productoId) q.append('productoId', params.productoId.toString());
    if (params?.motivo) q.append('motivo', params.motivo);
    const qs = q.toString();
    return await api.get<BajaProducto[]>(`/bajas${qs ? `?${qs}` : ''}`);
  },

  getById: async (id: number): Promise<ApiResponse<BajaProducto>> => {
    return await api.get<BajaProducto>(`/bajas/${id}`);
  },

  create: async (data: { productoId: number; cantidad: number; motivo: string; observaciones?: string }): Promise<ApiResponse<BajaProducto>> => {
    return await api.post<BajaProducto>('/bajas', data);
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/bajas/${id}`);
  },
};
