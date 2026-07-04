import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/ui/Logo';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.companyName.trim()) errs.companyName = 'Company name is required.';
    if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!formData.email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format.';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);

    const result = await signUp({
      companyName: formData.companyName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    if (result.success) {
      const loginResult = await login(formData.email, formData.password);
      if (loginResult.success) {
        navigate('/dashboard');
      } else {
        setErrors({ email: 'Registration succeeded, but login failed.' });
      }
    } else {
      setErrors({ email: result.error || 'Registration failed' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#020617]">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-6">
            <Logo className="scale-110" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-surface-400 mt-1">Set up your HRMS company workspace</p>
        </div>

        {/* Form Card */}
        <div className="bg-surface-800 border border-surface-700 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={e => handleChange('companyName', e.target.value)}
                placeholder="NovaTech Solutions"
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                disabled={isLoading}
              />
              {errors.companyName && <p className="text-xs text-[#ef4444] mt-1.5 font-medium">{errors.companyName}</p>}
            </div>

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                  placeholder="Ananya"
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                  disabled={isLoading}
                />
                {errors.firstName && <p className="text-xs text-[#ef4444] mt-1.5 font-medium">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                  placeholder="Sharma"
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                  disabled={isLoading}
                />
                {errors.lastName && <p className="text-xs text-[#ef4444] mt-1.5 font-medium">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Work Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="ananya@company.com"
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                disabled={isLoading}
              />
              {errors.email && <p className="text-xs text-[#ef4444] mt-1.5 font-medium">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                disabled={isLoading}
              />
              {errors.phone && <p className="text-xs text-[#ef4444] mt-1.5 font-medium">{errors.phone}</p>}
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                  disabled={isLoading}
                />
                {errors.password && <p className="text-xs text-[#ef4444] mt-1.5 font-medium">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                  disabled={isLoading}
                />
                {errors.confirmPassword && <p className="text-xs text-[#ef4444] mt-1.5 font-medium">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary w-full h-11 mt-4 shadow-sm" disabled={isLoading}>
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Sign In link */}
        <p className="text-center mt-6 text-sm text-surface-400">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
