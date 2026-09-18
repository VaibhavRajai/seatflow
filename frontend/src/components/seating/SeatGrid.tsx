"use client";

import React from "react";
import { Seat } from "./Seat";
import { AreaLayout, PhysicalSeat } from "../../api/venueSection.api";

interface SelectedSeatInfo {
  id: string;
  code: string;
  sectionName: string;
  price: number;
}

interface SeatGridProps {
  area: AreaLayout;
  selectedSeats: SelectedSeatInfo[];
  onToggleSeat: (seatId: string, seatCode: string, sectionName: string, price: number) => void;
  getSectionPrice?: (sectionName: string) => number;
}

export const SeatGrid: React.FC<SeatGridProps> = ({
  area,
  selectedSeats,
  onToggleSeat,
  getSectionPrice = (name) => {
    const s = name.toLowerCase();
    if (s.includes("recliner") || s.includes("vip") || s.includes("royal")) return 450;
    if (s.includes("prime") || s.includes("executive")) return 280;
    return 180;
  },
}) => {
  return (
    <div className="w-full space-y-8">
      {/* Screen Indicator (Top of Auditorium) */}
      <div className="pt-2 pb-6 max-w-lg mx-auto text-center space-y-2">
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_4px_12px_rgba(34,211,238,0.4)]" />
        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          SCREEN (All eyes this way please)
        </p>
      </div>

      {/* Sections Grid */}
      <div className="space-y-8 overflow-x-auto py-2">
        {area.sections.map((section) => {
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
              {/* Section Header */}
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-1.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-black uppercase tracking-widest text-[#f84464]">
                    {section.name} SECTION
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">
                    ₹{price}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-zinc-500">
                  {section.rowsCount} Rows × {section.seatsPerRow} Seats ({section.seats.length} Total Seats)
                </span>
              </div>

              {/* Rows */}
              <div className="space-y-2 py-1 min-w-[320px]">
                {Array.from(rowMap.entries()).map(([rowLabel, seatsInRow]) => (
                  <div key={rowLabel} className="flex items-center justify-center gap-3 sm:gap-6">
                    {/* Left Row Label */}
                    <span className="w-5 text-center font-mono font-bold text-xs text-zinc-400 select-none">
                      {rowLabel}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {seatsInRow.map((seat) => {
                        const isSelected = selectedSeats.some((s) => s.id === seat.id);

                        return (
                          <Seat
                            key={seat.id}
                            id={seat.id}
                            rowLabel={seat.rowLabel}
                            seatNumber={seat.seatNumber}
                            isSelected={isSelected}
                            price={price}
                            onToggle={(seatId, seatCode) =>
                              onToggleSeat(seatId, seatCode, section.name, price)
                            }
                          />
                        );
                      })}
                    </div>

                    {/* Right Row Label */}
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
    </div>
  );
};
