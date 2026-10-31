import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { Layers, Shield, Briefcase, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'manager' | 'employee') => {
    try {
      setLoading(true);
      setError(null);
      await switchDemoUser(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Failed to log in with demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle backdrop glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-2">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Synapse Enterprise AI
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Cross-departmental intelligence, workflow orchestration, and predictive decision support powered by Google Gemini.
          </p>
        </div>

        {/* Quick Demo Role Logins */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block px-1">
            One-Click Demo Credentials:
          </span>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-indigo-950/80 text-indigo-400 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Sarah Lin</div>
                  <div className="text-[11px] text-slate-400 font-mono">Executive Admin · Operations</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('manager')}
              disabled={loading}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-indigo-950/80 text-indigo-400 flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Marcus Vance</div>
                  <div className="text-[11px] text-slate-400 font-mono">Department Lead · Engineering</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('employee')}
              disabled={loading}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-indigo-950/80 text-indigo-400 flex items-center justify-center">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Elena Rostova</div>
                  <div className="text-[11px] text-slate-400 font-mono">Staff Analyst · Product</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@synapse.ai"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm font-mono uppercase tracking-wider"
            >
              {loading ? 'Authenticating...' : 'Sign In to Enterprise Workspace'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Need an enterprise account?{' '}
            <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
              Register New Member
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
