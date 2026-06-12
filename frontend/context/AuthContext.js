// frontend/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, saveToken, deleteToken, getToken } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true al inicio mientras validamos el token guardado

  /**
   * Al montar el provider, intentamos recuperar la sesión:
   * si hay token guardado, lo usamos para llamar /me y recuperar el user.
   */
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Intentamos validar el token contra el backend
        const data = await apiFetch('/api/users/me');
        setUser(data.user);
      } catch (err) {
        // Token expirado o inválido: lo borramos
        await deleteToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const data = await apiFetch('/api/users/login', {
      method: 'POST',
      body: { email, password },
    });
    await saveToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async ({ name, email, password, role, inviteCode }) => {
    const data = await apiFetch('/api/users/register', {
      method: 'POST',
      body: { name, email, password, role, inviteCode },
    });
    await saveToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await deleteToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}