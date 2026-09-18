import React from "react";
import { Shield, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#333545] dark:bg-[#14151e] text-zinc-400 text-xs py-10 px-4 sm:px-8 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-[#f84464] text-white font-black text-sm px-2 py-0.5 uppercase tracking-wider">
                SeatFlow
              </div>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Book tickets, pick your favorite seats, and enjoy live entertainment across top multiplexes and venues.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              SeatFlow
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#cinemas" className="hover:text-white transition-colors">Cinemas & Venues</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Platform Features</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Support & Legal
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li><a href="#help" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Venue Partners
            </h4>
            <p className="text-[11px] text-zinc-400">
              Manage your cinema screens, auditoriums, and seat matrix layout through our dedicated Venue Admin Portal.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
          <span>© {new Date().getFullYear()} SeatFlow Entertainment Technologies. All rights reserved.</span>
          <span>Book tickets. Pick your seats. Enjoy the experience.</span>
        </div>
      </div>
    </footer>
  );
};
