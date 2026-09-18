import React from "react";
import { Search, LayoutGrid, CreditCard, Ticket } from "lucide-react";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Find an Event",
      description: "Explore movies and upcoming events across cinemas in your city.",
    },
    {
      number: "02",
      icon: LayoutGrid,
      title: "Choose Your Seats",
      description: "Pick your preferred seats directly on the interactive theater grid.",
    },
    {
      number: "03",
      icon: CreditCard,
      title: "Complete Your Booking",
      description: "Confirm your ticket selection with quick and secure checkout.",
    },
    {
      number: "04",
      icon: Ticket,
      title: "Receive Your Ticket",
      description: "Get instant booking confirmation ready for theater entry.",
    },
  ];

  return (
    <section className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 space-y-8 shadow-xs">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <h2 className="text-xl font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
          How It Works
        </h2>
        <p className="text-xs text-zinc-500">
          Simple 4-step ticket booking experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-[#f84464]/10 border border-[#f84464]/30 text-[#f84464] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-zinc-200 dark:text-zinc-800 font-mono">
                  {step.number}
                </span>
              </div>
              <h3 className="font-bold text-sm uppercase text-zinc-900 dark:text-zinc-100">
                {step.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
