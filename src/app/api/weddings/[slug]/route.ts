import { NextRequest, NextResponse } from "next/server";
import { getWeddingBySlug, getRSVPs, getPhotos, seedDemoData } from "@/lib/db";

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

  const rsvps = getRSVPs(wedding.id);
  const photos = getPhotos(wedding.id);

  return NextResponse.json({ wedding, rsvps, photos });
}
