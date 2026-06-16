import { notFound } from "next/navigation";
import { getWeddingBySlug, seedDemoData } from "@/lib/db";
import { formatDate, daysUntil } from "@/lib/utils";
import RSVPForm from "@/components/RSVPForm";
import GalleryUpload from "@/components/GalleryUpload";
import { MapPin, Clock, Calendar, Shirt } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  seedDemoData();
  const { slug } = await params;
  const wedding = getWeddingBySlug(slug);
  if (!wedding) return { title: "Stran ni najdena" };
  return {
    title: `${wedding.partner1} & ${wedding.partner2} — Poroka`,
    description: wedding.description,
  };
}

export default async function WeddingPage({ params }: Props) {
  seedDemoData();
  const { slug } = await params;
  const wedding = getWeddingBySlug(slug);

  if (!wedding) notFound();

  const days = daysUntil(wedding.weddingDate);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center gradient-wedding overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-80 h-80 bg-rose-light rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-sage-light rounded-full blur-3xl" />
        </div>

        <div className="relative text-center px-6 py-20">
          <p className="text-sm tracking-[0.3em] uppercase text-sage-dark mb-6">
            Vabimo vas na poroko
          </p>

          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl font-light text-charcoal leading-none">
            {wedding.partner1}
          </h1>
          <p className="font-serif text-3xl sm:text-4xl text-rose-dark my-4">&</p>
          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl font-light text-charcoal leading-none">
            {wedding.partner2}
          </h1>

          <div className="mt-10 flex flex-col items-center gap-2">
            <p className="font-serif text-2xl text-charcoal">
              {formatDate(wedding.weddingDate)}
            </p>
            <p className="text-warm-gray">ob {wedding.weddingTime}</p>
          </div>

          {days > 0 && (
            <div className="mt-8 inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-5 py-2 rounded-full text-sm text-sage-dark">
              <Calendar className="w-4 h-4" />
              Še {days} {days === 1 ? "dan" : days === 2 ? "dneva" : days <= 4 ? "dnevi" : "dni"}
            </div>
          )}
        </div>
      </section>

      {/* Details */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          {wedding.description && (
            <p className="font-serif text-2xl text-charcoal leading-relaxed mb-12 text-balance">
              {wedding.description}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 text-left">
              <MapPin className="w-5 h-5 text-sage mb-3" />
              <h3 className="font-serif text-xl text-charcoal mb-1">{wedding.venue}</h3>
              <p className="text-warm-gray text-sm">{wedding.venueAddress}</p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-left">
              <Clock className="w-5 h-5 text-sage mb-3" />
              <h3 className="font-serif text-xl text-charcoal mb-1">Čas</h3>
              <p className="text-warm-gray text-sm">
                {formatDate(wedding.weddingDate)} ob {wedding.weddingTime}
              </p>
            </div>
            {wedding.dressCode && (
              <div className="glass-card rounded-2xl p-6 text-left sm:col-span-2">
                <Shirt className="w-5 h-5 text-sage mb-3" />
                <h3 className="font-serif text-xl text-charcoal mb-1">Dress code</h3>
                <p className="text-warm-gray text-sm">{wedding.dressCode}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RSVP */}
      <section className="py-20 bg-cream" id="rsvp">
        <div className="max-w-lg mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-serif text-4xl text-charcoal mb-3">Potrditev udeležbe</h2>
            <p className="text-warm-gray">Prosimo, sporočite nam, ali boste z nami.</p>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <RSVPForm
              weddingSlug={wedding.slug}
              partner1={wedding.partner1}
              partner2={wedding.partner2}
              rsvpDeadline={wedding.rsvpDeadline}
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      {wedding.galleryEnabled && (
        <GalleryUpload weddingSlug={wedding.slug} enabled={wedding.galleryEnabled} />
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-warm-gray bg-white border-t border-cream-dark">
        <p>
          {wedding.partner1} & {wedding.partner2} · {new Date(wedding.weddingDate).getFullYear()}
        </p>
      </footer>
    </div>
  );
}
