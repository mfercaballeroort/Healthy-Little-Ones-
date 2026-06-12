// frontend/services/api.js
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/config';

const TOKEN_KEY = 'auth_token';

/**
 * Storage que funciona en web Y en mobile:
 * - En web: localStorage (SecureStore no existe en navegador)
 * - En mobile: SecureStore (Keychain iOS / KeyStore Android, cifrado)
 */
const storage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const saveToken = (token) => storage.setItem(TOKEN_KEY, token);
export const getToken = () => storage.getItem(TOKEN_KEY);
export const deleteToken = () => storage.deleteItem(TOKEN_KEY);

/**
 * Wrapper de fetch que:
 * 1. Agrega Authorization automáticamente si hay token guardado.
 * 2. Setea Content-Type JSON.
 * 3. Parsea la respuesta.
 * 4. Tira un Error con el mensaje del backend si la respuesta no es 2xx.
 */
export async function apiFetch(path, options = {}) {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    body: options.body && typeof options.body === 'object'
      ? JSON.stringify(options.body)
      : options.body,
  };

  const response = await fetch(`${API_URL}${path}`, config);

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Error ${response.status}: respuesta inválida del servidor`);
  }

  if (!response.ok) {
    const error = new Error(data.message || `Error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}