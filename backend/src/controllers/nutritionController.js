/**
 * @fileoverview Controlador REST para la gestión nutricional (Versión ESM).
 */

import nutritionFacade from '../services/NutritionFacade.js';

/**
 * Procesa la solicitud POST para una nueva evaluación nutricional.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const evaluateNutrition = async (req, res) => {
    try {
        const { patientId, weight, height } = req.body;

        // Guard Clause
        if (!patientId || typeof weight !== 'number' || typeof height !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Bad Request: Estructura de payload inválida.',
                details: 'Se requieren patientId (String), weight (Number) y height (Number).'
            });
        }

        const assessmentDTO = await nutritionFacade.executeAssessment(patientId, weight, height);
        return res.status(200).json(assessmentDTO);

    } catch (error) {
        console.error(`[NutritionController Error] ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Fallo al procesar la evaluación nutricional en el servidor.'
        });
    }
};