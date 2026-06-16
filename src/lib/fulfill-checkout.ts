import { createWedding } from "@/lib/db";
import {
  getStripe,
  metadataToWeddingInput,
} from "@/lib/stripe";
import type Stripe from "stripe";

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return null;
  }

  const input = metadataToWeddingInput(session.metadata || {});
  if (!input) {
    throw new Error("Manjkajo podatki poroke v Stripe metadata");
  }

  return createWedding(input, {
    stripeSessionId: session.id,
    clerkUserId: session.metadata?.clerkUserId || undefined,
  });
}

export async function fulfillCheckoutSessionById(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return fulfillCheckoutSession(session);
}
