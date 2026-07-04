/**
 * Employee Service — Mock CRUD operations for employees
 */

import { employees, companies } from '../data/mockData';
import type { Employee } from '../types';
import { generateLoginId, generateTempPassword } from '../utils/loginIdGenerator';

export function getEmployees(): Employee[] {
  return [...employees];
}

export function getEmployee(id: string): Employee | undefined {
  return employees.find(e => e.id === id);
}

export function getEmployeesByDepartment(department: string): Employee[] {
  return employees.filter(e => e.department === department);
}

export function searchEmployees(query: string): Employee[] {
  const q = query.toLowerCase();
  return employees.filter(e =>
    e.firstName.toLowerCase().includes(q) ||
    e.lastName.toLowerCase().includes(q) ||
    e.email.toLowerCase().includes(q) ||
    e.department.toLowerCase().includes(q) ||
    e.title.toLowerCase().includes(q) ||
    e.loginId.toLowerCase().includes(q)
  );
}

export function updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return undefined;

  employees[idx] = { ...employees[idx], ...updates };
  return employees[idx];
}

export function createEmployee(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  title: string;
  companyId: string;
  dateOfJoining: string;
}): { employee: Employee; loginId: string; tempPassword: string } {
  const company = companies.find(c => c.id === data.companyId);
  const companyCode = company?.code ?? '0E';
  const year = new Date(data.dateOfJoining).getFullYear();

  const loginId = generateLoginId(companyCode, data.firstName, data.lastName, year);
  const tempPassword = generateTempPassword();

  const newEmployee: Employee = {
    id: `emp-${String(employees.length + 1).padStart(3, '0')}`,
    loginId,
    role: 'employee',
    companyId: data.companyId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    profilePictureUrl: undefined,
    aboutMe: '',
    skills: [],
    certifications: [],
    interests: [],
    department: data.department,
    title: data.title,
    managerId: undefined,
    dateOfBirth: '',
    currentAddress: '',
    permanentAddress: '',
    personalEmail: '',
    gender: 'other',
    maritalStatus: 'single',
    panNumber: '',
    aadharNumber: '',
    bloodGroup: '',
    dateOfJoining: data.dateOfJoining,
    password: tempPassword,
  };

  employees.push(newEmployee);

  return { employee: newEmployee, loginId, tempPassword };
}

export function getDepartments(): string[] {
  return [...new Set(employees.map(e => e.department))];
}
