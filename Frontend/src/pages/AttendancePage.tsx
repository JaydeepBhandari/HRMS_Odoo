import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getAttendanceByDate,
  getAttendanceByEmployeeAndMonth,
  getMonthSummary,
  checkIn,
} from '../services/attendanceService';
import { getEmployees } from '../services/employeeService';
import { Search, ChevronLeft, ChevronRight, Clock, CalendarIcon, CheckCircle2, ArrowRight, CalendarOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatusBadge } from '../components/ui/StatusBadge';


export default function AttendancePage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminAttendanceView /> : <EmployeeAttendanceView />;
}

function AdminAttendanceView() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const allEmployees = getEmployees();
  const records = useMemo(() => {
    if (viewMode === 'day') {
      return getAttendanceByDate(selectedDate);
    }
    const start = new Date(selectedDate);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates.flatMap(date => getAttendanceByDate(date));
  }, [selectedDate, viewMode]);

  const tableData = useMemo(() => {
    return allEmployees
      .filter(emp => {
        if (!search) return true;
        const q = search.toLowerCase();
        return emp.firstName.toLowerCase().includes(q) ||
               emp.lastName.toLowerCase().includes(q) ||
               emp.department.toLowerCase().includes(q);
      })
      .map(emp => {
        const record = records.find(r => r.employeeId === emp.id && r.date === selectedDate);
        return { employee: emp, record };
      });
  }, [allEmployees, records, selectedDate, search]);

  const navigateDate = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const setToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white tracking-tight">Attendance</h1>

      {/* Controls */}
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-900 border border-surface-700 rounded-lg overflow-hidden">
            <button onClick={() => navigateDate(-1)} className="p-2 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-sm text-white focus:ring-0 w-36 px-2 text-center"
            />
            <button onClick={() => navigateDate(1)} className="p-2 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
          
          <button onClick={setToday} className="btn-secondary h-9 text-xs px-3">
            Today
          </button>

          {/* Day/Week toggle */}
          <div className="hidden sm:flex bg-surface-900 rounded-lg p-1 border border-surface-700">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'day' ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200'}`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'week' ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200'}`}
            >
              Week
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-900 border border-surface-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-800 border border-surface-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-surface-900/50 border-b border-surface-700">
              <tr>
                <th className="text-left py-3.5 px-5 font-semibold text-surface-400">Employee</th>
                <th className="text-left py-3.5 px-5 font-semibold text-surface-400">Status</th>
                <th className="text-left py-3.5 px-5 font-semibold text-surface-400">Check In</th>
                <th className="text-left py-3.5 px-5 font-semibold text-surface-400">Check Out</th>
                <th className="text-right py-3.5 px-5 font-semibold text-surface-400">Work Hours</th>
                <th className="text-right py-3.5 px-5 font-semibold text-surface-400">Extra Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {tableData.map(({ employee, record }, idx) => (
                <tr key={employee.id} className={`hover:bg-surface-700/30 transition-colors ${idx % 2 === 0 ? 'bg-surface-800' : 'bg-surface-800/40'}`}>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-700 flex items-center justify-center text-xs font-semibold text-white border border-surface-600">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                      <div>
                        <div className="text-white font-medium">{employee.firstName} {employee.lastName}</div>
                        <div className="text-xs text-surface-400">{employee.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <StatusBadge status={record?.status || 'absent'} />
                  </td>
                  <td className="py-3 px-5 text-surface-300 font-mono text-xs">
                    {record?.checkIn ? formatTime(record.checkIn) : '-'}
                  </td>
                  <td className="py-3 px-5 text-surface-300 font-mono text-xs">
                    {record?.checkOut ? formatTime(record.checkOut) : '-'}
                  </td>
                  <td className="py-3 px-5 text-right font-mono text-white">
                    {record?.workHours ? formatDuration(record.workHours) : '-'}
                  </td>
                  <td className="py-3 px-5 text-right font-mono text-xs">
                    {record?.extraHours && record.extraHours > 0 ? (
                      <span className="text-accent-400 font-medium">+{formatDuration(record.extraHours)}</span>
                    ) : (
                      <span className="text-surface-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {tableData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-surface-500 bg-surface-800">
                    <div className="flex flex-col items-center justify-center">
                      <Search size={32} className="mb-3 opacity-30" />
                      <p>No attendance records found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EmployeeAttendanceView() {
  const { currentUser } = useAuth();
  const employeeId = currentUser!.employee.id;
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [, setForceUpdate] = useState(0);

  const summary = getMonthSummary(employeeId, year, month);
  const records = getAttendanceByEmployeeAndMonth(employeeId, year, month);

  // Check if today needs a check-in
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date === todayStr);
  const needsCheckIn = (!todayRecord || todayRecord.status === 'absent') && year === now.getFullYear() && month === now.getMonth() + 1;

  const handleCheckIn = () => {
    checkIn(employeeId);
    toast.success('Checked in successfully');
    setForceUpdate(n => n + 1);
  };

  const navigateMonth = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m);
    setYear(y);
  };

  const setThisMonth = () => {
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
  };

  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {needsCheckIn && (
        <div className="bg-accent-500/10 border border-accent-500/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-accent-400">
            <Clock size={20} />
            <span className="font-medium text-sm">You haven't checked in yet today.</span>
          </div>
          <button onClick={handleCheckIn} className="btn-primary h-9 text-xs gap-2">
            Check In <ArrowRight size={14} />
          </button>
        </div>
      )}

      <h1 className="text-2xl font-bold text-white tracking-tight">My Attendance</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard 
          label="Days Present" 
          value={summary.daysPresent} 
          icon={<CheckCircle2 size={24} className="text-[#22c55e]" />} 
        />
        <SummaryCard 
          label="Leave Days" 
          value={summary.leavesCount} 
          icon={<CalendarOff size={24} className="text-[#3b82f6]" />} 
        />
        <SummaryCard 
          label="Working Days" 
          value={summary.totalWorkingDays} 
          icon={<CalendarIcon size={24} className="text-surface-400" />} 
        />
      </div>

      {/* Controls */}
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-900 border border-surface-700 rounded-lg overflow-hidden">
            <button onClick={() => navigateMonth(-1)} className="p-2 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-white font-medium min-w-[140px] text-center text-sm">{monthName}</span>
            <button onClick={() => navigateMonth(1)} className="p-2 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
          <button onClick={setThisMonth} className="btn-secondary h-9 text-xs px-3">
            This Month
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-800 border border-surface-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-surface-900/50 border-b border-surface-700">
              <tr>
                <th className="text-left py-3.5 px-5 font-semibold text-surface-400">Date</th>
                <th className="text-left py-3.5 px-5 font-semibold text-surface-400">Status</th>
                <th className="text-left py-3.5 px-5 font-semibold text-surface-400">Check In</th>
                <th className="text-left py-3.5 px-5 font-semibold text-surface-400">Check Out</th>
                <th className="text-right py-3.5 px-5 font-semibold text-surface-400">Work Hours</th>
                <th className="text-right py-3.5 px-5 font-semibold text-surface-400">Extra Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {records.map((record, idx) => (
                <tr key={record.id} className={`hover:bg-surface-700/30 transition-colors ${idx % 2 === 0 ? 'bg-surface-800' : 'bg-surface-800/40'}`}>
                  <td className="py-3 px-5 text-surface-200">
                    <div className="flex items-center gap-2">
                      <span className="text-surface-400 w-8">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="font-medium">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="py-3 px-5 text-surface-300 font-mono text-xs">
                    {record.checkIn ? formatTime(record.checkIn) : '-'}
                  </td>
                  <td className="py-3 px-5 text-surface-300 font-mono text-xs">
                    {record.checkOut ? formatTime(record.checkOut) : '-'}
                  </td>
                  <td className="py-3 px-5 text-right font-mono text-white">
                    {record.workHours ? formatDuration(record.workHours) : '-'}
                  </td>
                  <td className="py-3 px-5 text-right font-mono text-xs">
                    {record.extraHours && record.extraHours > 0 ? (
                      <span className="text-accent-400 font-medium">+{formatDuration(record.extraHours)}</span>
                    ) : (
                      <span className="text-surface-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-surface-500 bg-surface-800">
                    <div className="flex flex-col items-center justify-center">
                      <CalendarIcon size={32} className="mb-3 opacity-30" />
                      <p>No attendance records for this month.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function SummaryCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-5 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className="w-12 h-12 rounded-full bg-surface-900 border border-surface-700 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '-';
  }
}

function formatDuration(hoursDecimal: number): string {
  const h = Math.floor(hoursDecimal);
  const m = Math.round((hoursDecimal - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
