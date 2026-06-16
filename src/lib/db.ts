import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getStore } from "@/lib/store";
import { getStoreBackend } from "@/lib/store-types";
import { linkWeddingToUser } from "@/lib/clerk-sync";
import { DEFAULT_MENU_OPTIONS, MAX_GUESTS_PER_RSVP } from "@/lib/menus";
import type { Wedding, RSVP, Photo, CreateWeddingInput, WeddingSettingsInput } from "@/types";

const LOCAL_UPLOADS = path.join(process.cwd(), "data", "uploads");

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
    maxGuestsPerRsvp: MAX_GUESTS_PER_RSVP,
    menuOptions: DEFAULT_MENU_OPTIONS,
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

export async function updateWeddingSettings(
  weddingId: string,
  settings: WeddingSettingsInput
) {
  const store = await getStore();
  return store.updateWedding(weddingId, settings);
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

export async function uploadPhoto(
  weddingId: string,
  filename: string,
  buffer: Buffer,
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
  await store.createPhoto(photo, buffer);
  return photo;
}

export async function getPhotoFile(photoId: string): Promise<Buffer | null> {
  const store = await getStore();
  return store.getPhotoData(photoId);
}

export function getUploadsDir(weddingId: string): string {
  const dir = path.join(LOCAL_UPLOADS, weddingId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function seedDemoData() {
  if (getStoreBackend() === "mysql") return;

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
    maxGuestsPerRsvp: MAX_GUESTS_PER_RSVP,
    menuOptions: DEFAULT_MENU_OPTIONS,
  };

  await store.createWedding(demo);
}
