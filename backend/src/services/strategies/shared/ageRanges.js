/**
 * Rangos etarios pediátricos estándar (SAP / OMS).
 * Cada rango tiene un identificador, un nombre legible, y los límites
 * en meses (inclusive el min, exclusive el max).
 */

export const AGE_RANGES = [
  { id: 'lactante_exclusivo',    name: 'Lactante exclusivo (0-6 meses)',         minMonths: 0,   maxMonths: 6 },
  { id: 'lactante_complementario', name: 'Lactante con alimentación complementaria (6-12 meses)', minMonths: 6, maxMonths: 12 },
  { id: 'nino_pequeno',          name: 'Niño pequeño (1-2 años)',                minMonths: 12,  maxMonths: 24 },
  { id: 'preescolar',            name: 'Preescolar (2-5 años)',                  minMonths: 24,  maxMonths: 60 },
  { id: 'escolar',               name: 'Escolar (5-12 años)',                    minMonths: 60,  maxMonths: 144 },
  { id: 'adolescente',           name: 'Adolescente (12+ años)',                 minMonths: 144, maxMonths: Infinity },
];

/**
 * Dado un valor de edad en meses, devuelve el rango etario correspondiente.
 * Si por alguna razón no encuentra match (no debería pasar), devuelve preescolar como fallback seguro.
 */
export function resolveAgeRange(ageInMonths) {
  const safeAge = Number.isFinite(ageInMonths) && ageInMonths >= 0 ? ageInMonths : 0;
  const range = AGE_RANGES.find(r => safeAge >= r.minMonths && safeAge < r.maxMonths);
  return range || AGE_RANGES[3]; // fallback: preescolar
}