"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { PublicNavbar } from "./PublicNavbar";
import { PublicFooter } from "./PublicFooter";

interface AppShellProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export function AppShell({ children, isAdmin }: AppShellProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const isUserAdmin =
    isAdmin !== undefined
      ? isAdmin
      : user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  // If user is not logged in, do NOT render the sidebar shell at all
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
        <PublicNavbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex">
      {/* Sidebar only renders for authenticated users */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isAdmin={isUserAdmin}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
