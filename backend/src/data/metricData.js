import { Metric } from './models/Metric.js';

/**
 * Persiste una nueva métrica antropométrica en la base de datos.
 * @param {Object} metricData - Objeto con los datos de la métrica (patientId, weight, height, etc.)
 * @returns {Promise<Object>} Documento de la métrica creada.
 */
const save = async (metricData) => {
  const newMetric = new Metric(metricData);
  return await newMetric.save();
};

/**
 * Recupera el historial completo de métricas de un paciente ordenado por fecha de forma descendente.
 * @param {string} patientId - ID de MongoDB del paciente.
 * @returns {Promise<Array>} Listado de métricas asociadas.
 */
const findByPatientId = async (patientId) => {
  return await Metric.find({ patientId }).sort({ date: -1 }).lean();
  // .lean() optimiza el rendimiento devolviendo objetos JSON planos en lugar de documentos Mongoose completos
};

/**
 * Obtiene la última métrica registrada de un paciente (útil para evaluaciones actuales).
 * @param {string} patientId - ID del paciente.
 * @returns {Promise<Object|null>} Última métrica o null.
 */
const findLatestByPatientId = async (patientId) => {
  return await Metric.findOne({ patientId }).sort({ date: -1 }).lean();
};

export const metricData = {
  save,
  findByPatientId,
  findLatestByPatientId,
};