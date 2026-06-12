import { NutritionStrategy } from '../interfaces/NutritionStrategy.js';

export class GrowthMonitoringStrategy extends NutritionStrategy {
    generateAdvice(child, record, state) {
        const risk = state.getRiskLevel();
        const needsAttention = state.requiresMedicalAttention();

        let intervention = 'Aumentar frecuencia de controles antropométricos. Reforzar diversidad alimentaria y densidad calórica. Evaluar curva de crecimiento en próxima consulta.';

        if (needsAttention) {
            intervention = 'Programar consulta pediátrica a corto plazo. Evaluar posibles causas de desaceleración del crecimiento y ajustar plan alimentario.';
        }

        return {
            protocol: 'Monitoreo y Seguimiento del Crecimiento',
            riskLevel: risk,
            actionableAdvice: intervention,
            requiresFollowUp: true,
            medicalMessage: state.getBaseMessage()
        };
    }
}