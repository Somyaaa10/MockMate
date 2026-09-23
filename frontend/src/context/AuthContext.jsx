import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/config";

const AuthContext = createContext(null);

const TOKEN_KEY = "mockmate_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // Fetch current user
  const fetchCurrentUser = async (authToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setUser(response.data.data);
      return response.data.data;
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);

      throw error;
    }
  };

  // Helper to refresh current user data on demand
  const refreshUser = async () => {
    if (!token) return null;
    try {
      return await fetchCurrentUser(token);
    } catch (err) {
      console.error("Refresh user error:", err);
      return null;
    }
  };

  // Restore authentication when app starts
  useEffect(() => {
    const restoreAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await fetchCurrentUser(token);
      } catch {
        // Invalid/expired token
        console.log("Session expired");
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });

    const { token: newToken } = response.data;

    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);

    const currentUser = await fetchCurrentUser(newToken);

    return currentUser;
  };

  // Register
  const register = async (fullName, email, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      fullName,
      email,
      password,
    });

    return response.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await axios.patch(
      `${API_BASE_URL}/auth/profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const updatedUser = response.data.data;

    setUser(updatedUser);

    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
