import { apiClient } from "./client";

export interface AuthResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    phone_number?: string;
  };
  admin?: {
    id: string;
    email: string;
  };
}

export interface CurrentUserSession {
  message: string;
  user?: {
    id: string;
    role: "user" | "venue_admin";
  };
  userId?: string;
}

export const authApi = {
  // Customer Auth
  signupUser: (email: string, password: string, phoneNumber?: string) => {
    return apiClient<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, phoneNumber }),
    });
  },

  loginUser: (email: string, password: string) => {
    return apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logoutUser: () => {
    return apiClient<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  },

  // Venue Admin Auth
  signupAdmin: (email: string, password: string) => {
    return apiClient<AuthResponse>("/admin/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  loginAdmin: (email: string, password: string) => {
    return apiClient<AuthResponse>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logoutAdmin: () => {
    return apiClient<{ message: string }>("/admin/auth/logout", {
      method: "POST",
    });
  },

  // Session Verification (uses HttpOnly cookie)
  getMe: () => {
    return apiClient<CurrentUserSession>("/users/me", {
      method: "GET",
      cache: "no-store",
    });
  },
};
