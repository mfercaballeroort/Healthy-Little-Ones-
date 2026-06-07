/**
 * @fileoverview Definición de endpoints para el módulo de nutrición (Versión ESM).
 */

import express from 'express';
import { evaluateNutrition } from '../controllers/nutritionController.js';

const router = express.Router();

// POST /api/v1/nutrition/assessment
router.post('/assessment', evaluateNutrition);

export default router;