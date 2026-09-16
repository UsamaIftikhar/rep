import Stripe from "stripe";
import { UserStatus } from "@prisma/client";
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
  type: "SUBSCRIPTION" | "COURSE" | "ELITE_PACIFIC" | "US_ATHLETE" | "INTERNATIONAL";
  courseId?: string;
  origin: string;
}) {
  if (!process.env.STRIPE_SECRET_KEY) {
    // In dev mode without Stripe keys, simulate instant checkout completion for rapid testing
    const mockSessionId = `cs_test_mock_${Date.now().toString(36)}`;

    // Activate user upon completed payment
    await db.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE },
    });

    if (type === "COURSE" && courseId) {
      await db.purchase.create({
        data: {
          userId,
          courseId,
          stripeCheckoutSessionId: mockSessionId,
          amountInCents: 999,
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

    if (type === "INTERNATIONAL" || type === "ELITE_PACIFIC") {
      await db.subscription.create({
        data: {
          userId,
          stripeCustomerId: `cus_mock_${userId}`,
          stripeSubscriptionId: `sub_mock_${Date.now().toString(36)}`,
          stripePriceId: "price_mock_elite_pacific",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      await db.entitlement.create({
        data: {
          userId,
          type: "ELITE_PACIFIC",
          source: "SUBSCRIPTION",
        },
      });

      return { url: `${origin}/dashboard?subscribed=true` };
    }

    // US_ATHLETE or SUBSCRIPTION
    await db.subscription.create({
      data: {
        userId,
        stripeCustomerId: `cus_mock_${userId}`,
        stripeSubscriptionId: `sub_mock_${Date.now().toString(36)}`,
        stripePriceId: "price_mock_us_athlete",
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    await db.entitlement.create({
      data: {
        userId,
        type: "ACADEMY",
        source: "SUBSCRIPTION",
      },
    });

    return { url: `${origin}/dashboard?subscribed=true` };
  }


  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let mode: Stripe.Checkout.SessionCreateParams.Mode = "payment";

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
          unit_amount: course?.priceInCents || 999,
        },
        quantity: 1,
      },
    ];
  } else if (type === "INTERNATIONAL" || type === "ELITE_PACIFIC") {
    const elitePriceId = process.env.STRIPE_PRICE_ELITE_PACIFIC || "price_1UEzKj8HF4AKFR6eZG2wz2zS";
    mode = elitePriceId ? "subscription" : "payment";
    lineItems = elitePriceId ? [
      { price: elitePriceId, quantity: 1 }
    ] : [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "REP 1 International Athlete Pass (Elite Pacific)",
            description: "Full global roster placement, collegiate pathway, and student academy access",
            tax_code: "txcd_10000000",
          },
          unit_amount: 7500,
        },
        quantity: 1,
      },
    ];
  } else {
    // US_ATHLETE or SUBSCRIPTION
    const athletePriceId = process.env.STRIPE_PRICE_ATHLETE || "price_1UEzKN8HF4AKFR6e5dSDSvGN";
    mode = athletePriceId ? "subscription" : "payment";
    lineItems = athletePriceId ? [
      { price: athletePriceId, quantity: 1 }
    ] : [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "REP 1 US Student Athlete Pass",
            description: "Full access to student academy, AI interview prep, and athlete profile tools",
            tax_code: "txcd_10000000",
          },
          unit_amount: 2999,
        },
        quantity: 1,
      },
    ];
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer_email: userEmail,
    line_items: lineItems,
    mode,
    managed_payments: { enabled: false },
    payment_method_types: ["card"],
    success_url: `${origin}/dashboard?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/settings?checkout_cancelled=true`,
    metadata: {
      userId,
      type,
      courseId: courseId || "",
    },
  };

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return { url: session.url };
  } catch (err: unknown) {
    console.warn("Stripe Checkout primary attempt failed, retrying with fallback:", err);
    try {
      const fallbackParams: Stripe.Checkout.SessionCreateParams = {
        ...sessionParams,
        mode: "payment",
      };
      const fallbackSession = await stripe.checkout.sessions.create(fallbackParams);
      return { url: fallbackSession.url };
    } catch (fallbackErr: unknown) {
      console.warn("Stripe Checkout payment fallback failed, retrying with inline price_data:", fallbackErr);
      const defaultName =
        type === "COURSE"
          ? "REP 1 Academy Course"
          : type === "INTERNATIONAL" || type === "ELITE_PACIFIC"
          ? "REP 1 International Athlete Pass (Elite Pacific)"
          : "REP 1 US Student Athlete Pass";
      const defaultAmount =
        type === "COURSE" ? 999 : type === "INTERNATIONAL" || type === "ELITE_PACIFIC" ? 7500 : 2999;

      const inlineParams: Stripe.Checkout.SessionCreateParams = {
        ...sessionParams,
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: defaultName,
                tax_code: "txcd_10000000",
              },
              unit_amount: defaultAmount,
            },
            quantity: 1,
          },
        ],
      };
      const inlineSession = await stripe.checkout.sessions.create(inlineParams);
      return { url: inlineSession.url };
    }
  }
}

export async function createStripeBillingPortal({ userId, origin }: { userId: string; origin: string }) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { url: `${origin}/settings?portal_mock=true` };
  }

  const sub = await db.subscription.findFirst({
    where: { userId, status: "active" },
  });

  if (!sub || !sub.stripeCustomerId) {
    return { url: `${origin}/pricing?notice=no_active_subscription` };
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
