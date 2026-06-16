import { auth } from "@clerk/nextjs/server";
import type { Wedding } from "@/types";
import { getWeddingRefsFromClerk } from "@/lib/clerk-sync";
import { updateWeddingClerkId } from "@/lib/db";

export function isClerkEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY
  );
}

export async function getAuthUserId(): Promise<string | null> {
  if (!isClerkEnabled()) return "demo-user";
  const { userId } = await auth();
  return userId;
}

export function canAccessWedding(
  wedding: Wedding,
  userId: string | null
): boolean {
  if (!isClerkEnabled()) return true;
  if (!userId) return false;
  if (!wedding.clerkUserId) return false;
  return wedding.clerkUserId === userId;
}

export async function requireWeddingAccess(
  wedding: Wedding
): Promise<string | null> {
  const userId = await getAuthUserId();
  if (!isClerkEnabled()) return userId || "demo-user";
  if (!userId) return null;

  if (wedding.clerkUserId === userId) return userId;

  const refs = await getWeddingRefsFromClerk(userId);
  const ownsViaMetadata = refs.some(
    (r) => r.slug === wedding.slug || r.id === wedding.id
  );

  if (ownsViaMetadata) {
    if (!wedding.clerkUserId) {
      await updateWeddingClerkId(wedding.id, userId);
    }
    return userId;
  }

  return null;
}
