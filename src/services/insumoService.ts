import { api, ApiResponse } from './api';

export interface Insumo {
  id: number;
  nombre: string;
  descripcion?: string;
  unidadMedida: string;
  stockActual: number;
  costoUnitario: number;
  stockMinimo: number;
  proveedorPrincipal?: string;
  activo: boolean;
  fechaActualizacion: string;
}

export const insumoService = {
  getAll: async (soloActivos: boolean = true): Promise<ApiResponse<Insumo[]>> => {
    return await api.get<Insumo[]>(`/insumos?soloActivos=${soloActivos}`);
  },

  getById: async (id: number): Promise<ApiResponse<Insumo>> => {
    return await api.get<Insumo>(`/insumos/${id}`);
  },

  create: async (data: Partial<Insumo>): Promise<ApiResponse<Insumo>> => {
    return await api.post<Insumo>('/insumos', data);
  },

  update: async (id: number, data: Partial<Insumo>): Promise<ApiResponse<Insumo>> => {
    return await api.post<Insumo>(`/insumos/${id}`, data);
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/insumos/${id}`);
  },

  ajustarStock: async (id: number, delta: number, nuevoCosto?: number): Promise<ApiResponse<boolean>> => {
    const q = new URLSearchParams({ delta: delta.toString() });
    if (nuevoCosto !== undefined) q.append('nuevoCosto', nuevoCosto.toString());
    return await api.patch<boolean>(`/insumos/${id}/stock?${q.toString()}`);
  },
};
