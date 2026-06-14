/**
 * Consejos de alimentación saludable por rango etario.
 * Aplicado cuando el paciente está en estado nutricional normal.
 */

export const HEALTHY_EATING_ADVICE = {
  lactante_exclusivo: {
    advice: 'Mantener lactancia materna exclusiva a demanda. Si recibe fórmula, respetar la dilución indicada por el pediatra. No incorporar agua, infusiones ni otros alimentos antes de los 6 meses.',
    message: 'Crecimiento adecuado para un lactante en periodo de lactancia exclusiva.',
  },
  lactante_complementario: {
    advice: 'Continuar con lactancia materna a demanda. Iniciar alimentación complementaria con consistencias progresivas. Introducir un alimento nuevo por vez para evaluar tolerancia. Evitar azúcares, sal, miel y leche de vaca entera.',
    message: 'Crecimiento adecuado durante la incorporación de alimentación complementaria.',
  },
  nino_pequeno: {
    advice: 'Ofrecer 4 comidas diarias más una a dos colaciones saludables. Variedad de frutas, verduras, cereales integrales y proteínas. Mantener lactancia materna si la familia lo desea. Limitar ultraprocesados y bebidas azucaradas.',
    message: 'Crecimiento adecuado durante la transición a la alimentación familiar.',
  },
  preescolar: {
    advice: 'Alimentación variada con frutas y verduras en cada comida, lácteos diarios, cereales integrales, carnes magras o legumbres. Limitar golosinas, snacks y gaseosas. Promover el agua como bebida principal. Comer en familia favorece buenos hábitos.',
    message: 'Crecimiento adecuado en etapa preescolar.',
  },
  escolar: {
    advice: 'Desayuno completo y nutritivo todos los días. Vianda escolar con frutas, agua y un alimento sustancioso. Limitar pantallas durante las comidas. Promover actividad física diaria (al menos 60 minutos) y descanso adecuado.',
    message: 'Crecimiento adecuado en edad escolar.',
  },
  adolescente: {
    advice: 'Asegurar 4 comidas diarias respetando los horarios. Aumentar consumo de calcio (lácteos), hierro (carnes magras, legumbres) y ácidos grasos esenciales. Atención a patrones alimentarios restrictivos o emocionales. Promover hidratación, actividad física y descanso.',
    message: 'Crecimiento adecuado en etapa adolescente.',
  },
};