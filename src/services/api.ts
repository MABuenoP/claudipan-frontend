import { STORAGE_KEYS } from '../utils/constants';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.pedroleyvasenador26.org/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('claudipan_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });
      const json = await response.json();
      return json;
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Error de conexión con el servidor',
      };
    }
  },

  post: async <T, B>(endpoint: string, body: B): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(body),
      });
      const json = await response.json();
      return json;
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Error de conexión con el servidor',
      };
    }
  },

  put: async <T, B>(endpoint: string, body: B): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(body),
      });
      const json = await response.json();
      return json;
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Error de conexión con el servidor',
      };
    }
  },

  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });
      const json = await response.json();
      return json;
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Error de conexión con el servidor',
      };
    }
  },
};
