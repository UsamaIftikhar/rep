"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const links = [
    { label: "Home", href: "/" },
    { label: "Classroom", href: "/classroom" },
    { label: "Elite Pacific", href: "/elite-pacific" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070707]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#F21717] flex items-center justify-center font-display font-black text-white text-xl tracking-wider shadow-[0_0_20px_rgba(242,23,23,0.5)] group-hover:scale-105 transition-transform">
            R1
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-2xl tracking-wider text-white uppercase leading-none">
              REP <span className="text-[#F21717]">1</span>
            </span>
            <span className="text-[10px] tracking-widest text-[#737373] uppercase font-semibold">
              Athletics & Recruiting
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white",
                  isActive ? "text-[#F21717] font-semibold" : "text-[#A3A3A3]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="athletic" size="sm" className="gap-1.5">
              Athlete Portal <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu hamburger */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="p-2 -mr-2 text-[#A3A3A3] hover:text-white md:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0D0D0D] px-4 py-5 space-y-4">
          <nav className="flex flex-col space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm text-[#A3A3A3] hover:text-white hover:bg-white/5 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="md" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="athletic" size="md" className="w-full">
                Enter Athlete Portal
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
