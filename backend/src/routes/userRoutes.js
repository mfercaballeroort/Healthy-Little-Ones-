// backend/src/routes/userRoutes.js
import express from 'express';
import { register, login, me, getAll, getById, update, remove, getProfessionals } from '../controllers/userController.js';
import { validateUser, validateLogin } from '../middleware/validateUser.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);

// Rutas autenticadas
router.get('/me', authMiddleware, me);

// Listado solo para profesionales
router.get('/', authMiddleware, requireRole('medico', 'nutricionista'), getAll);

// Operaciones individuales — los permisos finos están en el controller
router.get('/professionals', authMiddleware, getProfessionals);
router.get('/:id', authMiddleware, getById);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

export default router;