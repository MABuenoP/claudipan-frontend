import { api, ApiResponse } from './api';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'Administrador' | 'Secretaria' | 'Tecnico' | 'Cliente' | string;
  telefono?: string;
  direccion?: string;
  limiteCredito: number;
  deudaActual: number;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
}

export interface UpdateProfileRequest {
  nombre: string;
  telefono?: string;
  direccion?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
  direccion?: string;
  limiteCredito: number;
  deudaActual: number;
  activo: boolean;
  fechaCreacion: string;
}

export interface UpdateUsuarioAdminRequest {
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
  direccion?: string;
  limiteCredito: number;
  activo: boolean;
  password?: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<User>> => {
    const res = await api.post<any, LoginRequest>('/auth/login', credentials);
    if (res.success && res.data?.token) {
      localStorage.setItem('claudipan_token', res.data.token);
    }
    return res;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    const res = await api.post<any, RegisterRequest>('/auth/register', data);
    if (res.success && res.data?.token) {
      localStorage.setItem('claudipan_token', res.data.token);
    }
    return res;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    return await api.get<User>('/auth/profile');
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    return await api.put<User, UpdateProfileRequest>('/auth/profile', data);
  },

  getAllUsers: async (): Promise<ApiResponse<UsuarioAdmin[]>> => {
    return await api.get<UsuarioAdmin[]>('/auth/users');
  },

  createUserAdmin: async (data: UpdateUsuarioAdminRequest): Promise<ApiResponse<UsuarioAdmin>> => {
    return await api.post<UsuarioAdmin, UpdateUsuarioAdminRequest>('/auth/users', data);
  },

  updateUserAdmin: async (id: number, data: UpdateUsuarioAdminRequest): Promise<ApiResponse<UsuarioAdmin>> => {
    return await api.put<UsuarioAdmin, UpdateUsuarioAdminRequest>(`/auth/users/${id}`, data);
  },

  deleteUserAdmin: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/auth/users/${id}`);
  },

  logout: () => {
    localStorage.removeItem('claudipan_token');
    localStorage.removeItem('claudipan_auth');
  },
};
