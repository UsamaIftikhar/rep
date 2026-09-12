import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0A0A] py-12 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[#F21717] flex items-center justify-center font-display font-black text-white text-sm">
            R1
          </div>
          <span className="font-display uppercase tracking-widest text-sm font-bold text-white">
            REP 1 Athletics & Recruiting
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#737373]">
          <Link href="/about" className="hover:text-[#A3A3A3] transition-colors">
            About Us
          </Link>
          <Link href="/classroom" className="hover:text-[#A3A3A3] transition-colors">
            Classroom
          </Link>
          <Link href="/pricing" className="hover:text-[#A3A3A3] transition-colors">
            Pricing
          </Link>
          <Link href="/contact" className="hover:text-[#A3A3A3] transition-colors">
            Contact
          </Link>
        </div>

        <p className="text-xs text-[#525252]">
          &copy; {new Date().getFullYear()} REP 1 SaaS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
