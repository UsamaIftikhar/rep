import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[100px] w-full rounded-lg bg-[#141414] border border-white/10 px-3.5 py-2.5 text-sm text-[#F5F5F5] placeholder:text-[#737373] transition-colors resize-y",
            "focus-visible:outline-none focus-visible:border-[#F21717] focus-visible:ring-1 focus-visible:ring-[#F21717]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-[#EF4444]">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
