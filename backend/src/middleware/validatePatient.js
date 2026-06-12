

/*POST /api/patients
→ validatePatient ✓
→ patientController ✓
→ patientData ✓
→ MongoDB*/

 //cadena de Patient lista

export const validatePatient = (req, res, next) => {
  const { firstName, lastName, birthDate, gender } = req.body;

  if (!firstName || !lastName || !birthDate || !gender) {
    return res.status(400).json({
      success: false,
      message: 'firstName, lastName, birthDate y gender son obligatorios.',
    });
  }

  if (!['M', 'F'].includes(gender)) {
    return res.status(400).json({
      success: false,
      message: 'El campo gender debe ser M o F.',
    });
  }

  if (isNaN(Date.parse(birthDate))) {
    return res.status(400).json({
      success: false,
      message: 'El campo birthDate debe ser una fecha válida.',
    });
  }

  next();
};
