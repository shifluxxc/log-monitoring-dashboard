import { Router } from 'express';
import { TraceController } from '../controllers/traceController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateJWT, TraceController.getTraces);
router.get('/:traceId', authenticateJWT, TraceController.getTraceById);

export default router;
