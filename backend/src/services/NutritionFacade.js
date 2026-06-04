/**
 * @fileoverview Fachada de Orquestación Nutricional.
 * Encapsula la complejidad del subsistema de evaluación clínica (Data Layer, State y Strategy),
 * proveyendo una interfaz unificada y simplificada a los controladores de la aplicación.
 */

const metricData = require('../data/metricData');
const { NormalState, RiskState, AlertState } = require('./states'); // Ajustar ruta según estructura real
const { HealthyEatingStrategy, LowWeightStrategy } = require('./strategies'); // Ajustar ruta según estructura real

class NutritionFacade {
    /**
     * Orquesta el flujo completo de evaluación, persistencia e intervención nutricional.
     * @param {string} patientId - Identificador único del paciente (UUID o ObjectId).
     * @param {number} weight - Peso actual del paciente en kilogramos.
     * @param {number} height - Talla/Estatura actual del paciente en centímetros.
     * @returns {Promise<Object>} Data Transfer Object (DTO) formateado con el diagnóstico y plan de acción.
     * @throws {Error} Propaga excepciones controladas ante fallos en el subsistema.
     */
    async executeAssessment(patientId, weight, height) {
        try {
            // 1. Aislamiento y persistencia en la Capa de Datos
            // Se invoca el repositorio abstrayendo por completo el driver de MongoDB Atlas
            const savedMetric = await metricData.save({
                patientId,
                weight,
                height,
                date: new Date()
            });

            // 2. Determinación del Estado Clínico (Patrón State)
            // Se evalúan las métricas para instanciar el estado concreto correspondiente
            const clinicalState = this._resolveClinicalState(savedMetric);

            // 3. Selección Dinámica del Motor de Intervención (Patrón Strategy)
            // La fachada decide qué estrategia inyectar basándose en el estado de riesgo
            const interventionStrategy = this._resolveStrategy(clinicalState);

            // 4. Ejecución del algoritmo de negocio de la estrategia
            // Se procesa el protocolo clínico combinando el estado y los datos duros
            const interventionResult = interventionStrategy.execute(savedMetric, clinicalState);

            // 5. Construcción del Data Transfer Object (DTO) de salida
            // Se desacoplan los modelos internos y se retorna un objeto limpio y determinista para el Controller
            return {
                success: true,
                meta: {
                    metricId: savedMetric._id,
                    processedAt: savedMetric.date
                },
                patientId: savedMetric.patientId,
                clinicalStatus: {
                    state: clinicalState.getName(), // Expone el nombre del estado (e.g., "AlertState")
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
            // Captura de errores y envoltura semántica para no romper el ciclo de vida de la capa superior
            throw new Error(`[NutritionFacade Exception] Error al procesar el subsistema clínico: ${error.message}`);
        }
    }

    /**
     * Componente interno analítico encargado de mapear métricas a Estados Clínicos.
     * Centraliza las reglas de negocio iniciales para la instanciación de clases concretas.
     * @param {Object} metric - Mapeo de la métrica persistida.
     * @returns {NutritionState} Instancia hija que implementa el contrato NutritionState.
     * @private
     */
    _resolveClinicalState(metric) {
        // NOTA: Aquí se integrará la lógica analítica real (ej. Desvío Estándar, Percentiles o IMC).
        // Se simula la evaluación heurística para la ramificación de los objetos de estado.
        const ratio = metric.weight / (metric.height / 100);

        if (ratio < 12) {
            return new AlertState();
        } else if (ratio >= 12 && ratio < 15) {
            return new RiskState();
        } else {
            return new NormalState();
        }
    }

    /**
     * Selector encargado de emparejar el Estado Clínico con el motor algorítmico adecuado.
     * @param {NutritionState} state - Instancia del estado actual del paciente.
     * @returns {NutritionStrategy} Instancia concreta de la estrategia de intervención.
     * @private
     */
    _resolveStrategy(state) {
        // Si el estado clínico determina urgencia o riesgo, se inyecta la estrategia terapéutica de bajo peso
        if (state.isUrgent() || state.getRiskLevel() === 'HIGH') {
            return new LowWeightStrategy();
        }
        
        // Estado por defecto o preventivo
        return new HealthyEatingStrategy();
    }
}

// Exportación como Singleton para garantizar una única instancia compartida a nivel de proceso
module.exports = new NutritionFacade();