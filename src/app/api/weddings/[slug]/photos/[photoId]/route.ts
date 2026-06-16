import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getWeddingBySlug, getPhotos, getPhotoFile, seedDemoData } from "@/lib/db";
import { requireWeddingAccess } from "@/lib/auth";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; photoId: string }> }
) {
  await seedDemoData();
  const { slug, photoId } = await params;
  const wedding = await getWeddingBySlug(slug);

  if (!wedding) {
    return NextResponse.json({ error: "Poroka ni najdena" }, { status: 404 });
  }

  const userId = await requireWeddingAccess(wedding);
  if (!userId) {
    return NextResponse.json({ error: "Nimate dostopa" }, { status: 403 });
  }

  const photo = (await getPhotos(wedding.id)).find((p) => p.id === photoId);
  if (!photo) {
    return NextResponse.json({ error: "Fotografija ni najdena" }, { status: 404 });
  }

  const buffer = await getPhotoFile(wedding.id, photo.filename);
  if (!buffer) {
    return NextResponse.json(
      { error: "Fotografija ni na voljo" },
      { status: 404 }
    );
  }

  const ext = path.extname(
    photo.filename.startsWith("poroka/") ? ".jpg" : photo.filename
  ).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
