import type { ComponentType } from "react";
import {
  ArrowRight,
  BedDouble,
  Clock3,
  FileCheck2,
  Headset,
  MapPin,
  Plane,
  PlaneTakeoff,
  Route,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/ImageCarousel";
import { SectionHeading, TextLinkCta } from "@/components/SectionPrimitives";
import { CUSTOM_PACKAGE, EASE_OUT, IMAGES } from "@/lib/constants";

type Inclusion = "flights" | "hotels" | "meals" | "visa" | "activities" | "concierge";

const INCLUSIONS: Record<Inclusion, { label: string; icon: ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  flights: { label: "Return Flights", icon: Plane },
  hotels: { label: "Hotels", icon: BedDouble },
  meals: { label: "Meals", icon: UtensilsCrossed },
  visa: { label: "Visa Assistance", icon: FileCheck2 },
  activities: { label: "Activities & Transfers", icon: Route },
  concierge: { label: "24×7 Concierge", icon: Headset },
};

interface Package {
  badge: string;
  title: string;
  duration: string;
  stay: string;
  price: string;
  discounted: string;
  saving: string;
  inclusions: Inclusion[];
  images: readonly string[];
  withFlight: boolean;
}

const WITHOUT_FLIGHT: Package[] = [
  {
    badge: "Best Seller",
    title: "Bali Escape",
    duration: "4 Nights / 5 Days",
    stay: "2N Kuta • 2N Ubud",
    price: "₹44,300",
    discounted: "₹27,500",
    saving: "₹16,800",
    inclusions: ["hotels", "meals", "activities", "concierge"],
    images: [IMAGES.palmBeach, IMAGES.riceTerrace, IMAGES.hero, IMAGES.resortPool, IMAGES.ubudJunglePool],
    withFlight: false,
  },
  {
    badge: "Most Popular",
    title: "Bali Relax & Explore",
    duration: "5 Nights / 6 Days",
    stay: "2N Seminyak • 3N Ubud",
    price: "₹62,700",
    discounted: "₹54,820",
    saving: "₹7,880",
    inclusions: ["hotels", "meals", "visa", "activities", "concierge"],
    images: [IMAGES.seminyakClub, IMAGES.ubudVillaAerial, IMAGES.villaPool, IMAGES.ubudField, IMAGES.sunsetPalms],
    withFlight: false,
  },
  {
    badge: "Great Value",
    title: "Bali Leisure Holiday",
    duration: "5 Nights / 6 Days",
    stay: "3N Seminyak • 2N Ubud",
    price: "₹56,800",
    discounted: "₹45,720",
    saving: "₹11,080",
    inclusions: ["hotels", "meals", "visa", "activities", "concierge"],
    images: [IMAGES.diamondBeach, IMAGES.beachCafe, IMAGES.ubudJunglePool, IMAGES.riceTerrace, IMAGES.goldenPalms],
    withFlight: false,
  },
];

const WITH_FLIGHT: Package[] = [
  {
    badge: "Best Value",
    title: "Bali Complete Holiday",
    duration: "6 Nights / 7 Days",
    stay: "3N Kuta • 3N Ubud",
    price: "₹1,12,500",
    discounted: "₹83,740",
    saving: "₹28,760",
    inclusions: ["flights", "hotels", "meals", "visa", "activities", "concierge"],
    images: [IMAGES.finalCta, IMAGES.tanahLot, IMAGES.resortPool, IMAGES.ubudField, IMAGES.agungDawn],
    withFlight: true,
  },
  {
    badge: "Most Popular",
    title: "Bali Premium Escape",
    duration: "6 Nights / 7 Days",
    stay: "2N Seminyak • 4N Ubud",
    price: "₹98,650",
    discounted: "₹81,999",
    saving: "₹16,651",
    inclusions: ["flights", "hotels", "meals", "visa", "activities", "concierge"],
    images: [IMAGES.coupleInfinityPool, IMAGES.ubudVillaAerial, IMAGES.villaPool, IMAGES.riceTerrace, IMAGES.uluwatuTemple],
    withFlight: true,
  },
  {
    badge: "Great Deal",
    title: "Bali Beach & Ubud Holiday",
    duration: "6 Nights / 7 Days",
    stay: "4N Seminyak • 2N Ubud",
    price: "₹84,700",
    discounted: "₹76,740",
    saving: "₹7,960",
    inclusions: ["flights", "hotels", "meals", "visa", "activities", "concierge"],
    images: [IMAGES.swimmers, IMAGES.seminyakClub, IMAGES.ubudResortPool, IMAGES.ubudField, IMAGES.sunsetPalms],
    withFlight: true,
  },
];

function PackageCard({ pkg, index, onQuote }: { pkg: Package; index: number; onQuote: (title: string, source: string) => void }) {
  const slug = `package-${index}`;
  return (
    <motion.article
      data-testid={`package-card-${index}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white border border-line-soft card-lift transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(11,29,58,0.22)]"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: EASE_OUT }}
    >
      <div className="relative">
        <ImageCarousel images={pkg.images} alt={pkg.title} testId={`${slug}-carousel`} />
        <span
          data-testid={`package-badge-${index}`}
          className="absolute left-4 top-4 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-navy shadow-sm"
        >
          {pkg.badge}
        </span>
        <span
          data-testid={`package-flight-label-${index}`}
          className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm ${
            pkg.withFlight ? "bg-teal-deep text-white" : "bg-navy/85 text-white backdrop-blur"
          }`}
        >
          <PlaneTakeoff className="size-3" />
          {pkg.withFlight ? "Flights Included" : "Without Flight"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-xl font-semibold tracking-tight text-navy leading-tight">{pkg.title}</h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-ink-muted">
          <span className="inline-flex items-center gap-1.5 uppercase tracking-[0.1em] text-teal-brand">
            <Clock3 className="size-3.5" />
            {pkg.duration}
          </span>
          <span className="inline-flex items-center gap-1.5" data-testid={`package-stay-${index}`}>
            <MapPin className="size-3.5 text-gold" />
            {pkg.stay}
          </span>
        </div>

        <ul className="mt-4 mb-5 flex flex-wrap gap-1.5" data-testid={`package-inclusions-${index}`}>
          {pkg.inclusions.map((key) => {
            const { label, icon: Icon } = INCLUSIONS[key];
            return (
              <li
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-[11px] font-semibold text-navy"
              >
                <Icon className="size-3.5 text-teal-brand" strokeWidth={2} />
                {label}
              </li>
            );
          })}
        </ul>

        <div className="mt-auto pt-4 border-t border-line-soft">
          <div className="flex items-center gap-2.5">
            <span data-testid={`package-price-original-${index}`} className="text-sm text-[#94A3B8] line-through">
              {pkg.price}
            </span>
            <span
              data-testid={`package-saving-${index}`}
              className="rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-teal-deep"
            >
              Save {pkg.saving}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span data-testid={`package-price-${index}`} className="font-heading text-[28px] font-semibold text-navy leading-none">
              {pkg.discounted}
            </span>
            <span className="text-xs text-ink-muted">per person</span>
          </div>
          <Button
            type="button"
            data-testid={`package-quote-btn-${index}`}
            onClick={() => onQuote(pkg.title, "Package Popup")}
            className="mt-4 w-full h-11 rounded-full bg-gold hover:bg-gold-deep text-white font-bold text-[13px] uppercase tracking-[0.08em] transition-[background-color,box-shadow,transform] duration-200 hover:scale-[1.02] active:scale-[0.98] gold-glow"
          >
            Get Quote
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

function PackageGroup({
  id,
  title,
  text,
  packages,
  offset,
  onQuote,
}: {
  id: string;
  title: string;
  text: string;
  packages: Package[];
  offset: number;
  onQuote: (title: string, source: string) => void;
}) {
  return (
    <div data-testid={`package-group-${id}`}>
      <div className="mb-6 flex items-end gap-3">
        <span className="hidden sm:block h-px w-8 bg-teal-brand mb-2" aria-hidden />
        <div>
          <h3 className="font-heading text-2xl sm:text-[28px] font-semibold text-navy leading-tight">{title}</h3>
          <p className="mt-1 text-sm sm:text-base text-ink-muted">{text}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {packages.map((pkg, i) => (
          <PackageCard key={pkg.title} pkg={pkg} index={offset + i} onQuote={onQuote} />
        ))}
      </div>
    </div>
  );
}

export function PackagesSection({ onQuote }: { onQuote: (title: string, source: string) => void }) {
  return (
    <section
      id="packages"
      data-testid="packages-section"
      className="scroll-mt-20 bg-mist-soft py-16 sm:py-20 lg:py-24"
    >
      <div className="ff-container">
        <SectionHeading
          testId="packages"
          title={
            <>
              Popular <span className="text-gold">Bali</span> Holiday Packages
            </>
          }
          subtitle="Handpicked Bali packages for couples, families and groups — with options to customise your trip."
          aside={
            <TextLinkCta
              testId="packages-custom-quote-btn"
              label="Can't find your trip? Get a Custom Quote"
              onClick={() => onQuote(CUSTOM_PACKAGE, "Package Popup")}
            />
          }
        />

        <div className="space-y-14 lg:space-y-16">
          <PackageGroup
            id="without-flight"
            title="Packages Without Flight"
            text="Perfect if you want to book your own flights or prefer flexible travel dates."
            packages={WITHOUT_FLIGHT}
            offset={0}
            onQuote={onQuote}
          />
          <PackageGroup
            id="with-flight"
            title="Packages With Flight"
            text="Hassle-free packages with return flights from Delhi, hotels, meals and complete travel arrangements."
            packages={WITH_FLIGHT}
            offset={3}
            onQuote={onQuote}
          />
        </div>
      </div>
    </section>
  );
}
