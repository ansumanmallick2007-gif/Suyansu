import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { Shield, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

interface AuditLogTableProps {
  logs: AuditLog[];
  loading?: boolean;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, loading }) => {
  const [filterAction, setFilterAction] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredLogs = logs.filter((log) => {
    if (!filterAction) return true;
    return (
      log.action.toLowerCase().includes(filterAction.toLowerCase()) ||
      (log.user_name && log.user_name.toLowerCase().includes(filterAction.toLowerCase()))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const displayedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  const getActionColor = (action: string) => {
    if (action.includes('DOCUMENT')) return 'text-indigo-400';
    if (action.includes('WORKFLOW') || action.includes('INITIATIVE')) return 'text-cyan-400';
    if (action.includes('LOGIN') || action.includes('REGISTERED')) return 'text-emerald-400';
    if (action.includes('COPILOT')) return 'text-amber-400';
    return 'text-slate-300';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            System & User Audit Trail
          </h3>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            ({filteredLogs.length} events logged)
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by action or actor..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action Event</th>
              <th className="py-3 px-4">Audit Payload Context</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                  Loading audit logs...
                </td>
              </tr>
            ) : displayedLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                  No matching audit records found.
                </td>
              </tr>
            ) : (
              displayedLogs.map((log) => {
                const isExpanded = expandedRow === log.id;
                const detailsStr = typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '');

                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 tabular-nums whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-slate-200 font-medium whitespace-nowrap">
                        {log.user_name || 'System Service'}
                      </td>
                      <td className="py-2.5 px-4 font-semibold whitespace-nowrap">
                        <span className={getActionColor(log.action)}>{log.action}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 max-w-xs truncate">
                        {detailsStr}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="Expand JSON payload"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-950/80">
                        <td colSpan={5} className="py-3 px-4 text-xs font-mono">
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto">
                            <pre className="text-[11px] leading-relaxed">
                              {JSON.stringify(log, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>
            Page <span className="tabular-nums font-semibold text-slate-200">{page}</span> of{' '}
            <span className="tabular-nums">{totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
