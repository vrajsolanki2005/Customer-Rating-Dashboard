import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/authApi";
import {
  getStoredToken,
  getStoredUser,
  setStoredAuth,
  clearStoredAuth,
} from "../utils/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [initializing, setInitializing] = useState(() => Boolean(getStoredToken()));

  useEffect(() => {
    let active = true;

    if (!getStoredToken()) {
      setInitializing(false);
      return;
    }

    authApi
      .me()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setStoredAuth(getStoredToken(), currentUser);
      })
      .catch((error) => {
        if (!active) return;
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          clearStoredAuth();
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setInitializing(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    if (!data?.token) {
      throw new Error("Unable to log in. Please check your credentials.");
    }

    setStoredAuth(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    if (!data?.token) return null;

    setStoredAuth(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

