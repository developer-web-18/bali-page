import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GoldButton, SectionHeading } from "@/components/SectionPrimitives";
import { CUSTOM_PACKAGE, EASE_OUT } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Is Bali visa-free for Indian travellers?",
    a: "Visa and entry requirements can vary based on current regulations and your travel dates. Our team can guide you through the latest requirements and documentation needed for your Bali trip.",
  },
  {
    q: "How much does a Bali trip cost from India?",
    a: "The cost depends on your departure city, travel dates, hotel category, number of travellers and experiences selected. We create customised packages based on your budget and requirements.",
  },
  {
    q: "How many days are enough for a Bali trip?",
    a: "Most travellers prefer around 5–7 days to experience Bali comfortably. We can customise the duration based on the places and experiences you want to include.",
  },
  {
    q: "Can I customise my Bali itinerary?",
    a: "Yes. Your Bali itinerary can be customised around your travel dates, interests, hotel preferences, activities and budget.",
  },
  {
    q: "Are flights included in Bali holiday packages?",
    a: "Flights can be included depending on the package and your requirements. We can help you explore suitable flight options from your departure city.",
  },
  {
    q: "What places can I include in my Bali trip?",
    a: "Popular options include Ubud, Seminyak, Kuta, Uluwatu and Nusa Penida. Depending on your trip duration, we can also suggest experiences and destinations that fit your travel style.",
  },
  {
    q: "Can you arrange airport transfers and sightseeing?",
    a: "Yes. Airport transfers, local transportation and sightseeing can be arranged based on your selected itinerary and package.",
  },
  {
    q: "Can you help with Bali visa and travel documentation?",
    a: "Yes. FollowFoots can assist you with travel documentation and provide guidance regarding the applicable Bali entry and visa requirements.",
  },
  {
    q: "Can I get a Bali package based on my budget?",
    a: "Yes. Share your approximate budget, travel dates and number of travellers with us. Our Bali expert can suggest suitable options and customise the itinerary accordingly.",
  },
  {
    q: "How do I get a customised Bali quote?",
    a: "Simply fill out the enquiry form on this page or connect with us on WhatsApp. Our Bali expert will understand your requirements and prepare a personalised quote.",
  },
];

const COLUMNS = [FAQS.slice(0, 5), FAQS.slice(5)];

function FaqItem({
  index,
  q,
  a,
  open,
  onToggle,
}: {
  index: number;
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `faq-panel-${index}`;
  return (
    <div
      data-testid={`faq-item-${index}`}
      data-state={open ? "open" : "closed"}
      className={cn(
        "rounded-2xl border bg-white card-lift transition-colors duration-300",
        open ? "border-teal-brand/50" : "border-line-soft"
      )}
    >
      <button
        type="button"
        data-testid={`faq-trigger-${index}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span
          className={cn(
            "text-[15px] font-semibold leading-snug transition-colors duration-200",
            open ? "text-teal-deep" : "text-navy"
          )}
        >
          {q}
        </span>
        <span
          aria-hidden
          className={cn(
            "relative grid size-7 shrink-0 place-items-center rounded-full transition-colors duration-300",
            open ? "bg-teal-brand text-white" : "bg-mist text-navy"
          )}
        >
          <span className="absolute h-[2px] w-3 rounded-full bg-current" />
          <span
            className={cn(
              "absolute h-3 w-[2px] rounded-full bg-current transition-transform duration-300",
              open ? "rotate-90 scale-y-0" : "rotate-0"
            )}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            data-testid={`faq-answer-${index}`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-ink-muted leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection({ onQuote }: { onQuote: (pkg: string, source: string) => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faqs"
      data-testid="faq-section"
      className="scroll-mt-20 bg-mist-soft py-16 sm:py-20 lg:py-24"
    >
      <div className="ff-container">
        <SectionHeading
          testId="faq"
          title={
            <>
              Frequently Asked <span className="text-gold">Bali</span> Questions
            </>
          }
          subtitle="Everything you need to know before planning your Bali holiday."
        />

        <div data-testid="faq-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3 items-start">
          {COLUMNS.map((column, c) => (
            <div key={c} className="grid gap-3">
              {column.map((item, i) => {
                const index = c * 5 + i;
                return (
                  <FaqItem
                    key={item.q}
                    index={index}
                    q={item.q}
                    a={item.a}
                    open={openIndex === index}
                    onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <motion.div
          data-testid="faq-cta"
          className="mt-10 lg:mt-12 rounded-3xl bg-white border border-line-soft card-lift px-6 py-7 sm:px-8 sm:py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <div className="max-w-2xl">
            <h3 className="font-heading text-2xl sm:text-[28px] font-semibold text-navy leading-tight">
              Still have questions about your Bali trip?
            </h3>
            <p className="mt-2 text-sm sm:text-base text-ink-muted leading-relaxed">
              Tell us your dates, budget and travel preferences — our Bali expert will help you plan
              it.
            </p>
          </div>
          <GoldButton
            testId="faq-quote-btn"
            label="Get My Free Bali Quote"
            onClick={() => onQuote(CUSTOM_PACKAGE, "FAQ CTA")}
            className="w-full lg:w-auto shrink-0"
          />
        </motion.div>
      </div>
    </section>
  );
}
