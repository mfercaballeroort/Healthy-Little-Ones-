/**
 * @fileoverview Fachada de Orquestación Nutricional (Versión ESM).
 */

import { metricData } from '../data/metricData.js';
import { 
    NormalState, RiskState, AlertState, 
    HealthyEatingStrategy, LowWeightStrategy,
    HistorialObserver, AlertObserver, ContenidoObserver
} from './index.js';

class NutritionFacade {
    constructor() {
        this._observers = [
            new HistorialObserver(),
            new AlertObserver(),
            new ContenidoObserver()
        ];
    }

    subscribe(observer) {
        this._observers.push(observer);
    }

    unsubscribe(observer) {
        this._observers = this._observers.filter(o => o !== observer);
    }

    _notify(event, data) {
        this._observers.forEach(observer => observer.update(event, data));
    }

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
            const interventionResult = interventionStrategy.generateAdvice(null, savedMetric, clinicalState);

            const result = {
                success: true,
                meta: {
                    metricId: savedMetric._id,
                    processedAt: savedMetric.date
                },
                patientId: savedMetric.patientId,
                clinicalStatus: {
                    state: clinicalState.constructor.name,
                    riskLevel: clinicalState.getRiskLevel(),
                    requiresUrgentAction: clinicalState.requiresMedicalAttention()
                },
                treatmentPlan: {
                    strategyApplied: interventionStrategy.constructor.name,
                    dietaryGuidelines: interventionResult.actionableAdvice,
                    monitoringInterval: interventionResult.requiresFollowUp ? 'Corto plazo' : 'Control habitual',
                    observations: interventionResult.medicalMessage
                }
            };

            this._notify('assessment:completed', result);

            return result;

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
        if (state.requiresMedicalAttention() || state.getRiskLevel() === 'Alto') {
            return new LowWeightStrategy();
        }
        return new HealthyEatingStrategy();
    }
}

export default new NutritionFacade();