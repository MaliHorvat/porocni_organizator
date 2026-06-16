import { NextRequest, NextResponse } from "next/server";
import {
  getWeddingBySlug,
  getRSVPs,
  getPhotos,
  seedDemoData,
} from "@/lib/db";
import { requireWeddingAccess, getAuthUserId } from "@/lib/auth";

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
