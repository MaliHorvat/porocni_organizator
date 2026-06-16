import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  getWeddingBySlug,
  createPhoto,
  getUploadsDir,
  seedDemoData,
} from "@/lib/db";

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

    if (!wedding.galleryEnabled) {
      return NextResponse.json(
        { error: "Galerija ni omogočena za ta paket" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const uploaderName = (formData.get("uploaderName") as string) || "Anonimen";
    const caption = (formData.get("caption") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "Datoteka je obvezna" }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".jpg";
    const filename = `${uuidv4()}${ext}`;
    const uploadDir = getUploadsDir(wedding.id);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const photo = createPhoto(wedding.id, filename, uploaderName, caption);
    return NextResponse.json({ photo: { id: photo.id, uploaderName: photo.uploaderName } });
  } catch {
    return NextResponse.json(
      { error: "Napaka pri nalaganju fotografije" },
      { status: 500 }
    );
  }
}
