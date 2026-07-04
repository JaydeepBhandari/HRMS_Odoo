/**
 * Login ID Generator
 * 
 * Format: [CompanyCode][First2OfFirst][First2OfLast][YearOfJoining][Serial0001]
 * 
 * Example: 0E30SC20240001
 *   0E    = company code
 *   30SC  = first 2 of "30hn" + first 2 of "SChmidt" (not exactly — uses uppercase)
 *   2024  = year of joining
 *   0001  = serial number for that year, zero-padded 4 digits
 */

// Keep a map of how many employees joined per company per year (for serial)
const serialCounters: Record<string, number> = {};

/**
 * Generate a Login ID for a new employee.
 */
export function generateLoginId(
  companyCode: string,
  firstName: string,
  lastName: string,
  yearOfJoining: number,
  existingSerialCount?: number
): string {
  const first2First = firstName.substring(0, 2).toUpperCase();
  const first2Last = lastName.substring(0, 2).toUpperCase();
  const yearStr = yearOfJoining.toString();

  // Determine serial number
  const key = `${companyCode}-${yearOfJoining}`;
  if (existingSerialCount !== undefined) {
    serialCounters[key] = existingSerialCount;
  }
  if (!serialCounters[key]) {
    serialCounters[key] = 0;
  }
  serialCounters[key]++;
  const serial = serialCounters[key].toString().padStart(4, '0');

  return `${companyCode}${first2First}${first2Last}${yearStr}${serial}`;
}

/**
 * Initialize serial counters from existing employee data.
 * Call this once when the app boots with mock data.
 */
export function initializeSerialCounters(
  employees: Array<{ loginId: string; companyCode: string; dateOfJoining: string }>
): void {
  // Clear existing counters
  Object.keys(serialCounters).forEach(k => delete serialCounters[k]);

  for (const emp of employees) {
    const year = new Date(emp.dateOfJoining).getFullYear();
    const key = `${emp.companyCode}-${year}`;
    if (!serialCounters[key]) {
      serialCounters[key] = 0;
    }
    serialCounters[key]++;
  }
}

/**
 * Generate a random temporary password.
 */
export function generateTempPassword(length: number = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
