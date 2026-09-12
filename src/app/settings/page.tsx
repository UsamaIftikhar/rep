"use client";

import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select } from "@/components/ui";
import { ShieldCheck, CreditCard } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Account & Profile"
        title="Settings"
        description="Manage your athlete profile details, billing subscription, and platform preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle isDisplay>Personal Information</CardTitle>
              <CardDescription>Update your public recruiting profile data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">First Name</label>
                  <Input defaultValue="Jordan" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Last Name</label>
                  <Input defaultValue="Davis" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">High School / Club</label>
                  <Input defaultValue="Mater Dei High School" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Graduation Year</label>
                  <Select defaultValue="2026" options={[{ value: "2025", label: "2025" }, { value: "2026", label: "2026" }, { value: "2027", label: "2027" }]} />
                </div>
              </div>
              <div className="pt-2">
                <Button variant="primary" size="md">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle isDisplay>Membership & Billing</CardTitle>
              <CardDescription>Your current subscription tier.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#2ECC71]" />
                  <span className="text-sm font-bold text-white uppercase font-display">REP 1 Member Tier</span>
                </div>
                <p className="text-xs text-[#A3A3A3]">Active via Stripe • Renews monthly</p>
              </div>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <CreditCard className="w-4 h-4" /> Manage in Stripe Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
