import { NextRequest, NextResponse } from "next/server";
import { getWeddingBySlug, seedDemoData } from "@/lib/db";

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

  const { clerkUserId: _owner, stripeSessionId: _session, ...publicWedding } =
    wedding;

  return NextResponse.json({ wedding: publicWedding });
}
