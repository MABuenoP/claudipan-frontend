// Determinación dinámica de la URL del API (soporta localhost, variables de entorno y servidores remotos)
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5160/api';
    }
    // Servidor remoto de producción
    if (hostname.includes('pedroleyvasenador26.org')) {
      return 'https://api.pedroleyvasenador26.org/api';
    }
    return `${window.location.protocol}//${hostname}:5160/api`;
  }

  return 'http://localhost:5160/api';
};

export const API_BASE_URL = getApiBaseUrl();

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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const json = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        success: false,
        message: json?.message || `Error ${response.status}: ${response.statusText}`,
        errors: json?.errors,
        data: json?.data,
      };
    }

    return json || { success: true, data: undefined };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Error de conexión con el servidor API',
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T, B = any>(endpoint: string, body?: B) =>
    request<T>(endpoint, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T, B = any>(endpoint: string, body?: B) =>
    request<T>(endpoint, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T, B = any>(endpoint: string, body?: B) =>
    request<T>(endpoint, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
