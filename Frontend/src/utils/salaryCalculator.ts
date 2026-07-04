/**
 * Salary Calculator
 * 
 * Handles the full salary computation logic:
 * - Fixed amount components
 * - Percentage-based components (of wage or of another component)
 * - Fixed Allowance auto-computed as remainder (Wage - sum of others)
 * - Validation: sum must never exceed wage
 * - PF contribution computation
 */

import type { SalaryComponent, SalaryStructure } from '../types';

export interface SalaryComputationResult {
  components: SalaryComponent[];
  totalComputed: number;
  fixedAllowanceAmount: number;
  pfAmount: number;
  isValid: boolean;
  warning?: string;
}

/**
 * Compute all salary component amounts.
 * 
 * This handles dependency resolution:
 * 1. First compute fixed-amount components
 * 2. Then compute percentage-of-wage components
 * 3. Then compute percentage-of-other-component components (may need multiple passes)
 * 4. Finally compute Fixed Allowance as remainder
 */
export function computeSalary(structure: SalaryStructure): SalaryComputationResult {
  const { totalWage, components, pfContributionRate } = structure;
  const computed = components.map(c => ({ ...c }));

  // Build a lookup map for quick access
  const componentMap = new Map<string, SalaryComponent>();
  computed.forEach(c => componentMap.set(c.id, c));

  // Multiple passes to resolve dependencies (max 10 to prevent infinite loops)
  let changed = true;
  let passes = 0;
  const MAX_PASSES = 10;

  while (changed && passes < MAX_PASSES) {
    changed = false;
    passes++;

    for (const comp of computed) {
      if (comp.isFixedAllowance) continue; // Skip Fixed Allowance — computed last

      let newAmount: number | undefined;

      if (comp.computationType === 'fixed') {
        newAmount = comp.fixedAmount ?? 0;
      } else if (comp.computationType === 'percentage') {
        const pct = comp.percentageValue ?? 0;

        if (comp.percentageBase === 'wage') {
          newAmount = (pct / 100) * totalWage;
        } else if (comp.percentageBase) {
          // Percentage of another component
          const baseComp = componentMap.get(comp.percentageBase);
          if (baseComp && baseComp.computedAmount !== undefined) {
            newAmount = (pct / 100) * baseComp.computedAmount;
          }
        }
      }

      if (newAmount !== undefined && newAmount !== comp.computedAmount) {
        comp.computedAmount = Math.round(newAmount * 100) / 100;
        componentMap.set(comp.id, comp);
        changed = true;
      }
    }
  }

  // Sum of all non-fixed-allowance components
  const sumOthers = computed
    .filter(c => !c.isFixedAllowance)
    .reduce((sum, c) => sum + (c.computedAmount ?? 0), 0);

  // Compute Fixed Allowance = Wage - sum of others
  const fixedAllowanceAmount = Math.round((totalWage - sumOthers) * 100) / 100;

  // Set the Fixed Allowance component
  const fixedAllowanceComp = computed.find(c => c.isFixedAllowance);
  if (fixedAllowanceComp) {
    fixedAllowanceComp.computedAmount = Math.max(0, fixedAllowanceAmount);
  }

  // Total computed (including fixed allowance)
  const totalComputed = computed.reduce((sum, c) => sum + (c.computedAmount ?? 0), 0);

  // PF computation (typically on Basic Salary)
  const basicComponent = computed.find(c => c.name.toLowerCase().includes('basic'));
  const pfBase = basicComponent?.computedAmount ?? totalWage;
  const pfAmount = Math.round((pfContributionRate / 100) * pfBase * 100) / 100;

  // Validation
  const isValid = fixedAllowanceAmount >= 0;
  const warning = fixedAllowanceAmount < 0
    ? `Components exceed wage by ₹${Math.abs(fixedAllowanceAmount).toLocaleString('en-IN')}. Please reduce component values.`
    : undefined;

  return {
    components: computed,
    totalComputed: Math.round(totalComputed * 100) / 100,
    fixedAllowanceAmount,
    pfAmount,
    isValid,
    warning,
  };
}

/**
 * Create default salary components for a given wage.
 */
export function createDefaultSalaryComponents(wage: number): SalaryComponent[] {
  const basicId = 'comp-basic';
  return [
    {
      id: basicId,
      name: 'Basic Salary',
      computationType: 'percentage',
      percentageBase: 'wage',
      percentageValue: 50,
      order: 1,
    },
    {
      id: 'comp-hra',
      name: 'House Rent Allowance',
      computationType: 'percentage',
      percentageBase: basicId, // 50% of Basic
      percentageValue: 50,
      order: 2,
    },
    {
      id: 'comp-sa',
      name: 'Standard Allowance',
      computationType: 'fixed',
      fixedAmount: Math.round(wage * 0.05),
      order: 3,
    },
    {
      id: 'comp-perf',
      name: 'Performance Bonus',
      computationType: 'fixed',
      fixedAmount: Math.round(wage * 0.05),
      order: 4,
    },
    {
      id: 'comp-lta',
      name: 'Leave Travel Allowance',
      computationType: 'fixed',
      fixedAmount: Math.round(wage * 0.03),
      order: 5,
    },
    {
      id: 'comp-fa',
      name: 'Fixed Allowance',
      computationType: 'fixed',
      fixedAmount: 0,
      isFixedAllowance: true,
      order: 99,
    },
  ];
}


