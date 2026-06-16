"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import { Check, Heart, Users } from "lucide-react";
import type { MenuOption, GuestMenuChoice } from "@/types";

interface RSVPFormProps {
  weddingSlug: string;
  partner1: string;
  partner2: string;
  rsvpDeadline: string;
  menuOptions: MenuOption[];
  maxGuests: number;
}

function buildGuestMenus(
  count: number,
  contactName: string,
  existing: GuestMenuChoice[],
  defaultMenuId: string
): GuestMenuChoice[] {
  return Array.from({ length: count }, (_, i) => ({
    name: existing[i]?.name || (i === 0 ? contactName : ""),
    menuId: existing[i]?.menuId || defaultMenuId,
    allergies: existing[i]?.allergies || "",
  }));
}

export default function RSVPForm({
  weddingSlug,
  partner1,
  partner2,
  rsvpDeadline,
  menuOptions,
  maxGuests,
}: RSVPFormProps) {
  const defaultMenuId = menuOptions[0]?.id || "mesni";
  const guestNumbers = Array.from({ length: maxGuests }, (_, i) => i + 1);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [guestMenus, setGuestMenus] = useState<GuestMenuChoice[]>([
    { name: "", menuId: defaultMenuId, allergies: "" },
  ]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setGuestMenus((prev) =>
      buildGuestMenus(guestCount, name, prev, defaultMenuId)
    );
  }, [guestCount, name, defaultMenuId]);

  const updateGuest = (index: number, updates: Partial<GuestMenuChoice>) => {
    setGuestMenus((prev) =>
      prev.map((g, i) => (i === index ? { ...g, ...updates } : g))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email || undefined,
          attending: attending ?? false,
          guestCount,
          guestMenus: attending
            ? guestMenus.map((g, i) => ({
                ...g,
                name: g.name || (i === 0 ? name : `Gost ${i + 1}`),
              }))
            : [],
          message,
        }),
      });
      if (res.ok) setSubmitted(true);
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Napaka pri pošiljanju. Poskusite znova.");
      }
    } catch {
      alert("Napaka pri pošiljanju. Poskusite znova.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-sage-light/50 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-sage-dark" />
        </div>
        <h3 className="font-serif text-3xl text-charcoal mb-3">Hvala za odgovor!</h3>
        <p className="text-warm-gray">
          {attending
            ? `Veselimo se, da bomo skupaj s ${partner1} in ${partner2} proslavili ta poseben dan.`
            : "Žal nam je, da ne morete priti. Hvala, da ste nas obvestili."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-sm text-warm-gray">
          Prosimo, potrdite svojo udeležbo do{" "}
          <strong className="text-charcoal">
            {new Date(rsvpDeadline).toLocaleDateString("sl-SI", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </strong>
        </p>
      </div>

      <Input
        label="Ime družine / kontaktna oseba"
        placeholder="npr. družina Novak"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        label="E-pošta (neobvezno)"
        type="email"
        placeholder="ana@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-charcoal mb-3">
          Ali boste prisotni?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAttending(true)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              attending === true
                ? "border-sage bg-sage-light/20"
                : "border-cream-dark hover:border-sage-light"
            }`}
          >
            <Heart
              className={`w-5 h-5 mx-auto mb-1 ${
                attending === true ? "text-sage fill-sage/20" : "text-warm-gray"
              }`}
            />
            <span className="text-sm font-medium">Da, pridem!</span>
          </button>
          <button
            type="button"
            onClick={() => setAttending(false)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              attending === false
                ? "border-rose bg-rose-light/20"
                : "border-cream-dark hover:border-rose-light"
            }`}
          >
            <span className="text-sm font-medium">Žal ne morem</span>
          </button>
        </div>
      </div>

      {attending && (
        <>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-3">
              <Users className="w-4 h-4 inline mr-1 text-sage" />
              Število oseb (vključno z vami) — do {maxGuests}
            </label>
            <div className="flex flex-wrap gap-2">
              {guestNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setGuestCount(n)}
                  className={`w-11 h-11 rounded-xl border-2 font-medium transition-all ${
                    guestCount === n
                      ? "border-sage bg-sage text-white"
                      : "border-cream-dark hover:border-sage-light"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-charcoal">
              Izbira menija za vsakega gosta
            </p>
            {guestMenus.map((guest, index) => (
              <div
                key={index}
                className="rounded-xl border border-cream-dark p-4 space-y-3 bg-white/50"
              >
                <p className="text-sm font-medium text-sage-dark">
                  {index === 0 ? "Kontaktna oseba" : `Gost ${index + 1}`}
                </p>

                {index > 0 && (
                  <Input
                    label="Ime (neobvezno)"
                    placeholder={`npr. ime gosta ${index + 1}`}
                    value={guest.name}
                    onChange={(e) => updateGuest(index, { name: e.target.value })}
                  />
                )}

                <div>
                  <label className="block text-xs text-warm-gray mb-2">Meni</label>
                  <div className="grid grid-cols-2 gap-2">
                    {menuOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateGuest(index, { menuId: opt.id })}
                        className={`p-2.5 rounded-lg border-2 text-xs transition-all ${
                          guest.menuId === opt.id
                            ? "border-sage bg-sage-light/20"
                            : "border-cream-dark hover:border-sage-light"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Alergije (neobvezno)"
                  placeholder="npr. brez glutena..."
                  value={guest.allergies || ""}
                  onChange={(e) =>
                    updateGuest(index, { allergies: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </>
      )}

      <Textarea
        label="Sporočilo mladoporočencema (neobvezno)"
        placeholder="Vaše čestitke ali sporočilo..."
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <Button
        type="submit"
        className="w-full"
        disabled={loading || attending === null || !name.trim()}
      >
        {loading ? "Pošiljam..." : "Potrdi odgovor"}
      </Button>
    </form>
  );
}
