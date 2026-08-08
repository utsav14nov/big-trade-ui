import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setAccessToken } from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On load, try to restore a session via the refresh cookie.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await authApi.refresh();
        setAccessToken(data.access_token);
        const me = await authApi.me();
        setUser(me.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const onLogout = () => { setUser(null); setAccessToken(null); };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await authApi.login(username, password);
    setAccessToken(data.access_token);
    const me = await authApi.me();
    setUser(me.data);
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
