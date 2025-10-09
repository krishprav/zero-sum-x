'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
('AuthContext: Setting user', parsedUser);
        setUser(parsedUser);
      } catch (error) {
('AuthContext: Invalid user data', error);
        // Invalid user data, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
('AuthContext: Login attempt', { email, password: '***' });
      
      // Mock authentication - replace with actual API call
      if (email === 'demo@example.com' && password === 'password') {
        const userData = { id: '1', email };
        const token = 'mock-jwt-token';
        
('AuthContext: Login successful, setting user', userData);
        
        try {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
('AuthContext: localStorage updated successfully');
        } catch (storageError) {
('AuthContext: localStorage error:', storageError);
          return false;
        }
        
        setUser(userData);
        
('AuthContext: User set, isAuthenticated:', !!userData);
('AuthContext: Current user state:', user);
        return true;
      }
      
('AuthContext: Login failed - invalid credentials');
      return false;
    } catch (error) {
('AuthContext: Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
