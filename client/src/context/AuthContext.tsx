import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'Admin' | 'HR' | 'Employee' | 'Finance' | 'Manager';
  avatar_url: string;
  organization_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUserRoleState: (userId: string, role: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const profile = await api.auth.me();
          setUser(profile);
        } catch (error) {
          console.error('Failed to restore auth session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const response = await api.auth.login(credentials);
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const response = await api.auth.register(userData);
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  // Helper to dynamically update the logged-in user's role on role change
  const updateUserRoleState = (userId: string, role: any) => {
    if (user && user.id === userId) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserRoleState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
