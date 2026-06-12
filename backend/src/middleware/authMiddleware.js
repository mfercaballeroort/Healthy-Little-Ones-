// backend/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import userData from '../data/userData.js';

/**
 * Verifica el JWT del header Authorization.
 * Si es válido, carga el usuario completo en req.user.
 */
export const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Cargamos el user completo desde la DB (no solo el payload del token)
        // para tener siempre datos frescos (rol, children, etc.)
        const user = await userData.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

/**
 * Verifica que req.user.role esté entre los roles permitidos.
 * Usar SIEMPRE después de authMiddleware.
 *
 * Ejemplo: router.get('/pacientes', authMiddleware, requireRole('medico', 'nutricionista'), handler)
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}`
            });
        }
        next();
    };
};