"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, Button, Input, Select } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Flame, Loader2 } from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [sport, setSport] = React.useState("football");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await signup({
        firstName,
        lastName,
        email,
        password,
        sport,
        role: "ATHLETE",
      });

      if (!res.success) {
        setError(res.error || "Registration failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred during signup.");
    } finally {
      setIsSubmitting(false);
    }
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
            Create Athlete Account
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Join REP 1 to start your recruiting profile, Student Academy, and AI interview prep.
          </p>
        </div>

        <Card className="bg-[#111111] border-white/10">
          <CardContent className="space-y-4 pt-6">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                    First Name
                  </label>
                  <Input
                    placeholder="Jordan"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                    Last Name
                  </label>
                  <Input
                    placeholder="Davis"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="jordan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                  Primary Sport
                </label>
                <Select
                  options={[
                    { value: "football", label: "American Football" },
                    { value: "basketball", label: "Basketball" },
                    { value: "rugby", label: "Rugby League / Union" },
                    { value: "soccer", label: "Soccer" },
                    { value: "track", label: "Track & Field" },
                  ]}
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                  Create Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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
                      <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                    </>
                  ) : (
                    <>
                      Complete Registration <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#737373]">
          Already have an athlete account?{" "}
          <Link href="/login" className="text-[#F21717] hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
