import { Patient } from './models/Patient.js';

const save = async (data) => {
  const newPatient = new Patient(data);
  return await newPatient.save();
};

const findById = async (patientId) => {
  return await Patient.findById(patientId).lean();
};

const findAll = async () => {
  return await Patient.find().sort({ lastName: 1 }).lean();
};

const findByParentId = async (parentId) => {
  return await Patient.find({ parentId }).sort({ firstName: 1 }).lean();
};

const updateById = async (patientId, data) => {
  return await Patient.findByIdAndUpdate(patientId, data, {
    new: true,
    runValidators: true,
  }).lean();
};

const deleteById = async (patientId) => {
  return await Patient.findByIdAndDelete(patientId);
};
const findByAssignedDoctor = async (doctorId) => {
  return await Patient.find({ assignedDoctorId: doctorId }).sort({ firstName: 1 }).lean();
};

const findByAssignedNutritionist = async (nutriId) => {
  return await Patient.find({ assignedNutritionistId: nutriId }).sort({ firstName: 1 }).lean();
};

// ...y agregalas al export:
export const patientData = {
  save,
  findById,
  findAll,
  findByParentId,
  findByAssignedDoctor,
  findByAssignedNutritionist,
  updateById,
  deleteById,
};
