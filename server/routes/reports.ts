import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { generateExecutiveBriefing } from '../gemini.js';

const router = Router();

// POST /api/reports/generate - Generate executive briefing using Gemini
router.post('/generate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const documents = await db.getDocuments();
    const workflows = await db.getWorkflows();
    const user = req.user!;

    const completed = workflows.filter(w => w.status === 'completed').length;
    const inProgress = workflows.filter(w => w.status === 'in_progress').length;
    const critical = workflows.filter(w => w.priority === 'critical' && w.status !== 'completed').length;

    const departmentStats: Record<string, number> = {};
    for (const w of workflows) {
      departmentStats[w.department] = (departmentStats[w.department] || 0) + 1;
    }

    const riskFlags = workflows
      .filter(w => w.ai_suggestions?.riskAssessment && w.status !== 'completed')
      .map(w => ({ title: w.title, department: w.department, risk: w.ai_suggestions!.riskAssessment }));

    const briefingMarkdown = await generateExecutiveBriefing({
      totalDocuments: documents.length,
      totalWorkflows: workflows.length,
      completedWorkflows: completed,
      inProgressWorkflows: inProgress,
      criticalWorkflows: critical,
      departmentStats,
      riskFlags
    });

    await db.createAuditLog({
      user_id: user.id,
      user_name: user.name,
      action: 'EXECUTIVE_REPORT_GENERATED',
      details: {
        totalWorkflows: workflows.length,
        totalDocuments: documents.length
      }
    });

    return res.json({
      report: briefingMarkdown,
      generatedAt: new Date().toISOString(),
      generatedBy: user.name,
      stats: {
        totalDocuments: documents.length,
        totalWorkflows: workflows.length,
        completionRate: workflows.length > 0 ? Math.round((completed / workflows.length) * 100) : 0
      }
    });
  } catch (err: any) {
    console.error('[Report Generation Error]', err);
    return res.status(500).json({ error: 'Failed to generate executive report.' });
  }
});

export default router;
