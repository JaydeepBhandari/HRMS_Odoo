/**
 * Auth Service — Real API authentication with backend fallback
 */

import { api, ApiError } from './apiClient';
import { employees, companies } from '../data/mockData';
import type { Employee, AuthUser } from '../types';

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    designation?: string;
  };
}

interface RegisterResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

function backendUserToEmployee(backendUser: LoginResponse['user']): Employee {
  const nameParts = backendUser.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: backendUser.id,
    loginId: backendUser.email,
    role: backendUser.role === 'Admin' ? 'admin' : 'employee',
    companyId: 'comp-1',
    firstName,
    lastName,
    email: backendUser.email,
    phone: '',
    skills: [],
    certifications: [],
    interests: [],
    department: backendUser.department || 'General',
    title: backendUser.designation || 'Employee',
    dateOfBirth: '1990-01-01',
    currentAddress: '',
    permanentAddress: '',
    gender: 'male' as const,
    maritalStatus: 'single' as const,
    panNumber: '',
    aadharNumber: '',
    bloodGroup: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    password: '',
  };
}

export async function signIn(loginIdOrEmail: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const result = await api.post<LoginResponse>('/auth/login', { email: loginIdOrEmail, password });

    if (result.success && result.token) {
      localStorage.setItem('hrms_access_token', result.token);

      const employee = backendUserToEmployee(result.user);
      const company = companies[0] || { id: 'comp-1', code: 'NT', name: 'NovaTech Solutions' };

      const authUser: AuthUser = {
        employee,
        company,
        isAdmin: result.user.role === 'Admin',
      };

      return { success: true, user: authUser };
    }
    return { success: false, error: 'Login failed' };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }

    // Fallback to mock data if API is unreachable
    const emp = employees.find(e => e.loginId === loginIdOrEmail || e.email === loginIdOrEmail);
    if (!emp) return { success: false, error: 'No account found.' };
    if (password !== emp.password) return { success: false, error: 'Incorrect password.' };

    const company = companies.find(c => c.id === emp.companyId);
    if (!company) return { success: false, error: 'Company not found.' };

    return { success: true, user: { employee: emp, company, isAdmin: emp.role === 'admin' } };
  }
}

export async function signUp(data: {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ success: boolean; employee?: Employee; loginId?: string; tempPassword?: string; error?: string }> {
  try {
    const result = await api.post<RegisterResponse>('/auth/register', {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
      role: 'Admin',
      department: 'Management',
      designation: 'Administrator',
    });

    if (result.success && result.token) {
      localStorage.setItem('hrms_access_token', result.token);
      return {
        success: true,
        loginId: data.email,
        tempPassword: data.password,
      };
    }
    return { success: false, error: 'Registration failed' };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Could not connect to server' };
  }
}

export function getCurrentUser(): AuthUser | null {
  const stored = localStorage.getItem('hrms_current_user');
  return stored ? JSON.parse(stored) : null;
}
