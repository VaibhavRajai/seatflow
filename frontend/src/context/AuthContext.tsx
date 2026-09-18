"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/auth.api";

export type UserRole = "user" | "venue_admin";

export interface AuthUser {
  id: string;
  email?: string;
  role: UserRole;
  phoneNumber?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  setAuthenticatedUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res.user) {
        // Saved safe email from session storage if exists
        const cachedEmail = sessionStorage.getItem("seatflow_email") || undefined;
        setCurrentUser({
          id: res.user.id,
          role: res.user.role,
          email: cachedEmail,
        });
      } else {
        setCurrentUser(null);
        sessionStorage.removeItem("seatflow_email");
      }
    } catch {
      setCurrentUser(null);
      sessionStorage.removeItem("seatflow_email");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const setAuthenticatedUser = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.email) {
      sessionStorage.setItem("seatflow_email", user.email);
    }
  };

  const logout = async () => {
    try {
      if (currentUser?.role === "venue_admin") {
        await authApi.logoutAdmin();
      } else {
        await authApi.logoutUser();
      }
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setCurrentUser(null);
      sessionStorage.removeItem("seatflow_email");
    }
  };

  const value: AuthContextType = {
    isAuthenticated: !!currentUser,
    currentUser,
    role: currentUser?.role || null,
    loading,
    setAuthenticatedUser,
    logout,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
