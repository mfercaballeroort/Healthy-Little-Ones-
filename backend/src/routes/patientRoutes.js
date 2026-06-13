import { Router } from 'express';
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  createAssessment,
} from '../controllers/patientController.js';
import { validatePatient } from '../middleware/validatePatient.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Todas las rutas de pacientes requieren login
router.use(authMiddleware);

router.post('/', validatePatient, createPatient);                // POST   /api/patients
router.get('/', getAllPatients);                                  // GET    /api/patients
router.get('/:id', getPatientById);                               // GET    /api/patients/:id
router.put('/:id', validatePatient, updatePatient);               // PUT    /api/patients/:id
router.delete('/:id', deletePatient);                             // DELETE /api/patients/:id
router.post('/:id/assessment', createAssessment);                 // POST   /api/patients/:id/assessment

export default router;