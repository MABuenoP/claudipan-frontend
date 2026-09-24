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
  recetaNombre?: string;
  cantidadProgramada: number;
  cantidadProducida: number;
  cantOptima?: number;
  cantBuenasCondiciones?: number;
  cantMalasCondiciones?: number;
  destinoMalasCondiciones?: string; // "Transformacion", "Desecho", "Ninguno"
  costoInsumos: number;
  estado: 'Pendiente' | 'Preparando' | 'Horneando' | 'Entregada' | 'Cancelada' | string;
  tieneInsumosFaltantes?: boolean;
  insumosFaltantesDetalle?: string;
  fechaOrden: string;
  fechaEntrega?: string;
  observaciones?: string;
}

export interface ItemPreChequeoInsumo {
  insumoId: number;
  insumoNombre: string;
  unidadMedida: string;
  cantidadRequerida: number;
  stockActualBodega: number;
  stockResultante: number;
  esDeficit: boolean;
  costoUnitario: number;
  costoSubtotal: number;
}

export interface PreChequeoInsumosResponse {
  productoId: number;
  productoNombre: string;
  recetaId?: number;
  recetaNombre: string;
  cantidadProgramada: number;
  rendimientoBaseReceta: number;
  factorLote: number;
  costoEstimadoTotal: number;
  tieneDeficit: boolean;
  insumosFaltantesResumen?: string;
  insumos: ItemPreChequeoInsumo[];
}

export const produccionService = {
  // Recetas y Fórmulas
  getAllRecetas: async (): Promise<ApiResponse<RecetaProduccion[]>> => {
    return await api.get<RecetaProduccion[]>('/produccion/recetas');
  },

  getRecetaById: async (id: number): Promise<ApiResponse<RecetaProduccion>> => {
    return await api.get<RecetaProduccion>(`/produccion/recetas/${id}`);
  },

  createReceta: async (data: any): Promise<ApiResponse<RecetaProduccion>> => {
    return await api.post<RecetaProduccion>('/produccion/recetas', data);
  },

  updateReceta: async (id: number, data: any): Promise<ApiResponse<RecetaProduccion>> => {
    return await api.post<RecetaProduccion>(`/produccion/recetas/${id}`, data);
  },

  deleteReceta: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/produccion/recetas/${id}`);
  },

  // Pre-chequeo de insumos para Gerente / Administrador
  preChequeoInsumos: async (data: {
    productoId: number;
    recetaId?: number;
    cantidadProgramada: number;
  }): Promise<ApiResponse<PreChequeoInsumosResponse>> => {
    return await api.post<PreChequeoInsumosResponse>('/produccion/ordenes/pre-chequeo', data);
  },

  // Órdenes de Producción
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

  // Solo Gerente y Administrador
  createOrden: async (data: {
    productoId: number;
    recetaId?: number;
    cantidadProgramada: number;
    panaderoAsignadoId?: number;
    observaciones?: string;
  }): Promise<ApiResponse<OrdenProduccion>> => {
    return await api.post<OrdenProduccion>('/produccion/ordenes', data);
  },

  // Paso 1 Panadero: Cargue de Insumos & Iniciar Preparación (permite saldo en negativo)
  cargarInsumos: async (id: number, data?: { observaciones?: string }): Promise<ApiResponse<OrdenProduccion>> => {
    return await api.patch<OrdenProduccion>(`/produccion/ordenes/${id}/cargar-insumos`, data || {});
  },

  // Paso 2 Panadero: Masa a Punto -> Pasar a Horneando
  pasarHorneando: async (id: number, data?: { observaciones?: string }): Promise<ApiResponse<OrdenProduccion>> => {
    return await api.patch<OrdenProduccion>(`/produccion/ordenes/${id}/pasar-horneando`, data || {});
  },

  // Paso 3 Panadero: Culminar Horneado y Cuantificar Calidad (Óptimos, Buenas y Malas Condiciones)
  finalizarYCuantificar: async (
    id: number,
    data: {
      cantOptima: number;
      cantBuenasCondiciones: number;
      cantMalasCondiciones: number;
      destinoMalasCondiciones: 'Transformacion' | 'Desecho' | string;
      observaciones?: string;
    }
  ): Promise<ApiResponse<OrdenProduccion>> => {
    return await api.post<OrdenProduccion>(`/produccion/ordenes/${id}/finalizar-cuantificar`, data);
  },

  // Compatibilidad
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

