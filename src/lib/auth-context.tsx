'use client';

import { User, UserRole } from '@/types';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { users, getUserByRole } from './mock-data';

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
    setUser(users[0]); // Default to admin for demo
  }, []);

  const switchRole = (role: UserRole) => {
    const newUser = getUserByRole(role);
    if (newUser) {
      setUser(newUser);
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Mock login function for demo purposes
  const login = async (email: string, password: string): Promise<boolean> => {
    // For demo, we'll accept any credentials and find a user with matching email
    // In a real app, you'd verify the password too
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    
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