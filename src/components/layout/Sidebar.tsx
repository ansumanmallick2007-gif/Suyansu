import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Kanban,
  Sparkles,
  BarChart3,
  Settings,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Document Intelligence', path: '/documents', icon: FileText },
    { label: 'Workflows & Tasks', path: '/workflows', icon: Kanban },
    { label: 'Enterprise Copilot', path: '/copilot', icon: Sparkles },
    { label: 'Executive Briefings', path: '/reports', icon: BarChart3 },
    { label: 'Governance & Settings', path: '/settings', icon: Settings }
  ];

  const departmentColors: Record<string, string> = {
    finance: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    hr: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    engineering: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
    operations: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
    product: 'text-purple-400 border-purple-500/30 bg-purple-950/20'
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-3.5rem)]">
      {/* Current Tenant / Organization */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-200 tracking-wide truncate">
              Global Enterprise
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Tenant ID: <span className="tabular-nums">SYN-2026</span>
            </p>
          </div>
        </div>

        {/* User Department & Role Context */}
        {user && (
          <div className="mt-3 pt-3 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Department</span>
              <span className="capitalize font-semibold text-slate-200">{user.department}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
              <span>Access Level</span>
              <span className="uppercase font-semibold text-indigo-400">{user.role}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Grounding Badge */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 text-slate-300 font-medium mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Gemini Intelligence Core</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-normal">
          Multi-tenant RAG pipeline active with row-level tenant boundary isolation.
        </p>
      </div>
    </aside>
  );
};
