/**
 * Auth Service — Mock authentication layer
 */

import { employees, companies } from '../data/mockData';
import type { Employee, AuthUser } from '../types';

export function signIn(loginIdOrEmail: string, password: string): { success: boolean; user?: AuthUser; error?: string } {
  // Find employee by loginId or email
  const employee = employees.find(
    e => e.loginId === loginIdOrEmail || e.email === loginIdOrEmail
  );

  if (!employee) {
    return { success: false, error: 'No account found with this Login ID or email.' };
  }

  // Mock validation: password must be >= 6 chars
  if (password.length < 6) {
    return { success: false, error: 'Invalid password. Password must be at least 6 characters.' };
  }

  // Mock password check
  if (password !== employee.password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  const company = companies.find(c => c.id === employee.companyId);
  if (!company) {
    return { success: false, error: 'Company not found.' };
  }

  return {
    success: true,
    user: {
      employee,
      company,
      isAdmin: employee.role === 'admin',
    },
  };
}

export function signUp(data: {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): { success: boolean; employee?: Employee; loginId?: string; tempPassword?: string; error?: string } {
  // For mock purposes, just validate
  if (employees.find(e => e.email === data.email)) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  return {
    success: true,
    loginId: 'MOCK_ID_GENERATED',
    tempPassword: data.password,
  };
}

export function getCurrentUser(userId: string): AuthUser | null {
  const employee = employees.find(e => e.id === userId);
  if (!employee) return null;

  const company = companies.find(c => c.id === employee.companyId);
  if (!company) return null;

  return {
    employee,
    company,
    isAdmin: employee.role === 'admin',
  };
}
