import { NextRequest, NextResponse } from "next/server";
import { fulfillCheckoutSessionById } from "@/lib/fulfill-checkout";
import { isStripeEnabled } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Manjka session_id" }, { status: 400 });
  }

  if (!isStripeEnabled()) {
    return NextResponse.json(
      { error: "Stripe ni konfiguriran" },
      { status: 503 }
    );
  }

  try {
    const wedding = await fulfillCheckoutSessionById(sessionId);

    if (!wedding) {
      return NextResponse.json(
        { error: "Plačilo še ni potrjeno" },
        { status: 402 }
      );
    }

    return NextResponse.json({ slug: wedding.slug, id: wedding.id });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Napaka pri preverjanju plačila" },
      { status: 500 }
    );
  }
}
