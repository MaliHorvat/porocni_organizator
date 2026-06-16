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
}

export interface RSVP {
  id: string;
  weddingId: string;
  name: string;
  email: string;
  attending: boolean;
  guestCount: number;
  menuChoice: "mesni" | "vegi" | "veganski" | "otroski";
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

export interface RSVPInput {
  name: string;
  email: string;
  attending: boolean;
  guestCount: number;
  menuChoice: "mesni" | "vegi" | "veganski" | "otroski";
  allergies: string;
  message: string;
}
