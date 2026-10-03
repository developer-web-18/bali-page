import { Check } from "lucide-react";
import { motion } from "motion/react";
import { GoldButton } from "@/components/SectionPrimitives";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { CUSTOM_PACKAGE, EASE_OUT, IMAGES, WHATSAPP_LINK } from "@/lib/constants";

const TRUST = ["Free consultation", "No obligation", "100% privacy"];

export function FinalCtaSection({ onQuote }: { onQuote: (pkg: string, source: string) => void }) {
  return (
    <section
      id="final-cta"
      data-testid="final-cta-section"
      className="relative overflow-hidden bg-[#8FC7E8]"
    >
      <img
        data-testid="final-cta-image"
        src={IMAGES.finalCta}
        alt="Bright turquoise bay with limestone cliffs and palm trees in Bali"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-[center_60%] [filter:saturate(1.1)_brightness(1.04)]"
      />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(7,20,42,0.42)_0%,rgba(7,20,42,0.25)_38%,transparent_78%)]" />

      <div className="relative ff-container flex min-h-[440px] lg:min-h-[480px] flex-col items-center justify-center text-center py-20 sm:py-24 hero-text-shadow">
        <motion.h2
          data-testid="final-cta-heading"
          className="font-heading text-3xl sm:text-4xl lg:text-[52px] leading-[1.15] tracking-normal font-semibold text-white max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          Ready to Plan Your Bali Escape?
        </motion.h2>
        <motion.p
          data-testid="final-cta-subtext"
          className="mt-5 max-w-2xl text-base md:text-lg text-white leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT }}
        >
          Tell us your travel dates, budget and preferences — we&apos;ll create a Bali holiday around
          you.
        </motion.p>

        <motion.div
          data-testid="final-cta-buttons"
          className="mt-7 flex w-full max-w-xl flex-col md:flex-row md:max-w-none md:w-auto items-stretch md:items-center justify-center gap-3 md:gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
        >
          <GoldButton
            testId="final-cta-quote-btn"
            label="Get My Free Bali Quote"
            onClick={() => onQuote(CUSTOM_PACKAGE, "Final CTA")}
            className="h-13 w-full md:w-auto px-4 sm:px-7 tracking-normal"
          />
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="final-cta-whatsapp-btn"
            className="inline-flex h-13 w-full md:w-auto items-center justify-center gap-2 rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-md px-4 sm:px-7 text-[13px] sm:text-sm font-bold uppercase tracking-normal text-white hover:bg-white hover:text-navy transition-[background-color,color,transform] duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            <WhatsAppIcon className="size-5 shrink-0" />
            WhatsApp a Travel Expert
          </a>
        </motion.div>

        <ul
          data-testid="final-cta-trust"
          className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium text-white"
        >
          {TRUST.map((t, index) => (
            <li key={t} data-testid={`final-cta-trust-${index}`} className="inline-flex items-center gap-1.5">
              <span className="grid size-4 place-items-center rounded-full bg-gold-bright text-navy-dark">
                <Check className="size-3" strokeWidth={3.5} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
