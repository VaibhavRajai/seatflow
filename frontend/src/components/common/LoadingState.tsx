import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  fullPage = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 text-zinc-500 dark:text-zinc-400">
      <Loader2 className="w-8 h-8 animate-spin text-[#f84464]" />
      <p className="text-xs font-bold uppercase tracking-wider">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
