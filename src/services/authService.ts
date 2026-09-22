import { api, ApiResponse } from './api';

export interface User {
  id: number;
  nombre: string;
  email: string;
  cedula?: string;
  rol: 'Administrador' | 'Gerente' | 'Contable' | 'Panadero' | 'Vendedor' | 'Cliente' | string;
  telefono?: string;
  direccion?: string;
  redesSociales?: string;
  limiteCredito: number;
  deudaActual: number;
  token?: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password?: string;
  cedula?: string;
  documentoIdentidad?: string;
  telefono?: string;
  direccion?: string;
  redesSociales?: string;
  limiteCredito?: number;
}

export type UpdateUsuarioAdminRequest = any;

export interface UpdateProfileRequest {
  nombre: string;
  cedula?: string;
  telefono?: string;
  direccion?: string;
  redesSociales?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
  cedula?: string;
  rol: string;
  telefono?: string;
  direccion?: string;
  redesSociales?: string;
  limiteCredito: number;
  deudaActual: number;
  activo: boolean;
  fechaCreacion: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<User>> => {
    const res = await api.post<any>('/auth/login', credentials);
    if (res.success && res.data?.token) {
      localStorage.setItem('claudipan_token', res.data.token);
      localStorage.setItem('claudipan_refreshToken', res.data.refreshToken);
      return {
        success: true,
        data: res.data,
        message: res.message,
      };
    }
    return res;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    const res = await api.post<any>('/auth/register', data);
    if (res.success && res.data?.token) {
      localStorage.setItem('claudipan_token', res.data.token);
      localStorage.setItem('claudipan_refreshToken', res.data.refreshToken);
    }
    return res;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    return await api.get<User>('/auth/profile');
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    return await api.put<User>('/auth/profile', data);
  },

  getAllUsers: async (): Promise<ApiResponse<UsuarioAdmin[]>> => {
    return await api.get<UsuarioAdmin[]>('/auth/users');
  },

  createUserAdmin: async (data: any): Promise<ApiResponse<UsuarioAdmin>> => {
    return await api.post<UsuarioAdmin>('/auth/users', data);
  },

  updateUserAdmin: async (id: number, data: any): Promise<ApiResponse<UsuarioAdmin>> => {
    return await api.put<UsuarioAdmin>(`/auth/users/${id}`, data);
  },

  deleteUserAdmin: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/auth/users/${id}`);
  },

  logout: () => {
    localStorage.removeItem('claudipan_token');
    localStorage.removeItem('claudipan_refreshToken');
    localStorage.removeItem('claudipan_auth');
  },
};
