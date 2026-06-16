import { NextRequest, NextResponse } from "next/server";
import { createWedding, seedDemoData } from "@/lib/db";
import { getAuthUserId, isClerkEnabled } from "@/lib/auth";
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

    const wedding = createWedding(body, { clerkUserId: clerkUserId || undefined });
    return NextResponse.json({ slug: wedding.slug, id: wedding.id });
  } catch {
    return NextResponse.json(
      { error: "Napaka pri ustvarjanju poroke" },
      { status: 500 }
    );
  }
}
