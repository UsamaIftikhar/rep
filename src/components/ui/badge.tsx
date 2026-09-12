import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "neutral"
    | "outline"
    | "athletic";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full transition-colors select-none";

  const variants = {
    default: "bg-[#F21717]/15 text-[#F21717] border border-[#F21717]/30",
    success: "bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30",
    warning: "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30",
    danger: "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30",
    neutral: "bg-white/5 text-[#A3A3A3] border border-white/10",
    outline: "border border-white/20 text-[#F5F5F5]",
    athletic:
      "bg-[#F21717] text-white font-display uppercase tracking-wider font-bold rounded-md px-2 py-0.5",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
