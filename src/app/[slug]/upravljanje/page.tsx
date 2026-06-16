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
} from "lucide-react";
import type { Wedding, RSVP, Photo } from "@/types";
import { formatShortDate } from "@/lib/utils";
import PrivateGallery from "@/components/PrivateGallery";

export default function ManagementPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pageUrl, setPageUrl] = useState("");
  const [accessError, setAccessError] = useState("");

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

  const attending = rsvps.filter((r) => r.attending);
  const notAttending = rsvps.filter((r) => !r.attending);
  const totalGuests = attending.reduce((sum, r) => sum + r.guestCount, 0);
  const menuCounts = attending.reduce(
    (acc, r) => {
      acc[r.menuChoice] = (acc[r.menuChoice] || 0) + r.guestCount;
      return acc;
    },
    {} as Record<string, number>
  );

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
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-warm-gray hover:text-charcoal mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Nazaj na domačo stran
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-serif text-4xl text-charcoal">
              {wedding.partner1} & {wedding.partner2}
            </h1>
            <p className="text-warm-gray mt-1">Upravljanje poročne strani</p>
          </div>
          <Link href={`/${slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4" />
              Odpri stran
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="glass-card rounded-2xl p-6">
            <Users className="w-5 h-5 text-sage mb-2" />
            <p className="text-3xl font-serif text-charcoal">{totalGuests}</p>
            <p className="text-sm text-warm-gray">Potrjenih gostov</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <Check className="w-5 h-5 text-sage mb-2" />
            <p className="text-3xl font-serif text-charcoal">{attending.length}</p>
            <p className="text-sm text-warm-gray">Prihaja</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <X className="w-5 h-5 text-rose mb-2" />
            <p className="text-3xl font-serif text-charcoal">{notAttending.length}</p>
            <p className="text-sm text-warm-gray">Ne prihaja</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Code */}
          <div className="glass-card rounded-2xl p-8">
            <h2 className="font-serif text-2xl text-charcoal mb-4">QR koda za vabilo</h2>
            <p className="text-sm text-warm-gray mb-6">
              Natisnite to QR kodo na vabila. Gostje jo skenirajo in pridejo neposredno na vašo stran.
            </p>
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <QRCodeSVG id="qr-code" value={pageUrl} size={200} level="H" />
              </div>
            </div>
            <p className="text-center text-sm text-warm-gray mb-4 break-all">{pageUrl}</p>
            <Button variant="outline" className="w-full" onClick={downloadQR}>
              <Download className="w-4 h-4" />
              Prenesi QR kodo
            </Button>
          </div>

          {/* Menu breakdown */}
          <div className="glass-card rounded-2xl p-8">
            <h2 className="font-serif text-2xl text-charcoal mb-4">
              <UtensilsCrossed className="w-5 h-5 inline mr-2 text-sage" />
              Pregled menijev
            </h2>
            {Object.keys(menuCounts).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(menuCounts).map(([menu, count]) => (
                  <div key={menu} className="flex items-center justify-between py-2 border-b border-cream-dark last:border-0">
                    <span className="text-charcoal capitalize">
                      {menu === "mesni" ? "Mesni" : menu === "vegi" ? "Vegetarijanski" : menu === "veganski" ? "Veganski" : "Otroški"}
                    </span>
                    <span className="font-serif text-xl text-sage-dark">{count}</span>
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
          <h2 className="font-serif text-2xl text-charcoal mb-6">Vsi odzivi ({rsvps.length})</h2>

          {rsvps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cream-dark text-left text-warm-gray">
                    <th className="pb-3 pr-4 font-medium">Ime</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Osebe</th>
                    <th className="pb-3 pr-4 font-medium">Meni</th>
                    <th className="pb-3 font-medium">Alergije</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="border-b border-cream-dark/50 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-charcoal">{rsvp.name}</p>
                        <p className="text-xs text-warm-gray">{rsvp.email}</p>
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
                      <td className="py-3 pr-4 text-charcoal capitalize">
                        {rsvp.attending ? rsvp.menuChoice : "—"}
                      </td>
                      <td className="py-3 text-warm-gray text-xs max-w-[200px] truncate">
                        {rsvp.allergies || "—"}
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

        {/* Wedding info summary */}
        <div className="glass-card rounded-2xl p-8 mt-8">
          <h2 className="font-serif text-2xl text-charcoal mb-4">Podatki o poroki</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-warm-gray">Datum</p>
              <p className="text-charcoal font-medium">{formatShortDate(wedding.weddingDate)} ob {wedding.weddingTime}</p>
            </div>
            <div>
              <p className="text-warm-gray">Lokacija</p>
              <p className="text-charcoal font-medium">{wedding.venue}</p>
            </div>
            <div>
              <p className="text-warm-gray">RSVP rok</p>
              <p className="text-charcoal font-medium">{formatShortDate(wedding.rsvpDeadline)}</p>
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
      </div>
    </div>
  );
}
