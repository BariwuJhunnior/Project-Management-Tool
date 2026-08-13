// Manages the logged-in user state, token persistence, and authentication methods across the application

import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //Load user profile on initial app mount if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await api.get("/auth/me");
          setUser(data);
        } catch (error) {
          console.error("Session expired or invalid token: ", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  //Login Handler
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  //Register Handler
  const register = async (name, email, password, whatsApp, role) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      whatsApp,
      role,
    });
    localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  //Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
