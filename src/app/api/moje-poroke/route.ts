import { NextResponse } from "next/server";
import {
  getWeddingsByClerkUserId,
  getWeddingBySlug,
  updateWeddingClerkId,
  seedDemoData,
} from "@/lib/db";
import { getAuthUserId, isClerkEnabled } from "@/lib/auth";
import { getWeddingRefsFromClerk } from "@/lib/clerk-sync";
import type { Wedding } from "@/types";

export async function GET() {
  await seedDemoData();

  const clerkUserId = await getAuthUserId();
  if (isClerkEnabled() && !clerkUserId) {
    return NextResponse.json({ error: "Potrebna je prijava" }, { status: 401 });
  }

  if (!clerkUserId) {
    return NextResponse.json({ weddings: [] });
  }

  let weddings = await getWeddingsByClerkUserId(clerkUserId);

  if (weddings.length === 0) {
    const refs = await getWeddingRefsFromClerk(clerkUserId);
    const fromClerk = await Promise.all(
      refs.map((ref) => getWeddingBySlug(ref.slug))
    );
    weddings = fromClerk.filter(Boolean) as Wedding[];

    for (const wedding of weddings) {
      if (!wedding.clerkUserId) {
        await updateWeddingClerkId(wedding.id, clerkUserId);
      }
    }
  }

  return NextResponse.json({
    weddings: weddings.map((w) => ({
      slug: w.slug,
      partner1: w.partner1,
      partner2: w.partner2,
      weddingDate: w.weddingDate,
      plan: w.plan,
    })),
  });
}
