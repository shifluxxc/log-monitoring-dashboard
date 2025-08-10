import { Router } from 'express';
import { getLogs } from '../controllers/logController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.get('/logs', authenticateJWT, getLogs);

export default router;
