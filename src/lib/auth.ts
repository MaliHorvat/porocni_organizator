import { auth } from "@clerk/nextjs/server";
import type { Wedding } from "@/types";

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
  if (!canAccessWedding(wedding, userId)) {
    return null;
  }
  return userId;
}
