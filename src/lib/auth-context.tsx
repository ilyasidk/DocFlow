'use client';

import { User, UserRole } from '@/types';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize with null to prevent hydration mismatch
  const [user, setUser] = useState<User | null>(null);

  // Set the initial user after component mounts on client
  useEffect(() => {
    setUser(null); // Default to null for demo
  }, []);

  const switchRole = (role: UserRole) => {
    // Implementation of switchRole method
  };

  const logout = () => {
    setUser(null);
  };

  // Mock login function for demo purposes
  const login = async (email: string, password: string): Promise<boolean> => {
    // Implementation of login method
    return false;
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