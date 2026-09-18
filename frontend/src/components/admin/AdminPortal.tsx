"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Monitor,
  LayoutGrid,
  Plus,
  RefreshCw,
  Edit2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
  ArrowRight,
} from "lucide-react";
import { venueApi, Venue } from "../../api/venue.api";
import { venueAreaApi, VenueArea } from "../../api/venueArea.api";
import { venueSectionApi, VenueLayout } from "../../api/venueSection.api";
import { SeatGrid } from "../seating/SeatGrid";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { EmptyState } from "../common/EmptyState";
import { useAuth } from "../../context/AuthContext";

export const AdminPortal: React.FC = () => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"venues" | "areas" | "sections" | "layout">("venues");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [areas, setAreas] = useState<VenueArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [layout, setLayout] = useState<VenueLayout | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Modal / Form States
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [venueForm, setVenueForm] = useState({ name: "", description: "", address: "", city: "Mumbai" });

  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [areaForm, setAreaForm] = useState({ name: "", description: "" });

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({ name: "Prime", rowsCount: 5, seatsPerRow: 10 });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch Venues
  const loadVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await venueApi.getVenues();
      setVenues(res.venues || []);
      if (res.venues && res.venues.length > 0 && !selectedVenueId) {
        setSelectedVenueId(res.venues[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  // Fetch Areas when selected venue changes
  useEffect(() => {
    if (selectedVenueId) {
      venueAreaApi
        .getVenueAreas(selectedVenueId)
        .then((res) => {
          setAreas(res.areas || []);
          if (res.areas && res.areas.length > 0) {
            setSelectedAreaId(res.areas[0].id);
          } else {
            setSelectedAreaId("");
          }
        })
        .catch((err) => {
          console.error(err);
          setAreas([]);
        });
    }
  }, [selectedVenueId]);

  // Fetch Layout when on layout tab or selected venue changes
  const loadLayout = async () => {
    if (!selectedVenueId) return;
    try {
      const data = await venueSectionApi.getVenueLayout(selectedVenueId);
      setLayout(data);
    } catch (err) {
      console.error("Failed to load layout", err);
    }
  };

  useEffect(() => {
    if (selectedVenueId && activeTab === "layout") {
      loadLayout();
    }
  }, [selectedVenueId, activeTab]);

  const currentVenue = venues.find((v) => v.id === selectedVenueId);
  const currentArea = areas.find((a) => a.id === selectedAreaId);

  // Handlers for Venue Create / Edit
  const handleOpenCreateVenue = () => {
    setEditingVenue(null);
    setVenueForm({ name: "", description: "", address: "", city: "Mumbai" });
    setFormError(null);
    setIsVenueModalOpen(true);
  };

  const handleOpenEditVenue = (v: Venue) => {
    setEditingVenue(v);
    setVenueForm({
      name: v.name,
      description: v.description || "",
      address: v.address,
      city: v.city,
    });
    setFormError(null);
    setIsVenueModalOpen(true);
  };

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueForm.name.trim() || !venueForm.address.trim() || !venueForm.city.trim()) {
      setFormError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingVenue) {
        await venueApi.updateVenue(editingVenue.id, venueForm);
        notify(`Venue "${venueForm.name}" updated successfully.`);
      } else {
        const res = await venueApi.createVenue(venueForm);
        setSelectedVenueId(res.venue.id);
        notify(`Venue "${venueForm.name}" registered successfully.`);
      }
      setIsVenueModalOpen(false);
      await loadVenues();
    } catch (err: any) {
      setFormError(err.message || "Failed to save venue. You may not be authorized.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handler for Area Create
  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenueId) {
      setFormError("Select a venue first.");
      return;
    }
    if (!areaForm.name.trim()) {
      setFormError("Screen/Area name is required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await venueAreaApi.createVenueArea(selectedVenueId, areaForm);
      notify(`Screen "${areaForm.name}" added to venue.`);
      setIsAreaModalOpen(false);
      setAreaForm({ name: "", description: "" });
      // refresh areas
      const res = await venueAreaApi.getVenueAreas(selectedVenueId);
      setAreas(res.areas || []);
    } catch (err: any) {
      setFormError(err.message || "Failed to add screen. You may not own this venue.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handler for Section & Seat Matrix Create
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAreaId) {
      setFormError("Select a screen first.");
      return;
    }
    if (!sectionForm.name.trim()) {
      setFormError("Section name is required.");
      return;
    }
    if (sectionForm.rowsCount < 1 || sectionForm.seatsPerRow < 1) {
      setFormError("Rows count and seats per row must be at least 1.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const capacity = sectionForm.rowsCount * sectionForm.seatsPerRow;
      await venueSectionApi.createVenueSection(selectedAreaId, {
        name: sectionForm.name,
        capacity,
        rowsCount: Number(sectionForm.rowsCount),
        seatsPerRow: Number(sectionForm.seatsPerRow),
      });

      notify(`Section "${sectionForm.name}" created with ${capacity} physical seats!`);
      setIsSectionModalOpen(false);
      // switch to layout tab to view generated result
      setActiveTab("layout");
      await loadLayout();
    } catch (err: any) {
      setFormError(err.message || "Failed to create section. You may not own this venue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-[#333545] dark:bg-[#1e202b] text-white px-4 py-3 border-l-4 border-[#f84464] shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#f84464]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Portal Header Banner */}
      <div className="bg-[#222434] dark:bg-[#14151e] text-white p-5 border border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f84464]/10 border border-[#f84464]/30 text-[#f84464] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider">
              Venue Admin Dashboard
            </h1>
            <p className="text-xs text-zinc-400">
              Manage venues, auditoriums/screens, sections, and physical seating layouts.
            </p>
          </div>
        </div>

        {currentVenue && (
          <div className="text-xs text-zinc-300 flex items-center gap-2">
            <span className="font-bold text-zinc-400">Active Venue:</span>
            <span className="text-[#f84464] font-black">{currentVenue.name}</span>
            <span className="text-zinc-500">({currentVenue.city})</span>
          </div>
        )}
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("venues")}
            className={`py-3.5 px-4 text-center transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "venues"
                ? "border-b-2 border-[#f84464] text-[#f84464] bg-[#f84464]/5"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Venues ({venues.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("areas")}
            className={`py-3.5 px-4 text-center transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "areas"
                ? "border-b-2 border-[#f84464] text-[#f84464] bg-[#f84464]/5"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>2. Screens ({areas.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("sections")}
            className={`py-3.5 px-4 text-center transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "sections"
                ? "border-b-2 border-[#f84464] text-[#f84464] bg-[#f84464]/5"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Configure Sections</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("layout");
              loadLayout();
            }}
            className={`py-3.5 px-4 text-center transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "layout"
                ? "border-b-2 border-[#f84464] text-[#f84464] bg-[#f84464]/5"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>4. Seating Layout</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Venues Management */}
      {activeTab === "venues" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-[#181a24] p-4 border border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-bold uppercase text-zinc-900 dark:text-zinc-100">
                Registered Venues
              </h2>
              <p className="text-xs text-zinc-500">
                Select a venue to manage screens or register a new cinema location.
              </p>
            </div>
            <button
              onClick={handleOpenCreateVenue}
              className="px-4 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Venue</span>
            </button>
          </div>

          {loading ? (
            <LoadingState message="Loading venues..." />
          ) : venues.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Venues Found"
              description="Register your first venue to get started."
              actionText="Create Venue"
              onAction={handleOpenCreateVenue}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {venues.map((venue) => {
                const isSelected = venue.id === selectedVenueId;
                return (
                  <div
                    key={venue.id}
                    onClick={() => setSelectedVenueId(venue.id)}
                    className={`bg-white dark:bg-[#181a24] border p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#f84464] ring-1 ring-[#f84464] shadow-md"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {venue.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase border border-zinc-200 dark:border-zinc-700">
                          {venue.city}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-500 line-clamp-2">
                        {venue.description || "Cinema complex"}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#f84464] shrink-0" />
                        <span className="truncate">{venue.address}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditVenue(venue);
                        }}
                        className="px-2.5 py-1.5 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-[#f84464] border border-zinc-300 dark:border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVenueId(venue.id);
                          setActiveTab("areas");
                        }}
                        className="px-3 py-1.5 bg-[#333545] dark:bg-[#222434] hover:bg-[#f84464] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Manage Screens</span>
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

      {/* TAB 2: Screens / Areas */}
      {activeTab === "areas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-[#181a24] p-4 border border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-bold uppercase text-zinc-900 dark:text-zinc-100">
                Screens & Auditoriums for "{currentVenue?.name}"
              </h2>
              <p className="text-xs text-zinc-500">
                Each screen has its own seating layout (e.g. Screen 1, IMAX, Gold Class).
              </p>
            </div>
            <button
              onClick={() => {
                setAreaForm({ name: "", description: "" });
                setFormError(null);
                setIsAreaModalOpen(true);
              }}
              className="px-4 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Screen</span>
            </button>
          </div>

          {areas.length === 0 ? (
            <EmptyState
              icon={Monitor}
              title="No Screens Added"
              description="Add your first screen (e.g. Screen 1, IMAX) to configure sections."
              actionText="Add First Screen"
              onAction={() => {
                setAreaForm({ name: "", description: "" });
                setFormError(null);
                setIsAreaModalOpen(true);
              }}
            />
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
                        ? "border-[#f84464] ring-1 ring-[#f84464] shadow-md"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-[#f84464]" />
                          <span>{area.name}</span>
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase border border-zinc-200 dark:border-zinc-700">
                          Auditorium
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {area.description || "Auditorium screen"}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase">
                        {isSelected ? "Selected" : "Click to select"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAreaId(area.id);
                          setActiveTab("sections");
                        }}
                        className="px-3 py-1.5 bg-[#f84464] hover:bg-[#e51a4b] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Configure Sections</span>
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

      {/* TAB 3: Configure Sections & Generate Seats */}
      {activeTab === "sections" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-[#181a24] p-4 border border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-bold uppercase text-zinc-900 dark:text-zinc-100">
                Configure Sections for "{currentArea?.name || "Selected Screen"}"
              </h2>
              <p className="text-xs text-zinc-500">
                Define seating sections (VIP Recliner, Prime, Classic) with row and column counts.
              </p>
            </div>
            <button
              onClick={() => {
                setSectionForm({ name: "Prime", rowsCount: 5, seatsPerRow: 10 });
                setFormError(null);
                setIsSectionModalOpen(true);
              }}
              className="px-4 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-8 text-center space-y-6">
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-base font-bold uppercase text-zinc-900 dark:text-zinc-100">
                Generate Physical Seating Layout
              </h3>
              <p className="text-xs text-zinc-500">
                Venue: <strong className="text-[#f84464]">{currentVenue?.name}</strong> | Screen:{" "}
                <strong className="text-[#f84464]">{currentArea?.name || "None selected"}</strong>
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSectionForm({ name: "Prime", rowsCount: 5, seatsPerRow: 10 });
                  setFormError(null);
                  setIsSectionModalOpen(true);
                }}
                className="px-6 py-3 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Define $R \times C$ Section & Seats</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("layout");
                  loadLayout();
                }}
                className="px-6 py-3 bg-[#333545] dark:bg-[#222434] hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>View Generated Layout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Visual Seating Layout */}
      {activeTab === "layout" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#181a24] p-4 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-base font-bold uppercase text-zinc-900 dark:text-zinc-100">
              Generated Seating Chart for "{currentVenue?.name}"
            </h2>
            <button
              onClick={loadLayout}
              className="p-2 border border-zinc-300 dark:border-zinc-700 hover:text-[#f84464] transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {layout && layout.areas && layout.areas.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto bg-white dark:bg-[#181a24] p-2 border border-zinc-200 dark:border-zinc-800">
                {layout.areas.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAreaId(a.id)}
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                      selectedAreaId === a.id
                        ? "bg-[#f84464] text-white border-[#f84464]"
                        : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {a.name} ({a.sections.length} Sections)
                  </button>
                ))}
              </div>

              {layout.areas.find((a) => a.id === selectedAreaId) && (
                <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
                  <SeatGrid
                    area={layout.areas.find((a) => a.id === selectedAreaId)!}
                    selectedSeats={[]}
                    onToggleSeat={() => {}}
                  />
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={LayoutGrid}
              title="No Layout Available"
              description="Configure screens and sections to generate seating layouts."
            />
          )}
        </div>
      )}

      {/* CREATE / EDIT VENUE MODAL */}
      {isVenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#181a24] text-zinc-900 dark:text-zinc-100 max-w-lg w-full border border-zinc-300 dark:border-zinc-700 shadow-2xl">
            <div className="bg-[#333545] dark:bg-[#14151e] text-white p-4 flex items-center justify-between border-b border-white/10">
              <h3 className="font-bold text-sm uppercase">
                {editingVenue ? "Edit Venue" : "Register New Venue"}
              </h3>
              <button onClick={() => setIsVenueModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVenue} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={venueForm.name}
                  onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  placeholder="e.g. PVR ICON Multiplex"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={venueForm.description}
                  onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })}
                  placeholder="e.g. Premium multiplex with 4K Laser projection"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={venueForm.city}
                    onChange={(e) => setVenueForm({ ...venueForm, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={venueForm.address}
                    onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
                    placeholder="e.g. Andheri West, Link Road"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsVenueModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Venue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SCREEN MODAL */}
      {isAreaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#181a24] text-zinc-900 dark:text-zinc-100 max-w-md w-full border border-zinc-300 dark:border-zinc-700 shadow-2xl">
            <div className="bg-[#333545] dark:bg-[#14151e] text-white p-4 flex items-center justify-between border-b border-white/10">
              <h3 className="font-bold text-sm uppercase">Add Screen to "{currentVenue?.name}"</h3>
              <button onClick={() => setIsAreaModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveArea} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                  Screen / Area Name *
                </label>
                <input
                  type="text"
                  required
                  value={areaForm.name}
                  onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                  placeholder="e.g. Screen 1 - IMAX, Screen 2, Gold Class"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={areaForm.description}
                  onChange={(e) => setAreaForm({ ...areaForm, description: e.target.value })}
                  placeholder="e.g. 4K Dual Laser 12-Channel Immersive Sound"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAreaModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Screen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SECTION MODAL */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#181a24] text-zinc-900 dark:text-zinc-100 max-w-lg w-full border border-zinc-300 dark:border-zinc-700 shadow-2xl">
            <div className="bg-[#333545] dark:bg-[#14151e] text-white p-4 flex items-center justify-between border-b border-white/10">
              <h3 className="font-bold text-sm uppercase">
                Add Section to "{currentArea?.name}"
              </h3>
              <button onClick={() => setIsSectionModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                  Section Tier Name *
                </label>
                <div className="flex gap-2 mb-2">
                  {["VIP Recliner", "Prime", "Classic", "Balcony", "Executive"].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setSectionForm({ ...sectionForm, name: cat })}
                      className={`px-2.5 py-1 text-xs border font-bold transition-colors cursor-pointer ${
                        sectionForm.name === cat
                          ? "border-[#f84464] bg-[#f84464] text-white"
                          : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-800/40 p-3 border border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                    Rows (R)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={26}
                    required
                    value={sectionForm.rowsCount}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, rowsCount: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Rows: A to {String.fromCharCode(64 + Math.min(sectionForm.rowsCount, 26))}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                    Seats Per Row (C)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={sectionForm.seatsPerRow}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, seatsPerRow: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Seats: 1 to {sectionForm.seatsPerRow}
                  </span>
                </div>
              </div>

              <div className="text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span>Total Seats Generated:</span>
                <span className="text-[#f84464] font-mono font-black">
                  {sectionForm.rowsCount * sectionForm.seatsPerRow} Seats
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Generating..." : "Generate Seats"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
