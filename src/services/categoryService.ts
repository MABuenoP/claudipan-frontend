import { api, ApiResponse } from './api';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface CategoriaCreateRequest {
  nombre: string;
  descripcion?: string;
}

export const categoryService = {
  getAllCategories: async (): Promise<ApiResponse<Categoria[]>> => {
    return await api.get<Categoria[]>('/categorias');
  },

  getCategoryById: async (id: number): Promise<ApiResponse<Categoria>> => {
    return await api.get<Categoria>(`/categorias/${id}`);
  },

  createCategory: async (data: CategoriaCreateRequest): Promise<ApiResponse<Categoria>> => {
    return await api.post<Categoria, CategoriaCreateRequest>('/categorias', data);
  },

  updateCategory: async (id: number, data: CategoriaCreateRequest): Promise<ApiResponse<Categoria>> => {
    return await api.put<Categoria, CategoriaCreateRequest>(`/categorias/${id}`, data);
  },

  deleteCategory: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/categorias/${id}`);
  },
};
