"use client";

import React, { useState } from "react";
import { X, Building2, MapPin, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { api, Venue } from "../lib/api";

interface CreateVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVenueCreated: (newVenue: Venue) => void;
  onRequireAuth: () => void;
  isAdminLoggedIn: boolean;
}

export const CreateVenueModal: React.FC<CreateVenueModalProps> = ({
  isOpen,
  onClose,
  onVenueCreated,
  onRequireAuth,
  isAdminLoggedIn,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminLoggedIn) {
      onRequireAuth();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const newVenue = await api.createVenue({
        name,
        description,
        address,
        city,
      });
      onVenueCreated(newVenue);
      onClose();
      // reset form
      setName("");
      setDescription("");
      setAddress("");
    } catch (err: any) {
      setError(err.message || "Failed to create venue. Ensure you are signed in.");
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
            <Building2 className="w-5 h-5 text-[#f84464]" />
            <h2 className="font-bold text-base tracking-wide uppercase">
              Register New Venue
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
              Venue Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PVR ICON Multiplex, Phoenix Marketcity"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Premium 5-screen multiplex with 4K laser projection"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                City / Location *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                Address / Street *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Kurla West, LBS Marg"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
              />
            </div>
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
              {loading ? "Creating Venue..." : "Create Venue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
