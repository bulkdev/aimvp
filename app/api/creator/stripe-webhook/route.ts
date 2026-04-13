import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getStripe, stripeWebhookSecret } from "@/lib/stripe";
import { upsertSubscription } from "@/lib/creator-store";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, stripeWebhookSecret());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid webhook signature.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const projectId = session.metadata?.projectId;
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId || "monthly";
    if (projectId && userId) {
      await upsertSubscription({
        id: randomUUID(),
        projectId,
        userId,
        planId,
        status: "active",
        stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
        stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const metadata = sub.metadata || {};
    const projectId = metadata.projectId;
    const userId = metadata.userId;
    const planId = metadata.planId || "monthly";
    if (projectId && userId) {
      await upsertSubscription({
        id: typeof sub.id === "string" ? sub.id : randomUUID(),
        projectId,
        userId,
        planId,
        status: (sub.status as "active" | "canceled" | "past_due" | "trialing") || "active",
        stripeCustomerId: typeof sub.customer === "string" ? sub.customer : undefined,
        stripeSubscriptionId: typeof sub.id === "string" ? sub.id : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
}

