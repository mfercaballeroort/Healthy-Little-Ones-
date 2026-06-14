// Ejecutar manualmente: node src/seeds/seedStores.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { storeData } from '../data/storeData.js';

const MONGO_URI = process.env.MONGO_URI;

// Tiendas reales/ficticias en Buenos Aires con coords aproximadas
const stores = [
  {
    name: 'Dietética Natural',
    address: 'Av. Santa Fe 2345, CABA',
    phone: '+54 11 4823-5000',
    description: 'Productos naturales, sin gluten y vegetarianos.',
    specialties: ['sin_gluten', 'vegetariano', 'organico'],
    location: { type: 'Point', coordinates: [-58.3955, -34.5945] },
  },
  {
    name: 'Almacén Verde',
    address: 'Av. Cabildo 1450, Belgrano',
    phone: '+54 11 4783-1200',
    description: 'Especializado en alimentos veganos y sin lactosa.',
    specialties: ['vegano', 'sin_lactosa', 'organico'],
    location: { type: 'Point', coordinates: [-58.4570, -34.5620] },
  },
  {
    name: 'Sin Tacc Market',
    address: 'Av. Corrientes 3200, Almagro',
    phone: '+54 11 4862-0900',
    description: 'Todo libre de gluten, certificado.',
    specialties: ['sin_gluten', 'celiacos'],
    location: { type: 'Point', coordinates: [-58.4180, -34.6045] },
  },
  {
    name: 'Bio Market Palermo',
    address: 'Honduras 4870, Palermo',
    phone: '+54 11 4831-7700',
    description: 'Productos orgánicos, sin TACC y sin lactosa.',
    specialties: ['organico', 'sin_gluten', 'sin_lactosa', 'vegano'],
    location: { type: 'Point', coordinates: [-58.4290, -34.5870] },
  },
  {
    name: 'Granja del Sol',
    address: 'Av. Rivadavia 5300, Caballito',
    phone: '+54 11 4901-3400',
    description: 'Frutas, verduras orgánicas y dietéticos.',
    specialties: ['organico', 'vegetariano'],
    location: { type: 'Point', coordinates: [-58.4470, -34.6190] },
  },
  {
    name: 'Lactosa Free',
    address: 'Av. Las Heras 2100, Recoleta',
    phone: '+54 11 4806-5500',
    description: 'Especializado en productos sin lactosa.',
    specialties: ['sin_lactosa'],
    location: { type: 'Point', coordinates: [-58.3935, -34.5870] },
  },
  {
    name: 'Vegan House',
    address: 'Gorriti 5700, Palermo Hollywood',
    phone: '+54 11 4778-2200',
    description: 'Tienda 100% vegana.',
    specialties: ['vegano', 'sin_lactosa'],
    location: { type: 'Point', coordinates: [-58.4360, -34.5810] },
  },
  {
    name: 'Salud y Naturaleza',
    address: 'Av. Corrientes 1500, San Nicolás',
    phone: '+54 11 4374-0800',
    description: 'Dietética tradicional con sección celíacos.',
    specialties: ['sin_gluten', 'vegetariano'],
    location: { type: 'Point', coordinates: [-58.3870, -34.6045] },
  },
  {
    name: 'Eco Almacén',
    address: 'Av. Triunvirato 4200, Villa Urquiza',
    phone: '+54 11 4524-3300',
    description: 'Productos a granel, orgánicos y veganos.',
    specialties: ['organico', 'vegano', 'sin_lactosa'],
    location: { type: 'Point', coordinates: [-58.4830, -34.5750] },
  },
  {
    name: 'Naturista Caballito',
    address: 'Av. Acoyte 245, Caballito',
    phone: '+54 11 4903-7700',
    description: 'Suplementos, productos sin TACC y diabéticos.',
    specialties: ['sin_gluten', 'diabeticos'],
    location: { type: 'Point', coordinates: [-58.4400, -34.6190] },
  },
  {
    name: 'Almacén Saludable',
    address: 'Av. del Libertador 6500, Belgrano',
    phone: '+54 11 4787-1100',
    description: 'Alimentos integrales y orgánicos.',
    specialties: ['organico', 'integral', 'vegetariano'],
    location: { type: 'Point', coordinates: [-58.4570, -34.5530] },
  },
  {
    name: 'GlutenZero',
    address: 'Av. Pueyrredón 1800, Recoleta',
    phone: '+54 11 4805-9900',
    description: 'Sin gluten, sin lactosa, productos para celíacos.',
    specialties: ['sin_gluten', 'sin_lactosa', 'celiacos'],
    location: { type: 'Point', coordinates: [-58.4020, -34.5950] },
  },
];

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('🗑️  Borrando tiendas existentes...');
    await storeData.deleteAll();

    console.log('📍 Insertando tiendas...');
    for (const s of stores) {
      await storeData.save(s);
      console.log(`   ✓ ${s.name}`);
    }

    console.log(`\n🎉 ${stores.length} tiendas insertadas exitosamente.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

run();