import { apiClient } from "./client";

export interface VenueArea {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const venueAreaApi = {
  getVenueAreas: (venueId: string) => {
    return apiClient<{ areas: VenueArea[] }>(`/venues/${venueId}/areas`, {
      method: "GET",
      cache: "no-store",
    });
  },

  getVenueAreaById: (id: string) => {
    return apiClient<{ area: VenueArea }>(`/venue-areas/${id}`, {
      method: "GET",
      cache: "no-store",
    });
  },

  createVenueArea: (
    venueId: string,
    data: { name: string; description: string }
  ) => {
    return apiClient<{ message: string; area: VenueArea }>(
      `/venues/${venueId}/areas`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
};
