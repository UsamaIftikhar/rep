import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, options, ...props }, ref) => {
    return (
      <div className="w-full relative">
        <select
          ref={ref}
          className={cn(
            "flex h-11 w-full appearance-none rounded-lg bg-[#141414] border border-white/10 px-3.5 py-2 text-sm text-[#F5F5F5] placeholder:text-[#737373] transition-colors pr-10 cursor-pointer",
            "focus-visible:outline-none focus-visible:border-[#F21717] focus-visible:ring-1 focus-visible:ring-[#F21717]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#171717] text-[#F5F5F5]"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373]">
          <ChevronDown className="w-4 h-4" />
        </div>
        {error && <p className="mt-1.5 text-xs text-[#EF4444]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
