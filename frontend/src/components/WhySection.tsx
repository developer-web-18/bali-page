import { CarFront, FileCheck2, Headset, Plane, ReceiptText, Route, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { GoldButton } from "@/components/SectionPrimitives";
import { CUSTOM_PACKAGE, EASE_OUT, IMAGES } from "@/lib/constants";

const BENEFITS = [
  {
    icon: Route,
    label: "Customised Itineraries",
    title: "Travel your way",
    desc: "Your itinerary is planned around your dates, interests and travel style.",
  },
  {
    icon: Plane,
    label: "Flights + Hotels",
    title: "Options that fit your trip",
    desc: "Choose from suitable flight and hotel options based on your requirements.",
  },
  {
    icon: CarFront,
    label: "Private Transfers",
    title: "Hassle-free travel",
    desc: "Comfortable airport and local transfers can be arranged as part of your trip.",
  },
  {
    icon: FileCheck2,
    label: "Visa Assistance",
    title: "Guidance when you need it",
    desc: "Get assistance with the visa process and required documentation.",
  },
  {
    icon: ReceiptText,
    label: "Transparent Pricing",
    title: "Clear & straightforward",
    desc: "Understand what's included in your package before you book.",
  },
  {
    icon: Headset,
    label: "Travel Support",
    title: "Support before & during your trip",
    desc: "Get assistance throughout your travel journey.",
  },
];

const inView = { once: true, margin: "-60px" } as const;

export function WhySection({ onQuote }: { onQuote: (pkg: string, source: string) => void }) {
  return (
    <section
      id="why-us"
      data-testid="why-section"
      className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="ff-container grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <motion.div
          className="lg:col-span-5 relative"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={inView}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        >
          <div className="relative aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/5] overflow-hidden rounded-3xl shadow-[0_32px_70px_-28px_rgba(11,29,58,0.35)]">
            <img
              src={IMAGES.coupleInfinityPool}
              alt="Couple enjoying the ocean view from an infinity pool in Bali"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <motion.div
            data-testid="why-trust-card"
            className="absolute -bottom-5 left-4 right-4 sm:right-auto sm:left-6 sm:w-[270px] lg:-left-6 rounded-2xl bg-white/95 backdrop-blur p-4 sm:p-5 shadow-[0_20px_50px_-20px_rgba(11,29,58,0.35)] border border-white"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT }}
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                <Sparkles className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-heading text-lg font-semibold text-navy leading-tight">
                  Your Holiday. Your Way.
                </p>
                <p className="mt-1 text-xs text-ink-muted leading-snug">
                  Planned around your dates, interests and budget — not a fixed template.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="lg:col-span-7 pt-6 lg:pt-0">
          <motion.h2
            data-testid="why-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[44px] leading-[1.08] tracking-[-0.02em] font-semibold text-navy"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            Why FollowFoots for <span className="text-gold">Your Bali Trip?</span>
          </motion.h2>
          <motion.p
            data-testid="why-subheading"
            className="mt-3 text-base md:text-lg text-ink-muted leading-relaxed max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT }}
          >
            More than just a holiday package — we plan your Bali experience around your dates,
            preferences and budget.
          </motion.p>

          <ul data-testid="why-benefits" className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            {BENEFITS.map(({ icon: Icon, label, title, desc }, i) => (
              <motion.li
                key={label}
                data-testid={`why-benefit-${i}`}
                className="flex gap-3.5"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={inView}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: EASE_OUT }}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-pale text-teal-brand">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-deep">
                    {label}
                  </p>
                  <h3 className="mt-0.5 text-[15px] font-semibold text-navy leading-snug">{title}</h3>
                  <p className="mt-1 text-sm text-ink-muted leading-snug">{desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          <motion.p
            data-testid="why-trust-message"
            className="mt-8 rounded-2xl border-l-4 border-gold bg-mist px-5 py-4 text-sm sm:text-[15px] font-medium text-navy leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT }}
          >
            From flights and hotels to sightseeing and support, we can help you plan your Bali
            journey end-to-end.
          </motion.p>

          <motion.div
            data-testid="why-cta"
            className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 0.7, delay: 0.25, ease: EASE_OUT }}
          >
            <p className="font-heading text-lg sm:text-xl font-semibold text-navy">
              Ready to plan your Bali trip?
            </p>
            <GoldButton
              testId="why-plan-trip-btn"
              label="Plan My Bali Trip"
              onClick={() => onQuote(CUSTOM_PACKAGE, "Why Us CTA")}
              className="w-full sm:w-auto"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
