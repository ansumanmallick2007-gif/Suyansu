import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/analytics/summary - Executive overview KPI aggregator
router.get('/summary', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const documents = await db.getDocuments();
    const workflows = await db.getWorkflows();
    const auditLogs = await db.getAuditLogs(10);
    const users = await db.getAllUsers();

    const totalWorkflows = workflows.length;
    const completedWorkflows = workflows.filter(w => w.status === 'completed').length;
    const inProgressWorkflows = workflows.filter(w => w.status === 'in_progress').length;
    const reviewWorkflows = workflows.filter(w => w.status === 'review').length;
    const backlogWorkflows = workflows.filter(w => w.status === 'backlog').length;
    const criticalWorkflows = workflows.filter(w => w.priority === 'critical' && w.status !== 'completed').length;

    const completionRate = totalWorkflows > 0 ? Math.round((completedWorkflows / totalWorkflows) * 100) : 0;

    // Departmental distribution
    const departments = ['finance', 'hr', 'engineering', 'operations', 'product'] as const;
    const departmentBreakdown = departments.map(dept => {
      const deptWorkflows = workflows.filter(w => w.department === dept);
      const deptDocs = documents.filter(d => d.department === dept);
      const activeTasks = deptWorkflows.filter(w => w.status !== 'completed').length;
      return {
        department: dept,
        totalTasks: deptWorkflows.length,
        activeTasks,
        completedTasks: deptWorkflows.filter(w => w.status === 'completed').length,
        documentCount: deptDocs.length
      };
    });

    // Urgent AI Risk Alerts
    const urgentAlerts = workflows
      .filter(w => (w.priority === 'critical' || w.priority === 'high') && w.status !== 'completed')
      .map(w => ({
        id: w.id,
        title: w.title,
        department: w.department,
        priority: w.priority,
        riskAssessment: w.ai_suggestions?.riskAssessment || 'Active high-priority deliverable requires executive oversight.',
        dueDate: w.due_date
      }));

    return res.json({
      metrics: {
        totalDocuments: documents.length,
        totalWorkflows,
        completedWorkflows,
        inProgressWorkflows,
        reviewWorkflows,
        backlogWorkflows,
        criticalWorkflows,
        completionRate,
        teamMembersCount: users.length,
        estimatedHoursSaved: Math.round(documents.length * 3.5 + workflows.length * 4.2)
      },
      departmentBreakdown,
      urgentAlerts,
      recentAuditLogs: auditLogs
    });
  } catch (err: any) {
    console.error('[Analytics Error]', err);
    return res.status(500).json({ error: 'Failed to compute executive analytics summary.' });
  }
});

export default router;
