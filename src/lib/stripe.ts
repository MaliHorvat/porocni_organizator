import Stripe from "stripe";
import type { CreateWeddingInput } from "@/types";

export const PLANS = {
  basic: {
    name: "Osnovni paket",
    description: "Poročna stran z RSVP obrazcem in QR kodo",
    amount: 3900, // 39 € (prej 49 €)
    priceLabel: "39",
    compareAtLabel: "49",
  },
  premium: {
    name: "Premium paket",
    description: "Vse iz osnovnega + galerija fotografij",
    amount: 6900, // 69 € (prej 79 €)
    priceLabel: "69",
    compareAtLabel: "79",
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY ni nastavljen");
  }
  return new Stripe(key);
}

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function weddingInputToMetadata(
  input: CreateWeddingInput,
  clerkUserId?: string
): Record<string, string> {
  return {
    partner1: input.partner1,
    partner2: input.partner2,
    weddingDate: input.weddingDate,
    weddingTime: input.weddingTime,
    venue: input.venue,
    venueAddress: input.venueAddress,
    description: input.description || "",
    dressCode: input.dressCode || "",
    rsvpDeadline: input.rsvpDeadline,
    plan: input.plan,
    ...(clerkUserId ? { clerkUserId } : {}),
  };
}

export function metadataToWeddingInput(
  metadata: Stripe.Metadata
): CreateWeddingInput | null {
  const { partner1, partner2, weddingDate, venue, rsvpDeadline, plan } = metadata;

  if (!partner1 || !partner2 || !weddingDate || !venue || !rsvpDeadline) {
    return null;
  }

  if (plan !== "basic" && plan !== "premium") {
    return null;
  }

  return {
    partner1,
    partner2,
    weddingDate,
    weddingTime: metadata.weddingTime || "15:00",
    venue,
    venueAddress: metadata.venueAddress || "",
    description: metadata.description || "",
    dressCode: metadata.dressCode || undefined,
    rsvpDeadline,
    plan,
  };
}
