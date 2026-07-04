
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, DevRoleSwitcher } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import AttendancePage from './pages/AttendancePage';
import TimeOffPage from './pages/TimeOffPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />

          {/* Protected routes with layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeProfilePage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/time-off" element={<TimeOffPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/my-profile" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/sign-in" replace />} />
          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>

        {/* Dev role switcher (always visible when authenticated) */}
        <DevRoleSwitcher />
      </BrowserRouter>
    </AuthProvider>
  );
}
