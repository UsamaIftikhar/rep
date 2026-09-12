import Link from "next/link";
import { Card, CardContent, Button, Input, Select } from "@/components/ui";

export default function SignupPage() {
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
            Create Athlete Account
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Join REP 1 to start your recruiting profile, Student Academy, and AI interview prep.
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                  First Name
                </label>
                <Input placeholder="Jordan" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                  Last Name
                </label>
                <Input placeholder="Davis" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                Email Address
              </label>
              <Input type="email" placeholder="jordan@example.com" />
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
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                Password
              </label>
              <Input type="password" placeholder="Create a strong password..." />
            </div>

            <Link href="/dashboard" className="block pt-2">
              <Button variant="athletic" size="md" className="w-full">
                Register Account
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#737373]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#F21717] hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
