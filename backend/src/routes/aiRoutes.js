import { Router } from 'express';
import { getAIOrientation } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Requiere login, igual que el resto de los recursos de la app
router.use(authMiddleware);

router.post('/orientation', getAIOrientation); // POST /api/ai/orientation

export default router;