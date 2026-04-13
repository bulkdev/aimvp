import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProject } from "@/lib/store";
import { creatorAssets } from "@/lib/creator-membership";
import { getStripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const projectId = req.nextUrl.searchParams.get("projectId")?.trim();
  const plan = req.nextUrl.searchParams.get("plan") === "year" ? "year" : "month";
  if (!projectId) return NextResponse.json({ error: "Missing projectId." }, { status: 400 });
  const project = await getProject(projectId);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const cm = creatorAssets(project.content);
  const selected = plan === "year" ? cm.yearlyPlan : cm.monthlyPlan;
  const stripe = getStripe();
  const unitAmount = Math.max(100, Math.round(selected.priceUsd * 100));
  const successUrl = new URL(`/site/${project.id}/account?success=1`, req.url).toString();
  const cancelUrl = new URL(`/site/${project.id}?billing=cancelled`, req.url).toString();

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email || undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          recurring: { interval: selected.billingInterval === "year" ? "year" : "month" },
          product_data: {
            name: `${project.content.brandName} ${selected.name} Membership`,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      projectId: project.id,
      userId: session.user.id,
      planId: selected.id,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  if (!checkout.url) return NextResponse.json({ error: "Checkout URL missing." }, { status: 500 });
  return NextResponse.redirect(checkout.url);
}

