// Demo-only authentication. The assignment asks for a login *interface*, so there
// is no backend: any non-empty username and password are accepted and the username
// is remembered in localStorage so a refresh keeps the user signed in.

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  STORAGE_KEYS,
  getStoredValue,
  removeStoredValue,
  setStoredValue,
} from '../utils/localStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredValue(STORAGE_KEYS.USER));

  const login = useCallback((username, password) => {
    const name = username.trim();
    if (!name || !password) {
      return { ok: false, error: 'Please enter both a username and a password.' };
    }
    setUser(name);
    setStoredValue(STORAGE_KEYS.USER, name);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeStoredValue(STORAGE_KEYS.USER);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
