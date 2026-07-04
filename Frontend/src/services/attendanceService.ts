/**
 * Attendance Service — Mock attendance tracking
 */

import { attendanceRecords, employees } from '../data/mockData';
import type { AttendanceRecord } from '../types';
import { getLeaveRequests } from './leaveService';
import { api } from './apiClient';

export function getAttendanceByDate(date: string): AttendanceRecord[] {
  return attendanceRecords.filter(r => r.date === date);
}

export function getAttendanceByEmployee(employeeId: string): AttendanceRecord[] {
  return attendanceRecords
    .filter(r => r.employeeId === employeeId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getAttendanceByEmployeeAndMonth(employeeId: string, year: number, month: number): AttendanceRecord[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return attendanceRecords
    .filter(r => r.employeeId === employeeId && r.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getAttendanceByDateRange(startDate: string, endDate: string, employeeId?: string): AttendanceRecord[] {
  return attendanceRecords
    .filter(r => {
      const inRange = r.date >= startDate && r.date <= endDate;
      const matchesEmployee = employeeId ? r.employeeId === employeeId : true;
      return inRange && matchesEmployee;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function checkIn(employeeId: string): AttendanceRecord {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toISOString();

  // Find existing record for today
  let record = attendanceRecords.find(
    r => r.employeeId === employeeId && r.date === dateStr
  );

  if (record) {
    record.checkIn = timeStr;
    record.status = 'present';
  } else {
    record = {
      id: `att-${employeeId}-${dateStr}`,
      employeeId,
      date: dateStr,
      checkIn: timeStr,
      status: 'present',
    };
    attendanceRecords.push(record);
  }

  return record;
}

export function checkOut(employeeId: string): AttendanceRecord | null {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toISOString();

  const record = attendanceRecords.find(
    r => r.employeeId === employeeId && r.date === dateStr
  );

  if (!record || !record.checkIn) return null;

  record.checkOut = timeStr;
  
  // Calculate work hours
  const checkInTime = new Date(record.checkIn);
  const checkOutTime = new Date(timeStr);
  const diffMs = checkOutTime.getTime() - checkInTime.getTime();
  record.workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  record.extraHours = Math.round(Math.max(0, record.workHours - 8) * 100) / 100;

  return record;
}

export function getEmployeeStatus(employeeId: string): 'present' | 'on-leave' | 'absent' {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if present today
  const record = attendanceRecords.find(
    r => r.employeeId === employeeId && r.date === today
  );
  if (record && record.status === 'present' && !record.checkOut) {
    return 'present';
  }

  // Check if on leave today
  const leaves = getLeaveRequests(employeeId);
  const onLeave = leaves.some(r => {
    return r.status === 'approved' && today >= r.startDate && today <= r.endDate;
  });

  if (onLeave) {
    return 'on-leave';
  }

  return 'absent';
}

export function getMonthSummary(employeeId: string, year: number, month: number): {
  daysPresent: number;
  leavesCount: number;
  totalWorkingDays: number;
  halfDays: number;
  absentDays: number;
} {
  const records = getAttendanceByEmployeeAndMonth(employeeId, year, month);
  
  // Calculate total working days (weekdays) in the month
  const daysInMonth = new Date(year, month, 0).getDate();
  let totalWorkingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const day = date.getDay();
    if (day !== 0 && day !== 6) totalWorkingDays++;
  }

  const daysPresent = records.filter(r => r.status === 'present').length;
  const leavesCount = records.filter(r => r.status === 'leave').length;
  const halfDays = records.filter(r => r.status === 'half-day').length;
  const absentDays = records.filter(r => r.status === 'absent').length;

  return { daysPresent, leavesCount, totalWorkingDays, halfDays, absentDays };
}

export function getAllEmployeesTodayAttendance(): Array<{
  employee: typeof employees[0];
  record?: AttendanceRecord;
}> {
  const today = new Date().toISOString().split('T')[0];
  return employees.map(emp => ({
    employee: emp,
    record: attendanceRecords.find(r => r.employeeId === emp.id && r.date === today),
  }));
}

export async function syncCheckIn(employeeId: string): Promise<void> {
  checkIn(employeeId); // updates local mock array instantly
  try {
    await api.post('/attendance/check-in');
  } catch (err) {
    console.error('Failed to sync check-in', err);
  }
}

export async function syncCheckOut(employeeId: string): Promise<void> {
  checkOut(employeeId);
  try {
    await api.post('/attendance/check-out');
  } catch (err) {
    console.error('Failed to sync check-out', err);
  }
}

export async function fetchTodayAttendanceForAdmin(): Promise<void> {
  try {
    const res = await api.get<{success: boolean, data: any[]}>('/attendance/today');
    if (res && res.success && res.data) {
      const today = new Date().toISOString().split('T')[0];
      for (const record of res.data) {
        const empId = typeof record.employee === 'object' ? record.employee._id : record.employee;
        let local = attendanceRecords.find(r => r.employeeId === empId && r.date === today);
        if (!local) {
          local = {
            id: record._id,
            employeeId: empId,
            date: today,
            status: record.status ? record.status.toLowerCase() as any : 'absent',
            checkIn: record.checkIn,
            checkOut: record.checkOut,
          };
          attendanceRecords.push(local);
        } else {
          local.checkIn = record.checkIn;
          local.checkOut = record.checkOut;
          if (record.status) {
            local.status = record.status.toLowerCase() as any;
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch admin attendance', err);
  }
}
