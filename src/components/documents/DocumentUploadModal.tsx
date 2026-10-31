import React, { useState } from 'react';
import { DepartmentType } from '../../types';
import { documentApi } from '../../services/api';
import { X, Upload, Sparkles, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDepartment?: DepartmentType;
}

const SAMPLE_TEMPLATES = [
  {
    title: 'Q4 GPU Infrastructure & Cloud Cost Reduction Plan',
    department: 'finance' as DepartmentType,
    file_type: 'Financial Report',
    content: `Executive Summary: Q4 cloud infrastructure spend reached $1,840,000 across North America and EU cloud regions. GPU consumption for large-scale embedding pipelines grew 28% month-over-month.
Recommendation: Enforce spot instance scheduling for batch inference workloads and transition 140TB of cold archival data to glacier tier storage by December 1, 2026.
Anticipated savings: $210,000 per month starting in Q1 2027.
Risk factor: Workload throttling could impact high-priority SLA during peak European trading hours.`
  },
  {
    title: 'Cross-Departmental SLA on Incident Response & P0 Escalations',
    department: 'engineering' as DepartmentType,
    file_type: 'Technical Spec',
    content: `Service Level Agreement v3.4:
Standard P0 production incident mitigation requires first page acknowledgement within 5 minutes and warm cross-functional incident commander assignment within 15 minutes.
Engineering, Operations, and Customer Success leads must maintain primary on-call rosters in PagerDuty.
Post-mortem reviews are mandatory within 72 hours for all outages exceeding 0.05% downtime impact.
Next review date: November 28, 2026.`
  },
  {
    title: 'Employee Retention and Talent Calibration Assessment',
    department: 'hr' as DepartmentType,
    file_type: 'HR Policy',
    content: `People Operations Q3 Talent Calibration:
Voluntary turnover stabilized at 3.8% across technical squads following mid-year compensation re-benchmarking against tier-1 tech peers.
Engineering headcount target stands at +35 senior engineers for Q4.
Recommendation: Expand technical leadership coaching programs and subsidize remote home office ergo budgets.
Pending action: Finalize bonus calibration pool with Finance before November 20.`
  }
];

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDepartment = 'operations'
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<DepartmentType>(defaultDepartment);
  const [fileType, setFileType] = useState('Financial Report');
  const [rawContent, setRawContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionPreview, setExtractionPreview] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: typeof SAMPLE_TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setDepartment(tmpl.department);
    setFileType(tmpl.file_type);
    setRawContent(tmpl.content);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawContent.trim()) {
      setError('Please provide a document title and content.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const res = await documentApi.uploadDocument({
        title,
        department,
        file_type: fileType,
        raw_content: rawContent
      });

      setExtractionPreview(res.document);
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to ingest and analyze document.');
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawContent(content || '');
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Ingest Enterprise Document
              </h2>
              <p className="text-xs text-slate-400">
                Gemini extracts executive summaries, sentiment, and action items automatically.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="px-6 pt-4 pb-2 bg-slate-900/50 border-b border-slate-800/60">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
            Quick Fill Enterprise Template:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TEMPLATES.map((tmpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800/80 transition-colors text-left"
              >
                {tmpl.file_type}: {tmpl.title.slice(0, 24)}...
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FY2026 Q3 Capital Expenditure & Cloud Margin Review"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as DepartmentType)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white capitalize focus:outline-none focus:border-indigo-500"
              >
                <option value="finance">Finance</option>
                <option value="hr">Human Resources</option>
                <option value="engineering">Engineering</option>
                <option value="operations">Operations</option>
                <option value="product">Product</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Document Classification *
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Financial Report">Financial Report</option>
                <option value="HR Policy">HR Policy</option>
                <option value="Technical Spec">Technical Spec</option>
                <option value="Project Roadmap">Project Roadmap</option>
                <option value="Customer Feedback">Customer Feedback</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Document Content (PDF/TXT/CSV notes) *
              </label>
              <label className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1 font-mono">
                <Upload className="w-3 h-3" />
                <span>Upload .txt / .csv</span>
                <input
                  type="file"
                  accept=".txt,.csv,.json,.md,.log"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              required
              rows={6}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Paste unstructured financial disclosures, technical specifications, policy updates, or operational briefs..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {extractionPreview && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Extracted successfully! Saving to enterprise database...</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Gemini Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Ingest & Extract with Gemini</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
