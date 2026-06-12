import { NutritionObserver } from '../interfaces/NutritionObserver.js';

export class HistorialObserver extends NutritionObserver {
    update(event, data) {
        if (event === 'assessment:completed') {
            console.log(`[HistorialObserver] Registro agregado al historial del paciente ${data.patientId} - Estado: ${data.clinicalStatus.state} - Fecha: ${data.meta.processedAt}`);
        }
    }
}