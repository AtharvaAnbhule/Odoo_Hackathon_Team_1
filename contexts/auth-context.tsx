"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@/lib/types";
import { authAPI, tokenManager, handleAPIError } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    userData: Partial<User> & { password: string }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = tokenManager.getToken();
      if (!token || tokenManager.isTokenExpired(token)) {
        tokenManager.removeToken();
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await authAPI.getMe();
      setUser(response.user);
    } catch (error) {
      tokenManager.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      tokenManager.setToken(response.token);
      setUser(response.user);
      setLoading(false);

      setTimeout(() => {
        switch (response.user.role) {
          case "admin":
            window.location.href = "/admin/dashboard";
            break;
          case "staff":
            window.location.href = "/staff/dashboard";
            break;
          case "customer":
            window.location.href = "/customer/dashboard";
            break;
          default:
            window.location.href = "/dashboard";
        }
      }, 100);

      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: handleAPIError(error) };
    }
  };

  const signup = async (userData: Partial<User> & { password: string }) => {
    setLoading(true);

    try {
      const response = await authAPI.register({
        name: userData.name!,
        email: userData.email!,
        password: userData.password,
        role: userData.role || "customer",
        phone: userData.phone,
        address: userData.address,
      });

      tokenManager.setToken(response.token);
      setUser(response.user);
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: handleAPIError(error) };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenManager.removeToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
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
