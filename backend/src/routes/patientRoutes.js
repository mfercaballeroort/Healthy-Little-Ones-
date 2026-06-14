import { Router } from 'express';
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  createAssessment,
  getPatientHistory,
} from '../controllers/patientController.js';
import { validatePatient } from '../middleware/validatePatient.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Todas las rutas requieren login
router.use(authMiddleware);

router.post('/', validatePatient, createPatient);
router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.put('/:id', validatePatient, updatePatient);
router.delete('/:id', deletePatient);
router.post('/:id/assessment', createAssessment);
router.get('/:id/metrics', getPatientHistory);  // ← nuevo

export default router;