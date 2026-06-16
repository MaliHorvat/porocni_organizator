import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import CreatePageLink from "@/components/CreatePageLink";
import {
  Heart,
  QrCode,
  UtensilsCrossed,
  Camera,
  Clock,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";
import { getWeddingBySlug, seedDemoData } from "@/lib/db";
import { PLANS, PROMO_DESCRIPTION } from "@/lib/stripe";

const features = [
  {
    icon: QrCode,
    title: "QR koda na vabilu",
    description:
      "Gostje skenirajo QR kodo in takoj pridejo na vašo stran — brez iskanja povezav.",
  },
  {
    icon: UtensilsCrossed,
    title: "RSVP in meniji",
    description:
      "Gostje potrdijo prihod, izberejo mesni ali vegi meni in napišejo alergije.",
  },
  {
    icon: Camera,
    title: "Galerija po poroki",
    description:
      "Gostje naložijo fotografije neposredno s telefona. Vse slike na enem mestu.",
  },
  {
    icon: Clock,
    title: "Pripravljeno v 15 minutah",
    description:
      "Izpolnite obrazec, izberite paket in vaša stran je takoj na voljo.",
  },
];

const plans = [
  {
    name: "Osnovni",
    price: PLANS.basic.priceLabel,
    compareAt: PLANS.basic.compareAtLabel,
    features: [
      "Unikatna poročna stran",
      "RSVP obrazec",
      "Izbira menija in alergije",
      "QR koda za vabilo",
      "Pregled odzivov",
    ],
    highlighted: false,
  },
  {
    name: "Premium",
    price: PLANS.premium.priceLabel,
    compareAt: PLANS.premium.compareAtLabel,
    features: [
      "Vse iz osnovnega paketa",
      "Galerija fotografij",
      "Nalaganje slik s strani gostov",
      "Prenos vseh fotografij",
      "Prednostna podpora",
    ],
    highlighted: true,
  },
];

const steps = [
  { num: "01", title: "Izpolnite podatke", desc: "Imeni, datum, lokacija in opis vaše poroke." },
  { num: "02", title: "Izberite paket", desc: "Osnovni za RSVP ali Premium z galerijo fotografij." },
  { num: "03", title: "Delite z gosti", desc: "Natisnite QR kodo na vabila in pošljite povezavo." },
];

export default async function HomePage() {
  await seedDemoData();

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-screen flex items-center gradient-wedding overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-rose-light rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-sage-light rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-sage-dark mb-8">
              <Sparkles className="w-4 h-4" />
              Digitalni poročni organizator
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-charcoal leading-tight text-balance">
              Vaša poroka,
              <br />
              <span className="italic text-rose-dark">ena stran</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-warm-gray max-w-2xl mx-auto text-balance">
              Ustvarite moderno poročno spletno stran z RSVP obrazcem in galerijo
              fotografij. Gostje potrdijo prihod, izberejo meni — vi pa imate vse
              pod kontrolo.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <CreatePageLink>
                <Button size="lg">
                  Ustvari svojo stran
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CreatePageLink>
              <Link href="/maja-in-luka">
                <Button variant="outline" size="lg">
                  Oglej si demo
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-warm-gray">
              Pripravljeno v 15 minutah · akcija od {PLANS.basic.priceLabel} € enkratno
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-serif text-4xl text-center text-charcoal mb-4">
              Kako deluje?
            </h2>
            <p className="text-center text-warm-gray mb-16 max-w-xl mx-auto">
              Tri preprosti koraki do vaše popolne poročne strani.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.num} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage-light/50 text-sage-dark font-serif text-2xl mb-6 group-hover:bg-sage group-hover:text-white transition-all duration-300">
                    {step.num}
                  </div>
                  <h3 className="font-serif text-2xl text-charcoal mb-3">{step.title}</h3>
                  <p className="text-warm-gray">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="funkcije" className="py-24 bg-cream">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-serif text-4xl text-center text-charcoal mb-4">
              Vse, kar potrebujete
            </h2>
            <p className="text-center text-warm-gray mb-16 max-w-xl mx-auto">
              Od RSVP-ja do galerije — eno mesto za celotno poročno izkušnjo.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="glass-card rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-sage-light/50 flex items-center justify-center mb-5">
                    <feature.icon className="w-6 h-6 text-sage-dark" />
                  </div>
                  <h3 className="font-serif text-2xl text-charcoal mb-3">{feature.title}</h3>
                  <p className="text-warm-gray leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="cenik" className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="font-serif text-4xl text-center text-charcoal mb-4">
              Preprosta cena
            </h2>
            <p className="text-center text-warm-gray mb-4 max-w-xl mx-auto">
              Enkratno plačilo brez naročnine. V poročnem proračunu zanemarljiv znesek.
            </p>
            <p className="text-center text-sm text-sage-dark font-medium mb-16 max-w-lg mx-auto bg-sage-light/30 rounded-full px-5 py-2">
              {PROMO_DESCRIPTION}
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-8 ${
                    plan.highlighted
                      ? "bg-charcoal text-cream ring-2 ring-rose scale-105 shadow-2xl"
                      : "glass-card"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="inline-block bg-rose text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
                      Najbolj priljubljen
                    </span>
                  )}
                  <span
                    className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 ${
                      plan.highlighted
                        ? "bg-rose/80 text-white"
                        : "bg-rose-light text-rose-dark"
                    } ${plan.highlighted ? "ml-2" : ""}`}
                  >
                    Akcija
                  </span>
                  <h3 className={`font-serif text-2xl mb-2 ${plan.highlighted ? "text-cream" : "text-charcoal"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mb-3 ${plan.highlighted ? "text-cream/70" : "text-sage-dark"}`}>
                    Akcijska cena
                  </p>
                  <div className="mb-6">
                    <span className={`font-serif text-5xl ${plan.highlighted ? "text-cream" : "text-charcoal"}`}>
                      {plan.price} €
                    </span>
                    <span className={`text-sm ml-2 line-through ${plan.highlighted ? "text-cream/40" : "text-warm-gray/60"}`}>
                      {plan.compareAt} €
                    </span>
                    <span className={`text-sm ml-2 ${plan.highlighted ? "text-cream/60" : "text-warm-gray"}`}>
                      enkratno
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 mt-0.5 shrink-0 ${plan.highlighted ? "text-rose-light" : "text-sage"}`} />
                        <span className={plan.highlighted ? "text-cream/80" : "text-warm-gray"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <CreatePageLink plan={plan.highlighted ? "premium" : "basic"}>
                    <Button
                      variant={plan.highlighted ? "secondary" : "primary"}
                      className="w-full"
                    >
                      Izberi {plan.name}
                    </Button>
                  </CreatePageLink>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 gradient-wedding relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <Heart className="w-10 h-10 text-rose mx-auto mb-6 fill-rose/20" />
            <h2 className="font-serif text-4xl sm:text-5xl text-charcoal mb-6 text-balance">
              Pripravljeni na vaš najlepši dan?
            </h2>
            <p className="text-warm-gray text-lg mb-10">
              Ustvarite svojo poročno stran še danes in se osredotočite na to, kar je res pomembno.
            </p>
            <CreatePageLink>
              <Button size="lg">
                Začni zdaj — 15 minut
                <ArrowRight className="w-5 h-5" />
              </Button>
            </CreatePageLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
