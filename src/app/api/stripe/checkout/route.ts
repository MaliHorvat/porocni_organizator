import { NextRequest, NextResponse } from "next/server";
import { createWedding, seedDemoData } from "@/lib/db";
import { getAuthUserId, isClerkEnabled } from "@/lib/auth";
import {
  getBaseUrl,
  getStripe,
  isStripeEnabled,
  PLANS,
  weddingInputToMetadata,
} from "@/lib/stripe";
import type { CreateWeddingInput } from "@/types";

export async function POST(request: NextRequest) {
  try {
    seedDemoData();
    const body: CreateWeddingInput = await request.json();

    if (!body.partner1 || !body.partner2 || !body.weddingDate || !body.venue) {
      return NextResponse.json(
        { error: "Manjkajo obvezni podatki" },
        { status: 400 }
      );
    }

    const clerkUserId = await getAuthUserId();
    if (isClerkEnabled() && !clerkUserId) {
      return NextResponse.json({ error: "Potrebna je prijava" }, { status: 401 });
    }

    if (!isStripeEnabled()) {
      const wedding = createWedding(body, { clerkUserId: clerkUserId || undefined });
      return NextResponse.json({ slug: wedding.slug, id: wedding.id, demo: true });
    }

    const plan = PLANS[body.plan];
    const stripe = getStripe();
    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: plan.amount,
            product_data: {
              name: plan.name,
              description: `${body.partner1} & ${body.partner2} — ${plan.description}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: weddingInputToMetadata(body, clerkUserId || undefined),
      success_url: `${baseUrl}/ustvari/uspeh?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/ustvari?cancelled=1`,
      locale: "sl",
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Napaka pri ustvarjanju plačila" },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Napaka pri ustvarjanju plačila" },
      { status: 500 }
    );
  }
}
