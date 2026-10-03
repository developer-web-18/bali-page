import { motion } from "motion/react";
import { GoldButton, SectionHeading } from "@/components/SectionPrimitives";
import { CUSTOM_ITINERARY, EASE_OUT, IMAGES } from "@/lib/constants";

const EXPERIENCES = [
  { name: "Nusa Penida", desc: "Stunning beaches & dramatic cliffs", image: IMAGES.diamondBeach },
  { name: "Ubud", desc: "Temples, culture & lush nature", image: IMAGES.ubudField },
  { name: "Uluwatu Sunset", desc: "Clifftop views & magical sunsets", image: IMAGES.uluwatuTemple },
  { name: "Beach Club", desc: "FINNS Beach Club · Poolside & sunsets", image: IMAGES.finnsBeachClub },
  { name: "Mount Batur", desc: "Sunrise trekking & volcano views", image: IMAGES.baturSunrise },
  { name: "Gili Islands", desc: "Turquoise waters & island escapes", image: IMAGES.giliIslands },
];

export function ExperiencesSection({ onQuote }: { onQuote: (pkg: string, source: string) => void }) {
  return (
    <section
      id="experiences"
      data-testid="experiences-section"
      className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="ff-container">
        <SectionHeading
          testId="experiences"
          title={
            <>
              Unforgettable <span className="text-gold">Bali</span> Experiences
            </>
          }
          subtitle="From breathtaking beaches to cultural wonders, discover the experiences that make Bali unforgettable."
        />

        <div
          data-testid="experiences-grid"
          className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6"
        >
          {EXPERIENCES.map((exp, i) => (
            <motion.article
              key={exp.name}
              data-testid={`experience-card-${i}`}
              className="group relative aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/3] overflow-hidden rounded-2xl sm:rounded-3xl bg-mist shadow-[0_18px_40px_-20px_rgba(11,29,58,0.25)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-22px_rgba(11,29,58,0.32)]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.1, ease: EASE_OUT }}
            >
              <img
                data-testid={`experience-image-${i}`}
                src={exp.image}
                alt={`${exp.name} — ${exp.desc}`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5">
                <h3 data-testid={`experience-title-${i}`} className="font-heading text-base sm:text-xl lg:text-[22px] font-semibold text-white leading-tight">
                  {exp.name}
                </h3>
                <p data-testid={`experience-description-${i}`} className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-white/85 leading-snug">
                  {exp.desc}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          data-testid="experiences-cta"
          className="mt-10 lg:mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-teal-pale px-6 py-5"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <p className="font-heading text-lg sm:text-xl font-semibold text-navy">
            Want these experiences in your trip?
          </p>
          <GoldButton
            testId="experiences-build-itinerary-btn"
            label="Build My Bali Itinerary"
            onClick={() => onQuote(CUSTOM_ITINERARY, "Experiences CTA")}
            className="w-full sm:w-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}
