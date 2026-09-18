"use client";

import React, { useState } from "react";
import { X, Mail, Lock, Shield, AlertCircle, CheckCircle2, Eye, EyeOff, User, Phone, ArrowRight } from "lucide-react";
import { authApi } from "../../api/auth.api";
import { useAuth, UserRole } from "../../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  requiredRole?: UserRole;
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = "user",
  requiredRole,
  onSuccess,
}) => {
  const { setAuthenticatedUser } = useAuth();

  const [role, setRole] = useState<UserRole>(requiredRole || initialRole);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; phoneNumber?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: { email?: string; password?: string; phoneNumber?: string } = {};

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (mode === "signup" && role === "user") {
      if (!phoneNumber.trim()) {
        errors.phoneNumber = "Mobile number is required.";
      } else if (!PHONE_REGEX.test(phoneNumber.trim())) {
        errors.phoneNumber = "Enter a valid 10-digit mobile number.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMsg(null);

    if (!validate()) return;

    setLoading(true);

    try {
      if (role === "venue_admin") {
        if (mode === "signup") {
          const res = await authApi.signupAdmin(email.trim(), password);
          setSuccessMsg("Venue Admin account registered! Signing you in...");
          await authApi.loginAdmin(email.trim(), password);
          if (res.admin) {
            setAuthenticatedUser({ id: res.admin.id, email: res.admin.email, role: "venue_admin" });
          }
        } else {
          const res = await authApi.loginAdmin(email.trim(), password);
          if (res.admin) {
            setAuthenticatedUser({ id: res.admin.id, email: res.admin.email, role: "venue_admin" });
          }
        }
      } else {
        // Customer
        if (mode === "signup") {
          const res = await authApi.signupUser(email.trim(), password, phoneNumber.trim());
          setSuccessMsg("Customer account registered! Signing you in...");
          await authApi.loginUser(email.trim(), password);
          if (res.user) {
            setAuthenticatedUser({ id: res.user.id, email: res.user.email, role: "user", phoneNumber: res.user.phone_number });
          }
        } else {
          const res = await authApi.loginUser(email.trim(), password);
          if (res.user) {
            setAuthenticatedUser({ id: res.user.id, email: res.user.email, role: "user", phoneNumber: res.user.phone_number });
          }
        }
      }

      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setServerError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#181a24] text-zinc-900 dark:text-zinc-100 w-full max-w-md border border-zinc-300 dark:border-zinc-700 shadow-2xl">
        {/* Modal Header */}
        <div className="bg-[#333545] dark:bg-[#14151e] text-white p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            {role === "venue_admin" ? (
              <Shield className="w-5 h-5 text-[#f84464]" />
            ) : (
              <User className="w-5 h-5 text-[#f84464]" />
            )}
            <h2 className="font-bold text-sm tracking-wider uppercase">
              {role === "venue_admin" ? "Venue Admin Portal" : "Customer Account"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector (RBAC) */}
        {!requiredRole && (
          <div className="grid grid-cols-2 bg-zinc-100 dark:bg-[#12141c] border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setRole("user");
                setServerError(null);
                setFieldErrors({});
              }}
              className={`py-2.5 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                role === "user"
                  ? "bg-white dark:bg-[#181a24] text-[#f84464] border-b-2 border-[#f84464]"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("venue_admin");
                setServerError(null);
                setFieldErrors({});
              }}
              className={`py-2.5 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                role === "venue_admin"
                  ? "bg-white dark:bg-[#181a24] text-[#f84464] border-b-2 border-[#f84464]"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Venue Admin</span>
            </button>
          </div>
        )}

        {/* Mode Selector (Login / Signup) */}
        <div className="grid grid-cols-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setServerError(null);
              setFieldErrors({});
            }}
            className={`py-3 text-center transition-colors cursor-pointer ${
              mode === "login"
                ? "border-b-2 border-[#f84464] text-[#f84464] bg-zinc-50 dark:bg-zinc-800/40"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setServerError(null);
              setFieldErrors({});
            }}
            className={`py-3 text-center transition-colors cursor-pointer ${
              mode === "signup"
                ? "border-b-2 border-[#f84464] text-[#f84464] bg-zinc-50 dark:bg-zinc-800/40"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                }}
                placeholder={role === "venue_admin" ? "admin@multiplex.com" : "customer@example.com"}
                className={`w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-[#12141c] border ${
                  fieldErrors.email ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                } focus:border-[#f84464] outline-none`}
              />
            </div>
            {fieldErrors.email && (
              <span className="text-[11px] text-red-500 font-medium block">{fieldErrors.email}</span>
            )}
          </div>

          {/* Mobile Number (Customer Signup) */}
          {mode === "signup" && role === "user" && (
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                10-Digit Mobile Number
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3 w-4 h-4 text-zinc-400" />
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (fieldErrors.phoneNumber) setFieldErrors({ ...fieldErrors, phoneNumber: undefined });
                  }}
                  placeholder="9876543210"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-[#12141c] border ${
                    fieldErrors.phoneNumber ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                  } focus:border-[#f84464] outline-none`}
                />
              </div>
              {fieldErrors.phoneNumber && (
                <span className="text-[11px] text-red-500 font-medium block">{fieldErrors.phoneNumber}</span>
              )}
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
              Password (Min 8 Characters)
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-zinc-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                }}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2.5 text-sm bg-white dark:bg-[#12141c] border ${
                  fieldErrors.password ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                } focus:border-[#f84464] outline-none`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="text-[11px] text-red-500 font-medium block">{fieldErrors.password}</span>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 mt-4 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <span>
              {loading
                ? "Processing..."
                : mode === "login"
                ? `Sign In as ${role === "venue_admin" ? "Venue Admin" : "Customer"}`
                : `Register as ${role === "venue_admin" ? "Venue Admin" : "Customer"}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
