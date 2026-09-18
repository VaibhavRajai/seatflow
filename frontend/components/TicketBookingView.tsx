"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Monitor,
  LayoutGrid,
  MapPin,
  RefreshCw,
  Ticket,
  CheckCircle2,
  User,
  Shield,
  CreditCard,
  Layers,
  ChevronRight,
} from "lucide-react";
import { api, Venue, VenueLayout, AreaLayout, VenueSection, PhysicalSeat, CurrentUser } from "../lib/api";

interface TicketBookingViewProps {
  venues: Venue[];
  selectedVenueId?: string;
  onSelectVenue: (venueId: string) => void;
  currentUser: CurrentUser | null;
  onRequireAuth: (requiredRole?: "user" | "venue_admin") => void;
}

export const TicketBookingView: React.FC<TicketBookingViewProps> = ({
  venues,
  selectedVenueId,
  onSelectVenue,
  currentUser,
  onRequireAuth,
}) => {
  const [currentVenueId, setCurrentVenueId] = useState<string>(
    selectedVenueId || (venues.length > 0 ? venues[0].id : "")
  );
  const [layout, setLayout] = useState<VenueLayout | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<{ id: string; code: string; sectionName: string; price: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    if (selectedVenueId) {
      setCurrentVenueId(selectedVenueId);
    } else if (venues.length > 0 && !currentVenueId) {
      setCurrentVenueId(venues[0].id);
    }
  }, [selectedVenueId, venues]);

  const loadLayout = async (vId: string) => {
    if (!vId) return;
    setLoading(true);
    setError(null);
    setSelectedSeats([]);
    setBookingConfirmed(false);

    try {
      const data = await api.getVenueLayout(vId);
      setLayout(data);
      if (data.areas && data.areas.length > 0) {
        setSelectedAreaId(data.areas[0].id);
      } else {
        setSelectedAreaId("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load layout");
      setLayout(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentVenueId) {
      loadLayout(currentVenueId);
    }
  }, [currentVenueId]);

  const currentVenue = venues.find((v) => v.id === currentVenueId);
  const activeArea = layout?.areas.find((a) => a.id === selectedAreaId);

  // Price estimator based on section name
  const getSectionPrice = (sectionName: string): number => {
    const s = sectionName.toLowerCase();
    if (s.includes("recliner") || s.includes("vip") || s.includes("royal")) return 450;
    if (s.includes("prime") || s.includes("executive")) return 280;
    return 180; // Classic / Silver
  };

  const toggleSeat = (seatId: string, code: string, sectionName: string, price: number) => {
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seatId);
      if (exists) {
        return prev.filter((s) => s.id !== seatId);
      } else {
        return [...prev, { id: seatId, code, sectionName, price }];
      }
    });
  };

  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleProceedBooking = () => {
    if (!currentUser) {
      onRequireAuth("user");
      return;
    }
    setBookingConfirmed(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header / Venue Selector */}
      <div className="bg-white dark:bg-[#181a24] p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f84464]/10 border border-[#f84464]/30 text-[#f84464] flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Step 1: Select Cinema Venue
            </span>
            <select
              value={currentVenueId}
              onChange={(e) => {
                setCurrentVenueId(e.target.value);
                onSelectVenue(e.target.value);
              }}
              className="font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-zinc-300 dark:border-zinc-700 pb-0.5 outline-none focus:border-[#f84464]"
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id} className="bg-white dark:bg-[#1a1c24] text-zinc-900 dark:text-zinc-100">
                  {v.name} ({v.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentVenue && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-[#f84464]" />
            <span className="max-w-xs truncate">{currentVenue.address}, {currentVenue.city}</span>
            <button
              onClick={() => loadLayout(currentVenueId)}
              className="p-1.5 border border-zinc-300 dark:border-zinc-700 hover:text-[#f84464] transition-colors ml-2 cursor-pointer"
              title="Refresh layout"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#f84464]" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {/* Screen / Area Tabs */}
      {layout && layout.areas && layout.areas.length > 0 && (
        <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-2 flex items-center gap-1">
              <Monitor className="w-3.5 h-3.5" />
              Step 2: Select Screen
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

          <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 pr-2">
            {activeArea?.description || "Dolby Atmos Cinema"}
          </div>
        </div>
      )}

      {/* Main Seating Layout */}
      {loading ? (
        <div className="bg-white dark:bg-[#181a24] p-16 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#f84464]" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading physical seat matrix...</p>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-[#181a24] p-8 border border-red-300 dark:border-red-900/40 text-center text-red-500 space-y-2">
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={() => loadLayout(currentVenueId)}
            className="px-4 py-1.5 text-xs bg-[#f84464] text-white font-bold uppercase"
          >
            Retry
          </button>
        </div>
      ) : !layout || layout.areas.length === 0 ? (
        <div className="bg-white dark:bg-[#181a24] p-12 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
          <Layers className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-base font-bold uppercase text-zinc-800 dark:text-zinc-200">
            No Screens Found for this Venue
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            This venue does not have screens configured yet. Switch venue or sign in as Venue Admin to add screens.
          </p>
        </div>
      ) : !activeArea || activeArea.sections.length === 0 ? (
        <div className="bg-white dark:bg-[#181a24] p-12 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
          <LayoutGrid className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-base font-bold uppercase text-zinc-800 dark:text-zinc-200">
            No Sections in "{activeArea?.name}"
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            No seating sections have been generated yet for this screen.
          </p>
        </div>
      ) : (
        /* Interactive Theater Seating Chart */
        <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-4 sm:p-8 space-y-8 shadow-sm">
          {/* Header & Pricing Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{activeArea.name}</span>
                <span className="text-xs font-bold text-zinc-400">({activeArea.sections.reduce((acc, s) => acc + s.seats.length, 0)} Total Seats)</span>
              </h2>
              <span className="text-xs text-zinc-500">
                Click any seat below to select and book tickets.
              </span>
            </div>

            {/* Pricing Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
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

          {/* Sections Display */}
          <div className="space-y-8 overflow-x-auto py-2">
            {activeArea.sections.map((section) => {
              const price = getSectionPrice(section.name);
              const rowMap = new Map<string, PhysicalSeat[]>();
              for (const seat of section.seats) {
                if (!rowMap.has(seat.rowLabel)) {
                  rowMap.set(seat.rowLabel, []);
                }
                rowMap.get(seat.rowLabel)!.push(seat);
              }

              return (
                <div key={section.id} className="space-y-3">
                  {/* Section Title Header */}
                  <div className="border-b border-zinc-200 dark:border-zinc-800 pb-1 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black uppercase tracking-widest text-[#f84464]">
                        {section.name}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">
                        ₹{price}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {section.rowsCount} Rows × {section.seatsPerRow} Seats ({section.seats.length} Seats)
                    </span>
                  </div>

                  {/* Seat Grid */}
                  <div className="space-y-2 py-1 min-w-[320px]">
                    {Array.from(rowMap.entries()).map(([rowLabel, seatsInRow]) => (
                      <div key={rowLabel} className="flex items-center justify-center gap-3 sm:gap-6">
                        <span className="w-5 text-center font-mono font-bold text-xs text-zinc-400 select-none">
                          {rowLabel}
                        </span>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {seatsInRow.map((seat) => {
                            const seatCode = `${seat.rowLabel}${seat.seatNumber}`;
                            const isSelected = selectedSeats.some((s) => s.id === seat.id);

                            return (
                              <button
                                key={seat.id}
                                onClick={() => toggleSeat(seat.id, seatCode, section.name, price)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold transition-all select-none cursor-pointer border ${
                                  isSelected
                                    ? "bg-[#f84464] text-white border-[#f84464] shadow-xs scale-105"
                                    : "border-emerald-600/70 hover:border-[#f84464] hover:bg-[#f84464]/10 text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#14151e]"
                                }`}
                                title={`Seat ${seatCode} - ₹${price}`}
                              >
                                {seat.seatNumber}
                              </button>
                            );
                          })}
                        </div>

                        <span className="w-5 text-center font-mono font-bold text-xs text-zinc-400 select-none">
                          {rowLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Screen Arc */}
          <div className="pt-8 pb-4 space-y-3 max-w-md mx-auto text-center">
            <div className="w-full h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_4px_12px_rgba(34,211,238,0.4)]" />
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              All eyes this way please (Screen)
            </p>
          </div>

          {/* Interactive Booking Summary Bar */}
          {selectedSeats.length > 0 && (
            <div className="sticky bottom-4 z-30 bg-[#333545] dark:bg-[#14151e] text-white p-4 border border-white/20 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-[#f84464] text-white px-2 py-0.5 text-xs font-bold uppercase">
                    {selectedSeats.length} {selectedSeats.length === 1 ? "Ticket" : "Tickets"}
                  </span>
                  <span className="text-xs font-bold text-zinc-300">
                    Seats: {selectedSeats.map((s) => s.code).join(", ")}
                  </span>
                </div>
                <div className="text-sm font-black text-emerald-400">
                  Total Amount: ₹{totalAmount}
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => setSelectedSeats([])}
                  className="px-3 py-2 text-xs text-zinc-300 hover:text-white border border-zinc-600 hover:border-zinc-400 transition-colors cursor-pointer font-bold"
                >
                  Clear
                </button>
                <button
                  onClick={handleProceedBooking}
                  className="px-6 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Book (₹{totalAmount})</span>
                </button>
              </div>
            </div>
          )}

          {/* Booking Confirmation Dialog */}
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
                  <p><strong>Venue:</strong> {currentVenue?.name}</p>
                  <p><strong>Screen:</strong> {activeArea?.name}</p>
                  <p><strong>Seats:</strong> {selectedSeats.map((s) => s.code).join(", ")}</p>
                  <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
                  <p><strong>Customer:</strong> {currentUser?.email || "Guest"}</p>
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
