/**
 * Leave Service — Mock leave management
 */

import { leaveRequests, leaveAllocations, activities } from '../data/mockData';
import type { LeaveRequest, LeaveAllocation, LeaveType, LeaveStatus, ActivityItem } from '../types';

export function getLeaveRequests(employeeId?: string): LeaveRequest[] {
  const requests = employeeId
    ? leaveRequests.filter(r => r.employeeId === employeeId)
    : [...leaveRequests];
  return requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getLeaveRequestsByStatus(status: LeaveStatus, employeeId?: string): LeaveRequest[] {
  return getLeaveRequests(employeeId).filter(r => r.status === status);
}

export function getPendingLeaveRequests(): LeaveRequest[] {
  return leaveRequests.filter(r => r.status === 'pending')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function submitLeaveRequest(request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>): LeaveRequest {
  const newRequest: LeaveRequest = {
    ...request,
    id: `lr-${String(leaveRequests.length + 1).padStart(3, '0')}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  leaveRequests.push(newRequest);

  // Add activity
  const activity: ActivityItem = {
    id: `act-${activities.length + 1}`,
    employeeId: request.employeeId,
    message: `You submitted a leave request for ${request.startDate} to ${request.endDate}.`,
    timestamp: new Date().toISOString(),
    type: 'leave-submitted',
  };
  activities.push(activity);

  return newRequest;
}

export function approveLeave(requestId: string, adminComment?: string): LeaveRequest | null {
  const request = leaveRequests.find(r => r.id === requestId);
  if (!request) return null;

  request.status = 'approved';
  request.adminComment = adminComment;

  // Update allocation used days
  const allocation = leaveAllocations.find(
    a => a.employeeId === request.employeeId && a.leaveType === request.leaveType
  );
  if (allocation) {
    allocation.daysUsed += request.daysRequested;
  }

  // Add activity for the employee
  const activity: ActivityItem = {
    id: `act-${activities.length + 1}`,
    employeeId: request.employeeId,
    message: `Your leave request for ${request.startDate} to ${request.endDate} was approved.`,
    timestamp: new Date().toISOString(),
    type: 'leave-approved',
  };
  activities.push(activity);

  return request;
}

export function rejectLeave(requestId: string, adminComment?: string): LeaveRequest | null {
  const request = leaveRequests.find(r => r.id === requestId);
  if (!request) return null;

  request.status = 'rejected';
  request.adminComment = adminComment;

  // Add activity for the employee
  const activity: ActivityItem = {
    id: `act-${activities.length + 1}`,
    employeeId: request.employeeId,
    message: `Your leave request for ${request.startDate} to ${request.endDate} was rejected.`,
    timestamp: new Date().toISOString(),
    type: 'leave-rejected',
  };
  activities.push(activity);

  return request;
}

export function getLeaveAllocations(employeeId?: string, year?: number): LeaveAllocation[] {
  let allocs = [...leaveAllocations];
  if (employeeId) allocs = allocs.filter(a => a.employeeId === employeeId);
  if (year) allocs = allocs.filter(a => a.year === year);
  return allocs;
}

export function updateLeaveAllocation(
  allocationId: string,
  updates: { daysAllocated?: number; daysUsed?: number }
): LeaveAllocation | null {
  const allocation = leaveAllocations.find(a => a.id === allocationId);
  if (!allocation) return null;

  if (updates.daysAllocated !== undefined) allocation.daysAllocated = updates.daysAllocated;
  if (updates.daysUsed !== undefined) allocation.daysUsed = updates.daysUsed;

  return allocation;
}

export function getLeaveBalance(employeeId: string, leaveType: LeaveType): { allocated: number; used: number; available: number } {
  const allocation = leaveAllocations.find(
    a => a.employeeId === employeeId && a.leaveType === leaveType && a.year === new Date().getFullYear()
  );

  if (!allocation) return { allocated: 0, used: 0, available: 0 };

  return {
    allocated: allocation.daysAllocated,
    used: allocation.daysUsed,
    available: allocation.daysAllocated - allocation.daysUsed,
  };
}

export function getActivities(employeeId?: string): ActivityItem[] {
  const items = employeeId
    ? activities.filter(a => a.employeeId === employeeId)
    : [...activities];
  return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
