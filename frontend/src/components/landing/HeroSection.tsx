import React from "react";
import { Film, Building2, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onExploreEvents: () => void;
  onBrowseVenues: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreEvents,
  onBrowseVenues,
}) => {
  return (
    <section className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-8 sm:p-14 shadow-xs">
      <div className="max-w-2xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f84464]/10 border border-[#f84464]/30 text-[#f84464] text-xs font-bold uppercase tracking-wider">
          <Film className="w-3.5 h-3.5" />
          <span>Ticket Booking Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
          Book your next experience
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Discover events, choose your seats, and book securely with SeatFlow.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExploreEvents}
            className="px-6 py-3 bg-[#f84464] hover:bg-[#e51a4b] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Film className="w-4 h-4" />
            <span>Explore Events</span>
          </button>

          <button
            onClick={onBrowseVenues}
            className="px-6 py-3 bg-[#333545] dark:bg-[#222434] hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Browse Venues</span>
          </button>
        </div>
      </div>
    </section>
  );
};
