"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import { Plus, Trash2, Save, Settings } from "lucide-react";
import type { Wedding, MenuOption, WeddingSettingsInput } from "@/types";

interface WeddingSettingsProps {
  wedding: Wedding;
  onSaved: (wedding: Wedding) => void;
}

function slugifyId(label: string): string {
  const map: Record<string, string> = {
    č: "c", ć: "c", š: "s", ž: "z", đ: "d",
  };
  return label
    .toLowerCase()
    .replace(/[čćšžđ]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 30) || "meni";
}

export default function WeddingSettingsPanel({
  wedding,
  onSaved,
}: WeddingSettingsProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<WeddingSettingsInput>({
    expectedGuests: wedding.expectedGuests,
    maxGuestsPerRsvp: wedding.maxGuestsPerRsvp ?? 8,
    menuOptions: wedding.menuOptions || [],
    description: wedding.description,
    dressCode: wedding.dressCode || "",
    rsvpDeadline: wedding.rsvpDeadline,
    venue: wedding.venue,
    venueAddress: wedding.venueAddress,
    weddingTime: wedding.weddingTime,
  });

  const updateMenu = (index: number, updates: Partial<MenuOption>) => {
    const menus = [...(form.menuOptions || [])];
    menus[index] = { ...menus[index], ...updates };
    if (updates.label && !menus[index].id) {
      menus[index].id = slugifyId(updates.label);
    }
    setForm({ ...form, menuOptions: menus });
  };

  const addMenu = () => {
    const menus = [...(form.menuOptions || [])];
    const n = menus.length + 1;
    menus.push({ id: `meni_${n}`, label: `Meni ${n}` });
    setForm({ ...form, menuOptions: menus });
  };

  const removeMenu = (index: number) => {
    const menus = (form.menuOptions || []).filter((_, i) => i !== index);
    setForm({ ...form, menuOptions: menus });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/weddings/${wedding.slug}/manage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.wedding) {
        onSaved(data.wedding);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(data.error || "Napaka pri shranjevanju.");
      }
    } catch {
      alert("Napaka pri shranjevanju.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 space-y-8">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-sage" />
        <h2 className="font-serif text-2xl text-charcoal">Nastavitve strani</h2>
      </div>

      {/* Evidenca gostov */}
      <section className="space-y-4">
        <h3 className="font-medium text-charcoal">Evidenca gostov</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Pričakovano število gostov (za vašo evidenco)"
            type="number"
            min={0}
            placeholder="npr. 80"
            value={form.expectedGuests ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                expectedGuests: e.target.value
                  ? parseInt(e.target.value, 10)
                  : undefined,
              })
            }
          />
          <Input
            label="Največ oseb na en RSVP (družina)"
            type="number"
            min={1}
            max={12}
            value={form.maxGuestsPerRsvp ?? 8}
            onChange={(e) =>
              setForm({
                ...form,
                maxGuestsPerRsvp: parseInt(e.target.value, 10) || 8,
              })
            }
          />
        </div>
        <p className="text-xs text-warm-gray">
          Pričakovano število je samo za vaš pregled (npr. 80 vabljenih). Gostje lahko
          na en obrazec potrdijo do {form.maxGuestsPerRsvp ?? 8} oseb — vsaka z lastnim menijem.
        </p>
      </section>

      {/* Meniji */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-charcoal">Meniji za goste</h3>
          <Button type="button" variant="outline" size="sm" onClick={addMenu}>
            <Plus className="w-4 h-4" />
            Dodaj meni
          </Button>
        </div>
        <div className="space-y-3">
          {(form.menuOptions || []).map((menu, index) => (
            <div
              key={index}
              className="flex gap-3 items-end p-3 rounded-xl bg-white/60 border border-cream-dark"
            >
              <div className="flex-1">
                <Input
                  label={index === 0 ? "Ime menija" : undefined}
                  value={menu.label}
                  onChange={(e) => updateMenu(index, { label: e.target.value })}
                  placeholder="npr. Mesni meni"
                />
              </div>
              <div className="w-32">
                <Input
                  label={index === 0 ? "ID" : undefined}
                  value={menu.id}
                  onChange={(e) => updateMenu(index, { id: e.target.value })}
                  placeholder="mesni"
                />
              </div>
              {(form.menuOptions?.length || 0) > 1 && (
                <button
                  type="button"
                  onClick={() => removeMenu(index)}
                  className="p-2 text-rose hover:bg-rose-light/30 rounded-lg mb-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Podatki o poroki */}
      <section className="space-y-4">
        <h3 className="font-medium text-charcoal">Podatki na strani</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Čas"
            value={form.weddingTime || ""}
            onChange={(e) => setForm({ ...form, weddingTime: e.target.value })}
          />
          <Input
            label="RSVP rok"
            type="date"
            value={form.rsvpDeadline || ""}
            onChange={(e) => setForm({ ...form, rsvpDeadline: e.target.value })}
          />
          <Input
            label="Lokacija"
            className="sm:col-span-2"
            value={form.venue || ""}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
          />
          <Input
            label="Naslov lokacije"
            className="sm:col-span-2"
            value={form.venueAddress || ""}
            onChange={(e) => setForm({ ...form, venueAddress: e.target.value })}
          />
        </div>
        <Textarea
          label="Opis / vabilo"
          rows={3}
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          label="Dress code"
          value={form.dressCode || ""}
          onChange={(e) => setForm({ ...form, dressCode: e.target.value })}
        />
      </section>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? "Shranjujem..." : "Shrani nastavitve"}
        </Button>
        {saved && (
          <span className="text-sm text-sage-dark">Shranjeno!</span>
        )}
      </div>
    </div>
  );
}
