import { NutritionObserver } from '../interfaces/NutritionObserver.js';

export class AlertObserver extends NutritionObserver {
    update(event, data) {
        if (event === 'assessment:completed' && data.clinicalStatus.requiresUrgentAction) {
            console.log(`[AlertObserver] ⚠️ ALERTA CRÍTICA - Paciente ${data.patientId} requiere atención médica urgente. Nivel de riesgo: ${data.clinicalStatus.riskLevel}`);
        }
    }
}