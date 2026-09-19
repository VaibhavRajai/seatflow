"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Plus,
  Edit2,
  Trash2,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Layers,
  ChevronRight,
  Eye,
  Info,
} from "lucide-react";
import { eventApi, SeatFlowEvent, EventSectionItem } from "../../api/event.api";
import { venueApi, Venue } from "../../api/venue.api";
import { venueAreaApi, VenueArea } from "../../api/venueArea.api";
import { venueSectionApi } from "../../api/venueSection.api";
import { LoadingState } from "../common/LoadingState";
import { EmptyState } from "../common/EmptyState";

interface EventManagementTabProps {
  venues: Venue[];
  onNotify: (msg: string) => void;
}

interface PhysicalSectionOption {
  id: string;
  name: string;
  capacity: number;
  rows_count: number;
  seats_per_row: number;
}

export const EventManagementTab: React.FC<EventManagementTabProps> = ({
  venues,
  onNotify,
}) => {
  const [events, setEvents] = useState<SeatFlowEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SeatFlowEvent | null>(null);

  // Create Event Form State
  const [createForm, setCreateForm] = useState({
    venueId: "",
    venueAreaId: "",
    name: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const [availableAreas, setAvailableAreas] = useState<VenueArea[]>([]);
  const [availableSections, setAvailableSections] = useState<PhysicalSectionOption[]>([]);
  const [sectionPricing, setSectionPricing] = useState<{
    [sectionId: string]: { selected: boolean; price: string };
  }>({});

  const [loadingSections, setLoadingSections] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Edit Event Form State
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  // Inline Section Edit in Details Modal
  const [editingSectionPriceId, setEditingSectionPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>("");
  const [newSectionToAddId, setNewSectionToAddId] = useState<string>("");
  const [newSectionPrice, setNewSectionPrice] = useState<string>("250");
  const [areaPhysicalSections, setAreaPhysicalSections] = useState<PhysicalSectionOption[]>([]);

  // Fetch Admin Events
  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await eventApi.getAdminEvents();
      setEvents(res.events || []);
    } catch (err: any) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // When venue changes in Create modal, load its areas
  useEffect(() => {
    if (createForm.venueId) {
      venueAreaApi
        .getVenueAreas(createForm.venueId)
        .then((res) => {
          setAvailableAreas(res.areas || []);
          if (res.areas && res.areas.length > 0) {
            setCreateForm((prev) => ({ ...prev, venueAreaId: res.areas[0].id }));
          } else {
            setCreateForm((prev) => ({ ...prev, venueAreaId: "" }));
          }
        })
        .catch((err) => {
          console.error(err);
          setAvailableAreas([]);
        });
    } else {
      setAvailableAreas([]);
      setCreateForm((prev) => ({ ...prev, venueAreaId: "" }));
    }
  }, [createForm.venueId]);

  // When area changes in Create modal, load its physical sections
  useEffect(() => {
    if (createForm.venueAreaId) {
      setLoadingSections(true);
      venueSectionApi
        .getVenueSectionsByArea(createForm.venueAreaId)
        .then((res) => {
          const sections = res.sections || [];
          setAvailableSections(sections);
          // initialize pricing state
          const initialPricing: { [id: string]: { selected: boolean; price: string } } = {};
          sections.forEach((sec) => {
            initialPricing[sec.id] = { selected: true, price: "250" };
          });
          setSectionPricing(initialPricing);
        })
        .catch((err) => {
          console.error(err);
          setAvailableSections([]);
        })
        .finally(() => {
          setLoadingSections(false);
        });
    } else {
      setAvailableSections([]);
      setSectionPricing({});
    }
  }, [createForm.venueAreaId]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const initialVenueId = venues.length > 0 ? venues[0].id : "";
    const now = new Date();
    const startTimeDefault = new Date(now.getTime() + 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);
    const endTimeDefault = new Date(now.getTime() + 3.5 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);

    setCreateForm({
      venueId: initialVenueId,
      venueAreaId: "",
      name: "",
      description: "",
      startTime: startTimeDefault,
      endTime: endTimeDefault,
    });
    setModalError(null);
    setIsCreateModalOpen(true);
  };

  // Submit Create Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.venueAreaId) {
      setModalError("Please select a screen/auditorium.");
      return;
    }
    if (!createForm.name.trim()) {
      setModalError("Event name is required.");
      return;
    }
    if (!createForm.startTime || !createForm.endTime) {
      setModalError("Start time and end time are required.");
      return;
    }

    const start = new Date(createForm.startTime);
    const end = new Date(createForm.endTime);
    if (end <= start) {
      setModalError("End time must be after start time.");
      return;
    }

    // Build configured sections
    const selectedSections = Object.entries(sectionPricing)
      .filter(([_, config]) => config.selected)
      .map(([sectionId, config]) => {
        const priceNum = parseFloat(config.price);
        return {
          venueSectionId: sectionId,
          price: isNaN(priceNum) ? 0 : priceNum,
        };
      });

    for (const sec of selectedSections) {
      if (sec.price < 0) {
        setModalError("Section price cannot be negative.");
        return;
      }
    }

    setSubmitting(true);
    setModalError(null);

    try {
      await eventApi.createEvent({
        venueAreaId: createForm.venueAreaId,
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        startTime: new Date(createForm.startTime).toISOString(),
        endTime: new Date(createForm.endTime).toISOString(),
        sections: selectedSections.length > 0 ? selectedSections : undefined,
      });

      onNotify(`Event "${createForm.name}" created successfully!`);
      setIsCreateModalOpen(false);
      await loadEvents();
    } catch (err: any) {
      setModalError(err.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Details Modal
  const handleOpenDetails = async (event: SeatFlowEvent) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
    setEditingSectionPriceId(null);
    setNewSectionToAddId("");
    setNewSectionPrice("250");

    // Fetch area physical sections to see which ones aren't configured yet
    try {
      const res = await venueSectionApi.getVenueSectionsByArea(event.area.id);
      setAreaPhysicalSections(res.sections || []);
    } catch (err) {
      console.error(err);
      setAreaPhysicalSections([]);
    }
  };

  // Refresh Single Event Details
  const refreshEventDetails = async (eventId: string) => {
    try {
      const res = await eventApi.getAdminEventById(eventId);
      setSelectedEvent(res.event);
      await loadEvents();
    } catch (err) {
      console.error("Failed to refresh event", err);
    }
  };

  // Update Section Price Handler
  const handleUpdatePrice = async (sectionId: string) => {
    if (!selectedEvent) return;
    const priceNum = parseFloat(editingPriceValue);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Please enter a valid non-negative price.");
      return;
    }

    try {
      await eventApi.updateSectionPrice(selectedEvent.id, sectionId, priceNum);
      onNotify("Section price updated successfully!");
      setEditingSectionPriceId(null);
      await refreshEventDetails(selectedEvent.id);
    } catch (err: any) {
      alert(err.message || "Failed to update price");
    }
  };

  // Remove Section Handler
  const handleRemoveSection = async (sectionId: string) => {
    if (!selectedEvent) return;
    if (!confirm("Are you sure you want to remove this section pricing from the event?")) {
      return;
    }

    try {
      await eventApi.removeSection(selectedEvent.id, sectionId);
      onNotify("Section removed from event.");
      await refreshEventDetails(selectedEvent.id);
    } catch (err: any) {
      alert(err.message || "Failed to remove section");
    }
  };

  // Add Section to Event in Details Modal
  const handleAddSectionToEvent = async () => {
    if (!selectedEvent || !newSectionToAddId) return;
    const priceNum = parseFloat(newSectionPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Please enter a valid price (>= 0).");
      return;
    }

    try {
      await eventApi.addSectionToEvent(selectedEvent.id, {
        venueSectionId: newSectionToAddId,
        price: priceNum,
      });
      onNotify("Section added to event!");
      setNewSectionToAddId("");
      await refreshEventDetails(selectedEvent.id);
    } catch (err: any) {
      alert(err.message || "Failed to add section");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (event: SeatFlowEvent) => {
    setSelectedEvent(event);
    setEditForm({
      name: event.name,
      description: event.description || "",
      startTime: new Date(event.startTime).toISOString().slice(0, 16),
      endTime: new Date(event.endTime).toISOString().slice(0, 16),
    });
    setModalError(null);
    setIsEditModalOpen(true);
  };

  // Submit Edit Event
  const handleSaveEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!editForm.name.trim()) {
      setModalError("Event name is required.");
      return;
    }

    const start = new Date(editForm.startTime);
    const end = new Date(editForm.endTime);
    if (end <= start) {
      setModalError("End time must be after start time.");
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      await eventApi.updateEvent(selectedEvent.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });

      onNotify(`Event "${editForm.name}" updated successfully.`);
      setIsEditModalOpen(false);
      await loadEvents();
    } catch (err: any) {
      setModalError(err.message || "Failed to update event");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Event Handler
  const handleDeleteEvent = async (event: SeatFlowEvent) => {
    if (!confirm(`Are you sure you want to delete event "${event.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await eventApi.deleteEvent(event.id);
      onNotify(`Event "${event.name}" deleted successfully.`);
      if (isDetailsModalOpen && selectedEvent?.id === event.id) {
        setIsDetailsModalOpen(false);
      }
      await loadEvents();
    } catch (err: any) {
      alert(err.message || "Failed to delete event");
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#181a24] p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#f84464]" />
            <span>Event & Show Management</span>
          </h2>
          <p className="text-xs text-zinc-500">
            Schedule shows in your cinema auditoriums and configure event-specific section pricing.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          disabled={venues.length === 0}
          className="px-4 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </button>
      </div>

      {venues.length === 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>You need to register at least one venue and auditorium screen before creating events.</span>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <LoadingState message="Loading scheduled events..." />
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Events Scheduled"
          description="Create your first movie show or live event to start configuring section ticket prices."
          actionText="Create Event"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 hover:border-[#f84464]/50 p-5 flex flex-col justify-between space-y-4 transition-all shadow-xs group"
            >
              <div className="space-y-3">
                {/* Event Name & Screen Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#f84464] transition-colors line-clamp-1">
                      {event.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#f84464]" />
                      <span>
                        {event.venue.name} ({event.venue.city})
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase text-zinc-700 dark:text-zinc-300 shrink-0">
                    {event.area.name}
                  </span>
                </div>

                {/* Description */}
                {event.description && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {event.description}
                  </p>
                )}

                {/* Date & Time */}
                <div className="bg-zinc-50 dark:bg-zinc-900/60 p-2.5 border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#f84464]" />
                    <span>Starts: {formatDateTime(event.startTime)}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 pl-5">
                    Ends: {formatDateTime(event.endTime)}
                  </div>
                </div>

                {/* Configured Section Pricing Badges */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                    <span>Configured Section Prices:</span>
                    <span className="font-mono text-[#f84464]">
                      {event.sections.length} Section{event.sections.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {event.sections.length === 0 ? (
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 italic bg-amber-500/10 p-2 border border-amber-500/20">
                      No section prices configured yet.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {event.sections.map((sec) => (
                        <span
                          key={sec.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-[#f84464]/10 border border-[#f84464]/30 text-[#f84464]"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{sec.name}:</span>
                          <span className="font-black">₹{sec.price}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenDetails(event)}
                  className="px-3 py-1.5 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-[#f84464] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(event)}
                    className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-[#f84464] border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                    title="Edit event details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event)}
                    className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-red-500 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                    title="Delete event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE EVENT MULTI-STEP MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#181a24] text-zinc-900 dark:text-zinc-100 max-w-2xl w-full border border-zinc-300 dark:border-zinc-700 shadow-2xl my-8">
            <div className="bg-[#333545] dark:bg-[#14151e] text-white p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#f84464]" />
                <h3 className="font-bold text-sm uppercase">Create New Event / Show</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-5">
              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Step 1 & 2: Venue and Area Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-800/40 p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                    1. Select Venue *
                  </label>
                  <select
                    value={createForm.venueId}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, venueId: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                    2. Select Screen / Area *
                  </label>
                  <select
                    value={createForm.venueAreaId}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, venueAreaId: e.target.value })
                    }
                    required
                    disabled={availableAreas.length === 0}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none disabled:opacity-50"
                  >
                    {availableAreas.length === 0 ? (
                      <option value="">No screens registered</option>
                    ) : (
                      availableAreas.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Step 3: Event Information */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                    Event / Movie Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Avengers: Endgame"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Action / Sci-Fi • 3h 01m • English 2D"
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                      Show Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={createForm.startTime}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, startTime: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                      Show End Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={createForm.endTime}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, endTime: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Configure Section Pricing */}
              <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#f84464]" />
                      <span>Configure Section Pricing for this Show</span>
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Choose which physical sections participate in this event and set individual ticket prices.
                    </p>
                  </div>
                </div>

                {loadingSections ? (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    Loading screen sections...
                  </div>
                ) : availableSections.length === 0 ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                    No physical sections found for the selected screen. Please configure sections first in Tab 3 ("Configure Sections").
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {availableSections.map((sec) => {
                      const isChecked = sectionPricing[sec.id]?.selected ?? false;
                      const currentPrice = sectionPricing[sec.id]?.price ?? "250";

                      return (
                        <div
                          key={sec.id}
                          className={`p-3 border flex items-center justify-between gap-4 transition-colors ${
                            isChecked
                              ? "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700"
                              : "bg-zinc-100/40 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-60"
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setSectionPricing({
                                  ...sectionPricing,
                                  [sec.id]: {
                                    ...sectionPricing[sec.id],
                                    selected: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 accent-[#f84464] cursor-pointer"
                            />
                            <div>
                              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                {sec.name}
                              </div>
                              <div className="text-[10px] text-zinc-500">
                                Capacity: {sec.capacity} seats ({sec.rows_count} rows × {sec.seats_per_row} seats)
                              </div>
                            </div>
                          </label>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-500">Price (₹):</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              disabled={!isChecked}
                              value={currentPrice}
                              onChange={(e) =>
                                setSectionPricing({
                                  ...sectionPricing,
                                  [sec.id]: {
                                    ...sectionPricing[sec.id],
                                    price: e.target.value,
                                  },
                                })
                              }
                              className="w-24 px-2.5 py-1 text-xs font-bold bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none disabled:opacity-40 font-mono text-right"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || availableAreas.length === 0}
                  className="px-6 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Creating Event..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT DETAILS & SECTION PRICING MODAL */}
      {isDetailsModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#181a24] text-zinc-900 dark:text-zinc-100 max-w-2xl w-full border border-zinc-300 dark:border-zinc-700 shadow-2xl my-8">
            <div className="bg-[#333545] dark:bg-[#14151e] text-white p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#f84464]" />
                <h3 className="font-bold text-sm uppercase">
                  Event Details: {selectedEvent.name}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-800/40 p-3.5 border border-zinc-200 dark:border-zinc-800 text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-zinc-400">
                    Cinema Venue
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {selectedEvent.venue.name}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-zinc-400">
                    Screen
                  </span>
                  <span className="font-bold text-[#f84464]">
                    {selectedEvent.area.name}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-zinc-400">
                    Starts
                  </span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {formatDateTime(selectedEvent.startTime)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-zinc-400">
                    Ends
                  </span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {formatDateTime(selectedEvent.endTime)}
                  </span>
                </div>
              </div>

              {selectedEvent.description && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 border border-zinc-200 dark:border-zinc-800">
                  {selectedEvent.description}
                </p>
              )}

              {/* Configured Sections Pricing Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#f84464]" />
                    <span>Configured Section Pricing ({selectedEvent.sections.length})</span>
                  </h4>
                </div>

                {selectedEvent.sections.length === 0 ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                    No section prices are configured for this event. Use the form below to attach physical sections.
                  </div>
                ) : (
                  <div className="border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                        <tr>
                          <th className="p-3">Section Tier</th>
                          <th className="p-3">Capacity</th>
                          <th className="p-3">Event Price (₹)</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {selectedEvent.sections.map((sec) => (
                          <tr key={sec.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                            <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                              {sec.name}
                            </td>
                            <td className="p-3 text-zinc-500 font-mono">
                              {sec.capacity} seats
                            </td>
                            <td className="p-3">
                              {editingSectionPriceId === sec.id ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={editingPriceValue}
                                    onChange={(e) => setEditingPriceValue(e.target.value)}
                                    className="w-20 px-2 py-1 text-xs font-mono font-bold bg-white dark:bg-[#12141c] border border-[#f84464] outline-none"
                                  />
                                  <button
                                    onClick={() => handleUpdatePrice(sec.id)}
                                    className="px-2 py-1 bg-green-600 text-white font-bold text-[10px] uppercase cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingSectionPriceId(null)}
                                    className="px-2 py-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-[10px] uppercase cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <span className="font-mono font-bold text-[#f84464] text-sm">
                                  ₹{sec.price}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {editingSectionPriceId !== sec.id && (
                                  <button
                                    onClick={() => {
                                      setEditingSectionPriceId(sec.id);
                                      setEditingPriceValue(sec.price.toString());
                                    }}
                                    className="text-zinc-600 dark:text-zinc-400 hover:text-[#f84464] text-xs font-semibold cursor-pointer"
                                    title="Edit section price"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRemoveSection(sec.id)}
                                  className="text-zinc-600 dark:text-zinc-400 hover:text-red-500 text-xs font-semibold cursor-pointer"
                                  title="Remove section from event"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add Section to Event (if unconfigured sections exist) */}
              {(() => {
                const configuredVenueSectionIds = new Set(
                  selectedEvent.sections.map((s) => s.venueSectionId)
                );
                const unconfiguredSections = areaPhysicalSections.filter(
                  (s) => !configuredVenueSectionIds.has(s.id)
                );

                if (unconfiguredSections.length === 0) return null;

                return (
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <h5 className="text-xs font-bold uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-[#f84464]" />
                      <span>Add Another Section to this Show</span>
                    </h5>

                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={newSectionToAddId}
                        onChange={(e) => setNewSectionToAddId(e.target.value)}
                        className="flex-1 min-w-[180px] px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 outline-none"
                      >
                        <option value="">Select physical section...</option>
                        {unconfiguredSections.map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            {sec.name} ({sec.capacity} seats)
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-500">Price (₹):</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={newSectionPrice}
                          onChange={(e) => setNewSectionPrice(e.target.value)}
                          className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 outline-none"
                        />
                      </div>

                      <button
                        onClick={handleAddSectionToEvent}
                        disabled={!newSectionToAddId}
                        className="px-4 py-1.5 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Add Section
                      </button>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-4 flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => handleDeleteEvent(selectedEvent)}
                  className="px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Event</span>
                </button>

                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-5 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {isEditModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#181a24] text-zinc-900 dark:text-zinc-100 max-w-lg w-full border border-zinc-300 dark:border-zinc-700 shadow-2xl my-8">
            <div className="bg-[#333545] dark:bg-[#14151e] text-white p-4 flex items-center justify-between border-b border-white/10">
              <h3 className="font-bold text-sm uppercase">Edit Event</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditEvent} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
