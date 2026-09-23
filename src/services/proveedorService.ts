import { api, ApiResponse } from './api';

export interface Proveedor {
  id: number;
  nombre: string;
  nit: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  tipoInsumos?: string;
  activo: boolean;
  fechaRegistro: string;
}

export const proveedorService = {
  getAll: async (soloActivos: boolean = true): Promise<ApiResponse<Proveedor[]>> => {
    return await api.get<Proveedor[]>(`/proveedores?soloActivos=${soloActivos}`);
  },

  getById: async (id: number): Promise<ApiResponse<Proveedor>> => {
    return await api.get<Proveedor>(`/proveedores/${id}`);
  },

  create: async (data: Partial<Proveedor>): Promise<ApiResponse<Proveedor>> => {
    return await api.post<Proveedor>('/proveedores', data);
  },

  update: async (id: number, data: Partial<Proveedor>): Promise<ApiResponse<Proveedor>> => {
    return await api.post<Proveedor>(`/proveedores/${id}`, data);
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/proveedores/${id}`);
  },
};
