'use client';

import { User, UserRole } from '@/types';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface AuthContextType {
  user: User | null;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  login: (username: string, password: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user from localStorage (persisted login)
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          return JSON.parse(userJson) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const switchRole = (role: UserRole) => {
    // You can implement role switching or remove if not needed
    console.warn('switchRole is not implemented');
  };

  const logout = () => {
    // Clear auth token and user
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setUser(null);
  };

  // Real login function: authenticate against backend
  const login = async (username: string, password: string): Promise<User | null> => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      console.log('Attempting login to:', `${base}/api/auth/login`);
      const response = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      const { token, user: userData } = data;
      // Store token and user and set user context
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      const userObj: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        avatar: userData.avatar,
      };
      setUser(userObj);
      return userObj;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, switchRole, logout, login }}>
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