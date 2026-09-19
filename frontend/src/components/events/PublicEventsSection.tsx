"use client";

import React, { useState, useEffect } from "react";
import { Film, Calendar, Clock, MapPin, Tag, Search, Sparkles } from "lucide-react";
import { eventApi, SeatFlowEvent } from "../../api/event.api";
import { LoadingState } from "../common/LoadingState";
import { EmptyState } from "../common/EmptyState";

interface PublicEventsSectionProps {
  currentCity: string;
  onSelectEventVenue?: (venueId: string) => void;
}

export const PublicEventsSection: React.FC<PublicEventsSectionProps> = ({
  currentCity,
  onSelectEventVenue,
}) => {
  const [events, setEvents] = useState<SeatFlowEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await eventApi.getPublicEvents();
      setEvents(res.events || []);
    } catch (err) {
      console.error("Failed to load public events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesCity =
      currentCity === "All Cities" ||
      ev.venue.city.toLowerCase() === currentCity.toLowerCase();
    const matchesSearch =
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue.name.toLowerCase().includes(search.toLowerCase()) ||
      ev.area.name.toLowerCase().includes(search.toLowerCase());
    return matchesCity && matchesSearch;
  });

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
      {/* Search and Filters Header */}
      <div className="bg-white dark:bg-[#181a24] p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Film className="w-6 h-6 text-[#f84464]" />
            <span>Now Showing & Upcoming Shows</span>
          </h1>
          <p className="text-xs text-zinc-500">
            Browse live event showtimes, cinema screens, and section pricing tiers.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search movie, cinema or screen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-[#12141c] border border-zinc-300 dark:border-zinc-700 focus:border-[#f84464] outline-none"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading movie shows & events..." />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No Shows Scheduled"
          description="There are currently no active shows matching your selection in this city."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const minPrice =
              event.sections.length > 0
                ? Math.min(...event.sections.map((s) => s.price))
                : null;
            const maxPrice =
              event.sections.length > 0
                ? Math.max(...event.sections.map((s) => s.price))
                : null;

            return (
              <div
                key={event.id}
                className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 hover:border-[#f84464]/50 p-6 flex flex-col justify-between space-y-4 transition-all shadow-xs group"
              >
                <div className="space-y-3">
                  {/* Event Title and Cinema Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 group-hover:text-[#f84464] transition-colors leading-tight">
                        {event.name}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#f84464] shrink-0" />
                        <span>
                          {event.venue.name} • {event.venue.city}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#f84464]/10 border border-[#f84464]/30 text-[#f84464] text-[10px] font-black uppercase tracking-wider shrink-0">
                      {event.area.name}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Schedule */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                      <Clock className="w-3.5 h-3.5 text-[#f84464]" />
                      <span>{formatDateTime(event.startTime)}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 pl-5.5">
                      Ends: {formatDateTime(event.endTime)}
                    </div>
                  </div>

                  {/* Section Pricing Breakdown */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                      <span>Available Section Tiers:</span>
                      {minPrice !== null && (
                        <span className="font-mono text-[#f84464] font-black">
                          {minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {event.sections.map((sec) => (
                        <div
                          key={sec.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-medium"
                        >
                          <span className="text-zinc-800 dark:text-zinc-200">{sec.name}</span>
                          <span className="font-mono font-bold text-[#f84464]">₹{sec.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {onSelectEventVenue && (
                  <button
                    onClick={() => onSelectEventVenue(event.venue.id)}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-[#f84464] dark:bg-zinc-800 dark:hover:bg-[#f84464] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>View Cinema Auditorium Layout</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
