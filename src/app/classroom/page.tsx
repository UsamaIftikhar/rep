"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicNavbar, PublicFooter } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from "@/components/ui";
import { Clock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ClassroomCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  priceInCents: number;
  standalonePurchasable: boolean;
  includedWithMembership: boolean;
  totalLessonsCount: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export default function ClassroomPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = React.useState<ClassroomCourse[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/courses")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.courses) {
          setCourses(data.courses);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handlePurchase = async (courseId: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "COURSE", courseId }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.replace(data.url);
      } else {
        alert(data.error || "Stripe checkout session creation failed");
      }
    } catch {
      alert("Unable to initiate course checkout");
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex-1 w-full">
        <PageHeader
          eyebrow="Open Enrollment"
          title="REP 1 Public Classroom"
          description="Standalone courses for prospective student-athletes, parents, and coaches. All courses are automatically included with full athlete memberships."
        />

        {loading ? (
          <div className="py-20 text-center text-[#A3A3A3]">
            <Loader2 className="w-8 h-8 animate-spin text-[#F21717] mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest font-semibold">Loading Classroom Storefront...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((c) => {
              const formattedPrice = c.priceInCents > 0 ? `$${(c.priceInCents / 100).toFixed(2)}` : "$9.99";
              const isEntitled = isAuthenticated && (c.includedWithMembership || c.status !== "NOT_STARTED");

              return (
                <Card key={c.id} hoverEffect className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display text-2xl font-black text-[#F21717]">
                        {isEntitled ? "Included" : formattedPrice}
                      </span>
                      <Badge variant={isEntitled ? "success" : "neutral"}>
                        {isEntitled ? "Active Access" : "Unlimited Access"}
                      </Badge>
                    </div>
                    <CardTitle isDisplay>{c.title}</CardTitle>
                    <CardDescription>{c.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0 space-y-4">
                    <div className="flex items-center justify-between text-xs text-[#737373]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Self-Paced
                      </span>
                      <span>{c.totalLessonsCount || 4} Lessons</span>
                    </div>

                    {!isAuthenticated ? (
                      <Link href={`/signup?plan=course&courseId=${c.id}&courseSlug=${c.slug}`}>
                        <Button variant="athletic" size="md" className="w-full gap-2 bg-[#F21717] hover:bg-[#D90F0F] font-bold">
                          Pay & Enroll ({formattedPrice}) <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    ) : isEntitled ? (
                      <Link href={`/courses/${c.slug}`}>
                        <Button variant="athletic" size="md" className="w-full gap-2 bg-[#F21717] hover:bg-[#D90F0F]">
                          {c.status === "COMPLETED" ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Review Course
                            </>
                          ) : (
                            <>
                              Open Course <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => handlePurchase(c.id)}
                        variant="primary"
                        size="md"
                        className="w-full gap-2"
                      >
                        Purchase Course ({formattedPrice})
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
