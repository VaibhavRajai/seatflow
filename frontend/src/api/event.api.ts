import { apiClient } from "./client";

export interface EventSectionItem {
  id: string;
  venueSectionId: string;
  name: string;
  capacity?: number;
  rowsCount?: number;
  seatsPerRow?: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventVenueInfo {
  id: string;
  name: string;
  city: string;
  address?: string;
  adminId?: string;
}

export interface EventAreaInfo {
  id: string;
  name: string;
  description?: string | null;
}

export interface SeatFlowEvent {
  id: string;
  name: string;
  description: string | null;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  venue: EventVenueInfo;
  area: EventAreaInfo;
  sections: EventSectionItem[];
}

export interface CreateEventSectionInput {
  venueSectionId: string;
  price: number;
}

export interface CreateEventPayload {
  venueAreaId: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  sections?: CreateEventSectionInput[];
}

export interface UpdateEventPayload {
  name?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  venueAreaId?: string;
}

export const eventApi = {
  // Public
  getPublicEvents: () => {
    return apiClient<{ events: SeatFlowEvent[] }>("/events", {
      method: "GET",
      cache: "no-store",
    });
  },

  getPublicEventById: (id: string) => {
    return apiClient<{ event: SeatFlowEvent }>(`/events/${id}`, {
      method: "GET",
      cache: "no-store",
    });
  },

  // Admin
  getAdminEvents: () => {
    return apiClient<{ events: SeatFlowEvent[] }>("/events/admin/my-events", {
      method: "GET",
      cache: "no-store",
    });
  },

  getAdminEventById: (id: string) => {
    return apiClient<{ event: SeatFlowEvent }>(`/events/admin/${id}`, {
      method: "GET",
      cache: "no-store",
    });
  },

  createEvent: (data: CreateEventPayload) => {
    return apiClient<{ message: string; event: SeatFlowEvent }>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateEvent: (id: string, data: UpdateEventPayload) => {
    return apiClient<{ message: string; event: SeatFlowEvent }>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteEvent: (id: string) => {
    return apiClient<{ message: string; id: string }>(`/events/${id}`, {
      method: "DELETE",
    });
  },

  // Event Section Pricing
  addSectionToEvent: (
    eventId: string,
    data: { venueSectionId: string; price: number }
  ) => {
    return apiClient<{ message: string; section: EventSectionItem }>(
      `/events/${eventId}/sections`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  updateSectionPrice: (
    eventId: string,
    sectionId: string,
    price: number
  ) => {
    return apiClient<{ message: string; section: any }>(
      `/events/${eventId}/sections/${sectionId}`,
      {
        method: "PUT",
        body: JSON.stringify({ price }),
      }
    );
  },

  removeSectionFromEvent: (eventId: string, sectionId: string) => {
    return apiClient<{ message: string; id: string }>(
      `/events/${eventId}/sections/${sectionId}`,
      {
        method: "DELETE",
      }
    );
  },

  removeSection: (eventId: string, sectionId: string) => {
    return apiClient<{ message: string; id: string }>(
      `/events/${eventId}/sections/${sectionId}`,
      {
        method: "DELETE",
      }
    );
  },

  getEventSections: (eventId: string) => {
    return apiClient<{ sections: EventSectionItem[] }>(
      `/events/${eventId}/sections`,
      {
        method: "GET",
        cache: "no-store",
      }
    );
  },
};
