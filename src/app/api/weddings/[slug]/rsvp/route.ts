import { NextRequest, NextResponse } from "next/server";
import { getWeddingBySlug, createRSVP, seedDemoData } from "@/lib/db";
import type { RSVPInput } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    seedDemoData();
    const { slug } = await params;
    const wedding = getWeddingBySlug(slug);

    if (!wedding) {
      return NextResponse.json({ error: "Poroka ni najdena" }, { status: 404 });
    }

    const body: RSVPInput = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Ime in e-pošta sta obvezna" },
        { status: 400 }
      );
    }

    const rsvp = createRSVP(wedding.id, {
      name: body.name,
      email: body.email,
      attending: body.attending,
      guestCount: body.attending ? body.guestCount : 0,
      menuChoice: body.menuChoice,
      allergies: body.allergies || "",
      message: body.message || "",
    });

    return NextResponse.json({ rsvp });
  } catch {
    return NextResponse.json(
      { error: "Napaka pri shranjevanju RSVP" },
      { status: 500 }
    );
  }
}
