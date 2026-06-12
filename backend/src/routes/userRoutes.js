// backend/src/routes/userRoutes.js
import express from 'express';
import { register, login, getAll, getById, update, remove } from '../controllers/userController.js';
import { validateUser, validateLogin } from '../middleware/validateUser.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);
router.get('/', authMiddleware, getAll);
router.get('/:id', authMiddleware, getById);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

export default router;

