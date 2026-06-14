import { NutritionStrategy } from '../interfaces/NutritionStrategy.js';
import { resolveAgeRange } from './shared/ageRanges.js';
import { LOW_WEIGHT_ADVICE } from './shared/lowWeightAdvice.js';

export class LowWeightStrategy extends NutritionStrategy {
  generateAdvice(child, record, state) {
    const risk = state.getRiskLevel();
    const needsAttention = state.requiresMedicalAttention();
    const range = resolveAgeRange(child?.ageInMonths);
    const tableEntry = LOW_WEIGHT_ADVICE[range.id];

    const intervention = needsAttention ? tableEntry.urgent : tableEntry.intervention;

    return {
      protocol: 'Recuperación Nutricional',
      ageRange: range.name,
      riskLevel: risk,
      actionableAdvice: intervention,
      requiresFollowUp: true,
      medicalMessage: tableEntry.message,
    };
  }
}