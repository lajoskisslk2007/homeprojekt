import { createContext, useContext, useEffect, useState } from "react";
import api, { refreshSession, subscribeToSession, updateSession } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeToSession(setSession), []);

  useEffect(() => {
    refreshSession()
      .then(() => setLoading(false))
      .catch(() => {
        updateSession(null);
        setLoading(false);
      });
  }, []);

  function login(credentials) {
    return api.post("/auth/login", credentials).then((response) => {
      updateSession(response.data);
    });
  }

  function logout() {
    return api.post("/auth/logout").then(() => {
      updateSession(null);
    });
  }

  const value = {
    user: session?.user || null,
    accessToken: session?.accessToken || null,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
