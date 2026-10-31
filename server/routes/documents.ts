import { Router, Response } from 'express';
import { z } from 'zod';
import { db, DepartmentType } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { analyzeDocumentContent } from '../gemini.js';

const router = Router();

const documentUploadSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  department: z.enum(['finance', 'hr', 'engineering', 'operations', 'product']),
  file_type: z.string().min(2, 'Document type is required'),
  raw_content: z.string().min(10, 'Document content must contain at least 10 characters')
});

// GET /api/documents - List documents with tenant/department filtering
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const requestedDept = req.query.department as string | undefined;

    let filterDept: DepartmentType | undefined = undefined;

    if (requestedDept && ['finance', 'hr', 'engineering', 'operations', 'product'].includes(requestedDept)) {
      filterDept = requestedDept as DepartmentType;
    }

    const docs = await db.getDocuments(filterDept);

    return res.json({
      documents: docs,
      count: docs.length
    });
  } catch (err: any) {
    console.error('[Documents List Error]', err);
    return res.status(500).json({ error: 'Failed to retrieve enterprise documents.' });
  }
});

// GET /api/documents/:id - Single document by ID
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const doc = await db.getDocumentById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    return res.json({ document: doc });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve document details.' });
  }
});

// POST /api/documents - Ingest document and extract entities with Gemini
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = documentUploadSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues.map((e: any) => e.message)
      });
    }

    const { title, department, file_type, raw_content } = parseResult.data;
    const user = req.user!;

    // Perform multimodal/text Gemini extraction
    const extraction = await analyzeDocumentContent(title, department, raw_content);

    const newDoc = await db.createDocument({
      title,
      department: department as DepartmentType,
      file_type,
      raw_content,
      ai_summary: extraction.summary,
      extracted_entities: extraction,
      uploaded_by: user.id,
      uploaded_by_name: user.name
    });

    await db.createAuditLog({
      user_id: user.id,
      user_name: user.name,
      action: 'DOCUMENT_INGESTED',
      details: {
        documentId: newDoc.id,
        title: newDoc.title,
        department: newDoc.department,
        sentiment: extraction.sentiment,
        entitiesCount: extraction.keyEntities?.length || 0
      }
    });

    return res.status(201).json({
      message: 'Document successfully ingested and analyzed by Gemini',
      document: newDoc
    });
  } catch (err: any) {
    console.error('[Document Ingestion Error]', err);
    return res.status(500).json({ error: 'Failed to process document with Gemini AI.' });
  }
});

export default router;
