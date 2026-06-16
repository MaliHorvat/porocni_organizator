import type { Wedding, RSVP, Photo } from "@/types";

export interface WeddingStore {
  getWeddings(): Promise<Wedding[]>;
  getWeddingBySlug(slug: string): Promise<Wedding | undefined>;
  getWeddingById(id: string): Promise<Wedding | undefined>;
  getWeddingByStripeSession(sessionId: string): Promise<Wedding | undefined>;
  getWeddingsByClerkUserId(clerkUserId: string): Promise<Wedding[]>;
  createWedding(wedding: Wedding): Promise<Wedding>;
  saveWeddings(weddings: Wedding[]): Promise<void>;

  getRSVPs(weddingId?: string): Promise<RSVP[]>;
  createRSVP(rsvp: RSVP): Promise<RSVP>;
  saveRSVPs(rsvps: RSVP[]): Promise<void>;

  getPhotos(weddingId?: string): Promise<Photo[]>;
  createPhoto(photo: Photo, fileData?: Buffer): Promise<Photo>;
  getPhotoData(photoId: string): Promise<Buffer | null>;
  savePhotos(photos: Photo[]): Promise<void>;
}

export type StoreBackend = "mysql" | "json";

export function getDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DATABASE_HOST;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const name = process.env.DATABASE_NAME;

  if (host && user && password && name) {
    const port = process.env.DATABASE_PORT || "3306";
    return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
  }

  return undefined;
}

export function getStoreBackend(): StoreBackend {
  if (getDatabaseUrl()) return "mysql";
  return "json";
}

export function isProductionWithoutDatabase(): boolean {
  return process.env.VERCEL === "1" && !getDatabaseUrl();
}
