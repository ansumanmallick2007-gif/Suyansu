import React, { useState, useEffect } from 'react';
import { Workflow, DepartmentType, TaskStatus } from '../types';
import { workflowApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { WorkflowKanban } from '../components/workflows/WorkflowKanban';
import { CreateWorkflowModal } from '../components/workflows/CreateWorkflowModal';
import { Kanban, Plus, Filter, Sparkles, RefreshCw } from 'lucide-react';

const DEPARTMENTS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Departments' },
  { id: 'finance', label: 'Finance' },
  { id: 'hr', label: 'Human Resources' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'operations', label: 'Operations' },
  { id: 'product', label: 'Product' }
];

export const WorkflowsPage: React.FC = () => {
  const { canManage } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDept, setActiveDept] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const deptParam = activeDept !== 'all' ? (activeDept as DepartmentType) : undefined;
      const items = await workflowApi.getWorkflows(deptParam);
      setWorkflows(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [activeDept]);

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    // Optimistic UI update
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
    );
    try {
      await workflowApi.updateWorkflow(id, { status: newStatus });
    } catch (err) {
      console.error(err);
      loadWorkflows();
    }
  };

  const handleSubtaskToggle = async (workflowId: string, subtaskId: string, completed: boolean) => {
    const wf = workflows.find((w) => w.id === workflowId);
    if (!wf || !wf.ai_suggestions?.recommendedSubtasks) return;

    const updatedSubtasks = wf.ai_suggestions.recommendedSubtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed } : st
    );

    const updatedAiSuggestions = {
      ...wf.ai_suggestions,
      recommendedSubtasks: updatedSubtasks
    };

    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflowId ? { ...w, ai_suggestions: updatedAiSuggestions } : w))
    );

    try {
      await workflowApi.updateWorkflow(workflowId, { ai_suggestions: updatedAiSuggestions });
    } catch (err) {
      console.error(err);
      loadWorkflows();
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this initiative?')) return;
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    try {
      await workflowApi.deleteWorkflow(id);
    } catch (err) {
      console.error(err);
      loadWorkflows();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span>Operational Orchestration</span>
            <span aria-hidden="true">·</span>
            <span>AI Subtask Decomposition</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Cross-Departmental Workflows & Kanban
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automate delegation, monitor delivery milestones, and track AI-assessed operational risk flags.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadWorkflows}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            title="Refresh Tasks"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Initiative</span>
          </button>
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
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

        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          <span className="tabular-nums font-semibold text-white">{workflows.length}</span> initiatives registered
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs font-mono">
          Loading workflow state...
        </div>
      ) : (
        <WorkflowKanban
          workflows={workflows}
          onStatusChange={handleStatusChange}
          onSubtaskToggle={handleSubtaskToggle}
          onDeleteWorkflow={handleDeleteWorkflow}
          canManage={canManage}
        />
      )}

      {/* Create Initiative Modal */}
      <CreateWorkflowModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadWorkflows}
      />
    </div>
  );
};
