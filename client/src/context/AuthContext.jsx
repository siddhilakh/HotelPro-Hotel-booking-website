import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('hp_token'));

  useEffect(() => {
    if (!localStorage.getItem('hp_token')) return;
    api
      .get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem('hp_token'))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback(async (path, payload) => {
    const { data } = await api.post(`/auth/${path}`, payload);
    localStorage.setItem('hp_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = (email, password) => authenticate('login', { email, password });
  const register = (form) => authenticate('register', form);
  const logout = () => {
    localStorage.removeItem('hp_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}
