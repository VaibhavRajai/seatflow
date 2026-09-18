"use client";

import React, { useState } from "react";
import { X, Mail, Lock, Shield, AlertCircle, CheckCircle2, Eye, EyeOff, User, ArrowRight, Phone } from "lucide-react";
import { api, CurrentUser, UserRole } from "../lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: CurrentUser) => void;
  initialRole?: UserRole;
  requiredRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = "user",
  requiredRole,
}) => {
  const [role, setRole] = useState<UserRole>(requiredRole || initialRole);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (role === "venue_admin") {
        if (mode === "signup") {
          const res = await api.adminSignup(email, password);
          setSuccessMsg("Venue Admin registered! Signing you in...");
          await api.adminLogin(email, password);
          onSuccess({ id: res.admin.id, email: res.admin.email, role: "venue_admin" });
        } else {
          const res = await api.adminLogin(email, password);
          onSuccess({ id: res.admin.id, email: res.admin.email, role: "venue_admin" });
        }
      } else {
        // Customer / User
        if (mode === "signup") {
          const res = await api.userSignup(email, password, phoneNumber);
          setSuccessMsg("Account created! Signing you in...");
          await api.userLogin(email, password);
          onSuccess({ id: res.user.id, email: res.user.email, role: "user", phoneNumber: res.user.phone_number });
        } else {
          const res = await api.userLogin(email, password);
          onSuccess({ id: res.user.id, email: res.user.email, role: "user", phoneNumber: res.user.phone_number });
        }
      }

      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#181a24] text-zinc-900 dark:text-zinc-100 w-full max-w-md border border-zinc-300 dark:border-zinc-700 shadow-2xl">
        {/* Header */}
        <div className="bg-[#333545] dark:bg-[#14151e] text-white p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            {role === "venue_admin" ? (
              <Shield className="w-5 h-5 text-[#f84464]" />
            ) : (
              <User className="w-5 h-5 text-[#f84464]" />
            )}
            <h2 className="font-black text-sm tracking-wider uppercase">
              {role === "venue_admin" ? "Venue Admin Portal" : "Customer Sign In"}
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
                setError(null);
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
                setError(null);
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

        {/* Login / Signup Switcher */}
        <div className="grid grid-cols-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
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
              setError(null);
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
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "venue_admin" ? "admin@multiplex.com" : "customer@example.com"}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
              />
            </div>
          </div>

          {mode === "signup" && role === "user" && (
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3 w-4 h-4 text-zinc-400" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-zinc-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 mt-4 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <span>
              {loading
                ? "Verifying..."
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
