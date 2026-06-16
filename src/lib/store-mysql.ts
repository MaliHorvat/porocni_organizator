import mysql from "mysql2/promise";
import { getDatabaseUrl } from "./store-types";
import type { WeddingStore } from "./store-types";
import type { Wedding, RSVP, Photo } from "@/types";

let pool: mysql.Pool | null = null;

export function toMysqlDatetime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function getPool() {
  if (!pool) {
    const url = getDatabaseUrl();
    if (!url) throw new Error("MySQL povezava ni konfigurirana");
    pool = mysql.createPool({
      uri: url,
      waitForConnections: true,
      connectionLimit: 5,
      connectTimeout: 15_000,
      enableKeepAlive: true,
    });
  }
  return pool;
}

function formatDate(val: unknown): string {
  if (val instanceof Date) return val.toISOString().split("T")[0];
  return String(val).split("T")[0];
}

function rowToWedding(row: Record<string, unknown>): Wedding {
  return {
    id: row.id as string,
    slug: row.slug as string,
    partner1: row.partner1 as string,
    partner2: row.partner2 as string,
    weddingDate: formatDate(row.wedding_date),
    weddingTime: row.wedding_time as string,
    venue: row.venue as string,
    venueAddress: row.venue_address as string,
    description: (row.description as string) || "",
    dressCode: (row.dress_code as string) || undefined,
    rsvpDeadline: formatDate(row.rsvp_deadline),
    galleryEnabled: Boolean(row.gallery_enabled),
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
    plan: row.plan as "basic" | "premium",
    clerkUserId: (row.clerk_user_id as string) || undefined,
    stripeSessionId: (row.stripe_session_id as string) || undefined,
    paymentStatus: row.payment_status as "paid" | undefined,
  };
}

export async function initMysqlSchema() {
  const db = getPool();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS weddings (
      id VARCHAR(36) PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      partner1 VARCHAR(255) NOT NULL,
      partner2 VARCHAR(255) NOT NULL,
      wedding_date DATE NOT NULL,
      wedding_time VARCHAR(10) NOT NULL,
      venue VARCHAR(255) NOT NULL,
      venue_address VARCHAR(500) NOT NULL,
      description TEXT,
      dress_code VARCHAR(255),
      rsvp_deadline DATE NOT NULL,
      gallery_enabled BOOLEAN DEFAULT FALSE,
      plan VARCHAR(20) NOT NULL,
      clerk_user_id VARCHAR(255),
      stripe_session_id VARCHAR(255) UNIQUE,
      payment_status VARCHAR(20),
      created_at DATETIME NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id VARCHAR(36) PRIMARY KEY,
      wedding_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      attending BOOLEAN NOT NULL,
      guest_count INT NOT NULL,
      menu_choice VARCHAR(20) NOT NULL,
      allergies TEXT,
      message TEXT,
      created_at DATETIME NOT NULL,
      INDEX idx_rsvps_wedding (wedding_id)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS photos (
      id VARCHAR(36) PRIMARY KEY,
      wedding_id VARCHAR(36) NOT NULL,
      filename VARCHAR(255) NOT NULL,
      uploader_name VARCHAR(255) NOT NULL,
      caption TEXT,
      file_data LONGBLOB,
      created_at DATETIME NOT NULL,
      INDEX idx_photos_wedding (wedding_id)
    )
  `);
}

export function createMysqlStore(): WeddingStore {
  return {
    async getWeddings() {
      const [rows] = await getPool().execute("SELECT * FROM weddings");
      return (rows as Record<string, unknown>[]).map(rowToWedding);
    },
    async getWeddingBySlug(slug) {
      const [rows] = await getPool().execute(
        "SELECT * FROM weddings WHERE slug = ? LIMIT 1",
        [slug]
      );
      const row = (rows as Record<string, unknown>[])[0];
      return row ? rowToWedding(row) : undefined;
    },
    async getWeddingById(id) {
      const [rows] = await getPool().execute(
        "SELECT * FROM weddings WHERE id = ? LIMIT 1",
        [id]
      );
      const row = (rows as Record<string, unknown>[])[0];
      return row ? rowToWedding(row) : undefined;
    },
    async getWeddingByStripeSession(sessionId) {
      const [rows] = await getPool().execute(
        "SELECT * FROM weddings WHERE stripe_session_id = ? LIMIT 1",
        [sessionId]
      );
      const row = (rows as Record<string, unknown>[])[0];
      return row ? rowToWedding(row) : undefined;
    },
    async getWeddingsByClerkUserId(clerkUserId) {
      const [rows] = await getPool().execute(
        "SELECT * FROM weddings WHERE clerk_user_id = ?",
        [clerkUserId]
      );
      return (rows as Record<string, unknown>[]).map(rowToWedding);
    },
    async createWedding(wedding) {
      await getPool().execute(
        `INSERT INTO weddings (id, slug, partner1, partner2, wedding_date, wedding_time,
          venue, venue_address, description, dress_code, rsvp_deadline, gallery_enabled,
          plan, clerk_user_id, stripe_session_id, payment_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          wedding.id,
          wedding.slug,
          wedding.partner1,
          wedding.partner2,
          wedding.weddingDate,
          wedding.weddingTime,
          wedding.venue,
          wedding.venueAddress,
          wedding.description || "",
          wedding.dressCode || null,
          wedding.rsvpDeadline,
          wedding.galleryEnabled,
          wedding.plan,
          wedding.clerkUserId || null,
          wedding.stripeSessionId || null,
          wedding.paymentStatus || null,
          toMysqlDatetime(wedding.createdAt),
        ]
      );
      return wedding;
    },
    async saveWeddings() {
      throw new Error("saveWeddings not supported for MySQL");
    },
    async getRSVPs(weddingId) {
      const [rows] = weddingId
        ? await getPool().execute("SELECT * FROM rsvps WHERE wedding_id = ?", [weddingId])
        : await getPool().execute("SELECT * FROM rsvps");
      return (rows as Record<string, unknown>[]).map((row) => ({
        id: row.id as string,
        weddingId: row.wedding_id as string,
        name: row.name as string,
        email: row.email as string,
        attending: Boolean(row.attending),
        guestCount: row.guest_count as number,
        menuChoice: row.menu_choice as RSVP["menuChoice"],
        allergies: (row.allergies as string) || "",
        message: (row.message as string) || "",
        createdAt: row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
      }));
    },
    async createRSVP(rsvp) {
      await getPool().execute(
        `INSERT INTO rsvps (id, wedding_id, name, email, attending, guest_count,
          menu_choice, allergies, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rsvp.id,
          rsvp.weddingId,
          rsvp.name,
          rsvp.email,
          rsvp.attending,
          rsvp.guestCount,
          rsvp.menuChoice,
          rsvp.allergies,
          rsvp.message,
          toMysqlDatetime(rsvp.createdAt),
        ]
      );
      return rsvp;
    },
    async saveRSVPs() {
      throw new Error("saveRSVPs not supported for MySQL");
    },
    async getPhotos(weddingId) {
      const [rows] = weddingId
        ? await getPool().execute(
            "SELECT id, wedding_id, filename, uploader_name, caption, created_at FROM photos WHERE wedding_id = ?",
            [weddingId]
          )
        : await getPool().execute(
            "SELECT id, wedding_id, filename, uploader_name, caption, created_at FROM photos"
          );
      return (rows as Record<string, unknown>[]).map((row) => ({
        id: row.id as string,
        weddingId: row.wedding_id as string,
        filename: row.filename as string,
        uploaderName: row.uploader_name as string,
        caption: (row.caption as string) || "",
        createdAt: row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
      }));
    },
    async createPhoto(photo, fileData) {
      await getPool().execute(
        `INSERT INTO photos (id, wedding_id, filename, uploader_name, caption, file_data, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          photo.id,
          photo.weddingId,
          photo.filename,
          photo.uploaderName,
          photo.caption,
          fileData || null,
          toMysqlDatetime(photo.createdAt),
        ]
      );
      return photo;
    },
    async getPhotoData(photoId) {
      const [rows] = await getPool().execute(
        "SELECT file_data FROM photos WHERE id = ? LIMIT 1",
        [photoId]
      );
      const row = (rows as Record<string, unknown>[])[0];
      if (!row?.file_data) return null;
      return Buffer.from(row.file_data as Buffer);
    },
    async savePhotos() {
      throw new Error("savePhotos not supported for MySQL");
    },
  };
}
