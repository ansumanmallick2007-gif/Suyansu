import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { queryEnterpriseCopilot } from '../gemini.js';

const router = Router();

const copilotQuerySchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters')
});

// POST /api/ai/copilot - Context-aware enterprise copilot query
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = copilotQuerySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues.map((e: any) => e.message)
      });
    }

    const { query } = parseResult.data;
    const user = req.user!;

    // Fetch grounded context
    const documents = await db.getDocuments();
    const workflows = await db.getWorkflows();

    const criticalCount = workflows.filter(w => w.priority === 'critical' && w.status !== 'completed').length;
    const kpiSummary = {
      totalDocuments: documents.length,
      totalWorkflows: workflows.length,
      criticalCount
    };

    const aiResponse = await queryEnterpriseCopilot(query, user.department, {
      documents,
      workflows,
      kpiSummary
    });

    await db.createAuditLog({
      user_id: user.id,
      user_name: user.name,
      action: 'COPILOT_QUERY',
      details: {
        query,
        citationsCount: aiResponse.citations?.length || 0,
        confidence: aiResponse.confidence
      }
    });

    return res.json({
      query,
      answer: aiResponse.answer,
      citations: aiResponse.citations,
      confidence: aiResponse.confidence,
      suggestedFollowUps: aiResponse.suggestedFollowUps,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[Copilot Error]', err);
    return res.status(500).json({ error: 'Failed to process enterprise copilot query.' });
  }
});

export default router;
