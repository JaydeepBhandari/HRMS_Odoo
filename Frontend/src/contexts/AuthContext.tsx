/**
 * Auth Context — Provides current user, login/logout, and role-based access
 * Includes a dev-only role switcher for demo/testing
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import { signIn as authSignIn, getCurrentUser } from '../services/authService';
import { employees } from '../data/mockData';

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (loginIdOrEmail: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('hrms_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((loginIdOrEmail: string, password: string) => {
    const result = authSignIn(loginIdOrEmail, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      localStorage.setItem('hrms_current_user', JSON.stringify(result.user));
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('hrms_current_user');
  }, []);

  const switchUser = useCallback((userId: string) => {
    const authUser = getCurrentUser(userId);
    if (authUser) {
      setCurrentUser(authUser);
      localStorage.setItem('hrms_current_user', JSON.stringify(authUser));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.isAdmin ?? false,
        login,
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
 * Dev Role Switcher — floating widget for demo/testing
 */
export function DevRoleSwitcher() {
  const { currentUser, switchUser, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) return null;

  const allUsers = employees.map(emp => ({
    id: emp.id,
    name: `${emp.firstName} ${emp.lastName}`,
    role: emp.role,
    title: emp.title,
  }));

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-72 bg-surface-800 border border-surface-600 rounded-xl shadow-2xl p-3 animate-fade-in max-h-80 overflow-y-auto">
          <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 px-2">
            Switch User (Dev)
          </div>
          {allUsers.map(u => (
            <button
              key={u.id}
              onClick={() => {
                switchUser(u.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentUser?.employee.id === u.id
                  ? 'bg-accent-600/20 text-accent-400'
                  : 'text-surface-300 hover:bg-surface-700'
              }`}
            >
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-surface-500 flex items-center gap-2">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                  u.role === 'admin' ? 'bg-accent-400' : 'bg-status-green'
                }`} />
                {u.role === 'admin' ? 'Admin' : 'Employee'} · {u.title}
              </div>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-accent-600 text-white shadow-lg shadow-accent-600/30 flex items-center justify-center hover:bg-accent-500 transition-colors"
        title="Switch User (Dev)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </button>
    </div>
  );
}
