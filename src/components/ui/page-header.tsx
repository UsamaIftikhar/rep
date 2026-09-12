import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-white/10",
        className
      )}
    >
      <div className="space-y-1.5">
        {eyebrow && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F21717] inline-block animate-pulse" />
            <span className="font-display uppercase tracking-widest text-xs font-bold text-[#F21717]">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl uppercase font-extrabold tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-[#A3A3A3] max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}
