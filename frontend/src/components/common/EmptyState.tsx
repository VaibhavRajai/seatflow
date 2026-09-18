import React from "react";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold uppercase text-zinc-800 dark:text-zinc-200">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          {description}
        </p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-[#f84464] hover:bg-[#e51a4b] text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
