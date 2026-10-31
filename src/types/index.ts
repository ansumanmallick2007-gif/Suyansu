export type UserRole = 'admin' | 'manager' | 'employee';
export type DepartmentType = 'finance' | 'hr' | 'engineering' | 'operations' | 'product';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: DepartmentType;
  created_at: string;
  avatar_url?: string;
}

export interface Document {
  id: string;
  title: string;
  department: DepartmentType;
  file_type: string;
  raw_content: string;
  ai_summary: string;
  extracted_entities: {
    sentiment?: 'Positive' | 'Neutral' | 'Negative' | string;
    keyEntities?: string[];
    actionItems?: string[];
    summary?: string;
    [key: string]: any;
  };
  uploaded_by: string | null;
  uploaded_by_name?: string;
  created_at: string;
}

export interface WorkflowSubtask {
  id: string;
  title: string;
  estimatedHours: number;
  suggestedDepartment: string;
  completed: boolean;
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  department: DepartmentType;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  assigned_to_name?: string;
  ai_suggestions: {
    recommendedSubtasks?: WorkflowSubtask[];
    riskAssessment?: string;
    [key: string]: any;
  } | null;
  due_date: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name?: string;
  action: string;
  details: any;
  created_at: string;
}

export interface AnalyticsSummary {
  metrics: {
    totalDocuments: number;
    totalWorkflows: number;
    completedWorkflows: number;
    inProgressWorkflows: number;
    reviewWorkflows: number;
    backlogWorkflows: number;
    criticalWorkflows: number;
    completionRate: number;
    teamMembersCount: number;
    estimatedHoursSaved: number;
  };
  departmentBreakdown: Array<{
    department: DepartmentType;
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    documentCount: number;
  }>;
  urgentAlerts: Array<{
    id: string;
    title: string;
    department: DepartmentType;
    priority: TaskPriority;
    riskAssessment: string;
    dueDate: string | null;
  }>;
  recentAuditLogs: AuditLog[];
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Array<{
    title: string;
    department: string;
    type: string;
  }>;
  confidence?: number;
  suggestedFollowUps?: string[];
}
