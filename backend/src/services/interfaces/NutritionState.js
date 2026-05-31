// src/services/interfaces/NutritionState.js

export class NutritionState {
  constructor() {
    if (this.constructor === NutritionState) {
      throw new Error("La clase abstracta 'NutritionState' no puede ser instanciada directamente.");
    }
  }

  getRiskLevel() {
    throw new Error("El método 'getRiskLevel()' debe ser implementado por la clase concreta.");
  }

  getBaseMessage() {
    throw new Error("El método 'getBaseMessage()' debe ser implementado por la clase concreta.");
  }

  requiresMedicalAttention() {
    throw new Error("El método 'requiresMedicalAttention()' debe ser implementado por la clase concreta.");
  }
}