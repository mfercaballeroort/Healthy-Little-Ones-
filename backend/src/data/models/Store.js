import { Schema, model } from 'mongoose';

const storeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la tienda es obligatorio.'],
      trim: true,
      maxLength: 150,
    },
    address: {
      type: String,
      required: [true, 'La dirección es obligatoria.'],
      trim: true,
      maxLength: 250,
    },
    phone: {
      type: String,
      trim: true,
      maxLength: 30,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    specialties: {
      type: [String],
      default: [],
      // strings libres: "sin_gluten", "sin_lactosa", "vegano", "organico", etc.
    },
    // GeoJSON para queries geográficas con índice 2dsphere
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        // ¡OJO! GeoJSON usa [longitud, latitud], NO [latitud, longitud]
        type: [Number],
        required: [true, 'Las coordenadas son obligatorias.'],
        validate: {
          validator: (v) => v.length === 2,
          message: 'coordinates debe tener exactamente [lng, lat].',
        },
      },
    },
  },
  { timestamps: true }
);

// Índice geoespacial: indispensable para usar $near, $geoNear, etc.
storeSchema.index({ location: '2dsphere' });

export const Store = model('Store', storeSchema);