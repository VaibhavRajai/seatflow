import { apiClient } from "./client";

export interface Venue {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  admin_id: string;
  created_at: string;
  updated_at: string;
}

export const venueApi = {
  getVenues: () => {
    return apiClient<{ venues: Venue[] }>("/venues", {
      method: "GET",
      cache: "no-store",
    });
  },

  getVenueById: (id: string) => {
    return apiClient<{ venue: Venue }>(`/venues/${id}`, {
      method: "GET",
      cache: "no-store",
    });
  },

  createVenue: (data: {
    name: string;
    description: string;
    address: string;
    city: string;
  }) => {
    return apiClient<{ message: string; venue: Venue }>("/venues", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateVenue: (
    id: string,
    data: {
      name: string;
      description: string;
      address: string;
      city: string;
    }
  ) => {
    return apiClient<{ message: string; venue: Venue }>(`/venues/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
