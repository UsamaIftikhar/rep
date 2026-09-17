import { NextResponse } from "next/server";
import { UserStatus } from "@prisma/client";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret && webhookSecret.startsWith("whsec_") && signature) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid webhook signature";
      console.error("Webhook signature verification failed:", msg);
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  } else {
    if (webhookSecret && !webhookSecret.startsWith("whsec_")) {
      console.warn("STRIPE_WEBHOOK_SECRET is set to a placeholder or non-whsec_ value. Falling back to JSON body parsing.");
    }
    // Development fallback parsing if webhook secret is not set or is a placeholder
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const type = session.metadata?.type;
        const courseId = session.metadata?.courseId;

        if (userId) {
          // Activate user account upon successful payment
          await db.user.update({
            where: { id: userId },
            data: { status: UserStatus.ACTIVE },
          });

          if (type === "COURSE" && courseId) {
            await db.purchase.upsert({
              where: { stripeCheckoutSessionId: session.id },
              update: { status: "completed" },
              create: {
                userId,
                courseId,
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
                stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
                amountInCents: session.amount_total || 999,
                currency: session.currency || "usd",
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
                sourceReferenceId: session.id,
              },
            });
          } else if (type === "SUBSCRIPTION" || type === "ELITE_PACIFIC") {
            const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
            const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id || `sub_${session.id}`;

            if (customerId) {
              await db.subscription.upsert({
                where: { stripeSubscriptionId: subId },
                update: { status: "active", stripeCustomerId: customerId },
                create: {
                  userId,
                  stripeCustomerId: customerId,
                  stripeSubscriptionId: subId,
                  stripePriceId: type === "ELITE_PACIFIC" ? "price_elite" : "price_academy",
                  status: "active",
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
              });

              await db.entitlement.create({
                data: {
                  userId,
                  type: type === "ELITE_PACIFIC" ? "ELITE_PACIFIC" : "ACADEMY",
                  source: "SUBSCRIPTION",
                  sourceReferenceId: session.id,
                },
              });
            }
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription & { current_period_end?: number };
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const currentPeriodEndUnix = sub.current_period_end ? sub.current_period_end * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000;

        const user = await db.user.findFirst({
          where: {
            OR: [
              { subscriptions: { some: { stripeCustomerId: customerId } } },
              { purchases: { some: { stripeCustomerId: customerId } } },
            ],
          },
        });

        if (user) {
          await db.subscription.upsert({
            where: { stripeSubscriptionId: sub.id },
            update: {
              status: sub.status,
              currentPeriodEnd: new Date(currentPeriodEndUnix),
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
            create: {
              userId: user.id,
              stripeCustomerId: customerId,
              stripeSubscriptionId: sub.id,
              stripePriceId: sub.items.data[0]?.price.id || "price_default",
              status: sub.status,
              currentPeriodEnd: new Date(currentPeriodEndUnix),
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "canceled", canceledAt: new Date() },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Stripe webhook event:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
