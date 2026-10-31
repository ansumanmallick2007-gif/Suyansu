import React, { useState } from 'react';
import { Document } from '../../types';
import { X, Sparkles, Copy, Check, Calendar, User, Tag, CheckSquare, Square } from 'lucide-react';

interface DocumentDetailModalProps {
  document: Document | null;
  onClose: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({ document, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});

  if (!document) return null;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(document.raw_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleActionItem = (idx: number) => {
    setCompletedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const sentiment = document.extracted_entities?.sentiment || 'Neutral';
  const sentimentStyles: Record<string, string> = {
    Positive: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
    Negative: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
    Neutral: 'text-slate-400 border-slate-700 bg-slate-800/40'
  };

  const keyEntities = document.extracted_entities?.keyEntities || [];
  const actionItems = document.extracted_entities?.actionItems || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
              <span className="capitalize">{document.department}</span>
              <span aria-hidden="true">·</span>
              <span>{document.file_type}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{new Date(document.created_at).toLocaleDateString()}</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {document.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Gemini AI Intelligence Banner */}
          <div className="p-4 bg-slate-950/80 border border-indigo-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Gemini Extracted Intelligence</span>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${sentimentStyles[sentiment] || sentimentStyles.Neutral}`}>
                Sentiment: {sentiment}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {document.ai_summary || 'No AI summary available.'}
            </p>
          </div>

          {/* Key Entities & Metadata */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 font-mono">
              Extracted Entities & Metrics ({keyEntities.length})
            </h3>
            {keyEntities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keyEntities.map((entity, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 font-mono"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono">No structured entities identified.</p>
            )}
          </div>

          {/* Action Items Checklist */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 font-mono">
              Extracted Actionable Next Steps ({actionItems.length})
            </h3>
            {actionItems.length > 0 ? (
              <div className="space-y-2">
                {actionItems.map((item, i) => {
                  const isDone = !!completedItems[i];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleActionItem(i)}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300/80 line-through'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      )}
                      <span className="text-xs leading-relaxed">{item}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono">No actionable steps extracted.</p>
            )}
          </div>

          {/* Raw Content Section */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 font-mono">
                Original Ingested Content
              </span>
              <button
                onClick={handleCopyRaw}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {document.raw_content}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            <span>Uploaded by: {document.uploaded_by_name || 'System Analyst'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
