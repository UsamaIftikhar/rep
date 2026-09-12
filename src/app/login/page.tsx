"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Flame } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("marvin@rep1recruiting.com");
  const [password, setPassword] = React.useState("••••••••");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-9 h-9 rounded-lg bg-[#F21717] flex items-center justify-center text-white shadow-[0_0_20px_rgba(242,23,23,0.5)]">
              <Flame className="w-5 h-5 fill-current text-white" />
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

        <Card className="bg-[#111111] border-white/10">
          <CardContent className="space-y-4 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@rep1.com"
                  required
                />
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
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="athletic" size="md" className="w-full gap-2 font-bold">
                  Sign In to REP 1 <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
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
