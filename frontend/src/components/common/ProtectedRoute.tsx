"use client";

import React from "react";
import { useAuth, UserRole } from "../../context/AuthContext";
import { LoadingState } from "./LoadingState";
import { Shield, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  onRequireAuth: (requiredRole: UserRole) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  onRequireAuth,
}) => {
  const { isAuthenticated, role, loading, currentUser } = useAuth();

  if (loading) {
    return <LoadingState message="Verifying session..." fullPage />;
  }

  const isRoleAllowed = role && allowedRoles.includes(role);

  if (!isAuthenticated || !isRoleAllowed) {
    const targetRole = allowedRoles[0] || "user";
    return (
      <div className="w-full max-w-lg mx-auto my-16 bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 text-center space-y-6 shadow-sm">
        <div className="w-14 h-14 bg-[#f84464]/10 border border-[#f84464]/30 text-[#f84464] flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#f84464] bg-[#f84464]/10 px-2.5 py-1 border border-[#f84464]/30">
            Authorization Required
          </span>
          <h2 className="text-xl font-black uppercase text-zinc-900 dark:text-zinc-100">
            {targetRole === "venue_admin" ? "Venue Admin Access Only" : "Sign In Required"}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {currentUser && !isRoleAllowed
              ? `You are signed in with the role "${currentUser.role}". You need "${targetRole}" permissions to access this section.`
              : "Please sign in to access this page."}
          </p>
        </div>

        <button
          onClick={() => onRequireAuth(targetRole)}
          className="px-8 py-3 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Shield className="w-4 h-4" />
          <span>Sign In as {targetRole === "venue_admin" ? "Venue Admin" : "Customer"}</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
