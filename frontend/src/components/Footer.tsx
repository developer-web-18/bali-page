import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { scrollToId } from "@/hooks/useLenis";
import { CONTACT, WHATSAPP_LINK } from "@/lib/constants";

const NAV = [
  { label: "Bali Packages", id: "packages" },
  { label: "Experiences", id: "experiences" },
  { label: "Itinerary", id: "itinerary" },
  { label: "Why FollowFoots", id: "why-us" },
  { label: "FAQs", id: "faqs" },
];

const SOCIALS = [
  { label: "Instagram", icon: Instagram, href: CONTACT.instagram },
  { label: "Facebook", icon: Facebook, href: "https://www.facebook.com/FollowFootsPVTLTD" },
];

const CONTACT_ROWS = [
  { icon: <Phone className="size-4 shrink-0 text-teal-brand" strokeWidth={1.75} />, label: CONTACT.phone, href: CONTACT.phoneHref, testId: "footer-phone", external: false },
  { icon: <WhatsAppIcon className="size-4 shrink-0 text-[#25D366]" />, label: `WhatsApp ${CONTACT.phone}`, href: WHATSAPP_LINK, testId: "footer-whatsapp", external: true },
  { icon: <Mail className="size-4 shrink-0 text-teal-brand" strokeWidth={1.75} />, label: CONTACT.email, href: `mailto:${CONTACT.email}`, testId: "footer-email", external: false },
];

export function Footer() {
  return (
    <footer data-testid="site-footer" className="bg-white border-t border-line-soft">
      <div className="ff-container py-8 lg:py-9 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <div className="min-w-0 md:col-span-5">
          <div className="flex items-center gap-3">
            <img data-testid="footer-logo" src="/logo.png" alt="FollowFoots Vacation logo" className="h-11 w-11 shrink-0 object-contain" />
            <div className="leading-tight">
              <p data-testid="footer-brand" className="font-heading text-lg font-semibold text-navy">FollowFoots Vacation</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-brand">
                Pvt Ltd
              </p>
            </div>
          </div>
          <p data-testid="footer-description" className="mt-3 max-w-sm text-sm text-ink-muted leading-relaxed">
            Your trusted travel partner for customised holidays, flights, hotels, visas and travel
            experiences.
          </p>
          <div className="mt-3 flex items-center gap-2" data-testid="footer-social">
            {SOCIALS.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                data-testid={`footer-social-${label.toLowerCase()}`}
                className="grid size-11 place-items-center rounded-full bg-mist text-navy hover:bg-teal-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand transition-colors duration-200"
              >
                <Icon className="size-[18px]" strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>

        <nav className="md:col-span-3" aria-label="Footer" data-testid="footer-nav">
          <p data-testid="footer-explore-heading" className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy">Explore</p>
          <ul className="mt-3">
            {NAV.map(({ label, id }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  data-testid={`footer-nav-${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(id);
                  }}
                  className="inline-flex min-h-9 md:min-h-7 items-center text-sm text-ink-muted hover:text-teal-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand transition-colors duration-200"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 md:col-span-4" data-testid="footer-contact">
          <p data-testid="footer-contact-heading" className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy">Contact</p>
          <ul className="mt-3 space-y-0.5 md:space-y-1 text-sm">
            {CONTACT_ROWS.map(({ icon, label, href, testId, external }) => (
              <li key={testId} className="text-ink-muted">
                <a
                  href={href}
                  data-testid={testId}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="inline-flex max-w-full min-h-11 md:min-h-8 items-center gap-3 hover:text-teal-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand transition-colors duration-200"
                >
                  {icon}
                  <span className="min-w-0 break-words">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line-soft">
        <div className="ff-container py-3 text-center text-xs leading-5 text-ink-muted" data-testid="footer-copyright">
          © 2026 FollowFoots Vacation Pvt Ltd. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
