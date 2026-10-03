import { useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { GoldButton } from "@/components/SectionPrimitives";
import {
  CONTACT,
  CUSTOM_PACKAGE,
  EASE_OUT,
  TRUSTINDEX_FEED_SRC,
  TRUSTINDEX_SRC,
} from "@/lib/constants";

const inView = { once: true, margin: "-40px" } as const;

// Trustindex loaders render their widget next to their own <script> tag, so each loader is
// injected inside its container. Guarded so every script is only ever added to the document once.
function TrustindexWidget({ src, testId }: { src: string; testId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.async = true;
    container.appendChild(script);
  }, [src]);

  return (
    <div
      ref={ref}
      data-testid={testId}
      className="trustindex-container w-full max-w-full overflow-x-hidden min-h-[220px]"
    />
  );
}

function BlockLabel({ children }: { children: string }) {
  return (
    <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-deep">
      <span className="h-px w-6 bg-teal-brand" aria-hidden />
      {children}
    </p>
  );
}

export function ReviewsSection({ onQuote }: { onQuote: (pkg: string, source: string) => void }) {
  return (
    <section
      id="reviews"
      data-testid="reviews-section"
      className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24 overflow-x-hidden"
    >
      <div className="ff-container">
        <div className="mx-auto max-w-2xl text-center mb-10 lg:mb-12">
          <motion.h2
            data-testid="reviews-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[44px] leading-[1.08] tracking-[-0.02em] font-semibold text-navy"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            Trusted by <span className="text-gold">Travellers</span>
          </motion.h2>
          <motion.p
            data-testid="reviews-subheading"
            className="mt-3 text-base md:text-lg text-ink-muted leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT }}
          >
            See what our customers say and follow our latest travel experiences with FollowFoots.
          </motion.p>
        </div>

        <motion.div
          data-testid="reviews-google-block"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <div className="mb-5">
            <BlockLabel>Google Reviews</BlockLabel>
          </div>
          <TrustindexWidget src={TRUSTINDEX_SRC} testId="trustindex-widget" />
        </motion.div>

        <motion.div
          data-testid="reviews-instagram-block"
          className="mt-16 lg:mt-20 mx-auto w-full max-w-4xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <BlockLabel>Follow Us on Instagram</BlockLabel>
              <p className="mt-2 text-sm sm:text-base text-ink-muted">
                Follow @followfoots for travel inspiration, destinations and holiday ideas.
              </p>
            </div>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="reviews-instagram-follow-btn"
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-navy/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-navy hover:border-teal-brand hover:text-teal-brand transition-colors duration-200 shrink-0"
            >
              Follow @followfoots
              <ExternalLink className="size-3.5" />
            </a>
          </div>
          <div className="relative rounded-3xl bg-mist-soft p-3 sm:p-4">
            <div
              data-lenis-prevent
              data-testid="instagram-feed-scroll"
              className="max-h-[560px] lg:max-h-[620px] overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]"
            >
              <TrustindexWidget src={TRUSTINDEX_FEED_SRC} testId="trustindex-feed-widget" />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-3 sm:inset-x-4 bottom-3 sm:bottom-4 h-16 rounded-b-2xl bg-gradient-to-t from-mist-soft to-transparent"
            />
          </div>
        </motion.div>

        <motion.div
          data-testid="reviews-cta"
          className="mt-14 lg:mt-16 rounded-3xl bg-mist-soft border border-line-soft px-6 py-7 sm:px-8 sm:py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <div className="max-w-2xl">
            <h3 className="font-heading text-2xl sm:text-[28px] font-semibold text-navy leading-tight">
              Planning your Bali trip?
            </h3>
            <p className="mt-2 text-sm sm:text-base text-ink-muted leading-relaxed">
              Let our travel experts create a personalised Bali holiday around your dates and budget.
            </p>
          </div>
          <GoldButton
            testId="reviews-quote-btn"
            label="Get My Free Bali Quote"
            onClick={() => onQuote(CUSTOM_PACKAGE, "Reviews CTA")}
            className="w-full lg:w-auto shrink-0"
          />
        </motion.div>
      </div>
    </section>
  );
}
