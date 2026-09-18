"use client";

import React, { useState, useEffect } from "react";
import { X, Layers, AlertCircle, Building2 } from "lucide-react";
import { api, Venue, VenueArea } from "../lib/api";

interface CreateAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
  selectedVenueId?: string;
  onAreaCreated: (newArea: VenueArea) => void;
  onRequireAuth: () => void;
  isAdminLoggedIn: boolean;
}

export const CreateAreaModal: React.FC<CreateAreaModalProps> = ({
  isOpen,
  onClose,
  venues,
  selectedVenueId,
  onAreaCreated,
  onRequireAuth,
  isAdminLoggedIn,
}) => {
  const [venueId, setVenueId] = useState(selectedVenueId || "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedVenueId) {
      setVenueId(selectedVenueId);
    } else if (venues.length > 0 && !venueId) {
      setVenueId(venues[0].id);
    }
  }, [selectedVenueId, venues]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminLoggedIn) {
      onRequireAuth();
      return;
    }

    if (!venueId) {
      setError("Please select a valid venue first.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const newArea = await api.createVenueArea(venueId, {
        name,
        description,
      });
      onAreaCreated(newArea);
      onClose();
      // reset
      setName("");
      setDescription("");
    } catch (err: any) {
      setError(err.message || "Failed to create area. You may not own this venue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1a1c24] text-zinc-900 dark:text-zinc-100 w-full max-w-lg border border-zinc-300 dark:border-zinc-700 shadow-2xl">
        {/* Header */}
        <div className="bg-[#333545] dark:bg-[#14151e] text-white p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#f84464]" />
            <h2 className="font-bold text-base tracking-wide uppercase">
              Add Screen / Venue Area
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
              Select Parent Venue *
            </label>
            <select
              required
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
            >
              <option value="" disabled>
                -- Select a Venue --
              </option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
              Area / Screen Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Screen 1 - IMAX with Laser, Audi 2, Grand Ballroom"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
              Description / Specifications
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 4K Dual Laser 12-Channel Immersive Sound"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Adding Screen..." : "Add Screen / Area"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
