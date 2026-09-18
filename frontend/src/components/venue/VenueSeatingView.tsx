"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Monitor,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Layers,
} from "lucide-react";
import { venueSectionApi, VenueLayout, AreaLayout } from "../../api/venueSection.api";
import { Venue } from "../../api/venue.api";
import { SeatGrid } from "../seating/SeatGrid";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { EmptyState } from "../common/EmptyState";
import { useAuth } from "../../context/AuthContext";

interface SelectedSeatInfo {
  id: string;
  code: string;
  sectionName: string;
  price: number;
}

interface VenueSeatingViewProps {
  venue: Venue;
  onBack: () => void;
  onRequireAuth: (requiredRole?: "user" | "venue_admin") => void;
}

export const VenueSeatingView: React.FC<VenueSeatingViewProps> = ({
  venue,
  onBack,
  onRequireAuth,
}) => {
  const { isAuthenticated, currentUser } = useAuth();

  const [layout, setLayout] = useState<VenueLayout | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeatInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const fetchLayout = async () => {
    setLoading(true);
    setError(null);
    setSelectedSeats([]);
    setBookingConfirmed(false);

    try {
      const data = await venueSectionApi.getVenueLayout(venue.id);
      setLayout(data);
      if (data.areas && data.areas.length > 0) {
        setSelectedAreaId(data.areas[0].id);
      } else {
        setSelectedAreaId("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load venue layout.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayout();
  }, [venue.id]);

  const activeArea = layout?.areas.find((a) => a.id === selectedAreaId);

  const handleToggleSeat = (
    seatId: string,
    seatCode: string,
    sectionName: string,
    price: number
  ) => {
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seatId);
      if (exists) {
        return prev.filter((s) => s.id !== seatId);
      } else {
        return [...prev, { id: seatId, code: seatCode, sectionName, price }];
      }
    });
  };

  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleProceed = () => {
    if (!isAuthenticated) {
      onRequireAuth("user");
      return;
    }
    setBookingConfirmed(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Back to Cinemas & Venue Title */}
      <div className="bg-white dark:bg-[#181a24] p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="text-xs font-bold text-zinc-500 hover:text-[#f84464] flex items-center gap-1.5 transition-colors uppercase tracking-wider cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cinemas</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black uppercase text-zinc-900 dark:text-zinc-100">
              {venue.name}
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase border border-zinc-200 dark:border-zinc-700">
              {venue.city}
            </span>
          </div>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#f84464]" />
            <span>{venue.address}</span>
          </p>
        </div>

        <button
          onClick={fetchLayout}
          className="p-2 border border-zinc-300 dark:border-zinc-700 hover:text-[#f84464] transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
          title="Refresh Seating"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#f84464]" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Screen Tabs */}
      {layout && layout.areas && layout.areas.length > 0 && (
        <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-2 flex items-center gap-1">
              <Monitor className="w-3.5 h-3.5" />
              Select Screen:
            </span>
            {layout.areas.map((area) => (
              <button
                key={area.id}
                onClick={() => setSelectedAreaId(area.id)}
                className={`px-4 py-2 text-xs font-black tracking-wide uppercase transition-colors border flex items-center gap-1.5 cursor-pointer ${
                  selectedAreaId === area.id
                    ? "bg-[#f84464] text-white border-[#f84464] shadow-xs"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/30"
                }`}
              >
                <span>{area.name}</span>
                <span className="text-[10px] opacity-80">({area.sections.length} Sections)</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-zinc-500 pr-2">
            {activeArea?.description || "Dolby Surround Cinema"}
          </div>
        </div>
      )}

      {/* Seating Layout Canvas */}
      {loading ? (
        <LoadingState message="Loading seating layout..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLayout} />
      ) : !layout || layout.areas.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Screens Configured"
          description="This cinema does not have physical auditoriums or screens set up yet."
        />
      ) : !activeArea || activeArea.sections.length === 0 ? (
        <EmptyState
          icon={Monitor}
          title="No Sections in this Screen"
          description={`"${activeArea?.name}" does not have seating sections generated yet.`}
        />
      ) : (
        <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-4 sm:p-8 space-y-8 shadow-sm">
          {/* Header Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{activeArea.name}</span>
                <span className="text-xs font-bold text-zinc-400">
                  ({activeArea.sections.reduce((sum, s) => sum + s.seats.length, 0)} Total Seats)
                </span>
              </h2>
              <span className="text-xs text-zinc-500">
                Click any available seat below to select.
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 border border-emerald-500 bg-white dark:bg-[#12141c]" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-[#f84464] text-white text-[8px] flex items-center justify-center font-bold">
                  ✓
                </div>
                <span>Selected</span>
              </div>
            </div>
          </div>

          {/* Seat Grid */}
          <SeatGrid
            area={activeArea}
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
          />

          {/* Booking Summary Footer */}
          {selectedSeats.length > 0 && (
            <div className="sticky bottom-4 z-30 bg-[#333545] dark:bg-[#14151e] text-white p-4 border border-white/20 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-[#f84464] text-white px-2 py-0.5 text-xs font-bold uppercase">
                    {selectedSeats.length} {selectedSeats.length === 1 ? "Seat" : "Seats"} Selected
                  </span>
                  <span className="text-xs font-bold text-zinc-300">
                    {selectedSeats.map((s) => s.code).join(", ")}
                  </span>
                </div>
                <div className="text-sm font-black text-emerald-400">
                  Estimated Total: ₹{totalAmount}
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => setSelectedSeats([])}
                  className="px-3 py-2 text-xs text-zinc-300 hover:text-white border border-zinc-600 hover:border-zinc-400 transition-colors cursor-pointer font-bold"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleProceed}
                  className="px-6 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Select & Proceed (₹{totalAmount})</span>
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {bookingConfirmed && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="bg-white dark:bg-[#181a24] text-zinc-900 dark:text-zinc-100 max-w-md w-full border border-zinc-300 dark:border-zinc-700 p-6 space-y-4 shadow-2xl text-center">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-zinc-100">
                  Seats Selected Successfully!
                </h3>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 bg-zinc-50 dark:bg-zinc-800/40 p-3 border border-zinc-200 dark:border-zinc-800 text-left">
                  <p><strong>Venue:</strong> {venue.name}</p>
                  <p><strong>Screen:</strong> {activeArea.name}</p>
                  <p><strong>Selected Seats:</strong> {selectedSeats.map((s) => s.code).join(", ")}</p>
                  <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
                  <p><strong>User:</strong> {currentUser?.email || "Customer"}</p>
                </div>
                <button
                  onClick={() => {
                    setBookingConfirmed(false);
                    setSelectedSeats([]);
                  }}
                  className="w-full py-2.5 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
