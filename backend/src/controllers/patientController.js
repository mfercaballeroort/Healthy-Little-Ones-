import { patientData } from '../data/patientData.js';
import nutritionFacade from '../services/NutritionFacade.js'; // ajustar ruta según estructura

/**
 * POST /api/patients
 * Registra un nuevo paciente en el sistema.
 */
export const createPatient = async (req, res) => {
  try {
    const { firstName,
        lastName,
        birthDate,
        gender,
        guardian,
        observations
    } = req.body;

    const patient = await patientData.save({ firstName,
        lastName,
        birthDate,
        gender,
        guardian,
        observations });

    return res.status(201).json({ success: true, data: patient });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/patients
 * Devuelve el listado completo de pacientes.
 */
export const getAllPatients = async (req, res) => {
  try {
    const patients = await patientData.findAll();
    return res.status(200).json({ success: true, data: patients });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/patients/:id
 * Devuelve un paciente específico por su ID.
 */
export const getPatientById = async (req, res) => {
  try {
    const patient = await patientData.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
    }
    return res.status(200).json({ success: true, data: patient });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/patients/:id
 * Actualiza los datos de un paciente existente.
 */
export const updatePatient = async (req, res) => {
  try {
    const { firstName,
        lastName,
        birthDate,
        gender,
        guardian,
        observations
    } = req.body; // desestructurado para no pasar campos extra a Mongoose

    const updated = await patientData.updateById(req.params.id, {
        firstName,
        lastName,
        birthDate,
        gender,
        guardian,
        observations
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/patients/:id/assessment
 * Ejecuta una evaluación nutricional para el paciente.
 * createAssessment recibe el id del paciente desde la URL y weight y height del body, 
 * se los pasa a nutritionFacade.executeAssessment(), y devuelve el resultado al front. 
 * El controller no procesa nada, solo conecta la petición HTTP con la facade.
 */
export const createAssessment = async (req, res) => {
  try {
    const { weight, height } = req.body;

    const result = await nutritionFacade.executeAssessment(
      req.params.id,
      weight,
      height
    );

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
