import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployeeStatus } from '../../services/attendanceService';
import { User, LogOut, Menu, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Logo } from '../ui/Logo';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/employees', label: 'Employees' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/time-off', label: 'Time Off' },
];

// Helper to get consistent background colors based on name
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

export default function AppLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [dummy, setDummy] = useState(0);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    
    // Listen for check-in/out to update header color
    const handleUpdate = () => setDummy(d => d + 1);
    window.addEventListener('attendance-updated', handleUpdate);
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('attendance-updated', handleUpdate);
    };
  }, []);

  if (!currentUser) return null;

  const todayStatus = getEmployeeStatus(currentUser.employee.id);
  const statusColor =
    todayStatus === 'present' ? 'bg-status-green' :
    todayStatus === 'on-leave' ? 'bg-status-yellow' :
    'bg-status-red';

  const initials = `${currentUser.employee.firstName[0]}${currentUser.employee.lastName[0]}`.toUpperCase();
  const avatarColor = getAvatarColor(`${currentUser.employee.firstName} ${currentUser.employee.lastName}`);

  return (
    <div className="min-h-screen flex flex-col bg-[#020617]">
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } 
        }} 
      />
      {/* Top Navigation */}
      <header className="bg-surface-900 border-b border-surface-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-surface-400 hover:text-white p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Logo */}
            <div className="flex flex-1 items-center justify-center md:justify-start">
              <Logo className="scale-90 origin-left" />
            </div>

            {/* Desktop Nav Tabs */}
            <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 h-full">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative h-full flex items-center text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-accent-400'
                        : 'text-surface-400 hover:text-surface-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500 rounded-t-md" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Right side: status + avatar */}
            <div className="flex items-center gap-4 flex-1 justify-end" ref={dropdownRef}>
              
              {/* Avatar + Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white transition-transform hover:scale-105 shadow-sm"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${avatarColor}`}>
                    {initials}
                  </div>
                  {/* Status dot on avatar */}
                  <div 
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-900 ${statusColor}`} 
                    title={todayStatus} 
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-surface-800 border border-surface-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in py-1">
                    <div className="px-4 py-3 border-b border-surface-700 mb-1 bg-surface-800/50">
                      <div className="text-sm font-medium text-white truncate">
                        {currentUser.employee.firstName} {currentUser.employee.lastName}
                      </div>
                      <div className="text-xs text-surface-400 mt-0.5 truncate">
                        {currentUser.employee.email}
                      </div>
                      <div className="text-xs text-accent-400 mt-1 font-medium">
                        {currentUser.isAdmin ? 'Admin / HR' : 'Employee'}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(`/employees/${currentUser.employee.id}`);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-700 hover:text-white transition-colors flex items-center gap-3"
                    >
                      <User size={16} />
                      My Profile
                    </button>
                    
                    <div className="h-px bg-surface-700 my-1 mx-2" />
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate('/sign-in');
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-surface-700 hover:text-red-300 transition-colors flex items-center gap-3"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-800 bg-surface-900 animate-slide-in">
            <nav className="flex flex-col px-4 py-2 space-y-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-surface-800 text-accent-400'
                        : 'text-surface-400 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
