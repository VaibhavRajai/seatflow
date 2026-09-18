"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Layers,
  LayoutGrid,
  Monitor,
  Plus,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  MapPin,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { api, Venue, VenueArea, VenueSection, VenueLayout } from "../lib/api";
import { SeatingLayoutView } from "./SeatingLayoutView";

interface HierarchyWorkflowProps {
  venues: Venue[];
  onRefreshVenues: () => void;
  onOpenCreateVenue: () => void;
  onOpenCreateArea: (venueId: string) => void;
  onOpenCreateSection: (venueId: string, areaId?: string) => void;
  isAdminLoggedIn: boolean;
  onRequireAuth: () => void;
  currentCity: string;
  searchQuery: string;
}

export const HierarchyWorkflow: React.FC<HierarchyWorkflowProps> = ({
  venues,
  onRefreshVenues,
  onOpenCreateVenue,
  onOpenCreateArea,
  onOpenCreateSection,
  isAdminLoggedIn,
  onRequireAuth,
  currentCity,
  searchQuery,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  const [areas, setAreas] = useState<VenueArea[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  useEffect(() => {
    if (venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  // Load areas whenever selected venue changes
  useEffect(() => {
    if (selectedVenueId) {
      setLoadingAreas(true);
      api
        .getVenueAreas(selectedVenueId)
        .then((fetchedAreas) => {
          setAreas(fetchedAreas);
          if (fetchedAreas.length > 0) {
            setSelectedAreaId(fetchedAreas[0].id);
          } else {
            setSelectedAreaId("");
          }
        })
        .catch((err) => {
          console.error(err);
          setAreas([]);
        })
        .finally(() => {
          setLoadingAreas(false);
        });
    }
  }, [selectedVenueId]);

  const currentVenue = venues.find((v) => v.id === selectedVenueId);
  const currentArea = areas.find((a) => a.id === selectedAreaId);

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
      {/* Stepper Navigation / Breadcrumb Header */}
      <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Step Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveStep(1)}
            className={`p-4 text-left border-b-2 sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800 transition-colors ${
              activeStep === 1
                ? "border-b-2 border-b-[#f84464]! sm:border-b-0! bg-[#f84464]/5 dark:bg-[#f84464]/10"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold ${
                  activeStep === 1
                    ? "bg-[#f84464] text-white"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                1
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Venues
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 truncate">
              {currentVenue ? currentVenue.name : "Select or create venue"}
            </p>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`p-4 text-left border-b-2 sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800 transition-colors ${
              activeStep === 2
                ? "border-b-2 border-b-[#f84464]! sm:border-b-0! bg-[#f84464]/5 dark:bg-[#f84464]/10"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold ${
                  activeStep === 2
                    ? "bg-[#f84464] text-white"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                2
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Screens / Areas
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 truncate">
              {areas.length} {areas.length === 1 ? "Screen" : "Screens"} defined
            </p>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`p-4 text-left border-b-2 sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800 transition-colors ${
              activeStep === 3
                ? "border-b-2 border-b-[#f84464]! sm:border-b-0! bg-[#f84464]/5 dark:bg-[#f84464]/10"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold ${
                  activeStep === 3
                    ? "bg-[#f84464] text-white"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                3
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Add Sections & Seats
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 truncate">
              $R \times C$ physical seat generator
            </p>
          </button>

          <button
            onClick={() => setActiveStep(4)}
            className={`p-4 text-left transition-colors ${
              activeStep === 4
                ? "border-b-2 border-b-[#f84464]! sm:border-b-0! bg-[#f84464]/5 dark:bg-[#f84464]/10"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold ${
                  activeStep === 4
                    ? "bg-[#f84464] text-white"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                4
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Layout Visualizer
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 truncate">
              Interactive BookMyShow grid
            </p>
          </button>
        </div>

        {/* Current Active Venue Context Ribbon */}
        {currentVenue && (
          <div className="px-6 py-2.5 bg-zinc-50 dark:bg-[#14151e] flex flex-wrap items-center justify-between gap-3 text-xs border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-500 uppercase text-[10px]">Selected Venue:</span>
              <span className="font-extrabold text-[#f84464]">{currentVenue.name}</span>
              <span className="text-zinc-400">({currentVenue.city})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenCreateArea(currentVenue.id)}
                className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-[#f84464] hover:text-white transition-colors font-bold text-[11px] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Screen</span>
              </button>
              <button
                onClick={() => onOpenCreateSection(currentVenue.id, selectedAreaId)}
                className="px-2.5 py-1 bg-[#f84464] hover:bg-[#e51a4b] text-white transition-colors font-bold text-[11px] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Section</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STEP 1: Venues View */}
      {activeStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-[#181a24] p-4 border border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-wide text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#f84464]" />
                <span>Step 1: Select or Register a Venue</span>
              </h2>
              <p className="text-xs text-zinc-500">
                A Venue represents the overall physical cinema or theater complex.
              </p>
            </div>
            <button
              onClick={onOpenCreateVenue}
              className="px-4 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Venue</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVenues.map((venue) => {
              const isSelected = venue.id === selectedVenueId;
              return (
                <div
                  key={venue.id}
                  onClick={() => setSelectedVenueId(venue.id)}
                  className={`bg-white dark:bg-[#181a24] border p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#f84464] shadow-md ring-1 ring-[#f84464]"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {venue.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase tracking-wide shrink-0 border border-zinc-200 dark:border-zinc-700">
                        {venue.city}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {venue.description || "Multiplex complex"}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#f84464] shrink-0" />
                      <span className="truncate">{venue.address}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase">
                      {isSelected ? "Active Venue" : "Click to select"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVenueId(venue.id);
                        setActiveStep(2);
                      }}
                      className="px-3 py-1.5 bg-[#333545] dark:bg-[#222434] hover:bg-[#f84464] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <span>Manage Screens</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Screens / Areas View */}
      {activeStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-[#181a24] p-4 border border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-wide text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#f84464]" />
                <span>Step 2: Screens & Areas inside "{currentVenue?.name}"</span>
              </h2>
              <p className="text-xs text-zinc-500">
                A venue contains multiple physical screens or auditoriums (e.g. Screen 1, IMAX, Gold Class).
              </p>
            </div>
            <button
              onClick={() => onOpenCreateArea(selectedVenueId)}
              className="px-4 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Screen</span>
            </button>
          </div>

          {loadingAreas ? (
            <div className="bg-white dark:bg-[#181a24] p-12 text-center text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#f84464]" />
              <p className="text-xs font-bold uppercase mt-2">Loading Screens...</p>
            </div>
          ) : areas.length === 0 ? (
            <div className="bg-white dark:bg-[#181a24] p-12 border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
              <Layers className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
              <div className="space-y-1">
                <h3 className="text-base font-bold uppercase text-zinc-800 dark:text-zinc-200">
                  No Screens Added to this Venue Yet
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Add your first physical screen (e.g. Screen 1, IMAX with Laser) to start building sections.
                </p>
              </div>
              <button
                onClick={() => onOpenCreateArea(selectedVenueId)}
                className="px-5 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Screen</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map((area) => {
                const isSelected = area.id === selectedAreaId;
                return (
                  <div
                    key={area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                    className={`bg-white dark:bg-[#181a24] border p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#f84464] shadow-md ring-1 ring-[#f84464]"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-[#f84464]" />
                          <span>{area.name}</span>
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase tracking-wide border border-zinc-200 dark:border-zinc-700">
                          Screen
                        </span>
                      </div>

                      <p className="text-xs text-zinc-500">
                        {area.description || "Physical auditorium screen"}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase">
                        {isSelected ? "Selected Screen" : "Click to choose"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAreaId(area.id);
                          setActiveStep(3);
                        }}
                        className="px-3 py-1.5 bg-[#f84464] hover:bg-[#e51a4b] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                      >
                        <span>Add Section</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Add Section & Seat Matrix Generator */}
      {activeStep === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-[#181a24] p-4 border border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-wide text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#f84464]" />
                <span>Step 3: Section & Seat Configuration</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Define seating tiers (e.g. VIP Recliner, Prime, Classic) with row and seat counts. Physical seats are generated automatically in the database.
              </p>
            </div>
            <button
              onClick={() => onOpenCreateSection(selectedVenueId, selectedAreaId)}
              className="px-4 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Open Seat Matrix Generator</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-8 text-center space-y-6">
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-base font-bold uppercase text-zinc-900 dark:text-zinc-100">
                Configure Physical Seat Layout
              </h3>
              <p className="text-xs text-zinc-500">
                Target: <strong className="text-[#f84464]">{currentVenue?.name}</strong> → Screen:{" "}
                <strong className="text-[#f84464]">{currentArea?.name || "No screen selected"}</strong>
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => onOpenCreateSection(selectedVenueId, selectedAreaId)}
                className="px-6 py-3 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Configure $R \times C$ Section & Seats</span>
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className="px-6 py-3 bg-[#333545] dark:bg-[#222434] hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <span>View Full Layout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Full Layout Visualizer */}
      {activeStep === 4 && (
        <div className="space-y-4">
          <SeatingLayoutView
            venues={venues}
            selectedVenueId={selectedVenueId}
            onSelectVenue={setSelectedVenueId}
            onOpenCreateArea={onOpenCreateArea}
            onOpenCreateSection={onOpenCreateSection}
            isAdminLoggedIn={isAdminLoggedIn}
          />
        </div>
      )}
    </div>
  );
};
