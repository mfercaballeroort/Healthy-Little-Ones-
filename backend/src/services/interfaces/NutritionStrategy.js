// src/services/interfaces/NutritionStrategy.js

export class NutritionStrategy {
  constructor() {
    if (this.constructor === NutritionStrategy) {
      throw new Error("La clase abstracta 'NutritionStrategy' no puede ser instanciada directamente.");
    }
  }

  /**
   * Genera el plan de acción basado en las métricas y el estado de riesgo.
   * @param {Object} child - Datos del paciente (sexo, edad gestacional, etc.)
   * @param {Object} record - Las métricas actuales (peso, talla)
   * @param {Object} state - El estado nutricional evaluado (NutritionState)
   */
  generateAdvice(child, record, state) {
    throw new Error("El método 'generateAdvice()' debe ser implementado por la clase concreta.");
  }
}