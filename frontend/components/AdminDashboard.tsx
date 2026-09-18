"use client";

import React from "react";
import { Shield, Lock, ArrowRight, Building2, Plus, Layers, LayoutGrid, CheckCircle2 } from "lucide-react";
import { CurrentUser, Venue } from "../lib/api";
import { HierarchyWorkflow } from "./HierarchyWorkflow";

interface AdminDashboardProps {
  currentUser: CurrentUser | null;
  onRequireAdminAuth: () => void;
  venues: Venue[];
  onRefreshVenues: () => void;
  onOpenCreateVenue: () => void;
  onOpenCreateArea: (venueId: string) => void;
  onOpenCreateSection: (venueId: string, areaId?: string) => void;
  currentCity: string;
  searchQuery: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onRequireAdminAuth,
  venues,
  onRefreshVenues,
  onOpenCreateVenue,
  onOpenCreateArea,
  onOpenCreateSection,
  currentCity,
  searchQuery,
}) => {
  // RBAC Guard: Only venue_admin can access the administration dashboard
  if (!currentUser || currentUser.role !== "venue_admin") {
    return (
      <div className="w-full max-w-2xl mx-auto my-12 bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-[#f84464]/10 border border-[#f84464]/30 text-[#f84464] flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#f84464] bg-[#f84464]/10 px-2.5 py-1 border border-[#f84464]/30">
            RBAC Protected Route
          </span>
          <h2 className="text-2xl font-black uppercase text-zinc-900 dark:text-zinc-100">
            Venue Admin Access Required
          </h2>
          <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
            {currentUser?.role === "user"
              ? `You are currently signed in as a Customer (${currentUser.email}). Venue configuration, screen management, and $R \\times C$ physical seat generation require Venue Admin privileges.`
              : "This section is restricted to registered venue owners and theater administrators."}
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onRequireAdminAuth}
            className="w-full sm:w-auto px-8 py-3 bg-[#f84464] hover:bg-[#e51a4b] text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Shield className="w-4 h-4" />
            <span>Sign In as Venue Admin</span>
          </button>
        </div>
      </div>
    );
  }

  // Admin is Authorized
  return (
    <div className="w-full space-y-6">
      {/* Admin Authorization Banner */}
      <div className="bg-[#222434] dark:bg-[#14151e] text-white p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-[#f84464]" />
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              RBAC Authorized Session
            </span>
            <span className="text-xs font-bold text-white">
              Venue Admin: <span className="text-[#f84464]">{currentUser.email}</span>
            </span>
          </div>
        </div>

        <div className="text-[11px] font-bold text-zinc-400">
          Full permissions: Create Venue, Add Screens, Generate $R \times C$ Seats
        </div>
      </div>

      {/* Main Step Workflow */}
      <HierarchyWorkflow
        venues={venues}
        onRefreshVenues={onRefreshVenues}
        onOpenCreateVenue={onOpenCreateVenue}
        onOpenCreateArea={onOpenCreateArea}
        onOpenCreateSection={onOpenCreateSection}
        isAdminLoggedIn={true}
        onRequireAuth={onRequireAdminAuth}
        currentCity={currentCity}
        searchQuery={searchQuery}
      />
    </div>
  );
};
