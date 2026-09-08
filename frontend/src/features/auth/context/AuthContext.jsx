import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, login as loginRequest } from '../../../api/auth.js';
import { clearStoredToken, getStoredToken, setStoredToken } from '../../../api/http.js';
import { getDefaultRouteForUser, isHrManager } from '../utils.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch {
      clearStoredToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(async (credentials) => {
    const result = await loginRequest(credentials);
    setStoredToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isHrManager: isHrManager(user),
      login,
      logout,
      getDefaultRouteForUser: () => getDefaultRouteForUser(user),
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
