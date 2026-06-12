// backend/src/data/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['medico', 'nutricionista', 'padre'],
        default: 'padre'
    },
    // Solo se usa cuando role === 'padre': IDs de los hijos (pacientes)
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }],
    // Solo se usa cuando role === 'medico' o 'nutricionista': pacientes asignados
    assignedPatients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }]
}, { timestamps: true });

// Cuando el documento se serializa a JSON, nunca exponer el password
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});

export default mongoose.model('User', userSchema);