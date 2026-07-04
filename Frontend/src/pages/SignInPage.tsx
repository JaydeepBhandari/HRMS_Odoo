import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Shield, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from '../components/ui/Logo';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleDemoLogin(role: 'employee' | 'admin') {
    const demoEmail = role === 'admin' ? 'admin@novatech.com' : 'employee@novatech.com';
    const demoPassword = role === 'admin' ? 'admin123' : 'employee123';
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    const result = await login(email, password);
    if (result.success) {
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 shadow-2xl animate-fade-in">
        
        <div className="flex flex-col items-center mb-8">
          <div className="mb-6">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold text-white mt-2">Welcome back</h1>
          <p className="text-sm text-surface-400 mt-1.5">Sign in to your HRMS account</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-surface-300 uppercase tracking-wider">
              Login ID or Email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              disabled={isLoading}
              className="w-full h-10 bg-surface-900 border border-white/15 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 disabled:opacity-50 transition-colors mt-1.5"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-medium text-surface-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                disabled={isLoading}
                className="w-full h-10 bg-surface-900 border border-white/15 rounded-lg pl-3 pr-10 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 disabled:opacity-50 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 disabled:opacity-50 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm pt-1">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-accent-600 hover:bg-accent-500 active:bg-accent-700 text-white font-medium rounded-lg mt-2 transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-xs text-center text-surface-400 mb-4">Quick access for demo</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin('employee')}
              disabled={isLoading}
              className="h-10 border border-surface-600 hover:border-surface-500 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <User size={16} className="text-surface-400" />
              Employee
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Shield size={16} className="text-indigo-200" />
              Admin
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-surface-400">
        New company?{' '}
        <Link to="/sign-up" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
          Register here
        </Link>
      </div>
    </div>
  );
}
