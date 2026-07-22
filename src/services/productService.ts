import { api } from './api';
import { MOCK_PRODUCTS, Product } from '../data/mockData';

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    const res = await api.get(() => MOCK_PRODUCTS);
    return res.data;
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    const res = await api.get(() => MOCK_PRODUCTS.find((p) => p.id === id));
    return res.data;
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const res = await api.get(() => {
      if (category === 'all') return MOCK_PRODUCTS;
      return MOCK_PRODUCTS.filter((p) => p.category === category);
    });
    return res.data;
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    const res = await api.get(() => {
      const q = query.toLowerCase().trim();
      if (!q) return MOCK_PRODUCTS;
      return MOCK_PRODUCTS.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    });
    return res.data;
  },
};
