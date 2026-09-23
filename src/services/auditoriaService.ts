import { api, ApiResponse } from './api';

export interface RegistroAuditoria {
  id: number;
  usuarioId?: number;
  usuarioNombre?: string;
  usuarioEmail: string;
  usuarioRol?: string;
  accion: string;
  tablaAfectada: string;
  registroId?: string;
  formulario?: string;
  valoresAnteriores?: string;
  valoresNuevos?: string;
  fecha: string;
  direccionIp?: string;
}

export const auditoriaService = {
  getAll: async (params?: { 
    tabla?: string; 
    accion?: string; 
    formulario?: string; 
    busqueda?: string; 
  }): Promise<ApiResponse<RegistroAuditoria[]>> => {
    const q = new URLSearchParams();
    if (params?.tabla) q.append('tabla', params.tabla);
    if (params?.accion) q.append('accion', params.accion);
    if (params?.formulario) q.append('formulario', params.formulario);
    if (params?.busqueda) q.append('busqueda', params.busqueda);
    const qs = q.toString();
    return await api.get<RegistroAuditoria[]>(`/auditoria${qs ? `?${qs}` : ''}`);
  },
};
