/**
 * @fileoverview Fachada de Orquestación Nutricional (Versión ESM).
 */

import { metricData } from '../data/metricData.js';
import { patientData } from '../data/patientData.js';
import whoGrowthService from './whoStandards/WhoGrowthService.js';
import {
  NormalState, RiskState, AlertState,
  HealthyEatingStrategy, LowWeightStrategy, GrowthMonitoringStrategy,
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

  _calculateAgeInMonths(birthDate) {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const diffMs = Date.now() - birth.getTime();
    return Math.floor(diffMs / (30.44 * 24 * 60 * 60 * 1000));
  }

  async executeAssessment(patientId, weight, height) {
    try {
      // 1. Cargar paciente
      const patient = await patientData.findById(patientId);
      if (!patient) throw new Error('Paciente no encontrado.');

      // 2. Persistir la métrica
      const savedMetric = await metricData.save({
        patientId,
        weight,
        height,
        date: new Date()
      });

      const ageInMonths = this._calculateAgeInMonths(patient.birthDate);
      const childContext = { ...patient, ageInMonths };

      // 3. ✨ NUEVO: calcular Z-scores y percentilos con servicio OMS
      const whoResult = whoGrowthService.calculate({
        sex: patient.gender,        // 'M' o 'F' (ya está bien en tu modelo)
        ageMonths: ageInMonths,
        weight,
        height,
      });

      // 4. Resolver State según el resultado OMS (o fallback si está fuera de rango)
      const clinicalState = this._resolveClinicalState(whoResult);
      const interventionStrategy = this._resolveStrategy(clinicalState);
      const interventionResult = interventionStrategy.generateAdvice(
        childContext,
        savedMetric,
        clinicalState
      );

      // 5. Armar la respuesta
      const result = {
        success: true,
        meta: {
          metricId: savedMetric._id,
          processedAt: savedMetric.date
        },
        patientId: savedMetric.patientId,
        patient: {
          name: `${patient.firstName} ${patient.lastName}`,
          ageInMonths,
        },
        whoAssessment: whoResult,    // ← Z-scores, percentilos y clasificaciones
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
        },
        disclaimer: 'GrowSmart AI es una herramienta de cribado nutricional. No reemplaza la consulta con un profesional de la salud.',
      };

      this._notify('assessment:completed', result);
      return result;
    } catch (error) {
      throw new Error(`[NutritionFacade Exception] Error en subsistema clínico: ${error.message}`);
    }
  }

  /**
   * Determina el estado clínico basado en el resultado OMS.
   * Si está fuera de rango (>5 años), usa fallback al ratio simple.
   */
  _resolveClinicalState(whoResult) {
    // Fallback para edades fuera de rango OMS 0-60 meses
    if (!whoResult.inRange) {
      // Cálculo simple temporal (TODO Fase 2: tablas 5-19 años)
      return new NormalState();
    }

    if (whoResult.overallRisk === 'Alto') return new AlertState();
    if (whoResult.overallRisk === 'Moderado') return new RiskState();
    return new NormalState();
  }

  _resolveStrategy(state) {
    if (state.requiresMedicalAttention()) return new LowWeightStrategy();
    if (state.getRiskLevel() === 'Moderado') return new GrowthMonitoringStrategy();
    return new HealthyEatingStrategy();
  }
}

export default new NutritionFacade();