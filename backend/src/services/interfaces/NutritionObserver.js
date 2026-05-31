// src/services/interfaces/NutritionObserver.js

export class NutritionObserver {
  constructor() {
    if (this.constructor === NutritionObserver) {
      throw new Error("La clase abstracta 'NutritionObserver' no puede ser instanciada directamente.");
    }
  }

  /**
   * Método que se ejecuta cuando el EventManager notifica un cambio.
   * @param {String} event - Nombre del evento emitido
   * @param {Object} data - Payload con la información del paciente/evaluación
   */
  update(event, data) {
    throw new Error("El método 'update()' debe ser implementado por la clase concreta.");
  }
}