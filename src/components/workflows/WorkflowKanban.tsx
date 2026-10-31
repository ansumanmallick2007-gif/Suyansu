import React, { useState } from 'react';
import { Workflow, TaskStatus, TaskPriority } from '../../types';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Trash2,
  User,
  Sparkles,
  Layers
} from 'lucide-react';

interface WorkflowKanbanProps {
  workflows: Workflow[];
  onStatusChange: (id: string, newStatus: TaskStatus) => Promise<void>;
  onSubtaskToggle: (workflowId: string, subtaskId: string, completed: boolean) => Promise<void>;
  onDeleteWorkflow: (id: string) => Promise<void>;
  canManage: boolean;
}

const COLUMNS: { id: TaskStatus; label: string; countColor: string }[] = [
  { id: 'backlog', label: 'Backlog', countColor: 'text-slate-400' },
  { id: 'in_progress', label: 'In Progress', countColor: 'text-cyan-400' },
  { id: 'review', label: 'In Review', countColor: 'text-amber-400' },
  { id: 'completed', label: 'Completed', countColor: 'text-emerald-400' }
];

export const WorkflowKanban: React.FC<WorkflowKanbanProps> = ({
  workflows,
  onStatusChange,
  onSubtaskToggle,
  onDeleteWorkflow,
  canManage
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const priorityStyles: Record<TaskPriority, { text: string; bg: string; border: string }> = {
    critical: { text: 'text-rose-400', bg: 'bg-rose-950/30', border: 'border-rose-500/40' },
    high: { text: 'text-amber-400', bg: 'bg-amber-950/30', border: 'border-amber-500/40' },
    medium: { text: 'text-indigo-400', bg: 'bg-indigo-950/30', border: 'border-indigo-500/40' },
    low: { text: 'text-slate-400', bg: 'bg-slate-800/40', border: 'border-slate-700' }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    switch (current) {
      case 'backlog': return 'in_progress';
      case 'in_progress': return 'review';
      case 'review': return 'completed';
      default: return null;
    }
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    switch (current) {
      case 'completed': return 'review';
      case 'review': return 'in_progress';
      case 'in_progress': return 'backlog';
      default: return null;
    }
  };

  const handleMove = async (id: string, newStatus: TaskStatus) => {
    try {
      setMovingId(id);
      await onStatusChange(id, newStatus);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((column) => {
        const columnTasks = workflows.filter((w) => w.status === column.id);

        return (
          <div
            key={column.id}
            className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5 flex flex-col min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 tracking-wide uppercase font-mono">
                  {column.label}
                </span>
                <span className={`text-xs font-mono font-bold tabular-nums ${column.countColor}`}>
                  ({columnTasks.length})
                </span>
              </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-16rem)] pr-0.5">
              {columnTasks.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs font-mono">
                  No tasks
                </div>
              ) : (
                columnTasks.map((task) => {
                  const isExpanded = expandedId === task.id;
                  const isMoving = movingId === task.id;
                  const subtasks = task.ai_suggestions?.recommendedSubtasks || [];
                  const completedSubtasks = subtasks.filter((s) => s.completed).length;
                  const risk = task.ai_suggestions?.riskAssessment;
                  const pStyle = priorityStyles[task.priority] || priorityStyles.medium;

                  const nextStatus = getNextStatus(task.status);
                  const prevStatus = getPrevStatus(task.status);

                  return (
                    <div
                      key={task.id}
                      className={`bg-slate-950/90 border border-slate-800 rounded-lg p-3.5 hover:border-slate-700 transition-all shadow-sm ${
                        isMoving ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {/* Top Row: Department & Priority */}
                      <div className="flex items-center justify-between gap-2 mb-2 text-[11px] font-mono">
                        <span className="text-slate-400 capitalize">
                          {task.department}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded border text-[10px] uppercase font-semibold ${pStyle.text} ${pStyle.bg} ${pStyle.border}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-slate-100 mb-1.5 leading-snug">
                        {task.title}
                      </h4>

                      {/* Description snippet */}
                      {task.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Risk Badge if Critical/High */}
                      {risk && (task.priority === 'critical' || task.priority === 'high') && (
                        <div className="mb-2 p-2 rounded bg-rose-950/20 border border-rose-900/40 text-[11px] text-rose-300 flex items-start gap-1.5 leading-tight">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{risk}</span>
                        </div>
                      )}

                      {/* Subtask progress count */}
                      {subtasks.length > 0 && (
                        <div className="mb-2 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>AI Subtasks:</span>
                          </span>
                          <span className="tabular-nums font-semibold text-slate-300">
                            {completedSubtasks}/{subtasks.length} ({Math.round((completedSubtasks / subtasks.length) * 100)}%)
                          </span>
                        </div>
                      )}

                      {/* Expandable subtask drawer */}
                      {isExpanded && subtasks.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-1.5 animate-in fade-in duration-150">
                          <p className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                            Recommended Delegation:
                          </p>
                          {subtasks.map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => onSubtaskToggle(task.id, st.id, !st.completed)}
                              className="w-full flex items-start gap-2 p-1.5 rounded hover:bg-slate-900 text-left transition-colors text-[11px]"
                            >
                              <CheckCircle2
                                className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                                  st.completed ? 'text-emerald-400' : 'text-slate-600'
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <p className={`leading-tight ${st.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                                  {st.title}
                                </p>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {st.suggestedDepartment} · {st.estimatedHours}h
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Footer: Assignee & Move Controls */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono truncate max-w-[120px]">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{task.assigned_to_name || 'Unassigned'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {subtasks.length > 0 && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : task.id)}
                              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                              title="Toggle Subtasks"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {prevStatus && (
                            <button
                              onClick={() => handleMove(task.id, prevStatus)}
                              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                              title={`Move to ${prevStatus.replace('_', ' ')}`}
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {nextStatus && (
                            <button
                              onClick={() => handleMove(task.id, nextStatus)}
                              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                              title={`Advance to ${nextStatus.replace('_', ' ')}`}
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canManage && (
                            <button
                              onClick={() => onDeleteWorkflow(task.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                              title="Delete Initiative"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
