import { patientData } from '../data/patientData.js';
import nutritionFacade from '../services/NutritionFacade.js';

// Helper: chequea si el usuario logueado puede acceder a este paciente
const canAccess = (user, patient) => {
  if (user.role === 'padre') {
    return patient.parentId.toString() === user._id.toString();
  }
  if (user.role === 'medico') {
    return patient.assignedDoctorId?.toString() === user._id.toString();
  }
  if (user.role === 'nutricionista') {
    return patient.assignedNutritionistId?.toString() === user._id.toString();
  }
  return false;
};

/**
 * POST /api/patients
 * Solo padres pueden crear hijos. parentId sale del token, no del body.
 */
export const createPatient = async (req, res) => {
  try {
    if (req.user.role !== 'padre') {
      return res.status(403).json({
        success: false,
        message: 'Solo los padres pueden registrar hijos.',
      });
    }

    const { firstName, lastName, birthDate, gender, guardian, observations } = req.body;

    const patient = await patientData.save({
      parentId: req.user._id, // ← del token, no del body (seguridad)
      firstName,
      lastName,
      birthDate,
      gender,
      guardian,
      observations,
    });

    return res.status(201).json({ success: true, data: patient });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/patients
 * Padre → ve solo sus hijos.
 * Profesional → ve todos (en el Paso 4 se restringirá a assignedPatients).
 */
export const getAllPatients = async (req, res) => {
  try {
    let patients;
    if (req.user.role === 'padre') {
      patients = await patientData.findByParentId(req.user._id);
    } else if (req.user.role === 'medico') {
      patients = await patientData.findByAssignedDoctor(req.user._id);
    } else if (req.user.role === 'nutricionista') {
      patients = await patientData.findByAssignedNutritionist(req.user._id);
    }
    return res.status(200).json({ success: true, data: patients });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/patients/:id
 */
export const getPatientById = async (req, res) => {
  try {
    const patient = await patientData.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
    }
    if (!canAccess(req.user, patient)) {
      return res.status(403).json({ success: false, message: 'No tenés permiso para ver este paciente.' });
    }
    return res.status(200).json({ success: true, data: patient });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/patients/:id
 */
export const updatePatient = async (req, res) => {
  try {
    const existing = await patientData.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
    }
    if (!canAccess(req.user, existing)) {
      return res.status(403).json({ success: false, message: 'No tenés permiso para editar este paciente.' });
    }

    const { firstName, lastName, birthDate, gender, guardian, observations } = req.body;
    const updateData = { firstName, lastName, birthDate, gender, guardian, observations };

    // Solo el padre puede cambiar las asignaciones
    if (req.user.role === 'padre') {
      if ('assignedDoctorId' in req.body) updateData.assignedDoctorId = req.body.assignedDoctorId || null;
      if ('assignedNutritionistId' in req.body) updateData.assignedNutritionistId = req.body.assignedNutritionistId || null;
    }

    const updated = await patientData.updateById(req.params.id, updateData);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/patients/:id
 * Solo el padre dueño puede borrar a su hijo.
 */
export const deletePatient = async (req, res) => {
  try {
    const existing = await patientData.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
    }
    if (req.user.role !== 'padre' || existing.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Solo el padre puede eliminar a su hijo.' });
    }

    await patientData.deleteById(req.params.id);
    return res.status(200).json({ success: true, message: 'Paciente eliminado.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/patients/:id/assessment
 */
export const createAssessment = async (req, res) => {
  try {
    const patient = await patientData.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
    }
    if (!canAccess(req.user, patient)) {
      return res.status(403).json({ success: false, message: 'No tenés permiso para evaluar este paciente.' });
    }

    const { weight, height } = req.body;
    const result = await nutritionFacade.executeAssessment(req.params.id, weight, height);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};