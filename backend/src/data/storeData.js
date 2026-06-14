import { Store } from './models/Store.js';

const save = async (data) => {
  const newStore = new Store(data);
  return await newStore.save();
};

const findAll = async () => {
  return await Store.find().sort({ name: 1 }).lean();
};

const findById = async (id) => {
  return await Store.findById(id).lean();
};

/**
 * Busca tiendas cercanas a un punto, opcionalmente filtradas por especialidades.
 * @param {number} lat - Latitud del centro de búsqueda.
 * @param {number} lng - Longitud del centro.
 * @param {number} maxDistance - Radio en metros (default 5km).
 * @param {string[]} specialties - Si se pasan, devuelve solo tiendas que tengan TODAS las especialidades.
 */
const findNearby = async (lat, lng, maxDistance = 5000, specialties = []) => {
  const query = {
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: maxDistance,
      },
    },
  };

  if (specialties.length > 0) {
    // $all: la tienda debe tener todas las especialidades pedidas
    query.specialties = { $all: specialties };
  }

  return await Store.find(query).lean();
};

const deleteAll = async () => {
  return await Store.deleteMany({});
};

export const storeData = {
  save,
  findAll,
  findById,
  findNearby,
  deleteAll,
};