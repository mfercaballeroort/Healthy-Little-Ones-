import { metricData } from '../data/metricData.js';

/**
 * POST /api/metrics
 * Registra una nueva métrica antropométrica para un paciente.
 */
export const createMetric = async (req, res) => {
  try {
    const { 
        patientId, 
        date, 
        weight, 
        height, 
        headCircumference, 
        observations 
    } = req.body;

    const metric = await metricData.save({ 
        patientId, 
        date, 
        weight, 
        height, 
        headCircumference, 
        observations 
    });

    return res.status(201).json({ success: true, data: metric });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/metrics/patient/:patientId
 * Devuelve el historial completo de métricas de un paciente ordenado por fecha de forma descendente.
 */
export const getMetricsByPatientId = async (req, res) => {
  try {
    const metrics = await metricData.findByPatientId(req.params.patientId);
    return res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/metrics/patient/:patientId/latest
 * Obtiene la última métrica registrada de un paciente específico.
 */
export const getLatestMetricByPatientId = async (req, res) => {
  try {
    const metric = await metricData.findLatestByPatientId(req.params.patientId);
    if (!metric) {
      return res.status(404).json({ success: false, message: 'No se encontraron métricas para este paciente.' });
    }
    return res.status(200).json({ success: true, data: metric });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};