import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/audit-logs
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string || '50', 10);
    const action = req.query.action as string | undefined;

    const logs = await db.getAuditLogs(limit, action);
    return res.json({
      logs,
      total: logs.length
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve system audit logs.' });
  }
});

export default router;
