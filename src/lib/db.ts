import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { Wedding, RSVP, Photo, CreateWeddingInput } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const WEDDINGS_FILE = path.join(DATA_DIR, "weddings.json");
const RSVPS_FILE = path.join(DATA_DIR, "rsvps.json");
const PHOTOS_FILE = path.join(DATA_DIR, "photos.json");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  ensureDirs();
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
}

function writeJson<T>(file: string, data: T) {
  ensureDirs();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

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

export function createSlug(partner1: string, partner2: string): string {
  const base = `${slugify(partner1)}-in-${slugify(partner2)}`;
  const weddings = getWeddings();
  let slug = base;
  let counter = 1;
  while (weddings.some((w) => w.slug === slug)) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

export function getWeddings(): Wedding[] {
  return readJson<Wedding[]>(WEDDINGS_FILE, []);
}

export function getWeddingBySlug(slug: string): Wedding | undefined {
  return getWeddings().find((w) => w.slug === slug);
}

export function getWeddingById(id: string): Wedding | undefined {
  return getWeddings().find((w) => w.id === id);
}

export function createWedding(input: CreateWeddingInput): Wedding {
  const weddings = getWeddings();
  const wedding: Wedding = {
    id: uuidv4(),
    slug: createSlug(input.partner1, input.partner2),
    ...input,
    galleryEnabled: input.plan === "premium",
    createdAt: new Date().toISOString(),
  };
  weddings.push(wedding);
  writeJson(WEDDINGS_FILE, weddings);
  return wedding;
}

export function getRSVPs(weddingId?: string): RSVP[] {
  const rsvps = readJson<RSVP[]>(RSVPS_FILE, []);
  return weddingId ? rsvps.filter((r) => r.weddingId === weddingId) : rsvps;
}

export function createRSVP(
  weddingId: string,
  data: Omit<RSVP, "id" | "weddingId" | "createdAt">
): RSVP {
  const rsvps = getRSVPs();
  const rsvp: RSVP = {
    id: uuidv4(),
    weddingId,
    ...data,
    createdAt: new Date().toISOString(),
  };
  rsvps.push(rsvp);
  writeJson(RSVPS_FILE, rsvps);
  return rsvp;
}

export function getPhotos(weddingId?: string): Photo[] {
  const photos = readJson<Photo[]>(PHOTOS_FILE, []);
  return weddingId ? photos.filter((p) => p.weddingId === weddingId) : photos;
}

export function createPhoto(
  weddingId: string,
  filename: string,
  uploaderName: string,
  caption: string
): Photo {
  const photos = getPhotos();
  const photo: Photo = {
    id: uuidv4(),
    weddingId,
    filename,
    uploaderName,
    caption,
    createdAt: new Date().toISOString(),
  };
  photos.push(photo);
  writeJson(PHOTOS_FILE, photos);
  return photo;
}

export function getUploadsDir(weddingId: string): string {
  const dir = path.join(UPLOADS_DIR, weddingId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function seedDemoData() {
  const weddings = getWeddings();
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
      "Z velikim veseljem vas vabimo, da z nami proslavite naš najlepši dan. Po ceremoniji sledi slavnostna večerja in ples do jutranjih ur.",
    dressCode: "Elegantna priložnostna oblačila",
    rsvpDeadline: "2026-08-01",
    galleryEnabled: true,
    createdAt: new Date().toISOString(),
    plan: "premium",
  };

  writeJson(WEDDINGS_FILE, [demo]);
}
