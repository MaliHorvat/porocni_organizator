import Link from "next/link";
import Button from "@/components/Button";
import {
  ArrowRight,
  Users,
  UtensilsCrossed,
  QrCode,
  Check,
  Heart,
} from "lucide-react";

function BrowserFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-cream-dark/80 bg-white">
      <div className="flex items-center gap-2 px-4 py-3 bg-cream border-b border-cream-dark">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-light" />
          <span className="w-3 h-3 rounded-full bg-amber-200" />
          <span className="w-3 h-3 rounded-full bg-sage-light" />
        </div>
        <p className="text-[11px] text-warm-gray ml-2 truncate flex-1 text-center pr-12">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

export default function DemoShowcase() {
  return (
    <section className="relative py-20 bg-white border-t border-cream-dark/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-sage-dark uppercase tracking-widest mb-3">
            Predogled
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal mb-4">
            Tako izgleda vaša poročna stran
          </h2>
          <p className="text-warm-gray max-w-xl mx-auto">
            Elegantna stran za goste, preprost obrazec za potrditev in pregleden portal
            za vas — vse povezano.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Wedding page mock */}
          <BrowserFrame title="maja-in-luka.poroka.si">
            <div className="bg-gradient-to-b from-rose-light/30 to-cream p-6 min-h-[220px] text-center">
              <p className="text-[10px] tracking-[0.2em] uppercase text-sage-dark mb-3">
                Vabimo vas na poroko
              </p>
              <p className="font-serif text-2xl text-charcoal">Maja</p>
              <p className="font-serif text-lg text-rose-dark my-1">&</p>
              <p className="font-serif text-2xl text-charcoal">Luka</p>
              <p className="text-xs text-warm-gray mt-4">12. september 2026 · ob 15:00</p>
              <div className="mt-5 inline-flex items-center gap-1 bg-white/80 rounded-full px-3 py-1 text-[10px] text-sage-dark">
                <Heart className="w-3 h-3 fill-rose/30 text-rose" />
                Potrditev udeležbe
              </div>
            </div>
          </BrowserFrame>

          {/* RSVP mock */}
          <BrowserFrame title="RSVP obrazec za goste">
            <div className="p-5 bg-cream min-h-[220px]">
              <p className="font-serif text-lg text-charcoal mb-4">Potrditev udeležbe</p>
              <div className="space-y-2.5">
                <div className="h-8 bg-white rounded-lg border border-cream-dark" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-sage-light/40 rounded-lg border-2 border-sage text-[10px] flex items-center justify-center text-sage-dark font-medium">
                    Da, pridem!
                  </div>
                  <div className="h-10 bg-white rounded-lg border border-cream-dark" />
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={`w-7 h-7 rounded-md text-[10px] flex items-center justify-center ${
                        n === 2
                          ? "bg-sage text-white"
                          : "bg-white border border-cream-dark text-warm-gray"
                      }`}
                    >
                      {n}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="h-7 bg-sage-light/30 rounded-md border border-sage/30 text-[9px] flex items-center justify-center text-sage-dark">
                    Mesni
                  </div>
                  <div className="h-7 bg-white rounded-md border border-cream-dark text-[9px] flex items-center justify-center text-warm-gray">
                    Vegi
                  </div>
                </div>
                <div className="h-8 bg-sage rounded-lg flex items-center justify-center text-[10px] text-white font-medium">
                  Potrdi odgovor
                </div>
              </div>
            </div>
          </BrowserFrame>

          {/* Portal mock */}
          <BrowserFrame title="Portal za poročenca">
            <div className="p-5 bg-cream min-h-[220px]">
              <p className="font-serif text-lg text-charcoal mb-1">Maja & Luka</p>
              <p className="text-[10px] text-warm-gray mb-4">Upravljanje poročne strani</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: Users, val: "47", label: "Gostov" },
                  { icon: Check, val: "18", label: "Prihaja" },
                  { icon: UtensilsCrossed, val: "12", label: "Vegi" },
                ].map(({ icon: Icon, val, label }) => (
                  <div
                    key={label}
                    className="bg-white rounded-lg p-2 text-center border border-cream-dark"
                  >
                    <Icon className="w-3 h-3 text-sage mx-auto mb-1" />
                    <p className="font-serif text-sm text-charcoal">{val}</p>
                    <p className="text-[8px] text-warm-gray">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg p-3 border border-cream-dark flex items-center gap-3">
                <div className="w-12 h-12 bg-charcoal rounded p-1 shrink-0">
                  <QrCode className="w-full h-full text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-charcoal">QR koda za vabilo</p>
                  <p className="text-[9px] text-warm-gray">Natisni na vabila</p>
                </div>
              </div>
            </div>
          </BrowserFrame>
        </div>

        <div className="mt-12 text-center">
          <Link href="/maja-in-luka">
            <Button size="lg" variant="outline">
              Odpri živi demo
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="text-xs text-warm-gray mt-3">
            Preizkusite stran gosta, RSVP obrazec in portal — brez registracije.
          </p>
        </div>
      </div>
    </section>
  );
}
