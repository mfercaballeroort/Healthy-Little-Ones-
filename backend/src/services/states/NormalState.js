import { NutritionState } from '../interfaces/NutritionState.js';

export class NormalState extends NutritionState {
  getRiskLevel() {
    return 'Bajo';
  }

  getBaseMessage() {
    return 'Crecimiento eutrófico. Las variables antropométricas se mantienen dentro de los percentilos esperables para su edad gestacional corregida y sexo biológico.';
  }

  requiresMedicalAttention() {
    // No requiere intervención aguda, solo control pediátrico de rutina
    return false; 
  }
}