"use client";

import React from "react";
import {
  Building2,
  MapPin,
  Layers,
  LayoutGrid,
  Plus,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Venue } from "../lib/api";

interface VenueListProps {
  venues: Venue[];
  onSelectVenue: (venueId: string) => void;
  onOpenCreateVenue: () => void;
  onOpenCreateArea: (venueId: string) => void;
  onOpenCreateSection: (venueId: string) => void;
  currentCity: string;
  searchQuery: string;
  isAdminLoggedIn: boolean;
}

export const VenueList: React.FC<VenueListProps> = ({
  venues,
  onSelectVenue,
  onOpenCreateVenue,
  onOpenCreateArea,
  onOpenCreateSection,
  currentCity,
  searchQuery,
  isAdminLoggedIn,
}) => {
  const filteredVenues = venues.filter((v) => {
    const matchesCity =
      currentCity === "All Cities" ||
      v.city.toLowerCase() === currentCity.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.address && v.address.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCity && matchesSearch;
  });

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#181a24] p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#f84464]" />
            <span>Registered Venues & Multiplexes</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Select a venue to explore its physical screens, sections, and $R \times C$ seat matrices.
          </p>
        </div>

        <button
          onClick={onOpenCreateVenue}
          className="px-4 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Venue</span>
        </button>
      </div>

      {/* Venues Grid */}
      {filteredVenues.length === 0 ? (
        <div className="bg-white dark:bg-[#181a24] p-12 border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
          <Building2 className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
          <div className="space-y-1">
            <h3 className="text-base font-bold uppercase text-zinc-800 dark:text-zinc-200">
              No Venues Found
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              {searchQuery || currentCity !== "All Cities"
                ? "No venues match the current search filters. Try clearing your search or switching city."
                : "Get started by registering your first multiplex or cinema venue."}
            </p>
          </div>
          <button
            onClick={onOpenCreateVenue}
            className="px-5 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Venue</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 hover:border-[#f84464] transition-all flex flex-col justify-between p-5 space-y-4 shadow-xs group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#f84464] transition-colors leading-snug">
                    {venue.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase tracking-wide shrink-0 border border-zinc-200 dark:border-zinc-700">
                    {venue.city}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {venue.description || "Multiplex & entertainment venue"}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#f84464] shrink-0" />
                  <span className="truncate">{venue.address}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
                <button
                  onClick={() => onSelectVenue(venue.id)}
                  className="w-full py-2 bg-[#333545] dark:bg-[#222434] hover:bg-[#f84464] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>View Screens & Layout</span>
                </button>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    onClick={() => onOpenCreateArea(venue.id)}
                    className="py-1.5 px-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Layers className="w-3 h-3" />
                    <span>+ Screen</span>
                  </button>
                  <button
                    onClick={() => onOpenCreateSection(venue.id)}
                    className="py-1.5 px-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Section</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
