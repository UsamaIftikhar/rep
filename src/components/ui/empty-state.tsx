import * as React from "react";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl bg-[#111111]/70 border border-dashed border-white/15",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#A3A3A3] mb-4">
        {icon || <FolderOpen className="w-7 h-7 text-[#737373]" />}
      </div>
      <h3 className="font-display uppercase tracking-wide text-lg md:text-xl font-bold text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#A3A3A3] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
