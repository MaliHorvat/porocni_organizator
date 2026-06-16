import { head, put } from "@vercel/blob";
import type { WeddingStore } from "./store-types";
import type { Wedding, RSVP, Photo } from "@/types";

const WEDDINGS_KEY = "poroka/weddings.json";
const RSVPS_KEY = "poroka/rsvps.json";
const PHOTOS_KEY = "poroka/photos.json";

async function readBlob<T>(key: string, fallback: T): Promise<T> {
  try {
    const meta = await head(key);
    const res = await fetch(meta.url);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function writeBlob<T>(key: string, data: T): Promise<void> {
  await put(key, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export function createBlobStore(): WeddingStore {
  return {
    async getWeddings() {
      return readBlob<Wedding[]>(WEDDINGS_KEY, []);
    },
    async getWeddingBySlug(slug) {
      const weddings = await readBlob<Wedding[]>(WEDDINGS_KEY, []);
      return weddings.find((w) => w.slug === slug);
    },
    async getWeddingById(id) {
      const weddings = await readBlob<Wedding[]>(WEDDINGS_KEY, []);
      return weddings.find((w) => w.id === id);
    },
    async getWeddingByStripeSession(sessionId) {
      const weddings = await readBlob<Wedding[]>(WEDDINGS_KEY, []);
      return weddings.find((w) => w.stripeSessionId === sessionId);
    },
    async getWeddingsByClerkUserId(clerkUserId) {
      const weddings = await readBlob<Wedding[]>(WEDDINGS_KEY, []);
      return weddings.filter((w) => w.clerkUserId === clerkUserId);
    },
    async createWedding(wedding) {
      const weddings = await readBlob<Wedding[]>(WEDDINGS_KEY, []);
      weddings.push(wedding);
      await writeBlob(WEDDINGS_KEY, weddings);
      return wedding;
    },
    async saveWeddings(weddings) {
      await writeBlob(WEDDINGS_KEY, weddings);
    },
    async getRSVPs(weddingId) {
      const rsvps = await readBlob<RSVP[]>(RSVPS_KEY, []);
      return weddingId ? rsvps.filter((r) => r.weddingId === weddingId) : rsvps;
    },
    async createRSVP(rsvp) {
      const rsvps = await readBlob<RSVP[]>(RSVPS_KEY, []);
      rsvps.push(rsvp);
      await writeBlob(RSVPS_KEY, rsvps);
      return rsvp;
    },
    async saveRSVPs(rsvps) {
      await writeBlob(RSVPS_KEY, rsvps);
    },
    async getPhotos(weddingId) {
      const photos = await readBlob<Photo[]>(PHOTOS_KEY, []);
      return weddingId ? photos.filter((p) => p.weddingId === weddingId) : photos;
    },
    async createPhoto(photo) {
      const photos = await readBlob<Photo[]>(PHOTOS_KEY, []);
      photos.push(photo);
      await writeBlob(PHOTOS_KEY, photos);
      return photo;
    },
    async savePhotos(photos) {
      await writeBlob(PHOTOS_KEY, photos);
    },
  };
}
