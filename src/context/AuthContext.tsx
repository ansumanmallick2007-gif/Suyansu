import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; department: string; role?: string }) => Promise<void>;
  logout: () => void;
  switchDemoUser: (role: 'admin' | 'manager' | 'employee') => Promise<void>;
  isAdmin: boolean;
  isManager: boolean;
  canManage: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@synapse.ai', password: 'Enterprise2026!', label: 'Sarah Lin (Admin · Operations)' },
  manager: { email: 'manager@synapse.ai', password: 'Enterprise2026!', label: 'Marcus Vance (Manager · Engineering)' },
  employee: { email: 'employee@synapse.ai', password: 'Enterprise2026!', label: 'Elena Rostova (Employee · Product)' }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('synapse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('synapse_auth_token');
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('synapse_auth_token');
      if (storedToken) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          localStorage.setItem('synapse_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('[Auth] Session expired or invalid, clearing local state.');
          localStorage.removeItem('synapse_auth_token');
          localStorage.removeItem('synapse_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('synapse_auth_token', res.token);
    localStorage.setItem('synapse_user', JSON.stringify(res.user));
  };

  const register = async (data: { name: string; email: string; password: string; department: string; role?: string }) => {
    const res = await authApi.register(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('synapse_auth_token', res.token);
    localStorage.setItem('synapse_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('synapse_auth_token');
    localStorage.removeItem('synapse_user');
  };

  const switchDemoUser = async (role: 'admin' | 'manager' | 'employee') => {
    const cred = DEMO_CREDENTIALS[role];
    await login(cred.email, cred.password);
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canManage = isAdmin || isManager;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoUser,
        isAdmin,
        isManager,
        canManage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
