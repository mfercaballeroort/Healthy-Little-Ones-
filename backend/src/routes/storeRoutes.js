import { Router } from 'express';
import { getAllStores, getNearbyStores, getStoreById } from '../controllers/storeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Todas requieren login
router.use(authMiddleware);

// IMPORTANTE: /nearby debe ir ANTES que /:id, sino Express interpreta "nearby" como un id
router.get('/nearby', getNearbyStores);  // GET /api/stores/nearby
router.get('/', getAllStores);            // GET /api/stores
router.get('/:id', getStoreById);         // GET /api/stores/:id

export default router;