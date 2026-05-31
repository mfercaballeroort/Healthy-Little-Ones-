import { NutritionStrategy } from '../interfaces/NutritionStrategy.js';

export class LowWeightStrategy extends NutritionStrategy {
  generateAdvice(child, record, state) {
    const risk = state.getRiskLevel();
    const needsAttention = state.requiresMedicalAttention();
    
    let intervention = 'Revisar técnica de lactancia o dilución de fórmula. Incrementar densidad calórica de las papillas agregando aceites vegetales crudos.';

    if (needsAttention) {
      intervention = 'ALERTA: Derivación urgente. Solicitar laboratorio completo y descartar patología orgánica (ej. malabsorción, celiaquía) o causas psicosociales.';
    }

    return {
      protocol: 'Recuperación Nutricional',
      riskLevel: risk,
      actionableAdvice: intervention,
      requiresFollowUp: true, // Cita a corto plazo
      medicalMessage: state.getBaseMessage()
    };
  }
}