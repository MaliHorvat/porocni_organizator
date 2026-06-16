import { clerkClient } from "@clerk/nextjs/server";
import { isClerkEnabled } from "@/lib/auth";

interface WeddingRef {
  slug: string;
  id: string;
}

export async function linkWeddingToUser(
  clerkUserId: string,
  slug: string,
  weddingId: string
) {
  if (!isClerkEnabled()) return;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    const existing = (user.privateMetadata?.weddings as WeddingRef[]) || [];

    if (existing.some((w) => w.slug === slug)) return;

    await client.users.updateUserMetadata(clerkUserId, {
      privateMetadata: {
        weddings: [...existing, { slug, id: weddingId }],
      },
    });
  } catch (error) {
    console.error("Clerk metadata sync error:", error);
  }
}

export async function getWeddingRefsFromClerk(
  clerkUserId: string
): Promise<WeddingRef[]> {
  if (!isClerkEnabled()) return [];

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    return (user.privateMetadata?.weddings as WeddingRef[]) || [];
  } catch {
    return [];
  }
}
