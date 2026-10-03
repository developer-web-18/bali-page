import { Headset, Hotel, Map, Plane } from "lucide-react";
import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/constants";

const ITEMS = [
  { icon: Plane, title: "Best Flight Options", sub: "From India" },
  { icon: Hotel, title: "Handpicked Hotels", sub: "For Every Budget" },
  { icon: Map, title: "Customised Itineraries", sub: "Built Around You" },
  { icon: Headset, title: "24×7 Travel Support", sub: "Before & During Your Trip" },
];

export function TrustStrip() {
  return (
    <section
      id="trust"
      data-testid="trust-strip"
      aria-label="Why travel with FollowFoots"
      className="relative z-10 bg-white border-b border-line-soft"
    >
      <div className="ff-container">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 lg:gap-x-10 py-7 lg:py-8">
          {ITEMS.map(({ icon: Icon, title, sub }, i) => (
            <motion.li
              key={title}
              data-testid={`trust-item-${i}`}
              className="flex items-center gap-3.5"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: EASE_OUT }}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mist text-teal-brand">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-navy">{title}</span>
                <span className="block text-xs text-ink-muted mt-0.5">{sub}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
