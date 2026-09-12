import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@/components/ui";
import { Users, BookOpen, DollarSign, Activity } from "lucide-react";

export default function AdminPage() {
  const metrics = [
    { label: "Total Registered Users", value: "1,420", icon: Users, change: "+12% this month" },
    { label: "Active Memberships", value: "840", icon: DollarSign, change: "Stripe synchronized" },
    { label: "Course Enrollments", value: "3,290", icon: BookOpen, change: "89% completion rate" },
    { label: "AI Interview Attempts", value: "980", icon: Activity, change: "Avg score 84" },
  ];

  return (
    <AppShell isAdmin={true}>
      <PageHeader
        eyebrow="Back Office Operations"
        title="Admin Portal"
        description="Oversee user permissions, course content publication, interview analytics, and Stripe billing records."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#737373] font-semibold">
                    {m.label}
                  </p>
                  <h3 className="font-display font-black text-3xl text-white mt-1">
                    {m.value}
                  </h3>
                  <p className="text-xs text-[#2ECC71] mt-1">{m.change}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F21717]">
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle isDisplay>Quick Management Modules</CardTitle>
          <CardDescription>Direct shortcuts to administration controllers</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button variant="secondary" className="justify-start gap-2 h-12">
            <Users className="w-4 h-4 text-[#F21717]" /> Manage Users & Athletes
          </Button>
          <Button variant="secondary" className="justify-start gap-2 h-12">
            <BookOpen className="w-4 h-4 text-[#F21717]" /> Curriculum & Lessons Editor
          </Button>
          <Button variant="secondary" className="justify-start gap-2 h-12">
            <DollarSign className="w-4 h-4 text-[#F21717]" /> Stripe Orders & Subscriptions
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
