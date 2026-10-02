import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('smartcart_token');
    if (token) {
      api.getProfile()
        .then((res) => setUser(res.user))
        .catch(() => {
          localStorage.removeItem('smartcart_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    const res = await api.login(credentials);
    localStorage.setItem('smartcart_token', res.token);
    setUser(res.user);
    showToast(`Welcome back, ${res.user.name}!`);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('smartcart_token', res.token);
    setUser(res.user);
    showToast(`Account created successfully! Welcome, ${res.user.name}.`);
  };

  const logout = () => {
    localStorage.removeItem('smartcart_token');
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
