import { Schema, model } from 'mongoose';

const metricSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'El ID del paciente es obligatorio para persistir la métrica.'],
    },
    date: {
      type: Date,
      required: [true, 'La fecha de la medición es obligatoria.'],
      default: Date.now,
    },
    weight: {
      type: Number,
      required: [true, 'El peso es obligatorio.'],
      min: [0.1, 'El peso debe ser mayor a 0 kg.'], // Validación técnica de rango mínimo
    },
    height: {
      type: Number,
      required: [true, 'La talla es obligatoria.'],
      min: [10, 'La talla debe ser mayor a 10 cm.'],
    },
    headCircumference: {
      type: Number,
      required: false, // Es opcional ya que el perímetro cefálico se mide principalmente en lactantes/primera infancia
      min: [10, 'El perímetro cefálico debe ser mayor a 10 cm.'],
    },
    observations: {
      type: String,
      trim: true,
      maxLength: [500, 'Las observaciones no pueden superar los 500 caracteres.'],
    },
  },
  {
    timestamps: true, // Registra automáticamente createdAt y updatedAt
  }
);

// Índice compuesto para optimizar las búsquedas cronológicas de métricas por paciente
metricSchema.index({ patientId: 1, date: -1 });

export const Metric = model('Metric', metricSchema);