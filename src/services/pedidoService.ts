import { api, ApiResponse } from './api';

export interface DetallePedido {
  productoId: number;
  productoNombre?: string;
  cantidad: number;
  precioUnitario?: number;
  subtotal?: number;
}

export interface Pedido {
  id: number;
  usuarioId?: number;
  clienteNombre: string;
  clienteEmail?: string;
  clienteCedula?: string;
  esInvitado: boolean;
  invitadoNombre?: string;
  invitadoEmail?: string;
  invitadoTelefono?: string;
  invitadoCedula?: string;
  fechaPedido: string;
  fechaEntrega?: string;
  total: number;
  montoFiado: number;
  estado: string;
  tipoPago: 'Efectivo' | 'Nequi' | 'Transferencia' | 'Tarjeta' | 'Credito_Fiado' | string;
  estadoPago: 'Pagado' | 'Pendiente_Credito' | string;
  comprobanteBase64?: string;
  referenciaPago?: string;
  direccionEntrega?: string;
  observaciones?: string;
  detalles: DetallePedido[];
}

export interface TransaccionDeuda {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  pedidoId?: number;
  monto: number;
  saldoAnterior: number;
  saldoNuevo: number;
  tipo: string;
  concepto: string;
  metodoPagoAbono?: string;
  comprobanteBase64?: string;
  referenciaPago?: string;
  fecha: string;
}

export interface PedidoCreateRequest {
  usuarioId?: number;
  esInvitado?: boolean;
  invitadoNombre?: string;
  invitadoEmail?: string;
  invitadoTelefono?: string;
  invitadoCedula?: string;
  fechaEntrega?: string;
  direccionEntrega?: string;
  observaciones?: string;
  tipoPago: string;
  comprobanteBase64?: string;
  referenciaPago?: string;
  detalles: { productoId: number; cantidad: number }[];
}

export interface RegistrarAbonoRequest {
  usuarioId: number;
  monto: number;
  metodoPago?: string;
  concepto?: string;
  comprobanteBase64?: string;
  referenciaPago?: string;
}

export const pedidoService = {
  getAll: async (params?: { estado?: string; tipoPago?: string }): Promise<ApiResponse<Pedido[]>> => {
    const query = new URLSearchParams();
    if (params?.estado) query.append('estado', params.estado);
    if (params?.tipoPago) query.append('tipoPago', params.tipoPago);
    const queryString = query.toString();
    return await api.get<Pedido[]>(`/pedidos${queryString ? `?${queryString}` : ''}`);
  },

  getPedidos: async (params?: { estado?: string; tipoPago?: string }): Promise<ApiResponse<Pedido[]>> => {
    return await pedidoService.getAll(params);
  },

  getById: async (id: number): Promise<ApiResponse<Pedido>> => {
    return await api.get<Pedido>(`/pedidos/${id}`);
  },

  create: async (data: PedidoCreateRequest): Promise<ApiResponse<Pedido>> => {
    return await api.post<Pedido>('/pedidos', data);
  },

  createPedido: async (data: PedidoCreateRequest): Promise<ApiResponse<Pedido>> => {
    return await pedidoService.create(data);
  },

  updateEstado: async (id: number, nuevoEstado: string): Promise<ApiResponse<Pedido>> => {
    return await api.patch<Pedido>(`/pedidos/${id}/estado`, nuevoEstado);
  },

  cancelar: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.post<boolean>(`/pedidos/${id}/cancelar`);
  },

  getDeudas: async (usuarioId?: number): Promise<ApiResponse<TransaccionDeuda[]>> => {
    return await api.get<TransaccionDeuda[]>(`/pedidos/deudas${usuarioId ? `?usuarioId=${usuarioId}` : ''}`);
  },

  registrarAbono: async (dto: RegistrarAbonoRequest): Promise<ApiResponse<TransaccionDeuda>> => {
    return await api.post<TransaccionDeuda>('/pedidos/abonar', dto);
  },
};
