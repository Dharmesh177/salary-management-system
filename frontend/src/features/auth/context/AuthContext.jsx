import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchSession, login as loginRequest, logout as logoutRequest } from '../../../api/auth.js';
import { setUnauthorizedHandler } from '../../../api/http.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  const loadSession = useCallback(async () => {
    setLoading(true);

    try {
      const sessionUser = await fetchSession();
      setUser(sessionUser);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });

    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const result = await loginRequest(credentials);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Clear local session even if the logout request fails.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
