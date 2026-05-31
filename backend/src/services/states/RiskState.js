import { NutritionState } from '../interfaces/NutritionState.js';

export class RiskState extends NutritionState {
  getRiskLevel() {
    return 'Moderado';
  }

  getBaseMessage() {
    return 'Desviación en la curva de crecimiento detectada. Se observa un aplanamiento o caída interpercentilar que requiere monitoreo preventivo y pautas de alarma.';
  }

  requiresMedicalAttention() {
    // Requiere programar una cita a corto/mediano plazo para reevaluación clínica
    return false; 
  }
}