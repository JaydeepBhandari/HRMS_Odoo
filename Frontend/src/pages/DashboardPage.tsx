import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEmployees, searchEmployees } from '../services/employeeService';
import { getEmployeeStatus, checkIn, checkOut, getAllEmployeesTodayAttendance, syncCheckIn, syncCheckOut, fetchTodayAttendanceForAdmin } from '../services/attendanceService';
import { getActivities } from '../services/leaveService';
import { formatDate } from '../utils/formatters';
import type { Employee, EmployeeStatusDot } from '../types';
import { Users, UserCheck, CalendarOff, UserX, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';

function getStatusDot(employeeId: string): EmployeeStatusDot {
  const status = getEmployeeStatus(employeeId);
  if (status === 'present') return 'green';
  if (status === 'on-leave') return 'yellow';
  return 'red';
}

const statusColorMap: Record<EmployeeStatusDot, string> = {
  green: 'bg-[#22c55e]',
  yellow: 'bg-[#eab308]',
  red: 'bg-[#ef4444]',
};

// Helper for avatar colors
function getAvatarColor(name: string) {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500',
    'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
    'bg-pink-500', 'bg-rose-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function DashboardPage() {
  const { currentUser, isAdmin } = useAuth();
  const [dummy, setDummy] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setDummy(d => d + 1);
    window.addEventListener('attendance-updated', handleUpdate);
    return () => window.removeEventListener('attendance-updated', handleUpdate);
  }, []);

  if (!currentUser) return null;
  return isAdmin ? <AdminDashboard key={`admin-${dummy}`} /> : <EmployeeDashboard key={`emp-${dummy}`} />;
}


function EmployeeDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const employees = getEmployees();
  const myActivities = getActivities(currentUser!.employee.id).slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {currentUser!.employee.firstName}!</h1>
        <p className="text-surface-400 mt-1">Here is what is happening today.</p>
      </div>

      <CheckInOutPanel />

      {/* Employee Card Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Team Directory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {employees.map((emp, idx) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onClick={() => navigate(`/employees/${emp.id}`)}
              style={{ animationDelay: `${idx * 50}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="bg-surface-800 rounded-xl p-5 border border-surface-700 space-y-4 shadow-sm">
          {myActivities.length === 0 ? (
            <p className="text-surface-500 text-sm">No recent activity.</p>
          ) : (
            myActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  activity.type === 'leave-approved' ? 'bg-[#22c55e]' :
                  activity.type === 'leave-rejected' ? 'bg-[#ef4444]' :
                  activity.type === 'leave-submitted' ? 'bg-[#eab308]' :
                  'bg-accent-400'
                }`} />
                <div className="flex-1">
                  <p className="text-surface-200">{activity.message}</p>
                  <span className="text-xs text-surface-400">
                    {formatDate(activity.timestamp, 'medium')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


function AdminDashboard({ key }: { key?: string }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [force, setForce] = useState(0);

  useEffect(() => {
    fetchTodayAttendanceForAdmin().then(() => setForce(f => f + 1));
    const interval = setInterval(() => {
      fetchTodayAttendanceForAdmin().then(() => setForce(f => f + 1));
    }, 10000); // sync every 10 seconds
    
    const handleUpdate = () => {
      fetchTodayAttendanceForAdmin().then(() => setForce(f => f + 1));
    };
    window.addEventListener('attendance-updated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('attendance-updated', handleUpdate);
    };
  }, []);

  const allEmployees = useMemo(() =>
    search ? searchEmployees(search) : getEmployees(),
    [search]
  );
  
  const todayAttendance = getAllEmployeesTodayAttendance();
  const presentCount = todayAttendance.filter(a => a.record?.status === 'present').length;
  const onLeaveCount = todayAttendance.filter(a => a.record?.status === 'leave').length;
  // Absent = total employees - present - on leave (roughly)
  const absentCount = getEmployees().length - presentCount - onLeaveCount;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {currentUser!.employee.firstName}!</h1>
        <p className="text-surface-400 mt-1">Here is your administrator overview.</p>
      </div>
      
      <CheckInOutPanel />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Employees"
          value={getEmployees().length}
          icon={<Users size={20} />}
          color="accent"
        />
        <SummaryCard
          label="Present Today"
          value={presentCount}
          icon={<UserCheck size={20} />}
          color="green"
        />
        <SummaryCard
          label="On Leave"
          value={onLeaveCount}
          icon={<CalendarOff size={20} />}
          color="yellow"
        />
        <SummaryCard
          label="Absent"
          value={absentCount}
          icon={<UserX size={20} />}
          color="red"
        />
      </div>

      {/* Search + Employee List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-white">Employees Directory</h2>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface-900 border border-surface-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {allEmployees.map((emp, idx) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onClick={() => navigate(`/employees/${emp.id}`)}
              style={{ animationDelay: `${idx * 50}ms` }}
            />
          ))}
          {allEmployees.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-surface-500 bg-surface-800 rounded-xl border border-surface-700 border-dashed">
              <Search size={32} className="mb-3 opacity-50" />
              <p>No employees match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function CheckInOutPanel() {
  const { currentUser } = useAuth();
  const [now, setNow] = useState(new Date());
  const [checkedIn, setCheckedIn] = useState(() => getEmployeeStatus(currentUser!.employee.id) === 'present');
  const [checkedOut, setCheckedOut] = useState(false); // mock

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    await syncCheckIn(currentUser!.employee.id);
    setCheckedIn(true);
    window.dispatchEvent(new Event('attendance-updated'));
    toast.success('Checked in successfully');
  };

  const handleCheckOut = async () => {
    await syncCheckOut(currentUser!.employee.id);
    setCheckedOut(true);
    window.dispatchEvent(new Event('attendance-updated'));
    toast.success('Checked out successfully');
  };

  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateString = formatDate(now, 'medium');

  return (
    <div className="bg-surface-800 rounded-xl border border-surface-700 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-accent-600/10 text-accent-500 flex items-center justify-center shrink-0">
          <Clock size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{timeString}</h2>
          <p className="text-sm text-surface-400 mt-1">{dateString}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!checkedIn ? (
          <button onClick={handleCheckIn} className="h-11 px-6 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            Check In
          </button>
        ) : !checkedOut ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-surface-400 hidden sm:inline-block">
              Checked in today
            </span>
            <button onClick={handleCheckOut} className="h-11 px-6 bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium rounded-lg transition-colors flex items-center gap-2">
              Check Out
            </button>
          </div>
        ) : (
          <div className="h-11 px-6 bg-surface-700 text-surface-300 font-medium rounded-lg flex items-center gap-2 border border-surface-600">
             Checked Out
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeeCard({ employee, onClick, style }: { employee: Employee; onClick: () => void; style?: React.CSSProperties }) {
  const statusDot = getStatusDot(employee.id);
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  const avatarColor = getAvatarColor(`${employee.firstName} ${employee.lastName}`);

  return (
    <button
      onClick={onClick}
      className="bg-surface-800 border border-surface-700 rounded-xl p-5 text-left relative animate-fade-in w-full transition-all duration-200 hover:-translate-y-1 hover:border-surface-600 shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
      style={style}
    >
      {/* Status dot */}
      <div 
        className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full shadow-sm ${statusColorMap[statusDot]}`} 
        title={statusDot}
      />

      <div className="flex flex-col items-center text-center gap-3">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold text-white shadow-sm ${avatarColor}`}>
          {initials}
        </div>
        <div>
          <div className="font-semibold text-white text-base">
            {employee.firstName} {employee.lastName}
          </div>
          <div className="text-sm text-accent-400 mt-0.5">{employee.title}</div>
          <div className="text-xs text-surface-400 mt-1.5">{employee.department}</div>
        </div>
      </div>
    </button>
  );
}

function SummaryCard({ label, value, icon, color }: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'accent' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    accent: 'text-accent-400 bg-accent-500/10 border-accent-500/20',
    green: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20',
    yellow: 'text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20',
    red: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20',
  };

  return (
    <div className="bg-surface-800 rounded-xl border border-surface-700 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-surface-400">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
