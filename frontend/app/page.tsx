"use client";

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth, UserRole } from "../src/context/AuthContext";
import { Header } from "../src/components/layout/Header";
import { Footer } from "../src/components/layout/Footer";
import { HeroSection } from "../src/components/landing/HeroSection";
import { FeaturesSection } from "../src/components/landing/FeaturesSection";
import { HowItWorksSection } from "../src/components/landing/HowItWorksSection";
import { VenuesSection } from "../src/components/landing/VenuesSection";
import { VenueSeatingView } from "../src/components/venue/VenueSeatingView";
import { AdminPortal } from "../src/components/admin/AdminPortal";
import { AuthModal } from "../src/components/auth/AuthModal";
import { ProtectedRoute } from "../src/components/common/ProtectedRoute";
import { LoadingState } from "../src/components/common/LoadingState";
import { EmptyState } from "../src/components/common/EmptyState";
import { PublicEventsSection } from "../src/components/events/PublicEventsSection";
import { venueApi, Venue } from "../src/api/venue.api";
import { Film, Ticket, Clock, Building2, Shield, Search } from "lucide-react";

function MainApp() {
  const { isAuthenticated, currentUser } = useAuth();

  const [activeNav, setActiveNav] = useState<string>("home");
  const [currentCity, setCurrentCity] = useState<string>("All Cities");
  const [searchQuery, setSearchQuery] = useState<string>("" );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Venues state
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [loadingVenues, setLoadingVenues] = useState<boolean>(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRequiredRole, setAuthRequiredRole] = useState<UserRole | undefined>(undefined);

  // Theme setup
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  const loadVenues = async () => {
    try {
      setLoadingVenues(true);
      const res = await venueApi.getVenues();
      setVenues(res.venues || []);
    } catch (err) {
      console.error("Failed to load venues", err);
    } finally {
      setLoadingVenues(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const handleOpenAuth = (requiredRole?: UserRole) => {
    setAuthRequiredRole(requiredRole);
    setIsAuthModalOpen(true);
  };

  const handleSelectVenue = (venueId: string) => {
    const v = venues.find((item) => item.id === venueId);
    if (v) {
      setSelectedVenue(v);
      setActiveNav("seating");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5fa] dark:bg-[#0f1015] text-[#1f2533] dark:text-[#f3f4f6]">
      {/* Header */}
      <Header
        currentCity={currentCity}
        onCityChange={setCurrentCity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeNav={activeNav}
        onNavChange={(nav) => {
          setActiveNav(nav);
          if (nav !== "seating") setSelectedVenue(null);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeNav === "home" && (
          <div className="space-y-12">
            <HeroSection
              onExploreEvents={() => setActiveNav("events")}
              onBrowseVenues={() => setActiveNav("venues")}
            />

            <FeaturesSection />

            <HowItWorksSection />

            {loadingVenues ? (
              <LoadingState message="Loading cinemas..." />
            ) : (
              <VenuesSection
                venues={venues}
                currentCity={currentCity}
                onSelectVenue={handleSelectVenue}
                onViewAllVenues={() => setActiveNav("venues")}
              />
            )}
          </div>
        )}

        {/* Movies / Events Tab */}
        {activeNav === "events" && (
          <PublicEventsSection
            currentCity={currentCity}
            onSelectEventVenue={handleSelectVenue}
          />
        )}

        {/* Cinemas / Venues Directory Tab */}
        {activeNav === "venues" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#181a24] p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-[#f84464]" />
                  <span>Cinemas & Theaters in {currentCity}</span>
                </h1>
                <p className="text-xs text-zinc-500">
                  Browse physical cinema venues and view auditorium seating layouts.
                </p>
              </div>
            </div>

            {loadingVenues ? (
              <LoadingState message="Loading venues..." />
            ) : (
              <VenuesSection
                venues={venues}
                currentCity={currentCity}
                onSelectVenue={handleSelectVenue}
              />
            )}
          </div>
        )}

        {/* My Bookings Tab */}
        {activeNav === "bookings" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#181a24] p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <h1 className="text-xl sm:text-2xl font-black uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#f84464]" />
                <span>My Bookings</span>
              </h1>
              <p className="text-xs text-zinc-500">
                View your confirmed tickets and upcoming theater reservations.
              </p>
            </div>

            {!isAuthenticated ? (
              <EmptyState
                icon={Ticket}
                title="Sign In to View Bookings"
                description="Sign in to your customer account to view your past and upcoming ticket bookings."
                actionText="Customer Sign In"
                onAction={() => handleOpenAuth("user")}
              />
            ) : (
              <EmptyState
                icon={Ticket}
                title="No Active Bookings"
                description="You haven't reserved any tickets yet. Explore cinemas to select your seats."
                actionText="Explore Cinemas"
                onAction={() => setActiveNav("venues")}
              />
            )}
          </div>
        )}

        {/* Venue Seating Layout Tab */}
        {activeNav === "seating" && selectedVenue && (
          <VenueSeatingView
            venue={selectedVenue}
            onBack={() => setActiveNav("venues")}
            onRequireAuth={handleOpenAuth}
          />
        )}

        {/* Protected Venue Admin Portal Tab (RBAC) */}
        {activeNav === "admin" && (
          <ProtectedRoute
            allowedRoles={["venue_admin"]}
            onRequireAuth={(role) => handleOpenAuth(role)}
          >
            <AdminPortal />
          </ProtectedRoute>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Unified Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        requiredRole={authRequiredRole}
        onSuccess={() => {
          loadVenues();
        }}
      />
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
