import React, { createContext, useState, useEffect } from 'react';
import { User, authService } from '../services/authService';
import { storage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storage.get<User | null>(STORAGE_KEYS.AUTH, null));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      storage.set(STORAGE_KEYS.AUTH, user);
    } else {
      storage.remove(STORAGE_KEYS.AUTH);
    }
  }, [user]);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(email);
      setUser(loggedUser);
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
