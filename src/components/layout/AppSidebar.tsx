"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  Home,
  MapPin,
  GraduationCap,
  Mic,
  Settings,
  X,
  Flame,
  LogOut,
  BookOpen,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Classroom",
    href: "/courses",
    icon: BookOpen,
    requiresAuth: true,
  },
  {
    title: "Student Academy",
    href: "/academy",
    icon: GraduationCap,
    requiresAuth: true,
  },
  {
    title: "Elite Pacific Sports",
    href: "/elite-pacific",
    icon: MapPin,
  },
  {
    title: "Mock AI Interview",
    href: "/interview",
    icon: Mic,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isAdmin?: boolean;
}

export function AppSidebar({ isOpen = false, onClose, isAdmin }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const isUserAdmin =
    isAdmin !== undefined
      ? isAdmin
      : user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col h-screen w-60 bg-[#0A0A0A] border-r border-white/10 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:z-30 overflow-hidden shrink-0 select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand & User Header (Matches Bubble App) */}
        <div className="pt-6 px-6 pb-6 shrink-0">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group"
              onClick={onClose}
            >
              {/* Running athlete badge */}
              <div className="w-8 h-8 rounded bg-[#F21717] flex items-center justify-center text-white shadow-[0_0_15px_rgba(242,23,23,0.5)]">
                <Flame className="w-5 h-5 fill-current text-white" />
              </div>
              <span className="font-display font-black text-2xl tracking-wider text-white uppercase">
                REP 1
              </span>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-white/10 lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Name Subtitle */}
          <div className="mt-4 pt-1">
            <p className="text-xs font-semibold text-[#A3A3A3] tracking-wide">
              {user?.name || "Marvin Constant"}
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 space-y-1 overflow-hidden">
          {navItems
            .filter((item) => !item.requiresAuth || isAuthenticated)
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-[#171717] text-white font-semibold"
                      : "text-[#A3A3A3] hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-[#F21717]" : "text-[#737373]"
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
        </nav>

        {/* Bottom Actions: Admin & Logout */}
        <div className="p-3 border-t border-white/5 space-y-1 shrink-0">
          {isUserAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-[#171717] text-white font-semibold"
                  : "text-[#A3A3A3] hover:text-white hover:bg-white/5"
              )}
            >
              <div className="w-6 h-6 rounded-full bg-[#00D1B2]/20 border border-[#00D1B2]/40 flex items-center justify-center text-[#00D1B2]">
                <span className="text-[10px]">⚡</span>
              </div>
              <span>Admin Panel</span>
            </Link>
          )}

          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#737373] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
