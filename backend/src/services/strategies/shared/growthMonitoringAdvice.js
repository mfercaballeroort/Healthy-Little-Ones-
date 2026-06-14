/**
 * Intervenciones de monitoreo cuando hay riesgo moderado.
 * Cada rango tiene dos niveles: el seguimiento normal y el caso que requiere atención.
 */

export const GROWTH_MONITORING_ADVICE = {
  lactante_exclusivo: {
    monitoring: 'Aumentar frecuencia de controles pediátricos (mensuales). Evaluar técnica de lactancia, número de tomas y diuresis. Reforzar pautas de puericultura.',
    urgent:     'Consulta pediátrica a corto plazo para descartar dificultades en la alimentación o causas médicas que afecten la ganancia de peso.',
    message:    'Curva de crecimiento que requiere monitoreo activo en el periodo de lactancia.',
  },
  lactante_complementario: {
    monitoring: 'Aumentar frecuencia de controles. Reforzar densidad calórica de papillas. Evaluar variedad y cantidad de alimentos ofrecidos. Sostener la lactancia.',
    urgent:     'Consulta pediátrica a corto plazo. Evaluar posibles causas de desaceleración: alimentación insuficiente, rechazo a sólidos o intolerancias.',
    message:    'Curva de crecimiento que requiere atención durante la incorporación de sólidos.',
  },
  nino_pequeno: {
    monitoring: 'Controles cada 1-2 meses. Ofrecer alimentos densos en calorías y nutrientes. Evaluar conducta alimentaria y rutinas familiares. Promover actividad física apropiada.',
    urgent:     'Consulta pediátrica/nutricional a corto plazo. Posibles causas: neofobia alimentaria persistente, infecciones recurrentes, factores psicosociales.',
    message:    'Curva de crecimiento que requiere intervención durante la transición alimentaria.',
  },
  preescolar: {
    monitoring: 'Controles cada 2-3 meses. Ajustar plan alimentario aumentando densidad calórica. Trabajar hábitos en familia: horarios regulares, evitar distracciones. Actividad física diaria.',
    urgent:     'Consulta pediátrica/nutricional a corto plazo. Descartar causas orgánicas y/o trastornos de conducta alimentaria emergentes.',
    message:    'Curva de crecimiento que requiere intervención en etapa preescolar.',
  },
  escolar: {
    monitoring: 'Controles cada 3 meses. Ajustar aporte energético según actividad. Trabajar educación alimentaria con el niño y la familia. Atención al rendimiento escolar y descanso.',
    urgent:     'Consulta pediátrica a corto plazo. Evaluar posibles causas: dieta restrictiva, estrés escolar/familiar, signos de bullying o causas orgánicas.',
    message:    'Curva de crecimiento que requiere intervención en edad escolar.',
  },
  adolescente: {
    monitoring: 'Controles cada 3 meses. Evaluar patrones alimentarios, posibles dietas restrictivas y relación con el cuerpo. Acompañar con educación nutricional y emocional.',
    urgent:     'Consulta pediátrica/de salud mental a corto plazo. Descartar trastornos de la conducta alimentaria, patología orgánica o causas socioemocionales.',
    message:    'Curva de crecimiento que requiere intervención en etapa adolescente.',
  },
};