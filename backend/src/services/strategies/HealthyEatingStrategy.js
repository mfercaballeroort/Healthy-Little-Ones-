import { NutritionStrategy } from '../interfaces/NutritionStrategy.js';

export class HealthyEatingStrategy extends NutritionStrategy {
  generateAdvice(child, record, state) {
    // Validamos el estado actual
    const risk = state.getRiskLevel();
    
    // Lógica clínica: adaptamos el consejo según la edad o variables del paciente
    let baseAdvice = 'Mantener lactancia materna a demanda y/o fórmula de inicio.';
    
    // Ejemplo de lógica de negocio usando datos del modelo
    if (child.ageInMonths >= 6) {
      baseAdvice = 'Continuar con alimentación complementaria oportuna. Introducir un alimento nuevo por vez para evaluar tolerancia. Evitar azúcares y sal añadida.';
    }

    return {
      protocol: 'Prevención y Mantenimiento',
      riskLevel: risk,
      actionableAdvice: baseAdvice,
      requiresFollowUp: false, // Control sano habitual
      medicalMessage: state.getBaseMessage()
    };
  }
}