import { Schema, model } from 'mongoose';

const patientSchema = new Schema(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El paciente debe estar asociado a un padre.'],
      index: true, // acelera las queries por parentId
    },
    firstName: {
      type: String,
      required: [true, 'El nombre del paciente es obligatorio.'],
      trim: true,
      maxLength: [100, 'El nombre no puede superar los 100 caracteres.'],
    },
    lastName: {
      type: String,
      required: [true, 'El apellido del paciente es obligatorio.'],
      trim: true,
      maxLength: [100, 'El apellido no puede superar los 100 caracteres.'],
    },
    birthDate: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria.'],
    },
    gender: {
      type: String,
      required: [true, 'El sexo biológico es obligatorio para los cálculos de percentiles.'],
      enum: {
        values: ['M', 'F'],
        message: 'El sexo debe ser M (masculino) o F (femenino).',
      },
    },
    guardian: {
      type: String,
      trim: true,
      maxLength: [150, 'El nombre del tutor no puede superar los 150 caracteres.'],
    },
    observations: {
      type: String,
      trim: true,
      maxLength: [500, 'Las observaciones no pueden superar los 500 caracteres.'],
    },
  },
  {
    timestamps: true,
/*le dice a Mongoose que agregue automáticamente dos campos a cada documento:
reatedAt — fecha exacta en que se creó el registro
updatedAt — fecha exacta de la última modificación*/
  }
);

export const Patient = model('Patient', patientSchema);