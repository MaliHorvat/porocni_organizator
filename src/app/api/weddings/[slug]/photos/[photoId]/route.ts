import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import {
  getWeddingBySlug,
  getPhotos,
  getUploadsDir,
  seedDemoData,
} from "@/lib/db";
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
  seedDemoData();
  const { slug, photoId } = await params;
  const wedding = getWeddingBySlug(slug);

  if (!wedding) {
    return NextResponse.json({ error: "Poroka ni najdena" }, { status: 404 });
  }

  const userId = await requireWeddingAccess(wedding);
  if (!userId) {
    return NextResponse.json({ error: "Nimate dostopa" }, { status: 403 });
  }

  const photo = getPhotos(wedding.id).find((p) => p.id === photoId);
  if (!photo) {
    return NextResponse.json({ error: "Fotografija ni najdena" }, { status: 404 });
  }

  try {
    const filePath = path.join(getUploadsDir(wedding.id), photo.filename);
    const buffer = await readFile(filePath);
    const ext = path.extname(photo.filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Fotografija ni na voljo" },
      { status: 404 }
    );
  }
}
