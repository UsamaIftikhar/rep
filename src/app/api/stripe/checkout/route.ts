import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  type: z.enum(["SUBSCRIPTION", "COURSE", "ELITE_PACIFIC"]),
  courseId: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid checkout configuration" }, { status: 400 });
    }

    const { type, courseId } = result.data;
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await createStripeCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      type,
      courseId,
      origin,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to initialize Stripe checkout" },
      { status: 500 }
    );
  }
}
