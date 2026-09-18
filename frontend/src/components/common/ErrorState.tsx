import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "Please try again later or check your network connection.",
  onRetry,
}) => {
  return (
    <div className="bg-red-500/5 dark:bg-red-950/20 border border-red-500/30 p-8 text-center space-y-4 max-w-md mx-auto">
      <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-red-600 dark:text-red-400 uppercase">
          {title}
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-[#f84464] hover:bg-[#e51a4b] text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
