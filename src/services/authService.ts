import { api } from './api';
import { MOCK_USER } from '../data/mockData';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  address?: string;
  phone?: string;
}

export const authService = {
  login: async (email: string): Promise<User> => {
    const response = await api.post('/auth/login', { email }, {
      ...MOCK_USER,
      email: email || MOCK_USER.email,
    });
    return response.data;
  },

  logout: async (): Promise<boolean> => {
    const response = await api.post('/auth/logout', {}, true);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get(() => MOCK_USER);
    return response.data;
  },
};
