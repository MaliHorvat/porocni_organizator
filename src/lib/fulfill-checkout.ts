import { getAuthUserId } from "@/lib/auth";
import { getStripe, metadataToWeddingInput } from "@/lib/stripe";
import { createWedding } from "@/lib/db";
import type Stripe from "stripe";

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return null;
  }

  const input = metadataToWeddingInput(session.metadata || {});
  if (!input) {
    throw new Error("Manjkajo podatki poroke v Stripe metadata");
  }

  let clerkUserId = session.metadata?.clerkUserId || undefined;

  if (!clerkUserId) {
    const authUserId = await getAuthUserId();
    if (authUserId && authUserId !== "demo-user") {
      clerkUserId = authUserId;
    }
  }

  return createWedding(input, {
    stripeSessionId: session.id,
    clerkUserId,
  });
}

export async function fulfillCheckoutSessionById(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return fulfillCheckoutSession(session);
}
