import { Router } from 'express';
import { createPatient, getAllPatients, getPatientById, updatePatient } from '../controllers/patientController.js';
import { validatePatient } from '../middleware/validatePatient.js';

const router = Router();

router.post('/', validatePatient, createPatient);     // POST   /api/patients
router.get('/', getAllPatients);                       // GET    /api/patients
router.get('/:id', getPatientById);                   // GET    /api/patients/:id
router.put('/:id', validatePatient, updatePatient);   // PUT    /api/patients/:id

export default router;
