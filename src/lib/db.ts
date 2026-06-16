import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getStore } from "@/lib/store";
import { getStoreBackend } from "@/lib/store-types";
import { linkWeddingToUser } from "@/lib/clerk-sync";
import type { Wedding, RSVP, Photo, CreateWeddingInput } from "@/types";

const LOCAL_UPLOADS = path.join(process.cwd(), "data", "uploads");
const TMP_UPLOADS = path.join("/tmp", "porocna-stran-uploads");

function slugify(text: string): string {
  const map: Record<string, string> = {
    č: "c", ć: "c", š: "s", ž: "z", đ: "d",
    Č: "c", Ć: "c", Š: "s", Ž: "z", Đ: "d",
  };
  return text
    .toLowerCase()
    .replace(/[čćšžđČĆŠŽĐ]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createSlug(
  partner1: string,
  partner2: string
): Promise<string> {
  const store = await getStore();
  const weddings = await store.getWeddings();
  const base = `${slugify(partner1)}-in-${slugify(partner2)}`;
  let slug = base;
  let counter = 1;
  while (weddings.some((w) => w.slug === slug)) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

export async function getWeddingBySlug(slug: string) {
  const store = await getStore();
  return store.getWeddingBySlug(slug);
}

export async function getWeddingByStripeSession(sessionId: string) {
  const store = await getStore();
  return store.getWeddingByStripeSession(sessionId);
}

export async function getWeddingsByClerkUserId(clerkUserId: string) {
  const store = await getStore();
  return store.getWeddingsByClerkUserId(clerkUserId);
}

export async function createWedding(
  input: CreateWeddingInput,
  options?: { stripeSessionId?: string; clerkUserId?: string }
) {
  const store = await getStore();

  if (options?.stripeSessionId) {
    const existing = await store.getWeddingByStripeSession(options.stripeSessionId);
    if (existing) return existing;
  }

  const wedding: Wedding = {
    id: uuidv4(),
    slug: await createSlug(input.partner1, input.partner2),
    ...input,
    galleryEnabled: input.plan === "premium",
    createdAt: new Date().toISOString(),
    ...(options?.clerkUserId ? { clerkUserId: options.clerkUserId } : {}),
    ...(options?.stripeSessionId
      ? { stripeSessionId: options.stripeSessionId, paymentStatus: "paid" as const }
      : {}),
  };

  await store.createWedding(wedding);

  if (options?.clerkUserId) {
    await linkWeddingToUser(options.clerkUserId, wedding.slug, wedding.id);
  }

  return wedding;
}

export async function getRSVPs(weddingId?: string) {
  const store = await getStore();
  return store.getRSVPs(weddingId);
}

export async function createRSVP(
  weddingId: string,
  data: Omit<RSVP, "id" | "weddingId" | "createdAt">
) {
  const store = await getStore();
  const rsvp: RSVP = {
    id: uuidv4(),
    weddingId,
    ...data,
    createdAt: new Date().toISOString(),
  };
  await store.createRSVP(rsvp);
  return rsvp;
}

export async function getPhotos(weddingId?: string) {
  const store = await getStore();
  return store.getPhotos(weddingId);
}

export async function createPhoto(
  weddingId: string,
  filename: string,
  uploaderName: string,
  caption: string
) {
  const store = await getStore();
  const photo: Photo = {
    id: uuidv4(),
    weddingId,
    filename,
    uploaderName,
    caption,
    createdAt: new Date().toISOString(),
  };
  await store.createPhoto(photo);
  return photo;
}

export async function savePhotoFile(
  weddingId: string,
  filename: string,
  buffer: Buffer
): Promise<string> {
  if (getStoreBackend() === "blob") {
    const key = `poroka/photos/${weddingId}/${filename}`;
    await put(key, buffer, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return key;
  }

  const dir = getUploadsDir(weddingId);
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return filename;
}

export async function getPhotoFile(
  weddingId: string,
  filename: string
): Promise<Buffer | null> {
  if (filename.startsWith("poroka/photos/")) {
    try {
      const { head } = await import("@vercel/blob");
      const meta = await head(filename);
      const res = await fetch(meta.url);
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  try {
    const filePath = path.join(getUploadsDir(weddingId), filename);
    return fs.readFileSync(filePath);
  } catch {
    return null;
  }
}

export function getUploadsDir(weddingId: string): string {
  const base =
    process.env.VERCEL === "1" && getStoreBackend() !== "blob"
      ? TMP_UPLOADS
      : LOCAL_UPLOADS;
  const dir = path.join(base, weddingId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function seedDemoData() {
  const store = await getStore();
  const weddings = await store.getWeddings();
  if (weddings.length > 0) return;

  const demo: Wedding = {
    id: "demo-wedding-001",
    slug: "maja-in-luka",
    partner1: "Maja",
    partner2: "Luka",
    weddingDate: "2026-09-12",
    weddingTime: "15:00",
    venue: "Grad Otočec",
    venueAddress: "Otočec 39, 8222 Otočec",
    description:
      "Z velikim veseljem vas vabimo, da z nami proslavite naš najlepši dan.",
    dressCode: "Elegantna priložnostna oblačila",
    rsvpDeadline: "2026-08-01",
    galleryEnabled: true,
    createdAt: new Date().toISOString(),
    plan: "premium",
  };

  await store.createWedding(demo);
}
