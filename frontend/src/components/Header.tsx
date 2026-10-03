import { useEffect, useState } from "react";
import { ArrowRight, Headset, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToId } from "@/hooks/useLenis";
import { CONTACT } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Bali Packages", id: "packages" },
  { label: "Experiences", id: "experiences" },
  { label: "Itinerary", id: "itinerary" },
  { label: "Why Us", id: "why-us" },
  { label: "FAQs", id: "faqs" },
];

export function Header({ onEnquire }: { onEnquire: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-header"
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300",
        scrolled
          ? "bg-white/85 backdrop-blur-xl backdrop-saturate-150 border-b border-navy/10 shadow-sm"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="ff-container flex h-16 sm:h-[72px] items-center justify-between gap-4">
        <a
          href="#top"
          data-testid="header-logo"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2 sm:gap-2.5 shrink-0"
        >
          <img
            src="/logo.png"
            alt="FollowFoots Vacation logo"
            className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-sm"
          />
          <span className="leading-none">
            <span
              className={cn(
                "block font-heading text-base sm:text-xl font-semibold tracking-tight transition-colors duration-300",
                scrolled ? "text-navy" : "text-white"
              )}
            >
              FollowFoots
            </span>
            <span
              className={cn(
                "hidden sm:block text-[10px] font-semibold uppercase tracking-[0.28em] transition-colors duration-300",
                scrolled ? "text-teal-brand" : "text-sand"
              )}
            >
              Vacation Pvt Ltd
            </span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-1" data-testid="header-nav" aria-label="Primary">
          {NAV_LINKS.map(({ label, id }) => (
            <a
              key={id}
              href={`#${id}`}
              data-testid={`header-nav-${id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(id);
              }}
              className={cn(
                "text-sm font-semibold px-3.5 py-2 rounded-full transition-colors duration-200",
                scrolled ? "text-navy hover:bg-mist" : "text-white/95 hover:bg-white/15"
              )}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <a
            href={CONTACT.phoneHref}
            data-testid="header-call-btn"
            aria-label={`Call ${CONTACT.phone}`}
            className={cn(
              "lg:hidden inline-flex h-10 sm:h-11 items-center gap-1.5 rounded-full border px-3 sm:px-4 text-[11px] sm:text-xs font-bold tracking-wide whitespace-nowrap transition-colors duration-200",
              scrolled
                ? "border-navy/15 bg-mist text-navy hover:bg-teal-pale hover:text-teal-deep"
                : "border-white/40 bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
            )}
          >
            <Phone className="size-3.5 sm:size-4" strokeWidth={2.25} />
            {CONTACT.phone}
          </a>
          <Button
            data-testid="header-enquire-btn"
            onClick={onEnquire}
            aria-label="Talk to a Bali Expert"
            className="rounded-full bg-gold hover:bg-gold-deep text-white font-bold size-10 sm:size-auto sm:h-11 sm:px-6 text-sm tracking-wide transition-[background-color,box-shadow,transform] duration-200 hover:scale-[1.03] active:scale-[0.97] gold-glow shrink-0 p-0 sm:py-2"
          >
            <Headset className="size-[18px] sm:hidden" strokeWidth={2.25} />
            <span className="hidden sm:inline">Talk to a Bali Expert</span>
            <ArrowRight className="hidden sm:block size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
