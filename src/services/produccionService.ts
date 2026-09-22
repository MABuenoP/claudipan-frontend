import { api, ApiResponse } from './api';

export interface DetalleReceta {
  id?: number;
  insumoId: number;
  insumoNombre?: string;
  cantidadNecesaria: number;
  unidadMedida: string;
  costoUnitarioInsumo?: number;
  costoSubtotal?: number;
}

export interface RecetaProduccion {
  id: number;
  productoId: number;
  productoNombre: string;
  nombreReceta: string;
  descripcion?: string;
  rendimientoUnidades: number;
  costoTotalInsumos: number;
  costoUnitarioEstimado: number;
  activo: boolean;
  detalles: DetalleReceta[];
}

export interface OrdenProduccion {
  id: number;
  codigoOrden: string;
  panaderoUsuarioId: number;
  panaderoNombre: string;
  productoId: number;
  productoNombre: string;
  recetaId?: number;
  cantidadProgramada: number;
  cantidadProducida: number;
  costoInsumos: number;
  estado: 'Pendiente' | 'En_Proceso' | 'Terminada' | 'Entregada' | 'Cancelada' | string;
  fechaOrden: string;
  fechaEntrega?: string;
  observaciones?: string;
}

export const produccionService = {
  getAllRecetas: async (): Promise<ApiResponse<RecetaProduccion[]>> => {
    return await api.get<RecetaProduccion[]>('/produccion/recetas');
  },

  getRecetaById: async (id: number): Promise<ApiResponse<RecetaProduccion>> => {
    return await api.get<RecetaProduccion>(`/produccion/recetas/${id}`);
  },

  createReceta: async (data: any): Promise<ApiResponse<RecetaProduccion>> => {
    return await api.post<RecetaProduccion>('/produccion/recetas', data);
  },

  deleteReceta: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/produccion/recetas/${id}`);
  },

  getAllOrdenes: async (params?: { panaderoId?: number; estado?: string }): Promise<ApiResponse<OrdenProduccion[]>> => {
    const q = new URLSearchParams();
    if (params?.panaderoId) q.append('panaderoId', params.panaderoId.toString());
    if (params?.estado) q.append('estado', params.estado);
    const qs = q.toString();
    return await api.get<OrdenProduccion[]>(`/produccion/ordenes${qs ? `?${qs}` : ''}`);
  },

  getOrdenById: async (id: number): Promise<ApiResponse<OrdenProduccion>> => {
    return await api.get<OrdenProduccion>(`/produccion/ordenes/${id}`);
  },

  createOrden: async (data: { productoId: number; recetaId?: number; cantidadProgramada: number; observaciones?: string }): Promise<ApiResponse<OrdenProduccion>> => {
    return await api.post<OrdenProduccion>('/produccion/ordenes', data);
  },

  iniciarOrden: async (id: number): Promise<ApiResponse<OrdenProduccion>> => {
    return await api.patch<OrdenProduccion>(`/produccion/ordenes/${id}/iniciar`);
  },

  entregarProduccion: async (id: number, data: { cantidadProducida: number; observaciones?: string }): Promise<ApiResponse<OrdenProduccion>> => {
    return await api.post<OrdenProduccion>(`/produccion/ordenes/${id}/entregar`, data);
  },

  cancelarOrden: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.patch<boolean>(`/produccion/ordenes/${id}/cancelar`);
  },
};
