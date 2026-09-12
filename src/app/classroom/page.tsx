import { PublicNavbar, PublicFooter } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from "@/components/ui";
import { Clock } from "lucide-react";

export default function ClassroomPage() {
  const courses = [
    {
      id: "financial-literacy",
      title: "Financial Literacy for Athletes",
      desc: "Taxes, contracts, agent commissions, banking, and wealth preservation foundations.",
      price: "$149",
      lessons: 6,
    },
    {
      id: "marketing-playbook",
      title: "Marketing Playbook & NIL Strategy",
      desc: "Monetizing your name, image, and likeness legally while protecting your eligibility.",
      price: "$199",
      lessons: 6,
    },
    {
      id: "personal-branding",
      title: "Personal Branding & Digital Media",
      desc: "Building an authentic sports persona that attracts brands and university recruiters.",
      price: "$149",
      lessons: 7,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex-1 w-full">
        <PageHeader
          eyebrow="Open Enrollment"
          title="REP 1 Public Classroom"
          description="Standalone courses for prospective student-athletes, parents, and coaches. All courses are automatically included with full athlete memberships."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Card key={c.id} hoverEffect className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-2xl font-black text-[#F21717]">
                    {c.price}
                  </span>
                  <Badge variant="neutral">One-time Access</Badge>
                </div>
                <CardTitle isDisplay>{c.title}</CardTitle>
                <CardDescription>{c.desc}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="flex items-center justify-between text-xs text-[#737373] pb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Self-Paced
                  </span>
                  <span>{c.lessons} Lessons</span>
                </div>
                <Button variant="primary" size="md" className="w-full">
                  Purchase Course Access
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
