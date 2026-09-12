"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, PlusCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");

  const getSectionTitle = () => {
    if (pathname.startsWith("/elite-pacific")) return "Elite Pacific Sports";
    if (pathname.startsWith("/academy")) return "Student Academy";
    if (pathname.startsWith("/courses")) return "Classroom";
    if (pathname.startsWith("/interview")) return "Mock AI Interview";
    if (pathname.startsWith("/settings")) return "Settings";
    if (pathname.startsWith("/recruiting")) return "Recruiter Directory";
    if (pathname.startsWith("/admin")) return "Admin Operations";
    return "Dashboard";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recruiting/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/recruiting/search");
    }
  };

  const userInitials = user?.firstName?.[0]
    ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
    : "MC";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-20 px-4 md:px-8 bg-[#070707] border-b border-white/5">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-white/10 lg:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Section Title */}
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-widest text-[#F21717]">
            CURRENT SECTION
          </span>
          <h1 className="font-display uppercase text-2xl md:text-3xl font-extrabold text-white tracking-wide leading-none">
            {getSectionTitle()}
          </h1>
        </div>
      </div>

      {/* Right Controls: Search, Recruit Search button, My Account */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Athlete Search input */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search athletes..."
            className="h-10 w-full rounded-lg bg-[#141414] border border-white/10 pl-9 pr-3.5 text-xs text-[#F5F5F5] placeholder:text-[#737373] focus:outline-none focus:border-[#F21717]"
          />
        </form>

        {/* Recruit Search Button */}
        <Link href="/recruiting/search">
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5 h-10 px-4 text-xs font-semibold bg-[#F21717] hover:bg-[#D90F0F]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Recruit Search</span>
          </Button>
        </Link>

        {/* My Account Dropdown */}
        <Link
          href="/settings"
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F21717] to-amber-600 flex items-center justify-center text-xs font-bold text-white border border-white/20">
            {userInitials}
          </div>
          <span className="text-xs font-medium text-white hidden sm:inline-block">
            {user?.name || "My Account"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
        </Link>
      </div>
    </header>
  );
}
