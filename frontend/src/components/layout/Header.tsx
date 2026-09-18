"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  Moon,
  Sun,
  Shield,
  User,
  LogOut,
  Building2,
  Ticket,
  Film,
  Home,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  currentCity: string;
  onCityChange: (city: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeNav: string;
  onNavChange: (nav: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuth: (role?: "user" | "venue_admin") => void;
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

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onCityChange,
  searchQuery,
  onSearchChange,
  activeNav,
  onNavChange,
  isDarkMode,
  onToggleDarkMode,
  onOpenAuth,
}) => {
  const { isAuthenticated, currentUser, role, logout } = useAuth();
  const [showCityMenu, setShowCityMenu] = useState(false);

  return (
    <header className="w-full flex flex-col z-40 sticky top-0 shadow-md">
      {/* Top Header */}
      <div className="bg-[#333545] dark:bg-[#1e202b] text-white px-4 sm:px-8 py-3 flex items-center justify-between gap-4 border-b border-white/10">
        {/* Logo / Wordmark */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => onNavChange("home")}
        >
          <div className="bg-[#f84464] text-white font-black text-xl px-2.5 py-1 tracking-wider uppercase border border-white/20">
            SeatFlow
          </div>
          <span className="hidden md:inline text-xs font-bold uppercase tracking-widest text-zinc-300">
            Tickets & Venues
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-2 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search for events, cinemas, venues..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white dark:bg-[#12141c] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 pl-9 pr-4 py-1.5 text-sm outline-none border border-transparent focus:border-[#f84464]"
            />
          </div>
        </div>

        {/* Right Actions */}
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

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 border border-zinc-600 dark:border-zinc-700 hover:text-[#f84464] text-zinc-200 transition-colors bg-black/20 cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-300" />}
          </button>

          {/* User / Admin Authentication State */}
          {isAuthenticated && currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 text-xs bg-[#f84464]/10 text-[#f84464] px-2.5 py-1 border border-[#f84464]/40 font-bold">
                {role === "venue_admin" ? (
                  <Shield className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
                <span className="max-w-[120px] truncate">{currentUser.email || "User"}</span>
                <span className="text-[10px] uppercase opacity-80">
                  ({role === "venue_admin" ? "Admin" : "Customer"})
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2.5 py-1.5 font-bold transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth("user")}
                className="text-xs bg-[#f84464] hover:bg-[#e51a4b] text-white px-3.5 py-1.5 font-bold transition-colors uppercase tracking-wider cursor-pointer shadow-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth("venue_admin")}
                className="hidden sm:flex items-center gap-1 text-xs border border-zinc-600 hover:border-zinc-400 text-zinc-200 hover:text-white px-3 py-1.5 font-bold transition-colors uppercase tracking-wider cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#f84464]" />
                <span>Admin Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <div className="bg-[#222434] dark:bg-[#14151e] text-zinc-300 text-xs px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-white/5">
        <nav className="flex items-center gap-1 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => onNavChange("home")}
            className={`px-3 py-1 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeNav === "home" ? "bg-[#f84464] text-white" : "hover:text-white hover:bg-white/5"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => onNavChange("events")}
            className={`px-3 py-1 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeNav === "events" ? "bg-[#f84464] text-white" : "hover:text-white hover:bg-white/5"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Movies / Events</span>
          </button>
          <button
            onClick={() => onNavChange("venues")}
            className={`px-3 py-1 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeNav === "venues" ? "bg-[#f84464] text-white" : "hover:text-white hover:bg-white/5"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Cinemas / Venues</span>
          </button>
          <button
            onClick={() => onNavChange("bookings")}
            className={`px-3 py-1 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeNav === "bookings" ? "bg-[#f84464] text-white" : "hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>My Bookings</span>
          </button>
          <button
            onClick={() => onNavChange("admin")}
            className={`px-3 py-1 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeNav === "admin" ? "bg-[#f84464] text-white" : "hover:text-white hover:bg-white/5"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#f84464]" />
            <span>Admin Portal</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
