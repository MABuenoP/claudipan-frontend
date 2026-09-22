import React, { createContext, useState, useEffect } from 'react';
import { User, LoginRequest, RegisterRequest, UpdateProfileRequest, authService } from '../services/authService';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<{ success: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('claudipan_auth');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('claudipan_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('claudipan_auth');
      localStorage.removeItem('claudipan_token');
    }
  }, [user]);

  // Intentar sincronizar perfil en la primera carga si hay token
  useEffect(() => {
    const token = localStorage.getItem('claudipan_token');
    if (token) {
      refreshProfile();
    }
  }, []);

  const refreshProfile = async () => {
    try {
      const res = await authService.getProfile();
      if (res.success && res.data) {
        setUser(prev => ({
          ...prev,
          ...res.data,
        } as User));
      }
    } catch {
      // Ignorar error si token expiró
    }
  };

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data) {
        setUser(res.data);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Error en autenticación' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      if (res.success && res.data) {
        setUser(res.data);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Error al registrar usuario' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    setIsLoading(true);
    try {
      const res = await authService.updateProfile(data);
      if (res.success && res.data) {
        setUser(prev => ({
          ...prev,
          ...res.data,
        } as User));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Error al actualizar perfil' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
