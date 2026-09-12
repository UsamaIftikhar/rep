import Link from "next/link";
import { Card, CardContent, Button, Input } from "@/components/ui";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-9 h-9 rounded-lg bg-[#F21717] flex items-center justify-center font-display font-black text-white text-xl shadow-[0_0_20px_rgba(242,23,23,0.5)]">
              R1
            </div>
            <span className="font-display font-black text-2xl tracking-wider text-white uppercase">
              REP <span className="text-[#F21717]">1</span>
            </span>
          </Link>
          <h1 className="font-display uppercase text-3xl font-black text-white">
            Sign In to Platform
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Access your athlete dashboard, Academy courses, and interview scores.
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                Email Address
              </label>
              <Input type="email" placeholder="athlete@rep1.com" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#A3A3A3] block">
                  Password
                </label>
                <a href="#" className="text-[11px] text-[#F21717] hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input type="password" placeholder="••••••••" />
            </div>

            <Link href="/dashboard" className="block pt-2">
              <Button variant="athletic" size="md" className="w-full">
                Sign In to REP 1
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#737373]">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="text-[#F21717] hover:underline font-semibold">
            Create an athlete profile
          </Link>
        </p>
      </div>
    </div>
  );
}
