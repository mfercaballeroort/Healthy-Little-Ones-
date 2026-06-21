import { patientData } from '../data/patientData.js';

// Helper: calcula edad en meses desde una fecha de nacimiento
const calcAgeInMonths = (birthDate) => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const diffMs = Date.now() - birth.getTime();
  return Math.floor(diffMs / (30.44 * 24 * 60 * 60 * 1000));
};

const SYSTEM_PROMPT =
  'Sos un asistente de salud infantil. Respondé siempre en español, de forma breve, ' +
  'clara y amigable para padres. No diagnosticás ni reemplazás al médico: si los datos ' +
  'sugieren una situación de riesgo, recomendá explícitamente la consulta con un profesional. ' +
  'Considerá la edad del niño y, si están disponibles, sus alergias o patologías al dar consejos.';

/**
 * POST /api/ai/orientation
 * Body: { patientId: string }
 *
 * Genera orientación nutricional breve con IA para un paciente.
 * La API key de Anthropic vive únicamente acá, en el servidor — nunca en el frontend.
 */
export const getAIOrientation = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere patientId.',
      });
    }

    const patient = await patientData.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('Falta ANTHROPIC_API_KEY en las variables de entorno del backend.');
      return res.status(503).json({
        success: false,
        message: 'El servicio de orientación con IA no está configurado en este momento.',
      });
    }

    const ageInMonths = calcAgeInMonths(patient.birthDate);
    const genderLabel = patient.gender === 'F' ? 'femenino' : 'masculino';

    const userPrompt =
      `Paciente: ${patient.firstName} ${patient.lastName}, ` +
      `edad aproximada ${ageInMonths ?? '—'} meses, sexo ${genderLabel}. ` +
      (patient.observations ? `Observaciones registradas: ${patient.observations}. ` : '') +
      'Dame 2-3 consejos nutricionales generales y breves, apropiados para esta edad.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Error de la API de Anthropic:', response.status, errBody);
      return res.status(502).json({
        success: false,
        message: 'No se pudo obtener la orientación de IA en este momento.',
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? 'No se pudo generar una respuesta.';

    return res.status(200).json({
      success: true,
      data: {
        text,
        disclaimer: 'Esta orientación es general y no reemplaza la consulta con un profesional de la salud.',
      },
    });
  } catch (error) {
    console.error('Error en getAIOrientation:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
