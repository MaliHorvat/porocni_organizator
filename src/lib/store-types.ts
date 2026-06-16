import type { Wedding, RSVP, Photo } from "@/types";

export interface WeddingStore {
  getWeddings(): Promise<Wedding[]>;
  getWeddingBySlug(slug: string): Promise<Wedding | undefined>;
  getWeddingById(id: string): Promise<Wedding | undefined>;
  getWeddingByStripeSession(sessionId: string): Promise<Wedding | undefined>;
  getWeddingsByClerkUserId(clerkUserId: string): Promise<Wedding[]>;
  createWedding(
    wedding: Wedding
  ): Promise<Wedding>;
  saveWeddings(weddings: Wedding[]): Promise<void>;

  getRSVPs(weddingId?: string): Promise<RSVP[]>;
  createRSVP(rsvp: RSVP): Promise<RSVP>;
  saveRSVPs(rsvps: RSVP[]): Promise<void>;

  getPhotos(weddingId?: string): Promise<Photo[]>;
  createPhoto(photo: Photo): Promise<Photo>;
  savePhotos(photos: Photo[]): Promise<void>;
}

export type StoreBackend = "mysql" | "blob" | "json";

export function getStoreBackend(): StoreBackend {
  if (process.env.DATABASE_URL) return "mysql";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return "json";
}
