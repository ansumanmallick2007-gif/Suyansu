import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import {
  Layers,
  Sparkles,
  LogOut,
  ChevronDown,
  Shield,
  Briefcase,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleRoleSwitch = async (role: 'admin' | 'manager' | 'employee') => {
    try {
      setSwitching(true);
      await switchDemoUser(role);
      setProfileOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Department Lead',
    employee: 'Staff Analyst'
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 text-base font-bold tracking-tight text-white hover:text-indigo-300 transition-colors whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <span>Synapse Enterprise AI</span>
          </NavLink>
        </div>

        {/* Zone 2: 4-5 single-line clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-white font-semibold' : 'hover:text-slate-200'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/documents"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-white font-semibold' : 'hover:text-slate-200'
              }`
            }
          >
            Documents
          </NavLink>
          <NavLink
            to="/workflows"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-white font-semibold' : 'hover:text-slate-200'
              }`
            }
          >
            Workflows
          </NavLink>
          <NavLink
            to="/copilot"
            className={({ isActive }) =>
              `flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-indigo-400 font-semibold' : 'hover:text-indigo-300'
              }`
            }
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Copilot</span>
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-white font-semibold' : 'hover:text-slate-200'
              }`
            }
          >
            Reports
          </NavLink>
        </nav>

        {/* Zone 3: 1 primary action / User profile trigger */}
        <div className="relative shrink-0 flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600 transition-all text-left whitespace-nowrap shrink-0"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-500/40"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200 uppercase">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-xs leading-tight">
                  <div className="font-semibold text-slate-200">{user.name}</div>
                  <div className="text-slate-400 font-mono capitalize">
                    {user.department} · {roleLabels[user.role] || user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="font-semibold text-slate-200 text-sm">{user.name}</p>
                    <p className="text-slate-400 font-mono">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                      <span className="capitalize">{user.department}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{roleLabels[user.role] || user.role}</span>
                    </div>
                  </div>

                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                      Quick Role Switch (Demo)
                    </p>
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      disabled={switching}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-left ${
                        user.role === 'admin' ? 'bg-indigo-950/60 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Sarah Lin (Admin)</span>
                      </span>
                      {user.role === 'admin' && <span className="text-[10px] text-indigo-400 font-mono">Active</span>}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('manager')}
                      disabled={switching}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-left ${
                        user.role === 'manager' ? 'bg-indigo-950/60 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Marcus Vance (Manager)</span>
                      </span>
                      {user.role === 'manager' && <span className="text-[10px] text-indigo-400 font-mono">Active</span>}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('employee')}
                      disabled={switching}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-left ${
                        user.role === 'employee' ? 'bg-indigo-950/60 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Elena Rostova (Staff)</span>
                      </span>
                      {user.role === 'employee' && <span className="text-[10px] text-indigo-400 font-mono">Active</span>}
                    </button>
                  </div>

                  <div className="px-2 pt-1">
                    <NavLink
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="block px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                    >
                      Organization Settings & RBAC
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};
