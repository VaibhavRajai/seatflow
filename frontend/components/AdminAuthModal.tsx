"use client";

import React, { useState } from "react";
import { X, Mail, Lock, Shield, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { api } from "../lib/api";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      if (mode === "signup") {
        await api.adminSignup(email, password);
        setSuccessMsg("Account registered! Logging you in...");
        await api.adminLogin(email, password);
      } else {
        await api.adminLogin(email, password);
      }

      onSuccess(email);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
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
            <Shield className="w-5 h-5 text-[#f84464]" />
            <h2 className="font-black text-sm tracking-wider uppercase">
              Venue Admin Authentication
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`py-3.5 text-center transition-colors ${
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
            className={`py-3.5 text-center transition-colors ${
              mode === "signup"
                ? "border-b-2 border-[#f84464] text-[#f84464] bg-zinc-50 dark:bg-zinc-800/40"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Register Admin
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
              Admin Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@multiplex.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
              />
            </div>
          </div>

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
                className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 mt-4 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>
              {loading
                ? "Processing..."
                : mode === "login"
                ? "Sign In to Venue Portal"
                : "Create Admin Account"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
