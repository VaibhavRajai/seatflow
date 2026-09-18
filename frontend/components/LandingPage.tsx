"use client";

import React from "react";
import {
  Building2,
  Monitor,
  LayoutGrid,
  Layers,
  ArrowRight,
  Shield,
  MapPin,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { Venue } from "../lib/api";

interface LandingPageProps {
  venues: Venue[];
  onNavigateTab: (tab: string) => void;
  onSelectVenueAndVisualize: (venueId: string) => void;
  onOpenAuth: () => void;
  onOpenCreateVenue: () => void;
  isAdminLoggedIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  venues,
  onNavigateTab,
  onSelectVenueAndVisualize,
  onOpenAuth,
  onOpenCreateVenue,
  isAdminLoggedIn,
}) => {
  return (
    <div className="w-full space-y-12">
      {/* Hero Section */}
      <section className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f84464]/10 border border-[#f84464]/30 text-[#f84464] text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Venue Hierarchy Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
            Physical Venue & Seating Layout Engine
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Manage multi-screen multiplexes, configure $R \times C$ seating tiers (VIP Recliner, Prime, Classic), and generate interactive physical seat matrices modeled for BookMyShow scale.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab("visualizer")}
              className="px-6 py-3 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Explore Seating Layouts</span>
            </button>

            <button
              onClick={() => onNavigateTab("workflow")}
              className="px-6 py-3 bg-[#333545] dark:bg-[#222434] hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Admin Step Workflow</span>
            </button>

            {!isAdminLoggedIn && (
              <button
                onClick={onOpenAuth}
                className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 hover:border-[#f84464] text-zinc-800 dark:text-zinc-200 hover:text-[#f84464] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-[#f84464]" />
                <span>Admin Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Hierarchy Diagram Ribbon */}
        <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-zinc-50 dark:bg-[#14151e] p-4 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-[#f84464] uppercase block">Level 1</span>
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase">Venue</span>
            <span className="text-[11px] text-zinc-500 block mt-0.5">Multiplex Location</span>
          </div>
          <div className="bg-zinc-50 dark:bg-[#14151e] p-4 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-[#f84464] uppercase block">Level 2</span>
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase">Screen / Area</span>
            <span className="text-[11px] text-zinc-500 block mt-0.5">IMAX, 4DX, Screen 1</span>
          </div>
          <div className="bg-zinc-50 dark:bg-[#14151e] p-4 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-[#f84464] uppercase block">Level 3</span>
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase">Section</span>
            <span className="text-[11px] text-zinc-500 block mt-0.5">Recliner, Prime, Classic</span>
          </div>
          <div className="bg-zinc-50 dark:bg-[#14151e] p-4 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-[#f84464] uppercase block">Level 4</span>
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase">Physical Seats</span>
            <span className="text-[11px] text-zinc-500 block mt-0.5">$R \times C$ Auto Matrix</span>
          </div>
        </div>
      </section>

      {/* Feature Interfaces Section */}
      <section className="space-y-6">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#f84464]" />
              <span>Core Architecture & Features</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Each layer maps cleanly from REST API endpoints to frontend components.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Venue Management */}
          <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-5 space-y-3 flex flex-col justify-between hover:border-[#f84464] transition-colors">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[#f84464]">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm uppercase text-zinc-900 dark:text-zinc-100">
                Venue Management
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Create and organize cinema properties with city categorization, physical address, and admin ownership checks.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("venues")}
              className="text-xs font-bold uppercase tracking-wider text-[#f84464] hover:text-[#e51a4b] flex items-center gap-1 pt-2"
            >
              <span>View Venues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Screens & Auditoriums */}
          <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-5 space-y-3 flex flex-col justify-between hover:border-[#f84464] transition-colors">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[#f84464]">
                <Monitor className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm uppercase text-zinc-900 dark:text-zinc-100">
                Multi-Screen Areas
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Add multiple screens inside a single venue (e.g. Screen 1, IMAX Laser 3D, Gold Class Audi) with independent layouts.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("workflow")}
              className="text-xs font-bold uppercase tracking-wider text-[#f84464] hover:text-[#e51a4b] flex items-center gap-1 pt-2"
            >
              <span>Manage Screens</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: $R \times C$ Section Matrix */}
          <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-5 space-y-3 flex flex-col justify-between hover:border-[#f84464] transition-colors">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[#f84464]">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm uppercase text-zinc-900 dark:text-zinc-100">
                $R \times C$ Seat Generator
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Define row count ($R$) and seats per row ($C$). The system auto-generates permanent physical seat rows (A1...An, B1...Bn).
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("workflow")}
              className="text-xs font-bold uppercase tracking-wider text-[#f84464] hover:text-[#e51a4b] flex items-center gap-1 pt-2"
            >
              <span>Seat Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: BMS Seating Visualizer */}
          <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-5 space-y-3 flex flex-col justify-between hover:border-[#f84464] transition-colors">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[#f84464]">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm uppercase text-zinc-900 dark:text-zinc-100">
                BMS Layout Visualizer
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Full theater experience with realistic screen curve, symmetrical row labels, and interactive seat selection.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("visualizer")}
              className="text-xs font-bold uppercase tracking-wider text-[#f84464] hover:text-[#e51a4b] flex items-center gap-1 pt-2"
            >
              <span>Open Visualizer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Venues Quick Access */}
      {venues.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
              Active Venues
            </h2>
            <button
              onClick={() => onNavigateTab("venues")}
              className="text-xs font-bold text-[#f84464] hover:underline uppercase"
            >
              View All ({venues.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.slice(0, 3).map((v) => (
              <div
                key={v.id}
                className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {v.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase">
                      {v.city}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{v.address}</p>
                </div>

                <button
                  onClick={() => onSelectVenueAndVisualize(v.id)}
                  className="w-full py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Inspect Seating Grid</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
