import React, { useState } from 'react';
import { reportApi, workflowApi, documentApi } from '../services/api';
import {
  BarChart3,
  Sparkles,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Layers
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reportText, setReportText] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const res = await reportApi.generateReport();
      setReportText(res.report);
      setGeneratedAt(res.generatedAt);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      const workflows = await workflowApi.getWorkflows();
      const csvHeader = 'ID,Title,Department,Status,Priority,Due Date,Risk Assessment\n';
      const csvRows = workflows
        .map((w) =>
          [
            `"${w.id}"`,
            `"${w.title.replace(/"/g, '""')}"`,
            `"${w.department}"`,
            `"${w.status}"`,
            `"${w.priority}"`,
            `"${w.due_date || 'N/A'}"`,
            `"${(w.ai_suggestions?.riskAssessment || 'None').replace(/"/g, '""')}"`
          ].join(',')
        )
        .join('\n');

      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `synapse_enterprise_workflows_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingCsv(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span>Executive Reporting & Governance</span>
            <span aria-hidden="true">·</span>
            <span>Synthesized by Gemini</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Automated Executive Briefings & Exports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Compile weekly intelligence briefs for the board, export tabular audit metrics, and download CSV reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 font-mono"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>{exportingCsv ? 'Exporting...' : 'Export Workflows CSV'}</span>
          </button>

          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Generate Weekly Briefing</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Briefing View Area */}
      {reportText ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Compiled: {generatedAt ? new Date(generatedAt).toLocaleString() : 'Just now'}</span>
              <span aria-hidden="true">·</span>
              <span>Model: gemini-2.5-flash</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Briefing'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-mono"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-xs leading-relaxed font-sans text-slate-300 whitespace-pre-wrap p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            {reportText}
          </div>
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 p-8 space-y-4">
          <BarChart3 className="w-10 h-10 text-indigo-400 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-slate-200">
              Executive Briefing Ready for Compilation
            </h3>
            <p className="text-xs text-slate-400">
              Trigger Gemini to synthesize cross-department progress, cloud expenditure variance, and active operational risk bottlenecks into a concise executive summary.
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Executive Briefing Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
