import { NextRequest, NextResponse } from "next/server";
import { getWeddingBySlug, createRSVP, seedDemoData } from "@/lib/db";
import { getMenuOptions } from "@/lib/menus";
import type { RSVPInput } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await seedDemoData();
    const { slug } = await params;
    const wedding = await getWeddingBySlug(slug);

    if (!wedding) {
      return NextResponse.json({ error: "Poroka ni najdena" }, { status: 404 });
    }

    const body: RSVPInput = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Ime je obvezno" }, { status: 400 });
    }

    const maxGuests = wedding.maxGuestsPerRsvp ?? 8;

    if (body.attending) {
      if (body.guestCount < 1 || body.guestCount > maxGuests) {
        return NextResponse.json(
          { error: `Število oseb mora biti med 1 in ${maxGuests}` },
          { status: 400 }
        );
      }

      if (!body.guestMenus?.length || body.guestMenus.length !== body.guestCount) {
        return NextResponse.json(
          { error: "Izberite meni za vsakega gosta" },
          { status: 400 }
        );
      }

      const menuIds = new Set(getMenuOptions(wedding).map((m) => m.id));
      for (const guest of body.guestMenus) {
        if (!menuIds.has(guest.menuId)) {
          return NextResponse.json({ error: "Neveljaven meni" }, { status: 400 });
        }
      }
    }

    const guestMenus = body.attending
      ? body.guestMenus.map((g, i) => ({
          name: g.name?.trim() || (i === 0 ? body.name.trim() : `Gost ${i + 1}`),
          menuId: g.menuId,
          allergies: g.allergies?.trim() || "",
        }))
      : [];

    const rsvp = await createRSVP(wedding.id, {
      name: body.name.trim(),
      email: body.email?.trim() || "",
      attending: body.attending,
      guestCount: body.attending ? body.guestCount : 0,
      guestMenus,
      menuChoice: guestMenus[0]?.menuId,
      allergies: guestMenus.map((g) => g.allergies).filter(Boolean).join("; "),
      message: body.message?.trim() || "",
    });

    return NextResponse.json({ rsvp });
  } catch {
    return NextResponse.json(
      { error: "Napaka pri shranjevanju RSVP" },
      { status: 500 }
    );
  }
}
