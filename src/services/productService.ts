import { api, ApiResponse } from './api';

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOferta?: number;
  enOferta?: boolean;
  costoBaseProduccion?: number;
  stock: number;
  imagenUrl?: string;
  disponible: boolean;
  presentacion?: string;
  marca?: string;
  sabor?: string;
  tamano?: string;
  categoriaId: number;
  categoriaNombre?: string;
}

export interface ProductFilterParams {
  categoriaId?: number;
  search?: string;
  minPrecio?: number;
  maxPrecio?: number;
  soloOfertas?: boolean;
  marca?: string;
  sabor?: string;
  tamano?: string;
  presentacion?: string;
}

export type ProductCreateRequest = Partial<Product>;

export const productService = {
  getAll: async (params?: ProductFilterParams): Promise<ApiResponse<Product[]>> => {
    const query = new URLSearchParams();
    if (params?.categoriaId) query.append('categoriaId', params.categoriaId.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.minPrecio !== undefined) query.append('minPrecio', params.minPrecio.toString());
    if (params?.maxPrecio !== undefined) query.append('maxPrecio', params.maxPrecio.toString());
    if (params?.soloOfertas) query.append('soloOfertas', 'true');
    if (params?.marca) query.append('marca', params.marca);
    if (params?.sabor) query.append('sabor', params.sabor);
    if (params?.tamano) query.append('tamano', params.tamano);
    if (params?.presentacion) query.append('presentacion', params.presentacion);

    const queryString = query.toString();
    return await api.get<Product[]>(`/productos${queryString ? `?${queryString}` : ''}`);
  },

  getAllProducts: async (params?: ProductFilterParams): Promise<ApiResponse<Product[]>> => {
    return await productService.getAll(params);
  },

  getProducts: async (params?: ProductFilterParams): Promise<ApiResponse<Product[]>> => {
    return await productService.getAll(params);
  },

  getById: async (id: number): Promise<ApiResponse<Product>> => {
    return await api.get<Product>(`/productos/${id}`);
  },

  create: async (data: Partial<Product>): Promise<ApiResponse<Product>> => {
    return await api.post<Product>('/productos', data);
  },

  createProduct: async (data: Partial<Product>): Promise<ApiResponse<Product>> => {
    return await productService.create(data);
  },

  update: async (id: number, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    return await api.put<Product>(`/productos/${id}`, data);
  },

  updateProduct: async (id: number, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    return await productService.update(id, data);
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/productos/${id}`);
  },

  deleteProduct: async (id: number): Promise<ApiResponse<boolean>> => {
    return await productService.delete(id);
  },

  updateStock: async (id: number, cantidad: number): Promise<ApiResponse<boolean>> => {
    return await api.patch<boolean>(`/productos/${id}/stock?cantidad=${cantidad}`);
  },
};
