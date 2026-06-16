import fs from "fs";
import path from "path";
import type { WeddingStore } from "./store-types";
import type { Wedding, RSVP, Photo } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const WEDDINGS_FILE = path.join(DATA_DIR, "weddings.json");
const RSVPS_FILE = path.join(DATA_DIR, "rsvps.json");
const PHOTOS_FILE = path.join(DATA_DIR, "photos.json");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
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

export function createJsonStore(): WeddingStore {
  return {
    async getWeddings() {
      return readJson<Wedding[]>(WEDDINGS_FILE, []);
    },
    async getWeddingBySlug(slug) {
      const weddings = readJson<Wedding[]>(WEDDINGS_FILE, []);
      return weddings.find((w) => w.slug === slug);
    },
    async getWeddingById(id) {
      const weddings = readJson<Wedding[]>(WEDDINGS_FILE, []);
      return weddings.find((w) => w.id === id);
    },
    async getWeddingByStripeSession(sessionId) {
      const weddings = readJson<Wedding[]>(WEDDINGS_FILE, []);
      return weddings.find((w) => w.stripeSessionId === sessionId);
    },
    async getWeddingsByClerkUserId(clerkUserId) {
      const weddings = readJson<Wedding[]>(WEDDINGS_FILE, []);
      return weddings.filter((w) => w.clerkUserId === clerkUserId);
    },
    async createWedding(wedding) {
      const weddings = readJson<Wedding[]>(WEDDINGS_FILE, []);
      weddings.push(wedding);
      writeJson(WEDDINGS_FILE, weddings);
      return wedding;
    },
    async updateWedding(id, updates) {
      const weddings = readJson<Wedding[]>(WEDDINGS_FILE, []);
      const index = weddings.findIndex((w) => w.id === id);
      if (index === -1) return undefined;
      weddings[index] = { ...weddings[index], ...updates };
      writeJson(WEDDINGS_FILE, weddings);
      return weddings[index];
    },
    async saveWeddings(weddings) {
      writeJson(WEDDINGS_FILE, weddings);
    },
    async getRSVPs(weddingId) {
      const rsvps = readJson<RSVP[]>(RSVPS_FILE, []);
      return weddingId ? rsvps.filter((r) => r.weddingId === weddingId) : rsvps;
    },
    async createRSVP(rsvp) {
      const rsvps = readJson<RSVP[]>(RSVPS_FILE, []);
      rsvps.push(rsvp);
      writeJson(RSVPS_FILE, rsvps);
      return rsvp;
    },
    async saveRSVPs(rsvps) {
      writeJson(RSVPS_FILE, rsvps);
    },
    async getPhotos(weddingId) {
      const photos = readJson<Photo[]>(PHOTOS_FILE, []);
      return weddingId ? photos.filter((p) => p.weddingId === weddingId) : photos;
    },
    async createPhoto(photo, fileData?) {
      const photos = readJson<Photo[]>(PHOTOS_FILE, []);
      photos.push(photo);
      writeJson(PHOTOS_FILE, photos);

      if (fileData) {
        const dir = path.join(DATA_DIR, "uploads", photo.weddingId);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, photo.filename), fileData);
      }

      return photo;
    },
    async getPhotoData(photoId) {
      const photos = readJson<Photo[]>(PHOTOS_FILE, []);
      const photo = photos.find((p) => p.id === photoId);
      if (!photo) return null;
      try {
        const filePath = path.join(DATA_DIR, "uploads", photo.weddingId, photo.filename);
        return fs.readFileSync(filePath);
      } catch {
        return null;
      }
    },
    async savePhotos(photos) {
      writeJson(PHOTOS_FILE, photos);
    },
  };
}
