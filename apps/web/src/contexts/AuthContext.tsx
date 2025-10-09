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
        console.log('AuthContext: Setting user', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.log('AuthContext: Invalid user data', error);
        // Invalid user data, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Login attempt', { email, password: '***' });
      
      // Mock authentication - replace with actual API call
      if (email === 'demo@example.com' && password === 'password') {
        const userData = { id: '1', email };
        const token = 'mock-jwt-token';
        
        console.log('AuthContext: Login successful, setting user', userData);
        
        try {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('AuthContext: localStorage updated successfully');
        } catch (storageError) {
          console.log('AuthContext: localStorage error:', storageError);
          return false;
        }
        
        setUser(userData);
        
        console.log('AuthContext: User set, isAuthenticated:', !!userData);
        console.log('AuthContext: Current user state:', user);
        return true;
      }
      
      console.log('AuthContext: Login failed - invalid credentials');
      return false;
    } catch (error) {
      console.log('AuthContext: Login error:', error);
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
