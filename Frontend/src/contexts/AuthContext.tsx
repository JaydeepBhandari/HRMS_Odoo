/**
 * Auth Context — Provides current user, login/logout, and role-based access
 * Includes a dev-only role switcher for demo/testing
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import { signIn as authSignIn, getCurrentUser } from '../services/authService';

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (loginIdOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAs: (role: 'employee' | 'admin') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    return getCurrentUser();
  });

  const login = useCallback(async (loginIdOrEmail: string, password: string) => {
    const result = await authSignIn(loginIdOrEmail, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      localStorage.setItem('hrms_current_user', JSON.stringify(result.user));
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const loginAs = useCallback(async (role: 'employee' | 'admin') => {
    const email = role === 'admin' ? 'admin@novatech.com' : 'employee@novatech.com';
    const password = role === 'admin' ? 'admin123' : 'employee123';
    return login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('hrms_current_user');
    localStorage.removeItem('hrms_access_token');
  }, []);

  const switchUser = useCallback((_userId: string) => {
    // No-op for now — real API doesn't support this
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.isAdmin ?? false,
        login,
        loginAs,
        logout,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Dev Role Switcher — disabled with real API (no mock users to switch to)
 */
export function DevRoleSwitcher() {
  return null;
}
