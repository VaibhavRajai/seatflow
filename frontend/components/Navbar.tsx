"use client";

import React, { useState } from "react";
import {
  Building2,
  Search,
  MapPin,
  Moon,
  Sun,
  Shield,
  User,
  LogOut,
  Plus,
  Layers,
  LayoutGrid,
  Home,
  Ticket,
  SlidersHorizontal,
  Lock,
} from "lucide-react";
import { CurrentUser } from "../lib/api";

interface NavbarProps {
  currentCity: string;
  onCityChange: (city: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: CurrentUser | null;
  onOpenAuth: (requiredRole?: "user" | "venue_admin") => void;
  onLogout: () => void;
  onOpenCreateVenue: () => void;
  onOpenCreateArea: () => void;
  onOpenCreateSection: () => void;
}

const CITIES = [
  "All Cities",
  "Mumbai",
  "Delhi-NCR",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
];

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  onCityChange,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenCreateVenue,
  onOpenCreateArea,
  onOpenCreateSection,
}) => {
  const [showCityMenu, setShowCityMenu] = useState(false);

  return (
    <header className="w-full flex flex-col z-40 sticky top-0 shadow-md">
      {/* Top Header */}
      <div className="bg-[#333545] dark:bg-[#1e202b] text-white px-4 sm:px-8 py-3 flex items-center justify-between gap-4 border-b border-white/10">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange("landing")}>
          <div className="bg-[#f84464] text-white font-black text-xl px-2.5 py-1 tracking-wider uppercase border border-white/20">
            SeatFlow
          </div>
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-zinc-300">
            Ticket Booking & Layouts
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-2 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search for Cinemas, Screens, or Locations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white dark:bg-[#12141c] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 pl-9 pr-4 py-1.5 text-sm outline-none border border-transparent focus:border-[#f84464]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 text-sm">
          {/* City Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCityMenu(!showCityMenu)}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 hover:text-[#f84464] text-zinc-200 transition-colors border border-zinc-600 dark:border-zinc-700 bg-black/20 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#f84464]" />
              <span className="max-w-[80px] sm:max-w-[120px] truncate">{currentCity}</span>
            </button>

            {showCityMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#1a1c24] text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 shadow-lg z-50">
                <div className="p-2 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  Select Region
                </div>
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      onCityChange(city);
                      setShowCityMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#f84464] hover:text-white transition-colors cursor-pointer ${
                      currentCity === city ? "font-bold bg-zinc-100 dark:bg-zinc-800 text-[#f84464]" : ""
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 border border-zinc-600 dark:border-zinc-700 hover:text-[#f84464] text-zinc-200 transition-colors bg-black/20 cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-300" />}
          </button>

          {/* Auth & RBAC Indicator */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 text-xs bg-[#f84464]/10 text-[#f84464] px-2.5 py-1 border border-[#f84464]/40 font-bold">
                {currentUser.role === "venue_admin" ? (
                  <Shield className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
                <span className="max-w-[120px] truncate">{currentUser.email}</span>
                <span className="text-[10px] uppercase opacity-80">
                  ({currentUser.role === "venue_admin" ? "Admin" : "Customer"})
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2.5 py-1.5 font-bold transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth("user")}
                className="text-xs text-zinc-200 hover:text-white px-2.5 py-1.5 font-bold transition-colors cursor-pointer border border-zinc-600"
              >
                Customer Sign In
              </button>
              <button
                onClick={() => onOpenAuth("venue_admin")}
                className="flex items-center gap-1 text-xs bg-[#f84464] hover:bg-[#e51a4b] text-white px-3 py-1.5 font-bold transition-colors border border-transparent uppercase tracking-wider cursor-pointer shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="bg-[#222434] dark:bg-[#14151e] text-zinc-300 text-xs px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-white/5">
        <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => onTabChange("landing")}
            className={`px-3 py-1 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === "landing"
                ? "bg-[#f84464] text-white"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => onTabChange("booking")}
            className={`px-3 py-1 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === "booking"
                ? "bg-[#f84464] text-white"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Book Tickets & Seats</span>
          </button>
          <button
            onClick={() => onTabChange("venues")}
            className={`px-3 py-1 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === "venues"
                ? "bg-[#f84464] text-white"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>All Cinemas</span>
          </button>
          <button
            onClick={() => onTabChange("admin")}
            className={`px-3 py-1 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === "admin"
                ? "bg-[#f84464] text-white"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#f84464]" />
            <span>Venue Admin Portal (RBAC)</span>
          </button>
        </div>

        {/* Quick Admin Actions (Visible to Venue Admins) */}
        {currentUser?.role === "venue_admin" && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onOpenCreateVenue}
              className="flex items-center gap-1 px-2.5 py-1 text-zinc-200 hover:text-white bg-white/10 hover:bg-[#f84464] transition-colors font-medium border border-white/10 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>New Venue</span>
            </button>
            <button
              onClick={onOpenCreateArea}
              className="flex items-center gap-1 px-2.5 py-1 text-zinc-200 hover:text-white bg-white/10 hover:bg-[#f84464] transition-colors font-medium border border-white/10 cursor-pointer"
            >
              <Layers className="w-3 h-3" />
              <span>New Screen</span>
            </button>
            <button
              onClick={onOpenCreateSection}
              className="flex items-center gap-1 px-2.5 py-1 text-white bg-[#f84464] hover:bg-[#e51a4b] transition-colors font-bold shadow-sm cursor-pointer"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Add $R \times C$ Section</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
