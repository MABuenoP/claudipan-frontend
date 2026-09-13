import { api, ApiResponse } from './api';

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl?: string;
  disponible: boolean;
  categoriaId: number;
  categoriaNombre?: string;

  // Atributos de Variantes
  presentacion?: string; // Tajado, Entero, Baguette, Rollo
  marca?: string;        // Coca-Cola, Postobón, Alpina, Alquería
  sabor?: string;        // Capuchino, Vainilla, Manzana, Fresa
  tamano?: string;       // Personal (350ml), 8oz, 12oz, 1.5L, 1L, Familiar

  // Compatibility UI properties
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating?: number;
  reviewsCount?: number;
  isFreshToday?: boolean;
  isPopular?: boolean;
  ingredients?: string[];
}

export interface ProductCreateRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl?: string;
  disponible: boolean;
  presentacion?: string;
  marca?: string;
  sabor?: string;
  tamano?: string;
  categoriaId: number;
}

function mapProduct(p: any): Product {
  return {
    ...p,
    name: p.nombre,
    price: p.precio,
    image: p.imagenUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop',
    description: p.descripcion,
    category: p.categoriaNombre || 'Panes Artesanales',
    rating: 4.9,
    reviewsCount: 34,
    isFreshToday: true,
    isPopular: true,
    ingredients: ['Harina de Trigo Premium', 'Masa Madre Natural', 'Ingredientes Seleccionados'],
  };
}

export const productService = {
  getAllProducts: async (): Promise<ApiResponse<Product[]>> => {
    const res = await api.get<any[]>('/productos');
    if (res.success && res.data) {
      return {
        ...res,
        data: res.data.map(mapProduct),
      };
    }
    return res as any;
  },

  getProductById: async (id: number): Promise<ApiResponse<Product>> => {
    const res = await api.get<any>(`/productos/${id}`);
    if (res.success && res.data) {
      return {
        ...res,
        data: mapProduct(res.data),
      };
    }
    return res as any;
  },

  createProduct: async (data: ProductCreateRequest): Promise<ApiResponse<Product>> => {
    const res = await api.post<any, ProductCreateRequest>('/productos', data);
    if (res.success && res.data) {
      return { ...res, data: mapProduct(res.data) };
    }
    return res as any;
  },

  updateProduct: async (id: number, data: ProductCreateRequest): Promise<ApiResponse<Product>> => {
    const res = await api.put<any, ProductCreateRequest>(`/productos/${id}`, data);
    if (res.success && res.data) {
      return { ...res, data: mapProduct(res.data) };
    }
    return res as any;
  },

  deleteProduct: async (id: number): Promise<ApiResponse<boolean>> => {
    return await api.delete<boolean>(`/productos/${id}`);
  },
};
