import React from "react";

interface SeatProps {
  id: string;
  rowLabel: string;
  seatNumber: number;
  isSelected: boolean;
  isAvailable?: boolean;
  price?: number;
  onToggle: (seatId: string, seatCode: string) => void;
}

export const Seat: React.FC<SeatProps> = ({
  id,
  rowLabel,
  seatNumber,
  isSelected,
  isAvailable = true,
  price,
  onToggle,
}) => {
  const seatCode = `${rowLabel}${seatNumber}`;

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={() => onToggle(id, seatCode)}
      title={price ? `Seat ${seatCode} - ₹${price}` : `Seat ${seatCode}`}
      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold transition-all select-none cursor-pointer border ${
        isSelected
          ? "bg-[#f84464] text-white border-[#f84464] shadow-xs scale-105"
          : isAvailable
          ? "border-emerald-600/70 hover:border-[#f84464] hover:bg-[#f84464]/10 text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#14151e]"
          : "border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
      }`}
    >
      {seatNumber}
    </button>
  );
};
