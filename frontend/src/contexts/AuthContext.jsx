import { createContext, useContext, useEffect, useState } from "react";
import API from "@/services/api"; // Your Axios instance with the interceptor

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize auth state on app load or refresh
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Calls your router.get('/profile') or router.get('/me') backend route
          const { data } = await API.get("/auth/profile");
          setUser(data);
        } catch (error) {
          console.error("Session invalid or expired");
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Calls your router.post('/login') backend route
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || "Login failed" 
      };
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // In your MERN schema, 'user' and 'profile' are typically the same object
  return (
    <AuthContext.Provider value={{ user, profile: user, loading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}