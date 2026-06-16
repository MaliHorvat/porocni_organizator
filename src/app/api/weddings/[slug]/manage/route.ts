import { NextRequest, NextResponse } from "next/server";
import {
  getWeddingBySlug,
  getRSVPs,
  getPhotos,
  updateWeddingSettings,
  seedDemoData,
} from "@/lib/db";
import { requireWeddingAccess } from "@/lib/auth";
import type { WeddingSettingsInput } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await seedDemoData();
  const { slug } = await params;
  const wedding = await getWeddingBySlug(slug);

  if (!wedding) {
    return NextResponse.json({ error: "Poroka ni najdena" }, { status: 404 });
  }

  const userId = await requireWeddingAccess(wedding);
  if (!userId) {
    return NextResponse.json({ error: "Nimate dostopa" }, { status: 403 });
  }

  const rsvps = await getRSVPs(wedding.id);
  const photos = await getPhotos(wedding.id);

  return NextResponse.json({ wedding, rsvps, photos });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await seedDemoData();
  const { slug } = await params;
  const wedding = await getWeddingBySlug(slug);

  if (!wedding) {
    return NextResponse.json({ error: "Poroka ni najdena" }, { status: 404 });
  }

  const userId = await requireWeddingAccess(wedding);
  if (!userId) {
    return NextResponse.json({ error: "Nimate dostopa" }, { status: 403 });
  }

  const body: WeddingSettingsInput = await request.json();

  if (body.menuOptions) {
    const valid = body.menuOptions.every(
      (m) => m.id?.trim() && m.label?.trim()
    );
    if (!valid || body.menuOptions.length < 1) {
      return NextResponse.json(
        { error: "Vsak meni potrebuje ID in ime" },
        { status: 400 }
      );
    }
  }

  if (body.maxGuestsPerRsvp != null) {
    if (body.maxGuestsPerRsvp < 1 || body.maxGuestsPerRsvp > 12) {
      return NextResponse.json(
        { error: "Največ gostov na odziv: 1–12" },
        { status: 400 }
      );
    }
  }

  const updated = await updateWeddingSettings(wedding.id, body);
  return NextResponse.json({ wedding: updated });
}
