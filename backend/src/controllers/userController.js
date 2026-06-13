// backend/src/controllers/userController.js
import userData from '../data/userData.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mapea cada rol profesional con la variable de entorno que contiene su código
const INVITE_CODES = {
    medico: 'INVITE_CODE_MEDICO',
    nutricionista: 'INVITE_CODE_NUTRICIONISTA'
};

// Helper: genera el JWT para un usuario
function generateToken(user) {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

/**
 * POST /api/users/register
 * Body: { name, email, password, role, inviteCode? }
 * inviteCode es obligatorio si role es 'medico' o 'nutricionista'.
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role = 'padre', inviteCode } = req.body;

        // Validar que el rol sea uno de los permitidos
        if (!['padre', 'medico', 'nutricionista'].includes(role)) {
            return res.status(400).json({ message: 'Rol inválido' });
        }

        // Si el rol requiere código de invitación, validarlo
        if (INVITE_CODES[role]) {
            const expectedCode = process.env[INVITE_CODES[role]];
            if (!inviteCode || inviteCode !== expectedCode) {
                return res.status(403).json({
                    message: `Código de invitación inválido para el rol ${role}`
                });
            }
        }

        // Verificar que el email no esté ya registrado
        const existingUser = await userData.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userData.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        const token = generateToken(newUser);

        // Gracias al transform toJSON en el modelo, password no se incluye
        res.status(201).json({
            message: 'Usuario creado',
            token,
            user: newUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/users/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userData.findByEmailWithPassword(email);
        if (!user) {
            // Mensaje genérico para no revelar si el email existe
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = generateToken(user);

        res.status(200).json({
            token,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/users/me
 * Devuelve el usuario del token. Útil para el frontend al iniciar la app:
 * si hay token guardado, se valida y se recupera el user sin pedir login.
 */
export const me = async (req, res) => {
    // req.user fue cargado por authMiddleware
    res.status(200).json({ user: req.user });
};

/**
 * GET /api/users
 * Solo médicos y nutricionistas pueden listar usuarios.
 */
export const getAll = async (req, res) => {
    try {
        const users = await userData.getAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/users/:id
 * Cada usuario solo puede ver su propio perfil.
 * Médicos y nutricionistas pueden ver a cualquiera.
 */
export const getById = async (req, res) => {
    try {
        const requestedId = req.params.id;
        const isSelf = req.user._id.toString() === requestedId;
        const isProfessional = ['medico', 'nutricionista'].includes(req.user.role);

        if (!isSelf && !isProfessional) {
            return res.status(403).json({ message: 'No tenés permiso para ver este perfil' });
        }

        const user = await userData.findById(requestedId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
/**
 * GET /api/users/professionals
 * Devuelve médicos y nutricionistas (solo nombre/email/rol).
 * Solo padres pueden listar para elegir a quién asignar.
 */
export const getProfessionals = async (req, res) => {
  try {
    if (req.user.role !== 'padre') {
      return res.status(403).json({ message: 'Solo padres pueden consultar profesionales.' });
    }
    const medicos = await userData.findByRole('medico');
    const nutricionistas = await userData.findByRole('nutricionista');
    res.status(200).json({ medicos, nutricionistas });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/**
 * PUT /api/users/:id
 * Solo el propio usuario puede editarse a sí mismo.
 * No se puede cambiar el rol vía este endpoint (eso sería escalación de privilegios).
 */
export const update = async (req, res) => {
    try {
        const requestedId = req.params.id;
        const isSelf = req.user._id.toString() === requestedId;

        if (!isSelf) {
            return res.status(403).json({ message: 'Solo podés editar tu propio perfil' });
        }

        // Bloquear campos sensibles que no deben venir del cliente
        const { role, password, ...safeData } = req.body;

        const updated = await userData.update(requestedId, safeData);
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * DELETE /api/users/:id
 * Solo el propio usuario puede borrarse.
 */
export const remove = async (req, res) => {
    try {
        const requestedId = req.params.id;
        const isSelf = req.user._id.toString() === requestedId;

        if (!isSelf) {
            return res.status(403).json({ message: 'Solo podés eliminar tu propia cuenta' });
        }

        await userData.delete(requestedId);
        res.status(200).json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};