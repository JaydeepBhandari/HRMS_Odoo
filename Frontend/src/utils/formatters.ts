/**
 * Format currency in INR
 */
export function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/**
 * Format date in en-IN or standard 'MMM D, YYYY' format
 * Examples:
 * - Jan 1, 2024
 * - 01/01/2024 (short version)
 */
export function formatDate(date: string | Date, style: 'short' | 'medium' = 'medium'): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (style === 'short') {
    return d.toLocaleDateString('en-IN');
  }
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
