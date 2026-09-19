import { apiClient } from "./client";

export interface PhysicalSeat {
  id: string;
  rowLabel: string;
  seatNumber: number;
}

export interface VenueSection {
  id: string;
  name: string;
  capacity: number;
  rowsCount: number;
  seatsPerRow: number;
  seats: PhysicalSeat[];
}

export interface AreaLayout {
  id: string;
  name: string;
  description: string | null;
  sections: VenueSection[];
}

export interface VenueLayout {
  venue: {
    id: string;
    name: string;
  };
  areas: AreaLayout[];
}

export const venueSectionApi = {
  createVenueSection: (
    venueAreaId: string,
    data: {
      name: string;
      capacity: number;
      rowsCount: number;
      seatsPerRow: number;
    }
  ) => {
    return apiClient<{ message: string; section: any }>(
      `/venue-areas/${venueAreaId}/sections`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  getVenueLayout: (venueId: string) => {
    return apiClient<VenueLayout>(`/venues/${venueId}/layout`, {
      method: "GET",
      cache: "no-store",
    });
  },

  getVenueSectionsByArea: (venueAreaId: string) => {
    return apiClient<{ sections: Array<{ id: string; venue_area_id: string; name: string; capacity: number; rows_count: number; seats_per_row: number }> }>(
      `/venue-areas/${venueAreaId}/sections`,
      {
        method: "GET",
        cache: "no-store",
      }
    );
  },
};
