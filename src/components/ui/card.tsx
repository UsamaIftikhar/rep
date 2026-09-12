import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  hoverEffect = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hoverEffect?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-[#111111] border border-white/10 text-[#F5F5F5] transition-all duration-200",
        hoverEffect &&
          "hover:border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:bg-[#141414]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-5 md:p-6 border-b border-white/5", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  isDisplay = false,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { isDisplay?: boolean }) {
  return (
    <h3
      className={cn(
        "font-semibold text-lg leading-none tracking-tight text-white",
        isDisplay && "font-display text-2xl uppercase tracking-wide",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-[#A3A3A3] leading-relaxed", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 md:p-6", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center p-5 md:p-6 pt-0 border-t border-white/5 mt-auto",
        className
      )}
      {...props}
    />
  );
}
