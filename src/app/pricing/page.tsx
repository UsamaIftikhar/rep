import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from "@/components/ui";
import { Check } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Classroom Pass",
      price: "$9.99",
      period: "/course",
      desc: "Per course purchase for unlimited lifetime development.",
      features: [
        "Unlimited lifetime access per course",
        "Lesson progress tracking",
        "Downloadable athlete guides & resources",
      ],
      cta: "Explore Courses",
      href: "/classroom",
      highlight: false,
    },
    {
      name: "American Student Pass",
      price: "$29.99",
      period: "One-time fee",
      desc: "Full membership for US student-athletes.",
      features: [
        "Full access to all Student Academy courses",
        "Unlimited AI Mock Interview practice",
        "Verified athletic profile & combine metrics",
        "Earn official Academy completion badges",
        "One-time fee — lifetime access",
      ],
      cta: "Join US Membership",
      href: "/signup?plan=us_athlete",
      highlight: true,
      badgeText: "Most Popular",
    },
    {
      name: "International Athlete Pass",
      price: "$29.99",
      period: "One-time fee",
      desc: "Full membership for Australian & International prospects.",
      features: [
        "Full access to all Student Academy courses",
        "Australia-to-America recruiting roadmap",
        "Verified profile on Elite Pacific Sports network",
        "Unlimited AI Mock Interview prep",
        "One-time fee — lifetime access",
      ],
      cta: "Join International Pass",
      href: "/signup?plan=international",
      highlight: false,
    },
    {
      name: "Recruiter & Scout Pass",
      price: "$49.99",
      period: "/year",
      desc: "For college coaches, athletic directors, and scout organizations.",
      features: [
        "Access to search & view every recruit in the database",
        "Academic & physical verified combine stats",
        "Direct athlete & coach contact details",
        "Recruiting alert watchlist & scouting tools",
      ],
      cta: "Get Recruiter Pass",
      href: "/signup?plan=recruiter",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex-1 w-full">
        <PageHeader
          eyebrow="Membership & Access"
          title="Simple, Transparent Plans"
          description="Invest in your athletic and collegiate career with comprehensive preparation and recruiting access."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <Card
              key={p.name}
              hoverEffect
              className={p.highlight ? "border-[#F21717]/40 shadow-[0_0_30px_rgba(242,23,23,0.15)] flex flex-col" : "flex flex-col"}
            >
              <CardHeader>
                {p.highlight && (
                  <Badge variant="athletic" className="mb-2 self-start bg-[#F21717]">
                    {p.badgeText || "Most Popular"}
                  </Badge>
                )}
                <CardTitle isDisplay>{p.name}</CardTitle>
                <div className="flex items-baseline gap-1.5 my-3">
                  <span className="font-display text-4xl font-black text-white">
                    {p.price}
                  </span>
                  {p.period && (
                    <span className="text-xs text-[#737373]">{p.period}</span>
                  )}
                </div>
                <CardDescription>{p.desc}</CardDescription>
              </CardHeader>

              <CardContent className="mt-auto">
                <ul className="space-y-2.5 mb-6 text-xs text-[#A3A3A3]">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#F21717] flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href={p.href}>
                  <Button
                    variant={p.highlight ? "athletic" : "secondary"}
                    size="md"
                    className={p.highlight ? "w-full bg-[#F21717] hover:bg-[#D90F0F]" : "w-full"}
                  >
                    {p.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
