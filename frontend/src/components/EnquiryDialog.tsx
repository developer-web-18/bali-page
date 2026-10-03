import { XIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadForm } from "@/components/LeadForm";
import { CUSTOM_ITINERARY, CUSTOM_PACKAGE } from "@/lib/constants";

const TITLES: Record<string, string> = {
  [CUSTOM_PACKAGE]: "Get Your Custom Bali Quote",
  [CUSTOM_ITINERARY]: "Build Your Custom Bali Itinerary",
};

export function EnquiryDialog({
  open,
  onOpenChange,
  packageName = CUSTOM_PACKAGE,
  formSource = "Package Popup",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageName?: string;
  formSource?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="enquiry-dialog"
        showCloseButton={false}
        className="w-[calc(100%-1.5rem)] sm:max-w-[640px] rounded-3xl p-5 sm:p-7 pt-6 sm:pt-7 gap-0 max-h-[calc(100svh-1.5rem)] overflow-y-auto overscroll-contain"
        data-lenis-prevent
      >
        <DialogClose
          data-testid="enquiry-dialog-close"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-mist text-navy hover:bg-line-soft transition-colors duration-200"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader className="gap-1.5 text-left mb-4">
          <span data-testid="enquiry-dialog-badge" className="mr-10 inline-flex w-fit items-center rounded-full bg-teal-pale px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-deep">
            Free Custom Quote
          </span>
          <DialogTitle
            data-testid="enquiry-dialog-title"
            className="font-heading text-2xl sm:text-[27px] font-semibold tracking-normal text-navy leading-tight"
          >
            {TITLES[packageName] ?? `Get a Quote for ${packageName}`}
          </DialogTitle>
          <DialogDescription data-testid="enquiry-dialog-description" className="text-sm text-ink-muted leading-relaxed">
            Share your travel plans and a FollowFoots Bali expert will WhatsApp you a free,
            personalised quote.
          </DialogDescription>
        </DialogHeader>

        <LeadForm idPrefix="modal" packageName={packageName} formSource={formSource} />
      </DialogContent>
    </Dialog>
  );
}
