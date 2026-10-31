import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../services/api';
import { AnalyticsSummary } from '../types';
import { StatCard } from '../components/common/StatCard';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { CreateWorkflowModal } from '../components/workflows/CreateWorkflowModal';
import {
  FileText,
  Kanban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Plus,
  Upload,
  ArrowRight,
  Shield,
  Activity
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createWfModalOpen, setCreateWfModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const summary = await analyticsApi.getSummary();
      setData(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span className="capitalize">{user?.department}</span>
            <span aria-hidden="true">·</span>
            <span className="uppercase">{user?.role}</span>
            <span aria-hidden="true">·</span>
            <span>Enterprise Workspace</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Executive Intelligence Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time cross-departmental telemetry, Gemini document synthesis, and automated task delegation.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ingest Document</span>
          </button>
          <button
            onClick={() => setCreateWfModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>New Initiative</span>
          </button>
          <button
            onClick={() => navigate('/copilot')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Ask Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Documents Ingested"
          value={data?.metrics.totalDocuments ?? '—'}
          change="+18% MoM"
          changeType="positive"
          subtext="Extracted via Gemini"
          icon={FileText}
        />
        <StatCard
          label="Active Initiatives"
          value={data?.metrics.totalWorkflows ?? '—'}
          change={`${data?.metrics.inProgressWorkflows ?? 0} In Progress`}
          changeType="neutral"
          subtext="Cross-departmental"
          icon={Kanban}
        />
        <StatCard
          label="Completion Rate"
          value={data ? `${data.metrics.completionRate}%` : '—'}
          change="+6.2% vs target"
          changeType="positive"
          subtext="Operational efficiency"
          icon={CheckCircle2}
        />
        <StatCard
          label="Critical Bottlenecks"
          value={data?.metrics.criticalWorkflows ?? '—'}
          change={data?.metrics.criticalWorkflows ? 'Urgent Action' : 'Nominal'}
          changeType={data?.metrics.criticalWorkflows ? 'negative' : 'positive'}
          subtext="Flagged by Gemini"
          icon={AlertTriangle}
        />
        <StatCard
          label="Admin Hours Saved"
          value={data ? `${data.metrics.estimatedHoursSaved}h` : '—'}
          change="~60% overhead cut"
          changeType="positive"
          subtext="Through AI automation"
          icon={Clock}
        />
      </div>

      {/* 2-Column Split: Urgent AI Alerts vs Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Urgent AI Alerts (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Urgent AI Risk Alerts ({data?.urgentAlerts.length || 0})
                </h3>
              </div>
              <button
                onClick={() => navigate('/workflows')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1"
              >
                <span>View All Workflows</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <p className="text-xs text-slate-500 font-mono py-4 text-center">Analyzing risk telemetry...</p>
              ) : !data?.urgentAlerts.length ? (
                <p className="text-xs text-slate-500 font-mono py-4 text-center">
                  Zero critical bottlenecks detected. All cross-departmental operations nominal.
                </p>
              ) : (
                data.urgentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-lg hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 capitalize">{alert.department}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-400 uppercase font-semibold">
                          {alert.priority} Priority
                        </span>
                      </div>
                      {alert.dueDate && (
                        <span className="text-slate-500 tabular-nums">
                          Due: {new Date(alert.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 mb-1">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      {alert.riskAssessment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Department Load Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Cross-Departmental Workload & Documents
              </h3>
              <span className="text-xs font-mono text-slate-500">5 Divisions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {data?.departmentBreakdown.map((dept) => (
                <div
                  key={dept.department}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-center"
                >
                  <span className="text-xs font-semibold text-slate-300 capitalize block mb-2">
                    {dept.department}
                  </span>
                  <div className="text-lg font-bold font-mono text-white tabular-nums">
                    {dept.activeTasks}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    active tasks
                  </span>
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                    <span className="tabular-nums font-semibold text-slate-300">{dept.documentCount}</span> docs
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity & Audit Trail (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Recent AI Activity
                </h3>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono"
              >
                Audit Trail
              </button>
            </div>

            <div className="space-y-3 font-mono">
              {loading ? (
                <p className="text-xs text-slate-500 py-4 text-center">Loading audit log...</p>
              ) : !data?.recentAuditLogs.length ? (
                <p className="text-xs text-slate-500 py-4 text-center">No recent activity recorded.</p>
              ) : (
                data.recentAuditLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="text-xs p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-semibold text-slate-400">{log.user_name || 'System'}</span>
                      <span className="tabular-nums">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="font-semibold text-indigo-300 text-[11px] mb-0.5">
                      {log.action}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {typeof log.details === 'object'
                        ? log.details.title || log.details.query || log.details.action || JSON.stringify(log.details)
                        : String(log.details)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Enterprise Copilot Query Chip */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Ask Executive Question</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              "What are our top operational bottlenecks this quarter?" Copilot queries indexed financial disclosures, technical specifications, and initiative states.
            </p>
            <button
              onClick={() => navigate('/copilot')}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-center"
            >
              Open Natural Language Copilot
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={loadData}
      />
      <CreateWorkflowModal
        isOpen={createWfModalOpen}
        onClose={() => setCreateWfModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
