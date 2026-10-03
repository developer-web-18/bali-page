import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TrustStrip } from "@/components/TrustStrip";
import { PackagesSection } from "@/components/PackagesSection";
import { ExperiencesSection } from "@/components/ExperiencesSection";
import { ItinerarySection } from "@/components/ItinerarySection";
import { WhySection } from "@/components/WhySection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { FaqSection } from "@/components/FaqSection";
import { FinalCtaSection } from "@/components/FinalCtaSection";
import { Footer } from "@/components/Footer";
import { EnquiryDialog } from "@/components/EnquiryDialog";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { focusLeadForm, useLenis } from "@/hooks/useLenis";
import { CUSTOM_PACKAGE } from "@/lib/constants";

export default function Home() {
  useLenis();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [packageName, setPackageName] = useState(CUSTOM_PACKAGE);
  const [formSource, setFormSource] = useState("Package Popup");

  const openDialog = (pkg: string = CUSTOM_PACKAGE, source = "Package Popup") => {
    setPackageName(pkg);
    setFormSource(source);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-white pb-[76px] md:pb-0" data-testid="home-page">
      <Header onEnquire={() => openDialog(CUSTOM_PACKAGE, "Header CTA")} />
      <main>
        <HeroSection onEnquire={() => openDialog(CUSTOM_PACKAGE, "Hero Form")} />
        <TrustStrip />
        <PackagesSection onQuote={openDialog} />
        <ExperiencesSection onQuote={openDialog} />
        <ItinerarySection onQuote={openDialog} />
        <WhySection onQuote={openDialog} />
        <ReviewsSection onQuote={openDialog} />
        <FaqSection onQuote={openDialog} />
        <FinalCtaSection onQuote={openDialog} />
      </main>
      <Footer />

      <div
        data-testid="mobile-sticky-bar"
        className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-line-soft bg-white/95 backdrop-blur-xl px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            data-testid="mobile-bar-quote-btn"
            onClick={focusLeadForm}
            className="h-12 rounded-xl bg-gold hover:bg-gold-deep text-white text-sm font-bold uppercase tracking-[0.06em] transition-[background-color,transform] duration-200 active:scale-[0.985] gold-glow"
          >
            Get Free Quote
          </button>
          <WhatsAppButton
            data-testid="mobile-bar-whatsapp-btn"
            variant="solid"
            className="h-12 justify-center"
            label="WhatsApp"
          />
        </div>
      </div>

      <EnquiryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        packageName={packageName}
        formSource={formSource}
      />
      <Toaster richColors />
    </div>
  );
}
