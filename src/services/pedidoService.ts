import { api, ApiResponse } from './api';

export interface DetallePedidoCreate {
  productoId: number;
  cantidad: number;
}

export interface PedidoCreateRequest {
  usuarioId?: number;
  esInvitado: boolean;
  invitadoNombre?: string;
  invitadoEmail?: string;
  invitadoTelefono?: string;
  fechaEntrega?: string;
  direccionEntrega?: string;
  observaciones?: string;
  tipoPago: 'Efectivo' | 'Tarjeta' | 'Credito_Deuda' | string;
  detalles: DetallePedidoCreate[];
}

export interface DetallePedido {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuarioId?: number;
  clienteNombre: string;
  clienteEmail: string;
  esInvitado: boolean;
  invitadoNombre?: string;
  invitadoEmail?: string;
  invitadoTelefono?: string;
  fechaPedido: string;
  fechaEntrega?: string;
  total: number;
  estado: string;
  tipoPago: string;
  estadoPago: string;
  direccionEntrega?: string;
  observaciones?: string;
  detalles: DetallePedido[];
}

export const pedidoService = {
  createPedido: async (data: PedidoCreateRequest): Promise<ApiResponse<Pedido>> => {
    return await api.post<Pedido, PedidoCreateRequest>('/pedidos', data);
  },

  getPedidos: async (): Promise<ApiResponse<Pedido[]>> => {
    return await api.get<Pedido[]>('/pedidos');
  },

  getPedidoById: async (id: number): Promise<ApiResponse<Pedido>> => {
    return await api.get<Pedido>(`/pedidos/${id}`);
  },

  updateEstado: async (id: number, nuevoEstado: string): Promise<ApiResponse<boolean>> => {
    return await api.put<boolean, string>(`/pedidos/${id}/estado`, nuevoEstado);
  },
};
