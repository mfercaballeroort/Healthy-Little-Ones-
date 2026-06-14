/**
 * @fileoverview Servicio de cálculo de Z-scores y percentilos
 * según los estándares de crecimiento de la OMS (2006), método LMS.
 * 
 * Referencia: Cole TJ. The LMS method for constructing normalized growth standards.
 * Eur J Clin Nutr. 1990;44:45-60.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TABLES_DIR = join(__dirname, 'tables');

// Cargo las 6 tablas al iniciar el servicio (no en cada request).
// readFileSync se ejecuta una sola vez al importar el módulo.
const tables = {
  wfa: {
    M: JSON.parse(readFileSync(join(TABLES_DIR, 'wfa_boys.json'), 'utf-8')),
    F: JSON.parse(readFileSync(join(TABLES_DIR, 'wfa_girls.json'), 'utf-8')),
  },
  lhfa: {
    M: JSON.parse(readFileSync(join(TABLES_DIR, 'lhfa_boys.json'), 'utf-8')),
    F: JSON.parse(readFileSync(join(TABLES_DIR, 'lhfa_girls.json'), 'utf-8')),
  },
  bfa: {
    M: JSON.parse(readFileSync(join(TABLES_DIR, 'bfa_boys.json'), 'utf-8')),
    F: JSON.parse(readFileSync(join(TABLES_DIR, 'bfa_girls.json'), 'utf-8')),
  },
};

class WhoGrowthService {

  /**
   * Busca la fila L, M, S para una edad exacta o interpola entre dos vecinas.
   * @private
   */
  _findLMS(table, ageMonths) {
    // Caso 1: edad fuera de rango
    if (ageMonths < 0 || ageMonths > 60) return null;

    // Caso 2: edad entera exacta → match directo
    if (Number.isInteger(ageMonths)) {
      return table.find(r => r.age === ageMonths) || null;
    }

    // Caso 3: edad con decimales → interpolar entre el mes anterior y el siguiente
    const lower = Math.floor(ageMonths);
    const upper = Math.ceil(ageMonths);
    const rLower = table.find(r => r.age === lower);
    const rUpper = table.find(r => r.age === upper);
    if (!rLower || !rUpper) return null;

    const fraction = ageMonths - lower;
    return {
      age: ageMonths,
      L: rLower.L + (rUpper.L - rLower.L) * fraction,
      M: rLower.M + (rUpper.M - rLower.M) * fraction,
      S: rLower.S + (rUpper.S - rLower.S) * fraction,
    };
  }

  /**
   * Fórmula Cole-Green: convierte una medición en Z-score.
   * Z = ((X/M)^L - 1) / (L*S)   si L ≠ 0
   * Z = ln(X/M) / S             si L = 0
   * @private
   */
  _calculateZScore(value, lms) {
    const { L, M, S } = lms;
    if (L === 0) {
      return Math.log(value / M) / S;
    }
    return (Math.pow(value / M, L) - 1) / (L * S);
  }

  /**
   * Z-score aproximado a percentilo.
   * Usa la aproximación de Abramowitz & Stegun (suficientemente precisa).
   * @private
   */
  _zToPercentile(z) {
    // Función de distribución acumulada (CDF) de la normal estándar
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (z > 0) p = 1 - p;
    return Math.round(p * 1000) / 10; // un decimal: 50.0, 97.7, etc.
  }

  /**
   * Clasifica el Z-score según puntos de corte OMS estándar.
   * @private
   */
  _classifyZ(z, indicator) {
    // Puntos de corte recomendados por OMS
    // (más extremos = más urgente)
    if (z < -3) return { label: 'severo_bajo', risk: 'Alto', urgent: true };
    if (z < -2) return { label: 'moderado_bajo', risk: 'Moderado', urgent: false };
    if (z <= 2) return { label: 'normal', risk: 'Bajo', urgent: false };
    if (z <= 3) {
      // Sobrepeso solo aplica a indicadores de peso/IMC, no a talla
      if (indicator === 'lhfa') return { label: 'talla_alta', risk: 'Bajo', urgent: false };
      return { label: 'sobrepeso', risk: 'Moderado', urgent: false };
    }
    if (indicator === 'lhfa') return { label: 'talla_muy_alta', risk: 'Bajo', urgent: false };
    return { label: 'obesidad', risk: 'Alto', urgent: true };
  }

  /**
   * Método PÚBLICO principal.
   * Calcula los Z-scores y percentilos para los 3 indicadores OMS.
   * 
   * @param {Object} params
   * @param {'M'|'F'} params.sex - Sexo biológico
   * @param {number} params.ageMonths - Edad en meses (admite decimales)
   * @param {number} params.weight - Peso en kg
   * @param {number} params.height - Talla en cm
   * @returns {Object} Resultado con los 3 indicadores y un resumen
   */
  calculate({ sex, ageMonths, weight, height }) {
    // Validar rango etario OMS 2006 (0-60 meses)
    if (ageMonths < 0 || ageMonths > 60) {
      return {
        inRange: false,
        message: 'Las tablas OMS de esta versión cubren 0 a 60 meses (0-5 años). Para edades mayores, próximamente.',
        ageMonths,
      };
    }

    // 1. Weight-for-age (peso/edad)
    const wfaLMS = this._findLMS(tables.wfa[sex], ageMonths);
    const wfaZ = wfaLMS ? this._calculateZScore(weight, wfaLMS) : null;

    // 2. Length/Height-for-age (talla/edad)
    const lhfaLMS = this._findLMS(tables.lhfa[sex], ageMonths);
    const lhfaZ = lhfaLMS ? this._calculateZScore(height, lhfaLMS) : null;

    // 3. BMI-for-age (IMC/edad)
    const heightMeters = height / 100;
    const bmi = weight / (heightMeters * heightMeters);
    const bfaLMS = this._findLMS(tables.bfa[sex], ageMonths);
    const bfaZ = bfaLMS ? this._calculateZScore(bmi, bfaLMS) : null;

    // Para el "estado global", uso el indicador más severo
    const indicators = {
      wfa: this._buildIndicator(wfaZ, 'wfa'),
      lhfa: this._buildIndicator(lhfaZ, 'lhfa'),
      bfa: { ...this._buildIndicator(bfaZ, 'bfa'), bmi: Math.round(bmi * 10) / 10 },
    };

    // Determinar nivel de riesgo general (el peor de los 3)
    const overallRisk = this._aggregateRisk(indicators);

    return {
      inRange: true,
      sex,
      ageMonths,
      weight,
      height,
      bmi: Math.round(bmi * 10) / 10,
      indicators,
      overallRisk,
    };
  }

  _buildIndicator(z, indicator) {
    if (z === null) return { zScore: null, percentile: null, classification: null };
    const classification = this._classifyZ(z, indicator);
    return {
      zScore: Math.round(z * 100) / 100,   // dos decimales
      percentile: this._zToPercentile(z),
      classification,
    };
  }

  _aggregateRisk(indicators) {
    const risks = [
      indicators.wfa?.classification,
      indicators.lhfa?.classification,
      indicators.bfa?.classification,
    ].filter(Boolean);

    if (risks.some(c => c.urgent)) return 'Alto';
    if (risks.some(c => c.risk === 'Moderado')) return 'Moderado';
    return 'Bajo';
  }
}

// Singleton — una sola instancia compartida
export default new WhoGrowthService();