import { patientData } from '../data/patientData.js';
import { metricData } from '../data/metricData.js';
import nutritionFacade from '../services/NutritionFacade.js';
import whoGrowthService from '../services/whoStandards/WhoGrowthService.js';

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

// Helper: calcula edad en meses en un momento específico
const ageInMonthsAt = (birthDate, atDate) => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const at = new Date(atDate);
  const diffMs = at.getTime() - birth.getTime();
  return Math.floor(diffMs / (30.44 * 24 * 60 * 60 * 1000));
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
      parentId: req.user._id,
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

/**
 * GET /api/patients/:id/metrics
 * Devuelve el historial longitudinal del paciente.
 * Cada métrica viene enriquecida con el cálculo OMS correspondiente a la edad en ese momento.
 * Solo accesible para profesionales asignados (el padre ve evaluaciones puntuales, no la trayectoria).
 */
export const getPatientHistory = async (req, res) => {
  try {
    const patient = await patientData.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
    }
    if (!canAccess(req.user, patient)) {
      return res.status(403).json({ success: false, message: 'No tenés permiso para ver este historial.' });
    }

    // Decisión de UX: el historial detallado es solo para profesionales
    if (req.user.role === 'padre') {
      return res.status(403).json({
        success: false,
        message: 'El historial detallado está disponible solo para los profesionales asignados.',
      });
    }

    const metrics = await metricData.findByPatientId(req.params.id);

    // Enriquecer cada métrica con Z-scores calculados según la edad EN ESE MOMENTO
    const enrichedMetrics = metrics.map(m => {
      const ageMonths = ageInMonthsAt(patient.birthDate, m.date);
      const whoResult = whoGrowthService.calculate({
        sex: patient.gender,
        ageMonths,
        weight: m.weight,
        height: m.height,
      });
      return {
        _id: m._id,
        date: m.date,
        weight: m.weight,
        height: m.height,
        ageMonths,
        who: whoResult,
      };
    });

    return res.status(200).json({
      success: true,
      patient: {
        _id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        birthDate: patient.birthDate,
        gender: patient.gender,
      },
      data: enrichedMetrics,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};