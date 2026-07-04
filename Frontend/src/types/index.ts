
export type UserRole = 'employee' | 'admin';

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave';

export type LeaveType = 'paid-time-off' | 'sick-leave' | 'unpaid-leave';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type WageType = 'monthly' | 'yearly';

export type SalaryComputationType = 'fixed' | 'percentage';

export type EmployeeStatusDot = 'green' | 'yellow' | 'red';

// ---- Core Entities ----

export interface Company {
  id: string;
  code: string; // e.g. "0E"
  name: string;
  logoUrl?: string;
}

export interface Employee {
  id: string;
  loginId: string;
  role: UserRole;
  companyId: string;

  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
  aboutMe?: string;
  skills: string[];
  certifications: string[];
  interests: string[];

  // Work Info
  department: string;
  title: string;
  managerId?: string;

  // Private Info
  dateOfBirth: string; // ISO date
  currentAddress: string;
  permanentAddress: string;
  personalEmail?: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  panNumber: string;
  aadharNumber: string;
  bloodGroup: string;
  dateOfJoining: string; // ISO date

  // Password (mock)
  password: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // ISO date (YYYY-MM-DD)
  checkIn?: string; // ISO datetime
  checkOut?: string; // ISO datetime
  status: AttendanceStatus;
  workHours?: number; // decimal hours
  extraHours?: number; // hours over standard 8h
}

export interface SalaryComponent {
  id: string;
  name: string;
  computationType: SalaryComputationType;
  /** If percentage, what is the base? 'wage' or another component's id */
  percentageBase?: 'wage' | string;
  /** The percentage value (e.g. 50 means 50%) */
  percentageValue?: number;
  /** If fixed, the fixed amount */
  fixedAmount?: number;
  /** Computed amount (calculated at runtime) */
  computedAmount?: number;
  /** Is this the special Fixed Allowance (auto-computed remainder)? */
  isFixedAllowance?: boolean;
  /** Order for display */
  order: number;
}

export interface SalaryStructure {
  employeeId: string;
  wageType: WageType;
  totalWage: number;
  components: SalaryComponent[];
  pfContributionRate: number; // percentage, e.g. 12
  pfAmount?: number; // computed
  professionalTax: number; // flat amount
  workingDaysPerWeek: number;
  standardWorkHoursPerDay: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string; // ISO date
  endDate: string; // ISO date
  daysRequested: number;
  status: LeaveStatus;
  remarks?: string;
  attachmentName?: string; // filename for sick leave docs
  attachmentUrl?: string;
  adminComment?: string;
  createdAt: string; // ISO datetime
}

export interface LeaveAllocation {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  daysAllocated: number;
  daysUsed: number;
  year: number;
}

export interface ActivityItem {
  id: string;
  employeeId: string;
  message: string;
  timestamp: string; // ISO datetime
  type: 'leave-approved' | 'leave-rejected' | 'leave-submitted' | 'check-in' | 'check-out' | 'profile-updated';
}

// ---- Auth ----

export interface AuthUser {
  employee: Employee;
  company: Company;
  isAdmin: boolean;
}

// ---- Leave Type Labels ----

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  'paid-time-off': 'Paid Time Off',
  'sick-leave': 'Sick Leave',
  'unpaid-leave': 'Unpaid Leave',
};
