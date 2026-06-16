import { NextRequest, NextResponse } from "next/server";
import { fulfillCheckoutSessionById } from "@/lib/fulfill-checkout";
import { isStripeEnabled } from "@/lib/stripe";
import { isProductionWithoutDatabase } from "@/lib/store-types";

function getVerifyErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (isProductionWithoutDatabase()) {
    return "Baza podatkov ni nastavljena na Vercelu. Dodaj DATABASE_URL v Environment Variables.";
  }

  if (
    message.includes("MySQL povezava ni konfigurirana") ||
    message.includes("Neoserv MySQL")
  ) {
    return "Baza podatkov ni povezana. Preveri DATABASE_URL na Vercelu.";
  }

  if (
    message.includes("ECONNREFUSED") ||
    message.includes("ETIMEDOUT") ||
    message.includes("ENOTFOUND") ||
    message.includes("connect")
  ) {
    return "Ne morem se povezati z MySQL bazo. Preveri Remote MySQL v cPanel (% kot host) in IP strežnika.";
  }

  if (message.includes("Access denied")) {
    return "Napačen uporabnik ali geslo za bazo. Preveri DATABASE_URL.";
  }

  if (message.includes("Manjkajo podatki poroke")) {
    return "Manjkajo podatki poroke v Stripe. Poskusi znova ustvariti stran.";
  }

  if (message.includes("No such checkout.session")) {
    return "Neveljaven ID plačila.";
  }

  return "Napaka pri preverjanju plačila. Poskusi znova čez minuto.";
}

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

  if (isProductionWithoutDatabase()) {
    return NextResponse.json(
      {
        error:
          "Baza podatkov ni nastavljena na Vercelu. Dodaj DATABASE_URL v Environment Variables.",
      },
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
      { error: getVerifyErrorMessage(error) },
      { status: 500 }
    );
  }
}
