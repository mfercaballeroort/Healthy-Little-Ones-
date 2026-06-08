import { patientData } from '../data/patientData.js';
/*MOTIVO DE IMPLEMENTACION 
La petición del paciente debería pasar por 
Ruta → Middleware 
→ Controller → Service (NutritionFacade o un servicio específico) 
→ Data → Base de Datos.
 La idea es que el Controller no contenga lógica de negocio
  y que esta quede centralizada en la capa Service.(nutritionFacade)*/ 
/**
 * POST /api/patients
 * Registra un nuevo paciente en el sistema.
 */
export const createPatient = async (req, res) => { // controlador en si 
  try {
    const { firstName, //datos enviados del front
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
     // controllador no guarda datos, le pide a data que lo haga patientData.js 
    // (patienteData.save) y  luego devuelve la respuesta al front

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
    const updated = await patientData.updateById(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};