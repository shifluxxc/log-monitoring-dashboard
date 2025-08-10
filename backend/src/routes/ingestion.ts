import { Router } from 'express';
import { IngestionController } from '../controllers/ingestionController.js';
import { authenticateApiKey } from '../middleware/auth.js';
import { validateCreateLog } from '../middleware/validation.js';

const router = Router();

/**
 * @swagger
 * /ingest/logs:
 *   post:
 *     summary: Ingest a new log entry
 *     tags: [Ingestion]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *               - message
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [INFO, WARN, ERROR, DEBUG]
 *                 description: Log level
 *               message:
 *                 type: string
 *                 description: Log message
 *               metadata:
 *                 type: object
 *                 description: Optional structured data
 *     responses:
 *       201:
 *         description: Log ingested successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Log'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Invalid API key
 */
router.post('/ingest/logs', authenticateApiKey, validateCreateLog, IngestionController.ingestLog);

/**
 * @swagger
 * /ingest/traces:
 *   post:
 *     summary: Ingest trace data (Sprint 2)
 *     tags: [Ingestion]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Trace ingestion endpoint - coming in Sprint 2
 */
router.post('/ingest/traces', authenticateApiKey, IngestionController.ingestTrace);

export default router; 