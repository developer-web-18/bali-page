import { MapPin } from "lucide-react";
import { motion } from "motion/react";
import { GoldButton, SectionHeading, TextLinkCta } from "@/components/SectionPrimitives";
import { CUSTOM_ITINERARY, EASE_OUT, IMAGES } from "@/lib/constants";
import "./ItinerarySection.css";

const DAYS = [
  {
    title: "Arrival in Bali",
    location: "Seminyak",
    points: ["Airport arrival", "Private transfer", "Hotel check-in", "Leisure time"],
    image: IMAGES.resortPool,
  },
  {
    title: "Uluwatu & Sunset",
    location: "Uluwatu",
    points: ["Uluwatu Temple", "Scenic clifftop views", "Sunset experience", "Optional cultural show"],
    image: IMAGES.uluwatuCliff,
  },
  {
    title: "Nusa Penida Island",
    location: "Nusa Penida",
    points: ["Full-day island tour", "Beach & viewpoint experiences", "Return to Bali"],
    image: IMAGES.kelingking,
  },
  {
    title: "Ubud & Rice Terraces",
    location: "Ubud",
    points: ["Ubud", "Tegallalang Rice Terraces", "Temple / cultural experience", "Leisure time"],
    image: IMAGES.riceTerrace,
  },
  {
    title: "Water Sports & Leisure",
    location: "Nusa Dua / Seminyak",
    points: ["Water sports / beach activities", "Free time", "Optional spa or shopping"],
    image: IMAGES.snorkelDrone,
  },
  {
    title: "Departure",
    location: "Denpasar Airport",
    points: ["Breakfast", "Hotel checkout", "Airport transfer", "Departure"],
    image: IMAGES.agungDawn,
  },
];

export function ItinerarySection({ onQuote }: { onQuote: (pkg: string, source: string) => void }) {
  const customise = () => onQuote(CUSTOM_ITINERARY, "Itinerary CTA");

  return (
    <section
      id="itinerary"
      data-testid="itinerary-section"
      className="scroll-mt-20 bg-mist-soft py-14 sm:py-16 lg:py-20"
    >
      <div className="ff-container">
        <SectionHeading
          testId="itinerary"
          className="mb-8 lg:mb-9 md:gap-8"
          title={
            <>
              Sample Bali Itinerary
              <span data-testid="itinerary-duration" className="mt-3 block text-gold text-[0.55em] font-semibold tracking-normal">
                6 Days / 5 Nights
              </span>
            </>
          }
          subtitle="A perfect blend of sightseeing, culture, adventure and leisure — and completely customisable around your travel plans."
          aside={
            <TextLinkCta
              testId="itinerary-customise-btn"
              label="Customise This Itinerary"
              onClick={customise}
            />
          }
        />

        <ol
          data-testid="itinerary-timeline"
          className="itinerary-timeline grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 md:auto-rows-fr gap-x-5 gap-y-8 pl-11 md:pl-0"
        >
          {DAYS.map((day, i) => (
            <motion.li
              key={day.title}
              data-testid={`itinerary-day-${i + 1}`}
              className="itinerary-step"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.75, delay: (i % 3) * 0.1, ease: EASE_OUT }}
            >
              <div className="itinerary-marker">
                <span data-testid={`itinerary-marker-${i + 1}`} className="grid size-8 md:size-9 shrink-0 place-items-center rounded-full bg-gold text-white text-xs md:text-sm font-bold shadow-[0_6px_16px_-6px_rgba(217,119,6,0.7)]">
                  {i + 1}
                </span>
              </div>
              <article data-testid={`itinerary-card-${i + 1}`} className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-white border border-line-soft card-lift">
                <img
                  data-testid={`itinerary-image-${i + 1}`}
                  src={day.image}
                  alt={`${day.title} — ${day.location}`}
                  loading="lazy"
                  className="aspect-[16/9] xl:aspect-[16/10] w-full shrink-0 object-cover"
                />
                <div className="flex flex-1 flex-col p-4 xl:p-3.5">
                  <p data-testid={`itinerary-day-label-${i + 1}`} className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-brand">
                    Day {i + 1}
                  </p>
                  <h3 data-testid={`itinerary-title-${i + 1}`} className="mt-1.5 md:min-h-[2.5em] font-heading text-lg xl:text-[17px] font-semibold text-navy leading-tight">
                    {day.title}
                  </h3>
                  <p data-testid={`itinerary-location-${i + 1}`} className="mt-2 inline-flex md:min-h-8 items-start gap-1 text-xs leading-4 text-ink-muted">
                    <MapPin className="mt-px size-3.5 shrink-0 text-gold" />
                    {day.location}
                  </p>
                  <ul data-testid={`itinerary-activities-${i + 1}`} className="mt-3 space-y-1.5">
                    {day.points.map((pt, index) => (
                      <li key={pt} data-testid={`itinerary-activity-${i + 1}-${index + 1}`} className="flex items-start gap-2 text-[13px] xl:text-xs text-ink-muted leading-5">
                        <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-teal-brand" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </motion.li>
          ))}
        </ol>

        <motion.div
          data-testid="itinerary-custom-cta"
          className="mt-8 lg:mt-10 rounded-3xl bg-white border border-line-soft card-lift px-5 py-6 sm:px-7 sm:py-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <div className="max-w-2xl">
            <p data-testid="itinerary-custom-label" className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-deep">
              Sample itinerary · fully customisable
            </p>
            <h3 data-testid="itinerary-custom-heading" className="mt-2 font-heading text-2xl sm:text-[28px] font-semibold text-navy leading-tight">
              Don&apos;t want a fixed itinerary?
            </h3>
            <p data-testid="itinerary-custom-description" className="mt-2 text-sm sm:text-base text-ink-muted leading-relaxed">
              Tell us your dates, interests and budget. We&apos;ll customise your Bali trip around you.
            </p>
          </div>
          <GoldButton
            testId="itinerary-create-custom-btn"
            label="Create My Custom Itinerary"
            onClick={customise}
            className="w-full lg:w-auto shrink-0 px-4 sm:px-7 tracking-normal"
          />
        </motion.div>
      </div>
    </section>
  );
}
