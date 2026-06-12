import { Router } from 'express';
import { 
    createMetric, 
    getMetricsByPatientId,
    getLatestMetricByPatientId
} from '../controllers/metricController.js';

const router = Router();

router.post('/', createMetric);                                       // POST   /api/metrics
router.get('/patient/:patientId', getMetricsByPatientId);             // GET    /api/metrics/patient/:patientId
router.get('/patient/:patientId/latest', getLatestMetricByPatientId);  // GET    /api/metrics/patient/:patientId/latest

export default router;
