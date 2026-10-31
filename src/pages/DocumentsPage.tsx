import React, { useState, useEffect } from 'react';
import { Document, DepartmentType } from '../types';
import { documentApi } from '../services/api';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { DocumentDetailModal } from '../components/documents/DocumentDetailModal';
import {
  FileText,
  Upload,
  Search,
  Sparkles,
  Tag,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

const DEPARTMENTS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Departments' },
  { id: 'finance', label: 'Finance' },
  { id: 'hr', label: 'Human Resources' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'operations', label: 'Operations' },
  { id: 'product', label: 'Product' }
];

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDept, setActiveDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const deptParam = activeDept !== 'all' ? (activeDept as DepartmentType) : undefined;
      const docs = await documentApi.getDocuments(deptParam);
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [activeDept]);

  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = doc.title.toLowerCase().includes(q);
    const contentMatch = doc.raw_content.toLowerCase().includes(q);
    const summaryMatch = (doc.ai_summary || '').toLowerCase().includes(q);
    const entityMatch = (doc.extracted_entities?.keyEntities || []).some((e: string) =>
      e.toLowerCase().includes(q)
    );
    return titleMatch || contentMatch || summaryMatch || entityMatch;
  });

  const sentimentStyles: Record<string, string> = {
    Positive: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
    Negative: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
    Neutral: 'text-slate-400 border-slate-700 bg-slate-800/40'
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span>Enterprise Knowledge Repository</span>
            <span aria-hidden="true">·</span>
            <span>Multimodal Ingestion</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Document Intelligence & Entity Extraction
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            PDF, TXT, and CSV documents automatically parsed by Gemini into structured summaries and action items.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Ingest New Document</span>
        </button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Department Segmented Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto w-full sm:w-auto">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveDept(dept.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeDept === dept.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or entities..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs font-mono">
          Loading document repository...
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 p-8 space-y-3">
          <FileText className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400 font-mono">
            No enterprise documents found matching this filter criteria.
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Ingest First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const sentiment = doc.extracted_entities?.sentiment || 'Neutral';
            const entities = doc.extracted_entities?.keyEntities || [];
            const actionItems = doc.extracted_entities?.actionItems || [];

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all cursor-pointer shadow-sm flex flex-col justify-between group"
              >
                <div>
                  {/* Top Metadata Row: Zero-pill discipline */}
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="capitalize">{doc.department}</span>
                      <span aria-hidden="true">·</span>
                      <span>{doc.file_type}</span>
                    </div>
                    <span className="tabular-nums">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors mb-2 leading-snug">
                    {doc.title}
                  </h3>

                  {/* Gemini Summary Snippet */}
                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {doc.ai_summary || doc.raw_content}
                  </p>
                </div>

                <div>
                  {/* Structured tags preview */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] font-mono">
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] ${
                        sentimentStyles[sentiment] || sentimentStyles.Neutral
                      }`}
                    >
                      {sentiment}
                    </span>

                    <div className="flex items-center gap-2 text-slate-400">
                      <span>{entities.length} entities</span>
                      <span aria-hidden="true">·</span>
                      <span>{actionItems.length} actions</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={loadDocuments}
      />
      <DocumentDetailModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
};
