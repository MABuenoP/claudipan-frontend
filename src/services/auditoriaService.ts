import { api, ApiResponse } from './api';

export interface RegistroAuditoria {
  id: number;
  usuarioId?: number;
  usuarioEmail: string;
  accion: string;
  tablaAfectada: string;
  registroId?: string;
  valoresAnteriores?: string;
  valoresNuevos?: string;
  fecha: string;
  direccionIp?: string;
}

export const auditoriaService = {
  getAll: async (params?: { tabla?: string; accion?: string }): Promise<ApiResponse<RegistroAuditoria[]>> => {
    const q = new URLSearchParams();
    if (params?.tabla) q.append('tabla', params.tabla);
    if (params?.accion) q.append('accion', params.accion);
    const qs = q.toString();
    return await api.get<RegistroAuditoria[]>(`/auditoria${qs ? `?${qs}` : ''}`);
  },
};
