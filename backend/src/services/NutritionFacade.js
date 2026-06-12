/**
 * @fileoverview Fachada de Orquestación Nutricional (Versión ESM).
 */

import {metricData} from '../data/metricData.js';
import { NormalState, RiskState, AlertState, HealthyEatingStrategy, LowWeightStrategy } from './index.js';
//mport { HealthyEatingStrategy, LowWeightStrategy } from './strategies/index.js'; 

class NutritionFacade {
    /**
     * Orquesta el flujo completo de evaluación, persistencia e intervención nutricional.
     * @param {string} patientId - Identificador único del paciente.
     * @param {number} weight - Peso actual en kg.
     * @param {number} height - Talla actual en cm.
     * @returns {Promise<Object>} DTO formateado.
     */
    async executeAssessment(patientId, weight, height) {
        try {
            const savedMetric = await metricData.save({
                patientId,
                weight,
                height,
                date: new Date()
            });

            const clinicalState = this._resolveClinicalState(savedMetric);
            const interventionStrategy = this._resolveStrategy(clinicalState);
            const interventionResult = interventionStrategy.execute(savedMetric, clinicalState);

            return {
                success: true,
                meta: {
                    metricId: savedMetric._id,
                    processedAt: savedMetric.date
                },
                patientId: savedMetric.patientId,
                clinicalStatus: {
                    state: clinicalState.getName(),
                    riskLevel: clinicalState.getRiskLevel(),
                    requiresUrgentAction: clinicalState.isUrgent()
                },
                treatmentPlan: {
                    strategyApplied: interventionStrategy.getName(),
                    dietaryGuidelines: interventionResult.guidelines,
                    monitoringInterval: interventionResult.nextCheckIn,
                    observations: interventionResult.notes
                }
            };
        } catch (error) {
            throw new Error(`[NutritionFacade Exception] Error en subsistema clínico: ${error.message}`);
        }
    }

    _resolveClinicalState(metric) {
        const ratio = metric.weight / (metric.height / 100);
        if (ratio < 12) return new AlertState();
        if (ratio >= 12 && ratio < 15) return new RiskState();
        return new NormalState();
    }

    _resolveStrategy(state) {
        if (state.isUrgent() || state.getRiskLevel() === 'HIGH') {
            return new LowWeightStrategy();
        }
        return new HealthyEatingStrategy();
    }
}

// Exportación como Singleton compatible con ESM
export default new NutritionFacade();