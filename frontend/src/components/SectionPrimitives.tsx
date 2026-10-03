import type { ReactNode } from "react";
import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/constants";
import { cn } from "@/lib/utils";

const inView = { once: true, margin: "-60px" } as const;

export function SectionHeading({
  title,
  subtitle,
  aside,
  className,
  testId,
}: {
  title: ReactNode;
  subtitle: string;
  aside?: ReactNode;
  className?: string;
  testId: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-9 lg:mb-10",
        className
      )}
    >
      <div className="max-w-2xl">
        <motion.h2
          data-testid={`${testId}-heading`}
          className="font-heading text-3xl sm:text-4xl lg:text-[44px] leading-[1.08] tracking-[-0.02em] font-semibold text-navy"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          {title}
        </motion.h2>
        <motion.p
          data-testid={`${testId}-subheading`}
          className="mt-3 text-base md:text-lg text-ink-muted leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT }}
        >
          {subtitle}
        </motion.p>
      </div>
      {aside}
    </div>
  );
}

export function GoldButton({
  label,
  onClick,
  testId,
  className,
}: {
  label: string;
  onClick: () => void;
  testId: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 h-12 rounded-full bg-gold hover:bg-gold-deep text-white font-bold px-7 text-[13px] sm:text-sm uppercase tracking-[0.08em] transition-[background-color,box-shadow,transform] duration-200 hover:scale-[1.03] active:scale-[0.97] gold-glow",
        className
      )}
    >
      {label}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

export function TextLinkCta({
  label,
  onClick,
  testId,
}: {
  label: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className="group inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-[0.1em] text-gold hover:text-teal-brand transition-colors duration-200 md:shrink-0"
    >
      {label}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
