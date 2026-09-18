import React from "react";
import { Building2, MapPin, Monitor, ArrowRight, LayoutGrid } from "lucide-react";
import { Venue } from "../../api/venue.api";
import { EmptyState } from "../common/EmptyState";

interface VenuesSectionProps {
  venues: Venue[];
  onSelectVenue: (venueId: string) => void;
  onViewAllVenues?: () => void;
  currentCity?: string;
}

export const VenuesSection: React.FC<VenuesSectionProps> = ({
  venues,
  onSelectVenue,
  onViewAllVenues,
  currentCity = "All Cities",
}) => {
  const filteredVenues = venues.filter((v) => {
    return (
      currentCity === "All Cities" ||
      v.city.toLowerCase() === currentCity.toLowerCase()
    );
  });

  return (
    <section className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#f84464]" />
            <span>Cinemas & Theaters in {currentCity}</span>
          </h2>
          <p className="text-xs text-zinc-500">
            Select a cinema to view its auditoriums and interactive seating layout.
          </p>
        </div>

        {onViewAllVenues && (
          <button
            onClick={onViewAllVenues}
            className="text-xs font-bold text-[#f84464] hover:underline uppercase tracking-wider"
          >
            View All ({venues.length})
          </button>
        )}
      </div>

      {filteredVenues.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Venues Found"
          description={`No registered venues found in ${currentCity}. Try selecting a different city or browse all venues.`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 hover:border-[#f84464] transition-all p-5 flex flex-col justify-between space-y-4 shadow-xs group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#f84464] transition-colors leading-snug">
                    {venue.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase tracking-wide shrink-0 border border-zinc-200 dark:border-zinc-700">
                    {venue.city}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 line-clamp-2">
                  {venue.description || "Multiplex cinema experience"}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#f84464] shrink-0" />
                  <span className="truncate">{venue.address}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectVenue(venue.id)}
                className="w-full py-2.5 bg-[#f84464] hover:bg-[#e51a4b] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>View Venue & Seats</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
