/**
 * Employees Page — Directory/list view of all employees
 * Searchable, filterable by department
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEmployees, searchEmployees, getDepartments } from '../services/employeeService';
import { getEmployeeStatus } from '../services/attendanceService';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const departments = getDepartments();

  const employees = useMemo(() => {
    let result = search ? searchEmployees(search) : getEmployees();
    if (departmentFilter) {
      result = result.filter(e => e.department === departmentFilter);
    }
    return result;
  }, [search, departmentFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Employees</h1>
        <div className="flex items-center gap-3">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="input-base w-44 text-sm"
          >
            <option value="">All departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative w-64">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-10 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left py-3 px-4">Employee</th>
              <th className="text-left py-3 px-4">Login ID</th>
              <th className="text-left py-3 px-4">Department</th>
              <th className="text-left py-3 px-4">Title</th>
              <th className="text-center py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Email</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => {
              const status = getEmployeeStatus(emp.id);
              const statusColor = status === 'present' ? 'bg-status-green' : status === 'on-leave' ? 'bg-status-yellow' : 'bg-status-red';

              return (
                <tr
                  key={emp.id}
                  className="table-row cursor-pointer"
                  onClick={() => navigate(`/employees/${emp.id}`)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-700 flex items-center justify-center text-xs font-medium text-surface-300 border border-surface-600 shrink-0">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div className="font-medium text-surface-200">
                        {emp.firstName} {emp.lastName}
                        {emp.role === 'admin' && (
                          <span className="ml-2 badge bg-accent-600/15 text-accent-400 border border-accent-600/20 text-[10px]">Admin</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-surface-400 font-mono text-xs">{emp.loginId}</td>
                  <td className="py-3 px-4 text-surface-400">{emp.department}</td>
                  <td className="py-3 px-4 text-surface-400">{emp.title}</td>
                  <td className="py-3 px-4 text-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusColor} mx-auto`} />
                  </td>
                  <td className="py-3 px-4 text-surface-400 text-xs">{emp.email}</td>
                </tr>
              );
            })}
            {employees.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-surface-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
