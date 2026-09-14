"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { Flame, CheckCircle, Loader2, AlertCircle, KeyRound, ArrowRight } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Invalid Reset Link</h2>
          <p className="text-xs text-[#A3A3A3] mt-1">
            No password reset token was provided in the link.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/forgot-password">
            <Button variant="athletic" size="md" className="w-full font-bold">
              Request New Reset Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify both fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Password Reset Complete</h2>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Your password has been successfully updated. You can now log into your account using your new password.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="athletic" size="md" className="w-full gap-2 font-bold">
              Sign In Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
          New Password
        </label>
        <Input
          type="password"
          placeholder="Min 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
          Confirm New Password
        </label>
        <Input
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
              <Loader2 className="w-4 h-4 animate-spin" /> Updating password...
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" /> Set New Password
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            Set New Password
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Choose a strong password to secure your account.
          </p>
        </div>

        <Card className="bg-[#111111] border-white/10">
          <CardContent className="space-y-4 pt-6">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center py-8 text-[#A3A3A3]">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              }
            >
              <ResetPasswordForm />
            </React.Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#737373]">
          Remember your password?{" "}
          <Link href="/login" className="text-white hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
