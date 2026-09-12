import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicNavbar, PublicFooter } from "@/components/layout";
import { ArrowLeft, Flame } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#F21717]/20 border border-[#F21717]/40 flex items-center justify-center text-[#F21717] shadow-[0_0_30px_rgba(242,23,23,0.4)]">
          <Flame className="w-8 h-8 fill-current" />
        </div>

        <div className="space-y-2 max-w-md">
          <span className="text-[11px] font-bold tracking-widest text-[#F21717] uppercase">
            404 ERROR
          </span>
          <h1 className="font-display uppercase text-4xl font-black text-white">
            Page Out of Bounds
          </h1>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            The page or athlete resource you are looking for has been moved, renamed, or does not exist.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="athletic" size="md" className="gap-2 bg-[#F21717] hover:bg-[#D90F0F]">
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
