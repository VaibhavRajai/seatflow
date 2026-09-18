"use client";

import React, { useState, useEffect } from "react";
import { X, LayoutGrid, AlertCircle, Sparkles, Check } from "lucide-react";
import { api, Venue, VenueArea, VenueSection } from "../lib/api";

interface CreateSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
  selectedVenueId?: string;
  selectedAreaId?: string;
  onSectionCreated: (newSection: VenueSection) => void;
  onRequireAuth: () => void;
  isAdminLoggedIn: boolean;
}

export const CreateSectionModal: React.FC<CreateSectionModalProps> = ({
  isOpen,
  onClose,
  venues,
  selectedVenueId,
  selectedAreaId,
  onSectionCreated,
  onRequireAuth,
  isAdminLoggedIn,
}) => {
  const [venueId, setVenueId] = useState(selectedVenueId || "");
  const [areas, setAreas] = useState<VenueArea[]>([]);
  const [areaId, setAreaId] = useState(selectedAreaId || "");
  const [name, setName] = useState("Prime");
  const [rowsCount, setRowsCount] = useState<number>(4);
  const [seatsPerRow, setSeatsPerRow] = useState<number>(8);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load areas when venueId changes
  useEffect(() => {
    if (selectedVenueId) {
      setVenueId(selectedVenueId);
    } else if (venues.length > 0 && !venueId) {
      setVenueId(venues[0].id);
    }
  }, [selectedVenueId, venues]);

  useEffect(() => {
    if (venueId) {
      setLoadingAreas(true);
      api
        .getVenueAreas(venueId)
        .then((fetchedAreas) => {
          setAreas(fetchedAreas);
          if (selectedAreaId && fetchedAreas.some((a) => a.id === selectedAreaId)) {
            setAreaId(selectedAreaId);
          } else if (fetchedAreas.length > 0) {
            setAreaId(fetchedAreas[0].id);
          } else {
            setAreaId("");
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoadingAreas(false);
        });
    } else {
      setAreas([]);
      setAreaId("");
    }
  }, [venueId, selectedAreaId]);

  if (!isOpen) return null;

  const totalCapacity = (rowsCount || 0) * (seatsPerRow || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminLoggedIn) {
      onRequireAuth();
      return;
    }

    if (!areaId) {
      setError("Please select or create a Screen/Area first.");
      return;
    }

    if (rowsCount < 1 || seatsPerRow < 1) {
      setError("Rows count and seats per row must be at least 1.");
      return;
    }

    if (rowsCount > 26) {
      setError("Maximum 26 rows (A-Z) allowed per section.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const newSection = await api.createVenueSection(areaId, {
        name,
        capacity: totalCapacity,
        rowsCount: Number(rowsCount),
        seatsPerRow: Number(seatsPerRow),
      });

      onSectionCreated(newSection);
      onClose();
      // reset
      setName("Prime");
    } catch (err: any) {
      setError(err.message || "Failed to create section. You may not own this venue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1a1c24] text-zinc-900 dark:text-zinc-100 w-full max-w-xl border border-zinc-300 dark:border-zinc-700 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#333545] dark:bg-[#14151e] text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#f84464]" />
            <h2 className="font-bold text-base tracking-wide uppercase">
              Add Section & Generate Seats
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                1. Select Venue *
              </label>
              <select
                required
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
              >
                <option value="" disabled>
                  -- Select Venue --
                </option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                2. Select Screen / Area *
              </label>
              <select
                required
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                disabled={loadingAreas || areas.length === 0}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none disabled:opacity-50"
              >
                {areas.length === 0 ? (
                  <option value="">No screens found. Create an area first.</option>
                ) : (
                  areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
              3. Section Category Name *
            </label>
            <div className="flex gap-2 mb-2">
              {["VIP Recliner", "Prime", "Classic", "Balcony", "Executive"].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setName(cat)}
                  className={`px-2 py-1 text-xs border font-medium transition-colors ${
                    name === cat
                      ? "border-[#f84464] bg-[#f84464] text-white"
                      : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. VIP Recliner, Prime, Silver"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-800/40 p-3 border border-zinc-200 dark:border-zinc-800">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                Number of Rows (R)
              </label>
              <input
                type="number"
                min={1}
                max={26}
                required
                value={rowsCount}
                onChange={(e) => setRowsCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
              />
              <span className="text-[10px] text-zinc-500">Rows: A to {String.fromCharCode(64 + Math.min(rowsCount, 26))}</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                Seats Per Row (C)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={seatsPerRow}
                onChange={(e) => setSeatsPerRow(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
              />
              <span className="text-[10px] text-zinc-500">Seats: 1 to {seatsPerRow}</span>
            </div>
          </div>

          {/* Matrix Preview */}
          <div className="border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-100/60 dark:bg-black/40">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
              <span>Layout Preview ({totalCapacity} Total Seats)</span>
              <span className="text-[#f84464] font-mono">{rowsCount} × {seatsPerRow}</span>
            </div>

            <div className="max-h-40 overflow-auto p-2 bg-white dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-800 space-y-1">
              {Array.from({ length: Math.min(rowsCount, 6) }).map((_, rIdx) => {
                const rowLabel = String.fromCharCode(65 + rIdx);
                return (
                  <div key={rowLabel} className="flex items-center gap-1.5 justify-center">
                    <span className="w-4 text-[10px] font-bold text-zinc-400 text-right">{rowLabel}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(seatsPerRow, 12) }).map((_, sIdx) => (
                        <div
                          key={sIdx}
                          className="w-4 h-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-[8px] flex items-center justify-center font-mono font-bold"
                        >
                          {sIdx + 1}
                        </div>
                      ))}
                      {seatsPerRow > 12 && (
                        <span className="text-[9px] text-zinc-400 self-center">+{seatsPerRow - 12} more</span>
                      )}
                    </div>
                    <span className="w-4 text-[10px] font-bold text-zinc-400">{rowLabel}</span>
                  </div>
                );
              })}
              {rowsCount > 6 && (
                <div className="text-center text-[10px] text-zinc-400 italic pt-1">
                  +{rowsCount - 6} more rows ({String.fromCharCode(71)} to {String.fromCharCode(64 + rowsCount)})
                </div>
              )}
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
              disabled={loading || !areaId}
              className="px-6 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Generating Seats..." : `Generate ${totalCapacity} Physical Seats`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
