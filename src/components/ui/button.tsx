import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "athletic";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F21717] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070707] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-lg cursor-pointer";

    const variants = {
      primary:
        "bg-[#F21717] text-white hover:bg-[#D90F0F] shadow-[0_0_20px_rgba(242,23,23,0.3)] hover:shadow-[0_0_25px_rgba(242,23,23,0.5)] border border-transparent",
      secondary:
        "bg-[#171717] text-[#F5F5F5] hover:bg-[#202020] border border-white/10 hover:border-white/20",
      outline:
        "bg-transparent text-[#F5F5F5] border border-white/20 hover:border-[#F21717] hover:text-white hover:bg-white/5",
      ghost:
        "bg-transparent text-[#A3A3A3] hover:text-white hover:bg-white/5 border border-transparent",
      destructive:
        "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/25",
      athletic:
        "bg-[#F21717] text-white font-display uppercase tracking-wider text-base font-bold hover:bg-[#D90F0F] shadow-[0_0_20px_rgba(242,23,23,0.35)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
