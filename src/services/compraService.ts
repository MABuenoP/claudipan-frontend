import { api, ApiResponse } from './api';

export interface DetalleCompra {
  id?: number;
  insumoId?: number;
  insumoNombre?: string;
  productoId?: number;
  productoNombre?: string;
  descripcionItem: string;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
}

export interface Compra {
  id: number;
  proveedorId: number;
  proveedorNombre: string;
  numeroFactura: string;
  fechaCompra: string;
  total: number;
  metodoPago: string;
  estadoPago: string;
  observaciones?: string;
  detalles: DetalleCompra[];
}

export const compraService = {
  getAll: async (proveedorId?: number): Promise<ApiResponse<Compra[]>> => {
    return await api.get<Compra[]>(`/compras${proveedorId ? `?proveedorId=${proveedorId}` : ''}`);
  },

  getById: async (id: number): Promise<ApiResponse<Compra>> => {
    return await api.get<Compra>(`/compras/${id}`);
  },

  create: async (data: any): Promise<ApiResponse<Compra>> => {
    return await api.post<Compra>('/compras', data);
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/compras/${id}`);
  },
};
