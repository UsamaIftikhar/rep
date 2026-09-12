import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from "@/components/ui";
import { Check } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Classroom Pass",
      price: "A La Carte",
      desc: "Single course purchase for individual development.",
      features: [
        "Individual course lifetime access",
        "Lesson progress tracking",
        "Downloadable athlete guides",
      ],
      cta: "Explore Courses",
      href: "/classroom",
      highlight: false,
    },
    {
      name: "REP 1 Full Membership",
      price: "$75",
      period: "/month",
      desc: "All-inclusive athlete development, Academy access, and AI interview prep.",
      features: [
        "Full access to all 6+ Student Academy courses",
        "Unlimited AI Mock Interview sessions",
        "Verified profile on Elite Pacific Sports",
        "Earn official Academy badges",
        "Recruiting exposure & event priority",
      ],
      cta: "Join REP 1 Membership",
      href: "/signup",
      highlight: true,
    },
    {
      name: "Recruiter & Scout Pass",
      price: "Annual",
      desc: "For college coaches, athletic directors, and scout organizations.",
      features: [
        "Full athlete roster search & filtering",
        "Academic & physical verified stats",
        "Direct athlete & coach contact details",
        "Recruiting alert watchlist",
      ],
      cta: "Contact Recruiting",
      href: "/contact",
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <Card
              key={p.name}
              hoverEffect
              className={p.highlight ? "border-[#F21717]/40 shadow-[0_0_30px_rgba(242,23,23,0.15)] flex flex-col" : "flex flex-col"}
            >
              <CardHeader>
                {p.highlight && (
                  <Badge variant="athletic" className="mb-2 self-start">
                    Most Popular
                  </Badge>
                )}
                <CardTitle isDisplay>{p.name}</CardTitle>
                <div className="flex items-baseline gap-1 my-3">
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
                    className="w-full"
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
