import { Router, Response } from 'express';
import { z } from 'zod';
import { db, DepartmentType, TaskPriority, TaskStatus } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { generateWorkflowBreakdown } from '../gemini.js';

const router = Router();

// Zod schema from requirements
export const createWorkflowSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  department: z.enum(['finance', 'hr', 'engineering', 'operations', 'product']),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional().nullable()
});

const updateWorkflowSchema = z.object({
  status: z.enum(['backlog', 'in_progress', 'review', 'completed']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  assigned_to: z.string().nullable().optional(),
  ai_suggestions: z.any().optional(),
  title: z.string().min(3).optional(),
  description: z.string().optional()
});

// GET /api/workflows
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestedDept = req.query.department as string | undefined;
    let filterDept: DepartmentType | undefined = undefined;

    if (requestedDept && ['finance', 'hr', 'engineering', 'operations', 'product'].includes(requestedDept)) {
      filterDept = requestedDept as DepartmentType;
    }

    const workflows = await db.getWorkflows(filterDept);
    return res.json({
      workflows,
      count: workflows.length
    });
  } catch (err: any) {
    console.error('[Workflows Fetch Error]', err);
    return res.status(500).json({ error: 'Failed to retrieve workflows.' });
  }
});

// POST /api/workflows - Create a workflow with Gemini AI breakdown
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = createWorkflowSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues.map((e: any) => e.message)
      });
    }

    const { title, description = '', department, priority, dueDate, assignedTo } = parseResult.data;
    const user = req.user!;

    // Call Gemini to generate subtask breakdown and risk assessment
    const breakdown = await generateWorkflowBreakdown(title, description, department);

    const formattedSubtasks = (breakdown.recommendedSubtasks || []).map((st, idx) => ({
      id: `st-${Date.now()}-${idx}`,
      title: st.title,
      estimatedHours: st.estimatedHours,
      suggestedDepartment: st.suggestedDepartment,
      completed: false
    }));

    let assignedUserName: string | undefined = undefined;
    if (assignedTo) {
      const assignedUser = await db.findUserById(assignedTo);
      if (assignedUser) assignedUserName = assignedUser.name;
    }

    const newWorkflow = await db.createWorkflow({
      title,
      description,
      department: department as DepartmentType,
      status: 'backlog',
      priority: priority as TaskPriority,
      assigned_to: assignedTo || null,
      assigned_to_name: assignedUserName,
      ai_suggestions: {
        recommendedSubtasks: formattedSubtasks,
        riskAssessment: breakdown.riskAssessment
      },
      due_date: dueDate ? new Date(dueDate).toISOString() : null
    });

    await db.createAuditLog({
      user_id: user.id,
      user_name: user.name,
      action: 'WORKFLOW_CREATED',
      details: {
        workflowId: newWorkflow.id,
        title: newWorkflow.title,
        department: newWorkflow.department,
        priority: newWorkflow.priority,
        subtasksGenerated: formattedSubtasks.length
      }
    });

    return res.status(201).json({
      message: 'Workflow successfully created with AI subtask breakdown',
      workflow: newWorkflow
    });
  } catch (err: any) {
    console.error('[Workflow Creation Error]', err);
    return res.status(500).json({ error: 'Failed to create workflow.' });
  }
});

// PATCH /api/workflows/:id - Update status, assignment, subtasks
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = updateWorkflowSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues.map((e: any) => e.message)
      });
    }

    const { id } = req.params;
    const user = req.user!;

    const updated = await db.updateWorkflow(id, parseResult.data as any);
    if (!updated) {
      return res.status(404).json({ error: 'Workflow not found.' });
    }

    await db.createAuditLog({
      user_id: user.id,
      user_name: user.name,
      action: 'WORKFLOW_UPDATED',
      details: {
        workflowId: id,
        changes: parseResult.data
      }
    });

    return res.json({
      message: 'Workflow updated successfully',
      workflow: updated
    });
  } catch (err: any) {
    console.error('[Workflow Update Error]', err);
    return res.status(500).json({ error: 'Failed to update workflow.' });
  }
});

// DELETE /api/workflows/:id - Delete workflow (Admin & Managers)
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role === 'employee') {
      return res.status(403).json({ error: 'Only Managers and Admins can delete enterprise workflows.' });
    }

    const { id } = req.params;
    const deleted = await db.deleteWorkflow(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Workflow not found.' });
    }

    await db.createAuditLog({
      user_id: user.id,
      user_name: user.name,
      action: 'WORKFLOW_DELETED',
      details: { workflowId: id }
    });

    return res.json({ message: 'Workflow removed.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete workflow.' });
  }
});

export default router;
