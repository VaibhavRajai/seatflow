import React from "react";
import {
  Film,
  LayoutGrid,
  ShieldCheck,
  History,
  Building2,
  Bell,
} from "lucide-react";

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Film,
      title: "Discover Events",
      description: "Browse available events and find something you want to attend.",
    },
    {
      icon: LayoutGrid,
      title: "Choose Your Seats",
      description: "View the venue layout and select available seats visually.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Booking",
      description: "Book tickets through a secure checkout flow.",
    },
    {
      icon: History,
      title: "Booking History",
      description: "View your previous and upcoming bookings.",
    },
    {
      icon: Building2,
      title: "Venue Discovery",
      description: "Explore venues and see their seating layouts.",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Receive important booking information.",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <h2 className="text-xl font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
          Everything You Need for Seamless Booking
        </h2>
        <p className="text-xs text-zinc-500">
          Designed for moviegoers and event attendees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-6 space-y-3 hover:border-[#f84464] transition-colors"
            >
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[#f84464]">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm uppercase text-zinc-900 dark:text-zinc-100">
                {feature.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
