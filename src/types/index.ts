export interface MenuOption {
  id: string;
  label: string;
}

export interface GuestMenuChoice {
  name: string;
  menuId: string;
  allergies?: string;
}

export interface Wedding {
  id: string;
  slug: string;
  partner1: string;
  partner2: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  venueAddress: string;
  description: string;
  dressCode?: string;
  rsvpDeadline: string;
  galleryEnabled: boolean;
  createdAt: string;
  plan: "basic" | "premium";
  clerkUserId?: string;
  stripeSessionId?: string;
  paymentStatus?: "paid";
  expectedGuests?: number;
  maxGuestsPerRsvp?: number;
  menuOptions?: MenuOption[];
}

export interface RSVP {
  id: string;
  weddingId: string;
  name: string;
  email: string;
  attending: boolean;
  guestCount: number;
  /** @deprecated Uporabi guestMenus */
  menuChoice?: string;
  guestMenus: GuestMenuChoice[];
  allergies: string;
  message: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  weddingId: string;
  filename: string;
  uploaderName: string;
  caption: string;
  createdAt: string;
}

export interface CreateWeddingInput {
  partner1: string;
  partner2: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  venueAddress: string;
  description: string;
  dressCode?: string;
  rsvpDeadline: string;
  plan: "basic" | "premium";
}

export interface WeddingSettingsInput {
  expectedGuests?: number;
  maxGuestsPerRsvp?: number;
  menuOptions?: MenuOption[];
  description?: string;
  dressCode?: string;
  rsvpDeadline?: string;
  venue?: string;
  venueAddress?: string;
  weddingTime?: string;
}

export interface RSVPInput {
  name: string;
  email?: string;
  attending: boolean;
  guestCount: number;
  guestMenus: GuestMenuChoice[];
  allergies?: string;
  message?: string;
}
