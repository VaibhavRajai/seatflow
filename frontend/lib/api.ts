const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type UserRole = "user" | "venue_admin";

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
}

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

export interface VenueArea {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

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

// API Methods
export const api = {
  // Customer / User Auth
  userSignup: async (email: string, password: string, phoneNumber?: string) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, phoneNumber: phoneNumber || "9999999999" }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to sign up as customer");
    return data;
  },

  userLogin: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to login");
    return data;
  },

  userLogout: async () => {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  },

  // Venue Admin Auth
  adminSignup: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/admin/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to sign up as admin");
    return data;
  },

  adminLogin: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to login as admin");
    return data;
  },

  adminLogout: async () => {
    const res = await fetch(`${API_BASE}/admin/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  },

  // Venues
  getVenues: async (): Promise<Venue[]> => {
    const res = await fetch(`${API_BASE}/venues`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch venues");
    return data.venues || [];
  },

  getVenueById: async (id: string): Promise<Venue> => {
    const res = await fetch(`${API_BASE}/venues/${id}`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch venue");
    return data.venue;
  },

  createVenue: async (venue: {
    name: string;
    description: string;
    address: string;
    city: string;
  }): Promise<Venue> => {
    const res = await fetch(`${API_BASE}/venues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(venue),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create venue");
    return data.venue;
  },

  // Areas
  getVenueAreas: async (venueId: string): Promise<VenueArea[]> => {
    const res = await fetch(`${API_BASE}/venues/${venueId}/areas`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch venue areas");
    return data.areas || [];
  },

  createVenueArea: async (
    venueId: string,
    area: { name: string; description: string }
  ): Promise<VenueArea> => {
    const res = await fetch(`${API_BASE}/venues/${venueId}/areas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(area),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create area");
    return data.area;
  },

  // Sections
  createVenueSection: async (
    venueAreaId: string,
    section: {
      name: string;
      capacity: number;
      rowsCount: number;
      seatsPerRow: number;
    }
  ): Promise<VenueSection> => {
    const res = await fetch(`${API_BASE}/venue-areas/${venueAreaId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(section),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create section");
    return data.section;
  },

  // Layout
  getVenueLayout: async (venueId: string): Promise<VenueLayout> => {
    const res = await fetch(`${API_BASE}/venues/${venueId}/layout`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch venue layout");
    return data;
  },
};
