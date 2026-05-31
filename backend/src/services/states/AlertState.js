import { NutritionState } from '../interfaces/NutritionState.js';

export class AlertState extends NutritionState {
  getRiskLevel() {
    return 'Alto';
  }

  getBaseMessage() {
    return 'Riesgo nutricional severo. Los parámetros antropométricos indican una alteración crítica (ej. desnutrición aguda o sobrepeso severo). Requiere intervención inmediata.';
  }

  requiresMedicalAttention() {
    // Derivación directa y urgente para evaluación exhaustiva
    return true; 
  }
}