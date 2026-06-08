import { Patient } from './models/Patient.js';

/**
 * Persiste un nuevo paciente en la base de datos.
 * @param {Object} data - Datos del paciente (firstName, lastName, birthDate, gender, etc.)
 * @returns {Promise<Object>} Documento del paciente creado.
 */
const save = async (data) => {
  const newPatient = new Patient(data);
  return await newPatient.save();
};

/**
 * Busca un paciente por su ID de MongoDB.
 * @param {string} patientId - ID del paciente.
 * @returns {Promise<Object|null>} Paciente encontrado o null.
 */
const findById = async (patientId) => {
  return await Patient.findById(patientId).lean();
};

/**
 * Recupera todos los pacientes registrados, ordenados por apellido.
 * @returns {Promise<Array>} Listado de pacientes.
 */
const findAll = async () => {
  return await Patient.find().sort({ lastName: 1 }).lean();
};

/**
 * Actualiza los datos de un paciente existente.
 * @param {string} patientId - ID del paciente a actualizar.
 * @param {Object} data - Campos a actualizar.
 * @returns {Promise<Object|null>} Paciente actualizado o null si no existe.
 */
const updateById = async (patientId, data) => {
  return await Patient.findByIdAndUpdate(patientId, data, {
    new: true,       // Devuelve el documento actualizado
    runValidators: true, // Aplica las validaciones del schema al actualizar
  }).lean();
};

export const patientData = {
  save,
  findById,
  findAll,
  updateById,
};