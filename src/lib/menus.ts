import type { MenuOption, RSVP } from "@/types";

export const DEFAULT_MENU_OPTIONS: MenuOption[] = [
  { id: "mesni", label: "Mesni meni" },
  { id: "vegi", label: "Vegetarijanski" },
  { id: "veganski", label: "Veganski" },
  { id: "otroski", label: "Otroški meni" },
];

export const MAX_GUESTS_PER_RSVP = 8;

export function getMenuOptions(wedding: {
  menuOptions?: MenuOption[];
}): MenuOption[] {
  return wedding.menuOptions?.length ? wedding.menuOptions : DEFAULT_MENU_OPTIONS;
}

export function getMenuLabel(
  menuId: string,
  options: MenuOption[]
): string {
  return options.find((o) => o.id === menuId)?.label ?? menuId;
}

export function countMenusFromRsvps(
  rsvps: RSVP[],
  options: MenuOption[]
): { label: string; count: number }[] {
  const counts: Record<string, number> = {};

  for (const rsvp of rsvps) {
    if (!rsvp.attending) continue;
    for (const guest of rsvp.guestMenus) {
      counts[guest.menuId] = (counts[guest.menuId] || 0) + 1;
    }
  }

  return Object.entries(counts).map(([menuId, count]) => ({
    label: getMenuLabel(menuId, options),
    count,
  }));
}

export function normalizeGuestMenus(rsvp: RSVP): RSVP["guestMenus"] {
  if (rsvp.guestMenus?.length) return rsvp.guestMenus;

  const count = rsvp.attending ? Math.max(rsvp.guestCount, 1) : 0;
  const legacyMenu = rsvp.menuChoice || "mesni";

  return Array.from({ length: count }, (_, i) => ({
    name: i === 0 ? rsvp.name : `Gost ${i + 1}`,
    menuId: legacyMenu,
    allergies: i === 0 ? rsvp.allergies || "" : "",
  }));
}
