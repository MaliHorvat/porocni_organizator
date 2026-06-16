"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import Button from "@/components/Button";
import {
  ArrowLeft,
  Users,
  UtensilsCrossed,
  Download,
  ExternalLink,
  Check,
  X,
  Settings,
  BarChart3,
  FileDown,
} from "lucide-react";
import type { Wedding, RSVP, Photo } from "@/types";
import { formatShortDate } from "@/lib/utils";
import { countMenusFromRsvps, getMenuLabel, getMenuOptions } from "@/lib/menus";
import PrivateGallery from "@/components/PrivateGallery";
import WeddingSettingsPanel from "@/components/WeddingSettings";

type Tab = "pregled" | "nastavitve";

function exportRsvpsCsv(
  rsvps: RSVP[],
  wedding: Wedding,
  menuOptions: ReturnType<typeof getMenuOptions>
) {
  const headers = [
    "Ime",
    "E-pošta",
    "Status",
    "Št. oseb",
    "Gostje in meniji",
    "Alergije",
    "Sporočilo",
    "Datum",
  ];
  const rows = rsvps.map((r) => {
    const guests = r.guestMenus
      .map(
        (g) =>
          `${g.name}: ${getMenuLabel(g.menuId, menuOptions)}${
            g.allergies ? ` (${g.allergies})` : ""
          }`
      )
      .join(" | ");
    return [
      r.name,
      r.email || "",
      r.attending ? "Prihaja" : "Ne prihaja",
      r.attending ? String(r.guestCount) : "0",
      guests,
      r.allergies || "",
      r.message || "",
      new Date(r.createdAt).toLocaleDateString("sl-SI"),
    ];
  });

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rsvp-${wedding.slug}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ManagementPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pageUrl, setPageUrl] = useState("");
  const [accessError, setAccessError] = useState("");
  const [tab, setTab] = useState<Tab>("pregled");

  useEffect(() => {
    setPageUrl(`${window.location.origin}/${slug}`);
    fetch(`/api/weddings/${slug}/manage`)
      .then((r) => r.json())
      .then((data) => {
        if (data.wedding) {
          setWedding(data.wedding);
          setRsvps(data.rsvps || []);
          setPhotos(data.photos || []);
        } else {
          setAccessError(data.error || "Nimate dostopa do te strani.");
        }
      });
  }, [slug]);

  if (accessError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <div className="text-center max-w-md">
          <p className="text-rose-dark mb-4">{accessError}</p>
          <Link href="/prijava">
            <Button>Prijava</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-warm-gray">Nalagam...</p>
      </div>
    );
  }

  const menuOptions = getMenuOptions(wedding);
  const attending = rsvps.filter((r) => r.attending);
  const notAttending = rsvps.filter((r) => !r.attending);
  const totalGuests = attending.reduce((sum, r) => sum + r.guestCount, 0);
  const menuBreakdown = countMenusFromRsvps(attending, menuOptions);
  const expected = wedding.expectedGuests;
  const progressPct =
    expected && expected > 0
      ? Math.min(100, Math.round((totalGuests / expected) * 100))
      : null;

  const downloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx?.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = `qr-${slug}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link
          href="/moje-poroke"
          className="inline-flex items-center gap-2 text-sm text-warm-gray hover:text-charcoal mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Moje poroke
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-charcoal">
              {wedding.partner1} & {wedding.partner2}
            </h1>
            <p className="text-warm-gray mt-1">Portal za poročenca</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/${slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4" />
                Odpri stran
              </Button>
            </Link>
            {rsvps.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportRsvpsCsv(rsvps, wedding, menuOptions)}
              >
                <FileDown className="w-4 h-4" />
                Izvozi CSV
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-cream-dark pb-1">
          <button
            type="button"
            onClick={() => setTab("pregled")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === "pregled"
                ? "text-sage-dark border-b-2 border-sage -mb-[3px]"
                : "text-warm-gray hover:text-charcoal"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Pregled
          </button>
          <button
            type="button"
            onClick={() => setTab("nastavitve")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === "nastavitve"
                ? "text-sage-dark border-b-2 border-sage -mb-[3px]"
                : "text-warm-gray hover:text-charcoal"
            }`}
          >
            <Settings className="w-4 h-4" />
            Nastavitve
          </button>
        </div>

        {tab === "nastavitve" ? (
          <WeddingSettingsPanel
            wedding={wedding}
            onSaved={(updated) => setWedding(updated)}
          />
        ) : (
          <>
            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="glass-card rounded-2xl p-6">
                <Users className="w-5 h-5 text-sage mb-2" />
                <p className="text-3xl font-serif text-charcoal">{totalGuests}</p>
                <p className="text-sm text-warm-gray">Potrjenih gostov</p>
                {expected != null && expected > 0 && (
                  <p className="text-xs text-sage-dark mt-1">
                    od {expected} pričakovanih ({progressPct}%)
                  </p>
                )}
              </div>
              <div className="glass-card rounded-2xl p-6">
                <Check className="w-5 h-5 text-sage mb-2" />
                <p className="text-3xl font-serif text-charcoal">{attending.length}</p>
                <p className="text-sm text-warm-gray">Družin prihaja</p>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <X className="w-5 h-5 text-rose mb-2" />
                <p className="text-3xl font-serif text-charcoal">{notAttending.length}</p>
                <p className="text-sm text-warm-gray">Ne prihaja</p>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <UtensilsCrossed className="w-5 h-5 text-sage mb-2" />
                <p className="text-3xl font-serif text-charcoal">
                  {menuBreakdown.reduce((s, m) => s + m.count, 0)}
                </p>
                <p className="text-sm text-warm-gray">Menijev izbranih</p>
              </div>
            </div>

            {progressPct != null && (
              <div className="glass-card rounded-2xl p-6 mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-charcoal font-medium">Napredek potrditev</span>
                  <span className="text-warm-gray">
                    {totalGuests} / {expected} gostov
                  </span>
                </div>
                <div className="h-3 bg-cream-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sage rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass-card rounded-2xl p-8">
                <h2 className="font-serif text-2xl text-charcoal mb-4">
                  QR koda za vabilo
                </h2>
                <p className="text-sm text-warm-gray mb-6">
                  Natisnite QR kodo na vabila. Gostje jo skenirajo in pridejo na vašo
                  stran.
                </p>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <QRCodeSVG id="qr-code" value={pageUrl} size={200} level="H" />
                  </div>
                </div>
                <p className="text-center text-sm text-warm-gray mb-4 break-all">
                  {pageUrl}
                </p>
                <Button variant="outline" className="w-full" onClick={downloadQR}>
                  <Download className="w-4 h-4" />
                  Prenesi QR kodo
                </Button>
              </div>

              <div className="glass-card rounded-2xl p-8">
                <h2 className="font-serif text-2xl text-charcoal mb-4">
                  <UtensilsCrossed className="w-5 h-5 inline mr-2 text-sage" />
                  Pregled menijev
                </h2>
                {menuBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {menuBreakdown.map(({ label, count }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between py-2 border-b border-cream-dark last:border-0"
                      >
                        <span className="text-charcoal">{label}</span>
                        <span className="font-serif text-xl text-sage-dark">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-warm-gray text-sm">Še ni odzivov.</p>
                )}
              </div>
            </div>

            {/* RSVP List */}
            <div className="glass-card rounded-2xl p-8 mt-8">
              <h2 className="font-serif text-2xl text-charcoal mb-6">
                Vsi odzivi ({rsvps.length})
              </h2>

              {rsvps.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-cream-dark text-left text-warm-gray">
                        <th className="pb-3 pr-4 font-medium">Kontakt</th>
                        <th className="pb-3 pr-4 font-medium">Status</th>
                        <th className="pb-3 pr-4 font-medium">Osebe</th>
                        <th className="pb-3 pr-4 font-medium">Gostje in meniji</th>
                        <th className="pb-3 font-medium">Sporočilo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rsvps.map((rsvp) => (
                        <tr
                          key={rsvp.id}
                          className="border-b border-cream-dark/50 last:border-0 align-top"
                        >
                          <td className="py-3 pr-4">
                            <p className="font-medium text-charcoal">{rsvp.name}</p>
                            {rsvp.email && (
                              <p className="text-xs text-warm-gray">{rsvp.email}</p>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                rsvp.attending
                                  ? "bg-sage-light/50 text-sage-dark"
                                  : "bg-rose-light/50 text-rose-dark"
                              }`}
                            >
                              {rsvp.attending ? "Prihaja" : "Ne prihaja"}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-charcoal">
                            {rsvp.attending ? rsvp.guestCount : "—"}
                          </td>
                          <td className="py-3 pr-4 text-charcoal text-xs space-y-1">
                            {rsvp.attending ? (
                              rsvp.guestMenus.map((g, i) => (
                                <div key={i}>
                                  <span className="font-medium">{g.name}</span>:{" "}
                                  {getMenuLabel(g.menuId, menuOptions)}
                                  {g.allergies && (
                                    <span className="text-rose-dark">
                                      {" "}
                                      ({g.allergies})
                                    </span>
                                  )}
                                </div>
                              ))
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 text-warm-gray text-xs max-w-[180px]">
                            {rsvp.message || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-warm-gray text-center py-8">
                  Še ni odzivov. Delite QR kodo z gosti!
                </p>
              )}
            </div>

            <div className="glass-card rounded-2xl p-8 mt-8">
              <h2 className="font-serif text-2xl text-charcoal mb-4">Podatki o poroki</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-warm-gray">Datum</p>
                  <p className="text-charcoal font-medium">
                    {formatShortDate(wedding.weddingDate)} ob {wedding.weddingTime}
                  </p>
                </div>
                <div>
                  <p className="text-warm-gray">Lokacija</p>
                  <p className="text-charcoal font-medium">{wedding.venue}</p>
                </div>
                <div>
                  <p className="text-warm-gray">RSVP rok</p>
                  <p className="text-charcoal font-medium">
                    {formatShortDate(wedding.rsvpDeadline)}
                  </p>
                </div>
                <div>
                  <p className="text-warm-gray">Paket</p>
                  <p className="text-charcoal font-medium capitalize">{wedding.plan}</p>
                </div>
              </div>
            </div>

            {wedding.galleryEnabled && (
              <PrivateGallery weddingSlug={slug} photos={photos} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
