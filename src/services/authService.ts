import { api, ApiResponse } from './api';

export interface User {
  id: number;
  nombre: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  email: string;
  cedula?: string;
  rol: 'Administrador' | 'Gerente' | 'Contable' | 'Panadero' | 'Vendedor' | 'Cliente' | string;
  telefono?: string;
  direccion?: string;
  redesSociales?: string;
  limiteCredito: number;
  deudaActual: number;
  fotoBase64?: string;
  token?: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  nombre?: string;
  email: string;
  password?: string;
  cedula?: string;
  documentoIdentidad?: string;
  telefono?: string;
  direccion?: string;
  redesSociales?: string;
  limiteCredito?: number;
  fotoBase64?: string;
}

export interface UpdateProfileRequest {
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  nombre?: string;
  cedula?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  redesSociales?: string;
  fotoBase64?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
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
  fotoBase64?: string;
}

export interface UpdateUsuarioAdminRequest {
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  nombre?: string;
  cedula?: string;
  email: string;
  rol: string;
  telefono?: string;
  direccion?: string;
  redesSociales?: string;
  limiteCredito?: number;
  activo?: boolean;
  password?: string;
  fotoBase64?: string;
}

export interface PreRegistroAdmin {
  id: number;
  nombre: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  cedula?: string;
  email: string;
  passwordPlana: string;
  rol: string;
  telefono?: string;
  direccion?: string;
  redesSociales?: string;
  limiteCredito: number;
  fotoBase64?: string;
  tokenValidacion: string;
  tokenCancelacion: string;
  fechaCreacion: string;
  fechaExpiracion: string;
  estado: string;
}

export interface UpdatePreRegistroAdminRequest {
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  nombre?: string;
  cedula?: string;
  email: string;
  passwordPlana?: string;
  telefono?: string;
  direccion?: string;
  redesSociales?: string;
  limiteCredito?: number;
  fotoBase64?: string;
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
    return await api.post<User>('/auth/profile', data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<boolean>> => {
    return await api.post<boolean>('/auth/change-password', data);
  },

  getAllUsers: async (): Promise<ApiResponse<UsuarioAdmin[]>> => {
    return await api.get<UsuarioAdmin[]>('/auth/users');
  },

  createUserAdmin: async (data: UpdateUsuarioAdminRequest): Promise<ApiResponse<UsuarioAdmin>> => {
    return await api.post<UsuarioAdmin>('/auth/users', data);
  },

  updateUserAdmin: async (id: number, data: UpdateUsuarioAdminRequest): Promise<ApiResponse<UsuarioAdmin>> => {
    return await api.post<UsuarioAdmin>(`/auth/users/${id}`, data);
  },

  deleteUserAdmin: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/auth/users/${id}`);
  },

  checkField: async (field: 'email' | 'cedula' | 'telefono', value: string): Promise<ApiResponse<{ exists: boolean; message: string }>> => {
    return await api.post<{ exists: boolean; message: string }>('/auth/check-field', { field, value });
  },

  forgotPassword: async (email: string): Promise<ApiResponse<boolean>> => {
    return await api.post<boolean>('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, email: string): Promise<ApiResponse<boolean>> => {
    return await api.post<boolean>('/auth/reset-password', { token, email });
  },

  preRegister: async (data: RegisterRequest): Promise<ApiResponse<{ email: string; nombre: string; mensaje: string }>> => {
    return await api.post<{ email: string; nombre: string; mensaje: string }>('/auth/preregister', data);
  },

  confirmPreRegister: async (token: string, email: string): Promise<ApiResponse<User>> => {
    const res = await api.post<any>('/auth/confirm-preregister', { token, email });
    if (res.success && res.data?.token) {
      localStorage.setItem('claudipan_token', res.data.token);
      localStorage.setItem('claudipan_refreshToken', res.data.refreshToken);
      localStorage.setItem('claudipan_auth', JSON.stringify(res.data));
    }
    return res;
  },

  cancelPreRegister: async (token: string, email: string): Promise<ApiResponse<boolean>> => {
    return await api.post<boolean>('/auth/cancel-preregister', { token, email });
  },

  getAllPreRegistros: async (): Promise<ApiResponse<PreRegistroAdmin[]>> => {
    return await api.get<PreRegistroAdmin[]>('/auth/preregistros');
  },

  updatePreRegistroAdmin: async (id: number, data: UpdatePreRegistroAdminRequest): Promise<ApiResponse<PreRegistroAdmin>> => {
    return await api.post<PreRegistroAdmin>(`/auth/preregistros/${id}/update`, data);
  },

  validatePreRegistroAdmin: async (id: number): Promise<ApiResponse<{ message: string; usuarioId: number }>> => {
    return await api.post<{ message: string; usuarioId: number }>(`/auth/preregistros/${id}/validate`, {});
  },

  cancelPreRegistroAdmin: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.post<boolean>(`/auth/preregistros/${id}/cancel`, {});
  },

  logout: () => {
    localStorage.removeItem('claudipan_token');
    localStorage.removeItem('claudipan_refreshToken');
    localStorage.removeItem('claudipan_auth');
  },
};
