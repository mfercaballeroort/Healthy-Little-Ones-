import { storeData } from '../data/storeData.js';

/**
 * GET /api/stores
 * Lista todas las tiendas.
 */
export const getAllStores = async (req, res) => {
  try {
    const stores = await storeData.findAll();
    return res.status(200).json({ success: true, data: stores });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/stores/nearby?lat=X&lng=Y&maxDistance=5000&specialties=sin_gluten,sin_lactosa
 * Tiendas cercanas a una coordenada, opcionalmente filtradas.
 */
export const getNearbyStores = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const maxDistance = parseInt(req.query.maxDistance) || 5000;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren los parámetros lat y lng como números.',
      });
    }

    const specialtiesParam = req.query.specialties;
    const specialties = specialtiesParam
      ? specialtiesParam.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const stores = await storeData.findNearby(lat, lng, maxDistance, specialties);
    return res.status(200).json({ success: true, data: stores });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/stores/:id
 */
export const getStoreById = async (req, res) => {
  try {
    const store = await storeData.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Tienda no encontrada.' });
    }
    return res.status(200).json({ success: true, data: store });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};