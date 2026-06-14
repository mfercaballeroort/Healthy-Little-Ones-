import { NutritionStrategy } from '../interfaces/NutritionStrategy.js';
import { resolveAgeRange } from './shared/ageRanges.js';
import { HEALTHY_EATING_ADVICE } from './shared/healthyEatingAdvice.js';

export class HealthyEatingStrategy extends NutritionStrategy {
  generateAdvice(child, record, state) {
    const risk = state.getRiskLevel();
    const range = resolveAgeRange(child?.ageInMonths);
    const tableEntry = HEALTHY_EATING_ADVICE[range.id];

    return {
      protocol: 'Prevención y Mantenimiento',
      ageRange: range.name,
      riskLevel: risk,
      actionableAdvice: tableEntry.advice,
      requiresFollowUp: false,
      medicalMessage: tableEntry.message,
    };
  }
}