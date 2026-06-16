import { NextRequest, NextResponse } from "next/server";
import {
  getWeddingBySlug,
  getRSVPs,
  getPhotos,
  seedDemoData,
} from "@/lib/db";
import { requireWeddingAccess } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  seedDemoData();
  const { slug } = await params;
  const wedding = getWeddingBySlug(slug);

  if (!wedding) {
    return NextResponse.json({ error: "Poroka ni najdena" }, { status: 404 });
  }

  const userId = await requireWeddingAccess(wedding);
  if (!userId) {
    return NextResponse.json({ error: "Nimate dostopa" }, { status: 403 });
  }

  const rsvps = getRSVPs(wedding.id);
  const photos = getPhotos(wedding.id);

  return NextResponse.json({ wedding, rsvps, photos });
}
