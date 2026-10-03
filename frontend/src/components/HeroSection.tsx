import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, BadgeCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/LeadForm";
import { EASE_OUT } from "@/lib/constants";

const HERO_IMAGE = "https://images.unsplash.com/photo-1671034456366-77aff6bd3316?auto=format&fit=crop&q=85";

function RevealLine({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
      <motion.span
        className="block will-change-transform"
        initial={{ y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.05, delay, ease: EASE_OUT }}
      >
        {children}
      </motion.span>
    </span>
  );
}

const TRUST_POINTS = [
  "Customised Bali Itineraries",
  "Handpicked Hotels & Resorts",
  "On-trip Assistance",
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE_OUT },
});

export function HeroSection({ onEnquire }: { onEnquire: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "4%"]);

  return (
    <section
      id="top"
      ref={sectionRef}
      data-testid="hero-section"
      className="relative overflow-hidden bg-[#EDF5FA]"
    >
      <motion.div className="hero-media" style={{ y: reducedMotion ? 0 : bgY }}>
        <picture>
          <source media="(max-width: 639px)" srcSet={`${HERO_IMAGE}&w=900`} />
          <source media="(max-width: 1023px)" srcSet={`${HERO_IMAGE}&w=1400`} />
          <img
            data-testid="hero-background-image"
            src={`${HERO_IMAGE}&w=2400`}
            alt="Sunlit green cliffs of Uluwatu, Bali, above bright turquoise ocean"
            className="hero-destination-image"
            fetchPriority="high"
          />
        </picture>
        <div className="absolute inset-0 hero-scrim-mobile lg:hero-scrim" />
      </motion.div>

      <div className="relative ff-container grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center lg:min-h-[100svh] pt-24 lg:pt-28 pb-10 lg:pb-14">
        <div className="min-w-0 lg:col-span-7 space-y-5 lg:space-y-6 text-left hero-text-shadow">
          <motion.p
            data-testid="hero-eyebrow"
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/40 bg-white/15 backdrop-blur-md px-3 py-1.5 text-[9px] min-[375px]:text-[10px] tracking-[0.1em] sm:text-xs sm:tracking-[0.2em] font-bold uppercase text-white"
            {...fadeUp(0.15)}
          >
            <BadgeCheck className="size-4 shrink-0 text-sand" />
            Bali Specialists • FollowFoots Vacation
          </motion.p>

          <h1
            data-testid="hero-headline"
            className="font-heading text-4xl sm:text-5xl lg:text-[60px] leading-[1.08] tracking-normal text-white font-semibold"
          >
            <RevealLine delay={0.3}>
              <span className="text-gold-bright">Bali</span> Holiday Packages{" "}
            </RevealLine>
            <RevealLine delay={0.45}>from India</RevealLine>
          </h1>

          <motion.p
            data-testid="hero-subheadline"
            className="max-w-lg text-base sm:text-lg text-white font-medium leading-relaxed"
            {...fadeUp(0.7)}
          >
            Customised Bali holidays with handpicked hotels, transfers, sightseeing &amp;{" "}
            experiences.
          </motion.p>

          <motion.div
            data-testid="hero-price-anchor"
            className="w-fit rounded-xl border border-white/70 bg-white/90 px-5 py-3 text-navy shadow-sm backdrop-blur-sm [text-shadow:none]"
            {...fadeUp(0.8)}
          >
            <p data-testid="hero-price-label" className="text-[10px] font-bold tracking-[0.12em] uppercase">Packages starting from</p>
            <p data-testid="hero-starting-price" className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold leading-tight">₹27,500</span>
              <span className="text-[11px] font-semibold uppercase">/ Person</span>
            </p>
            <p data-testid="hero-price-details" className="mt-1 text-[10px] font-semibold tracking-[0.08em] uppercase">4N / 5D • Without Flight</p>
          </motion.div>

          <motion.div {...fadeUp(0.95)}>
            <Button
              type="button"
              data-testid="hero-primary-cta"
              onClick={onEnquire}
              className="h-13 w-full sm:w-auto rounded-full bg-gold hover:bg-gold-deep text-white font-bold px-8 text-[15px] uppercase tracking-[0.08em] transition-[background-color,box-shadow,transform] duration-200 hover:scale-[1.03] active:scale-[0.97] gold-glow"
            >
              Get My Bali Quote
              <ArrowRight className="size-5" />
            </Button>
          </motion.div>

          <motion.ul
            data-testid="hero-trust-points"
            className="flex flex-wrap gap-2"
            {...fadeUp(1.05)}
          >
            {TRUST_POINTS.map((label, index) => (
              <li
                key={label}
                data-testid={`hero-trust-point-${index}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/30 backdrop-blur-md pl-2.5 pr-3.5 py-1.5 text-xs sm:text-[13px] font-semibold text-white"
              >
                <span className="grid size-4 place-items-center rounded-full bg-gold-bright text-navy-dark">
                  <Check className="size-3" strokeWidth={3.5} />
                </span>
                {label}
              </li>
            ))}
          </motion.ul>

        </div>

        <motion.div
          className="min-w-0 w-full lg:col-span-5 relative z-10"
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55, ease: EASE_OUT }}
        >
          <div
            id="lead-form"
            data-testid="lead-form-card"
            className="scroll-mt-24 rounded-3xl bg-white p-5 sm:p-6 card-lift-lg border border-white/60"
          >
            <div className="mb-4 space-y-1.5">
              <h2
                data-testid="lead-form-heading"
                className="font-heading text-2xl sm:text-[27px] font-semibold tracking-normal text-navy"
              >
                Get Your Free Bali Quote
              </h2>
              <p data-testid="lead-form-description" className="text-sm text-ink-muted leading-relaxed">
                Tell us your travel plans and we&apos;ll create a personalised Bali package for you.
              </p>
            </div>
            <LeadForm idPrefix="lead" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
