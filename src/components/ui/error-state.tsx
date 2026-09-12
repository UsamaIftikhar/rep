import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this section. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444] mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="font-display uppercase tracking-wide text-lg font-bold text-white mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-[#A3A3A3] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
