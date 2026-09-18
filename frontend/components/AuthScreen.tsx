"use client";

import React, { useState } from "react";
import { Shield, Mail, Lock, AlertCircle, CheckCircle2, Moon, Sun, ArrowRight, Eye, EyeOff } from "lucide-react";
import { api } from "../lib/api";

interface AuthScreenProps {
  onLoginSuccess: (email: string) => void;
  onContinueAsGuest: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        await api.adminSignup(email, password);
        setSuccessMsg("Admin account registered! Signing you in...");
        await api.adminLogin(email, password);
      } else {
        await api.adminLogin(email, password);
      }

      onLoginSuccess(email);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5fa] dark:bg-[#0f1015] text-[#1f2533] dark:text-[#f3f4f6]">
      {/* Top Header */}
      <header className="bg-[#333545] dark:bg-[#1e202b] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#f84464] text-white font-black text-xl px-2.5 py-1 tracking-wider uppercase">
            SeatFlow
          </div>
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-zinc-300">
            Venue & Seating Hierarchy Engine
          </span>
        </div>

        <button
          onClick={onToggleDarkMode}
          className="p-2 border border-zinc-600 dark:border-zinc-700 hover:text-[#f84464] text-zinc-200 transition-colors bg-black/20"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-300" />}
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col">
          {/* Card Header */}
          <div className="bg-[#222434] dark:bg-[#14151e] text-white p-6 text-center border-b border-white/10 space-y-2">
            <div className="w-12 h-12 bg-[#f84464]/10 border border-[#f84464]/30 text-[#f84464] flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-black uppercase tracking-wider">
              Venue Admin Portal
            </h1>
            <p className="text-xs text-zinc-400">
              Sign in to manage venues, screens, $R \times C$ sections, and physical seats.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-3.5 text-center transition-colors ${
                mode === "login"
                  ? "border-b-2 border-[#f84464] text-[#f84464] bg-zinc-50 dark:bg-zinc-800/40"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent"
              }`}
            >
              Admin Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-3.5 text-center transition-colors ${
                mode === "signup"
                  ? "border-b-2 border-[#f84464] text-[#f84464] bg-zinc-50 dark:bg-zinc-800/40"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent"
              }`}
            >
              Register Admin
            </button>
          </div>

          {/* Form */}
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
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Admin Email
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
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              className="w-full py-3 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 mt-4 cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <span>
                {loading
                  ? "Verifying..."
                  : mode === "login"
                  ? "Sign In to Venue Portal"
                  : "Create Admin Account"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Guest / Viewer Mode Option */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs font-semibold text-zinc-500 hover:text-[#f84464] dark:text-zinc-400 dark:hover:text-[#f84464] transition-colors inline-flex items-center gap-1.5"
              >
                <span>Browse Landing Page & Layouts as Guest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#333545] dark:bg-[#14151e] text-zinc-400 text-xs py-4 px-6 text-center border-t border-white/10">
        Hierarchy: Venue → Venue Area / Screen → Sections → Physical Seats ($R \times C$)
      </footer>
    </div>
  );
};
