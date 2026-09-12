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
    lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course?.title || "REP 1 Academy Course",
            description: course?.description,
          },
          unit_amount: course?.priceInCents || 4900,
        },
        quantity: 1,
      },
    ];
  } else if (type === "ELITE_PACIFIC") {
    mode = "subscription";
    lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Elite Pacific Sports Recruiter Access",
            description: "Full Australian athlete database & recruiting directory subscription",
          },
          unit_amount: 7500, // $75/mo
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ];
  } else {
    mode = "subscription";
    lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "REP 1 Full Athlete Membership",
            description: "Includes Student Academy classes, Mock AI Interview prep, and recruiting tools",
          },
          unit_amount: 2999, // $29.99/mo
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ];
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: userEmail,
    line_items: lineItems,
    mode,
    success_url: `${origin}/dashboard?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/settings?checkout_cancelled=true`,
    metadata: {
      userId,
      type,
      courseId: courseId || "",
    },
  });

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

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${origin}/settings`,
  });

  return { url: portalSession.url };
}
