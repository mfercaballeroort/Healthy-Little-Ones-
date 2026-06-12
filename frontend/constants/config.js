// frontend/constants/config.js
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * URL del backend. Se autodetecta según la plataforma:
 * - Web: usa localhost
 * - Mobile (Expo Go): usa la IP del Metro Bundler (la IP de tu PC en la red local)
 *
 * Si en el futuro deployan el backend, simplemente reemplazás esto por la URL pública.
 */
function getApiUrl() {
  // Si el dev tiene una URL fija (ej. backend deployado), usarla
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // En web, localhost funciona directo
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }

  // En mobile, sacar la IP del host del Metro Bundler
  const hostUri = Constants.expoConfig?.hostUri ?? '';
  const host = hostUri.split(':')[0];
  return host ? `http://${host}:5000` : 'http://localhost:5000';
}

export const API_URL = getApiUrl();