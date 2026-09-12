import Stripe from "stripe";
import { db } from "./db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key_for_development_build", {
  apiVersion: "2026-08-26.dahlia",
});

export async function createStripeCheckoutSession({
  userId,
  userEmail,
  type,
  courseId,
  origin,
}: {
  userId: string;
  userEmail: string;
  type: "SUBSCRIPTION" | "COURSE" | "ELITE_PACIFIC";
  courseId?: string;
  origin: string;
}) {
  if (!process.env.STRIPE_SECRET_KEY) {
    // In dev mode without Stripe keys, simulate instant checkout completion for rapid testing
    const mockSessionId = `cs_test_mock_${Date.now().toString(36)}`;

    if (type === "COURSE" && courseId) {
      await db.purchase.create({
        data: {
          userId,
          courseId,
          stripeCheckoutSessionId: mockSessionId,
          amountInCents: 4900,
          currency: "usd",
          status: "completed",
        },
      });

      await db.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: { status: "IN_PROGRESS" },
        create: { userId, courseId, status: "IN_PROGRESS", source: "PURCHASE" },
      });

      await db.entitlement.create({
        data: {
          userId,
          type: "COURSE",
          referenceId: courseId,
          source: "PURCHASE",
          sourceReferenceId: mockSessionId,
        },
      });

      return { url: `${origin}/courses/${courseId}?purchased=true` };
    }

    if (type === "ELITE_PACIFIC" || type === "SUBSCRIPTION") {
      await db.subscription.create({
        data: {
          userId,
          stripeCustomerId: `cus_mock_${userId}`,
          stripeSubscriptionId: `sub_mock_${Date.now().toString(36)}`,
          stripePriceId: "price_mock_elite_pacific",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await db.entitlement.create({
        data: {
          userId,
          type: type === "ELITE_PACIFIC" ? "ELITE_PACIFIC" : "ACADEMY",
          source: "SUBSCRIPTION",
        },
      });

      return { url: `${origin}/dashboard?subscribed=true` };
    }

    return { url: `${origin}/dashboard` };
  }

  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let mode: Stripe.Checkout.SessionCreateParams.Mode = "subscription";

  if (type === "COURSE" && courseId) {
    mode = "payment";
    const course = await db.course.findUnique({ where: { id: courseId } });
    const coursePriceId = process.env.STRIPE_PRICE_COURSE || "price_1UEzLw8HF4AKFR6epQd27CQz";
    lineItems = coursePriceId ? [
      { price: coursePriceId, quantity: 1 }
    ] : [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course?.title || "REP 1 Academy Course",
            description: course?.description || undefined,
            tax_code: "txcd_10000000",
          },
          unit_amount: course?.priceInCents || 4900,
        },
        quantity: 1,
      },
    ];
  } else if (type === "ELITE_PACIFIC") {
    mode = "subscription";
    const elitePriceId = process.env.STRIPE_PRICE_ELITE_PACIFIC || "price_1UEzKj8HF4AKFR6eZG2wz2zS";
    lineItems = [
      {
        price: elitePriceId,
        quantity: 1,
      },
    ];
  } else {
    mode = "subscription";
    const athletePriceId = process.env.STRIPE_PRICE_ATHLETE || "price_1UEzKN8HF4AKFR6e5dSDSvGN";
    lineItems = [
      {
        price: athletePriceId,
        quantity: 1,
      },
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionParams: any = {
    customer_email: userEmail,
    line_items: lineItems,
    mode,
    managed_payments: { enabled: false },
    success_url: `${origin}/dashboard?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/settings?checkout_cancelled=true`,
    metadata: {
      userId,
      type,
      courseId: courseId || "",
    },
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  return { url: session.url };
}

export async function createStripeBillingPortal({ userId, origin }: { userId: string; origin: string }) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { url: `${origin}/settings?portal_mock=true` };
  }

  const sub = await db.subscription.findFirst({
    where: { userId, status: "active" },
  });

  if (!sub || !sub.stripeCustomerId) {
    throw new Error("No active Stripe subscription found for this account.");
  }

  if (sub.stripeCustomerId.startsWith("cus_mock_")) {
    return { url: `${origin}/settings?portal_mock=true` };
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/settings`,
    });
    return { url: portalSession.url };
  } catch (err: unknown) {
    console.error("Stripe billing portal error:", err);
    return { url: `${origin}/settings?portal_error=true` };
  }
}
