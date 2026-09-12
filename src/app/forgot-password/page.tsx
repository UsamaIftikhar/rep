"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { ArrowLeft, Flame, CheckCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate password reset email request dispatch
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsSubmitted(true);
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
            Reset Your Password
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Enter your email address to receive password reset instructions.
          </p>
        </div>

        <Card className="bg-[#111111] border-white/10">
          <CardContent className="space-y-4 pt-6">
            {isSubmitted ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Instructions Sent</h2>
                <p className="text-xs text-[#A3A3A3]">
                  If an account exists for <span className="text-white font-medium">{email}</span>, password reset instructions have been sent.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="athlete@rep1.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="athletic"
                    size="md"
                    className="w-full gap-2 font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#737373]">
          <Link href="/login" className="text-[#A3A3A3] hover:text-white inline-flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
