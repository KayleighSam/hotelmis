import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ApiFetchContext } from "./ApiFetchContext";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { post } = useContext(ApiFetchContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem("accessToken") || null
  );
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem("refreshToken") || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // LOGIN
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await post("/account/login/", { email, password });

      if (res.access && res.refresh && res.user) {
        setUser(res.user);
        setAccessToken(res.access);
        setRefreshToken(res.refresh);

        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("accessToken", res.access);
        localStorage.setItem("refreshToken", res.refresh);

        // redirect after login
        navigate("/admin");
      } else {
        setError(res.detail || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // REGISTER (accepts FormData)
  const register = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await post("/account/register/", data, true); // `true` tells our ApiFetchContext to send multipart
      if (res.id) {
        // automatically login newly created user
        await login(data.get("email"), data.get("password"));
      } else {
        setError(res.detail || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  // Load saved on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedAccess = localStorage.getItem("accessToken");
    const savedRefresh = localStorage.getItem("refreshToken");
    if (savedUser && savedAccess && savedRefresh) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedAccess);
      setRefreshToken(savedRefresh);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        error,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
