/**
 * Salary Service — Mock salary management
 */

import { salaryStructures } from '../data/mockData';
import type { SalaryStructure, SalaryComponent } from '../types';
import { computeSalary } from '../utils/salaryCalculator';
import type { SalaryComputationResult } from '../utils/salaryCalculator';

export function getSalaryStructure(employeeId: string): SalaryStructure | undefined {
  return salaryStructures.find(s => s.employeeId === employeeId);
}

export function getComputedSalary(employeeId: string): SalaryComputationResult | null {
  const structure = getSalaryStructure(employeeId);
  if (!structure) return null;
  return computeSalary(structure);
}

export function updateSalaryStructure(
  employeeId: string,
  updates: Partial<Omit<SalaryStructure, 'employeeId'>>
): SalaryStructure | null {
  const idx = salaryStructures.findIndex(s => s.employeeId === employeeId);
  if (idx === -1) return null;

  salaryStructures[idx] = { ...salaryStructures[idx], ...updates };
  return salaryStructures[idx];
}

export function updateSalaryComponent(
  employeeId: string,
  componentId: string,
  updates: Partial<SalaryComponent>
): SalaryStructure | null {
  const structure = salaryStructures.find(s => s.employeeId === employeeId);
  if (!structure) return null;

  const compIdx = structure.components.findIndex(c => c.id === componentId);
  if (compIdx === -1) return null;

  structure.components[compIdx] = { ...structure.components[compIdx], ...updates };
  return structure;
}

export function addSalaryComponent(
  employeeId: string,
  component: Omit<SalaryComponent, 'id'>
): SalaryStructure | null {
  const structure = salaryStructures.find(s => s.employeeId === employeeId);
  if (!structure) return null;

  const newComp: SalaryComponent = {
    ...component,
    id: `comp-custom-${Date.now()}`,
  };

  // Insert before Fixed Allowance
  const faIdx = structure.components.findIndex(c => c.isFixedAllowance);
  if (faIdx >= 0) {
    structure.components.splice(faIdx, 0, newComp);
  } else {
    structure.components.push(newComp);
  }

  return structure;
}

export function removeSalaryComponent(
  employeeId: string,
  componentId: string
): SalaryStructure | null {
  const structure = salaryStructures.find(s => s.employeeId === employeeId);
  if (!structure) return null;

  // Don't allow removing Fixed Allowance
  const comp = structure.components.find(c => c.id === componentId);
  if (comp?.isFixedAllowance) return structure;

  structure.components = structure.components.filter(c => c.id !== componentId);
  return structure;
}
