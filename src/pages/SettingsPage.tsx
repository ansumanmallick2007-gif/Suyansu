import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auditApi } from '../services/api';
import { AuditLog } from '../types';
import { AuditLogTable } from '../components/audit/AuditLogTable';
import {
  Shield,
  User,
  Key,
  CheckCircle2,
  Lock,
  Building,
  Server,
  Cpu,
  RefreshCw
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const loadAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await auditApi.getLogs(100);
      setLogs(res.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
          <span>Enterprise Governance</span>
          <span aria-hidden="true">·</span>
          <span>Access Control & Security</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Governance, RBAC & System Architecture
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Role-based permissions, cryptographic audit trails, and multi-tenant operational security.
        </p>
      </div>

      {/* Grid: User Profile & Security Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Identity Profile */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Authenticated Member Identity
            </h3>
            <span className="text-xs font-mono text-indigo-400 uppercase font-semibold">
              {user?.role}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-indigo-500/40 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg font-bold">
                {user?.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
              <p className="text-xs text-slate-400 font-mono truncate">{user?.email}</p>
              <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="capitalize">Department: {user?.department}</span>
                <span aria-hidden="true">·</span>
                <span>Active Session</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">JWT Expiration</span>
              <span className="font-semibold text-slate-200">24 Hours</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Password Hashing</span>
              <span className="font-semibold text-slate-200">Bcrypt (12 rounds)</span>
            </div>
          </div>
        </div>

        {/* System Architecture Specifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              System Architecture & Core APIs
            </h3>
            <span className="text-xs font-mono text-emerald-400">Verified</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">Gemini AI Engine</span>
              </div>
              <span className="text-indigo-400 font-semibold">gemini-2.5-flash</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">Database Layer</span>
              </div>
              <span className="text-emerald-400 font-semibold">PostgreSQL (pg Pool)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">Data Isolation Rule</span>
              </div>
              <span className="text-slate-300 font-semibold">Row-Level Security (RLS)</span>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Access Control Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="pb-3 mb-4 border-b border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Role-Based Access Control (RBAC) Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Granular enterprise permission breakdown across standard organizational roles.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="py-2.5 px-4">Capability / Operation</th>
                <th className="py-2.5 px-4 text-center">Standard Employee</th>
                <th className="py-2.5 px-4 text-center">Department Lead (Manager)</th>
                <th className="py-2.5 px-4 text-center">Global Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-2.5 px-4 text-slate-300 font-sans">Read Departmental Documents</td>
                <td className="py-2.5 px-4 text-center text-emerald-400">Yes (Own Dept)</td>
                <td className="py-2.5 px-4 text-center text-emerald-400">Yes (Own Dept)</td>
                <td className="py-2.5 px-4 text-center text-emerald-400 font-semibold">Full Global Access</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-slate-300 font-sans">Ingest & Upload Documents</td>
                <td className="py-2.5 px-4 text-center text-emerald-400">Yes</td>
                <td className="py-2.5 px-4 text-center text-emerald-400">Yes</td>
                <td className="py-2.5 px-4 text-center text-emerald-400 font-semibold">Yes</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-slate-300 font-sans">Create & Assign Cross-Dept Workflows</td>
                <td className="py-2.5 px-4 text-center text-slate-500">Read-Only</td>
                <td className="py-2.5 px-4 text-center text-emerald-400">Yes (Authorized)</td>
                <td className="py-2.5 px-4 text-center text-emerald-400 font-semibold">Yes (Full Authority)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-slate-300 font-sans">Advance Task Status & Subtasks</td>
                <td className="py-2.5 px-4 text-center text-emerald-400">Yes (Assigned)</td>
                <td className="py-2.5 px-4 text-center text-emerald-400">Yes</td>
                <td className="py-2.5 px-4 text-center text-emerald-400 font-semibold">Yes</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-slate-300 font-sans">Natural Language Copilot Queries</td>
                <td className="py-2.5 px-4 text-center text-emerald-400">Yes</td>
                <td className="py-2.5 px-4 text-center text-emerald-400">Yes</td>
                <td className="py-2.5 px-4 text-center text-emerald-400 font-semibold">Yes</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-slate-300 font-sans">View Cryptographic Audit Trail</td>
                <td className="py-2.5 px-4 text-center text-slate-500">Restricted</td>
                <td className="py-2.5 px-4 text-center text-emerald-400">Yes</td>
                <td className="py-2.5 px-4 text-center text-emerald-400 font-semibold">Full Audit Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Table Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Full System Audit Log Trail
            </h2>
            <p className="text-xs text-slate-400">
              Immutable ledger of user actions, document ingestions, and AI invocations.
            </p>
          </div>
          <button
            onClick={loadAuditLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Ledger</span>
          </button>
        </div>

        <AuditLogTable logs={logs} loading={loadingLogs} />
      </div>
    </div>
  );
};
