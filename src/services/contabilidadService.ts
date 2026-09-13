import { api, ApiResponse } from './api';

export interface TransaccionDeuda {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  pedidoId?: number;
  monto: number;
  tipo: 'Cargo_Deuda' | 'Abono_Pago' | string;
  concepto: string;
  fecha: string;
}

export interface RegistrarAbonoRequest {
  usuarioId: number;
  monto: number;
  concepto?: string;
}

export interface ResumenContable {
  totalVentas: number;
  totalCobrado: number;
  carteraPorCobrar: number;
  totalPedidos: number;
  totalClientesConDeuda: number;
}

export const contabilidadService = {
  getMisDeudas: async (): Promise<ApiResponse<TransaccionDeuda[]>> => {
    return await api.get<TransaccionDeuda[]>('/contabilidad/mis-deudas');
  },

  getAllTransacciones: async (): Promise<ApiResponse<TransaccionDeuda[]>> => {
    return await api.get<TransaccionDeuda[]>('/contabilidad/transacciones');
  },

  registrarAbono: async (data: RegistrarAbonoRequest): Promise<ApiResponse<TransaccionDeuda>> => {
    return await api.post<TransaccionDeuda, RegistrarAbonoRequest>('/contabilidad/abonos', data);
  },

  getResumenContable: async (): Promise<ApiResponse<ResumenContable>> => {
    return await api.get<ResumenContable>('/contabilidad/resumen');
  },
};
