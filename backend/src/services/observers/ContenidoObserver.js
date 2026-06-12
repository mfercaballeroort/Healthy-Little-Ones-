import { NutritionObserver } from '../interfaces/NutritionObserver.js';

export class ContenidoObserver extends NutritionObserver {
    update(event, data) {
        if (event === 'assessment:completed') {
            const contenido = this._sugerirContenido(data.clinicalStatus.riskLevel);
            console.log(`[ContenidoObserver] Contenido sugerido para paciente ${data.patientId}: ${contenido}`);
        }
    }

    _sugerirContenido(riskLevel) {
        const contenidos = {
            'Bajo':     'Guía de alimentación complementaria saludable',
            'Moderado': 'Pautas de alarma y señales de desnutrición temprana',
            'Alto':     'Protocolo de recuperación nutricional urgente'
        };
        return contenidos[riskLevel] || 'Contenido general de nutrición pediátrica';
    }
}