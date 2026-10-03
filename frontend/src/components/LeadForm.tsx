import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { ApiError, apiPost } from "@/lib/api";
import { OtpStep, ThankYou } from "@/components/OtpStep";
import type { OtpSendResult } from "@/components/OtpStep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnquiryField } from "@/components/EnquiryField";
import { TravelStyleField } from "@/components/TravelStyleField";
import type { TravelStyle } from "@/components/TravelStyleField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CUSTOM_PACKAGE } from "@/lib/constants";

interface LeadPayload {
  name: string;
  mobile: string;
  city: string;
  travelers: string;
  travel_month: string;
  travel_style: TravelStyle;
  package: string;
  form_source: string;
}

type LeadFormState = Omit<LeadPayload, "package" | "form_source">;

const TRAVELER_OPTIONS = [
  "1 Adult (Solo)",
  "2 Adults",
  "2 Adults + Kids",
  "3-4 Adults",
  "5-8 Persons",
  "9+ Persons / Group",
];

const MONTH_OPTIONS = [
  "Next 30 Days",
  "August 2026",
  "September 2026",
  "October 2026",
  "November 2026",
  "December 2026",
  "January 2027",
  "February 2027",
  "March 2027",
  "Later / Flexible",
];

const EMPTY: LeadFormState = { name: "", mobile: "", city: "", travelers: "2 Adults", travel_month: "", travel_style: null };

const REASSURANCE = ["Free consultation", "No obligation", "100% privacy"];

const fieldClass = "enquiry-control";

function Placeholder({ text }: { text: string }) {
  return <span className="text-[#94A3B8] font-normal">{text}</span>;
}

type Step = { kind: "form" } | { kind: "otp"; result: OtpSendResult } | { kind: "done" };

const submitError = (err: unknown) => {
  if (err instanceof ApiError && err.status === 422) {
    const detail = (err.body as { detail?: { msg?: string }[] } | null)?.detail;
    const msg = detail?.[0]?.msg?.replace(/^Value error, /, "");
    if (msg) return msg;
  }
  if (err instanceof ApiError && err.status === 429) {
    const detail = (err.body as { detail?: string } | null)?.detail;
    if (typeof detail === "string") return detail;
  }
  return "Could not submit your enquiry. Please check your details and try again.";
};

export function LeadForm({
  idPrefix = "lead",
  packageName = CUSTOM_PACKAGE,
  formSource = "Hero Form",
}: {
  idPrefix?: string;
  packageName?: string;
  formSource?: string;
}) {
  const [form, setForm] = useState<LeadFormState>(EMPTY);
  const [step, setStep] = useState<Step>({ kind: "form" });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: LeadPayload) => apiPost<OtpSendResult>("/leads", payload),
    onSuccess: (result) => {
      setStep({ kind: "otp", result });
      setForm(EMPTY);
    },
    onError: (err) => setError(submitError(err)),
  });

  const set = (key: keyof LeadFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mutation.isPending) return;
    setError(null);
    mutation.mutate({ ...form, package: packageName, form_source: formSource });
  };

  if (step.kind === "done") return <ThankYou idPrefix={idPrefix} />;
  if (step.kind === "otp") {
    return <OtpStep idPrefix={idPrefix} initial={step.result} onVerified={() => setStep({ kind: "done" })} />;
  }

  return (
    <form data-testid={`${idPrefix}-form`} onSubmit={onSubmit} className="space-y-3">
      <div data-testid={`${idPrefix}-field-grid`} className="grid grid-cols-1 sm:grid-cols-2 items-end gap-x-3 gap-y-3.5">
        <EnquiryField id={`${idPrefix}-name`} label="Full Name">
          <Input
            id={`${idPrefix}-name`}
            data-testid={`${idPrefix}-input-name`}
            className={fieldClass}
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            required
            minLength={2}
            autoComplete="name"
          />
        </EnquiryField>
        <EnquiryField id={`${idPrefix}-mobile`} label="Mobile Number (WhatsApp)">
          <Input
            id={`${idPrefix}-mobile`}
            data-testid={`${idPrefix}-input-mobile`}
            className={fieldClass}
            type="tel"
            inputMode="tel"
            placeholder="+91 98765 43210"
            value={form.mobile}
            onChange={(e) => set("mobile")(e.target.value)}
            required
            minLength={10}
            autoComplete="tel"
          />
        </EnquiryField>
        <EnquiryField id={`${idPrefix}-city`} label="Departure City">
          <Input
            id={`${idPrefix}-city`}
            data-testid={`${idPrefix}-input-city`}
            className={fieldClass}
            placeholder="Delhi"
            value={form.city}
            onChange={(e) => set("city")(e.target.value)}
            required
            minLength={2}
            autoComplete="address-level2"
          />
        </EnquiryField>
        <EnquiryField id={`${idPrefix}-month`} label="Travel Month">
          <Select value={form.travel_month || null} onValueChange={set("travel_month")} required>
            <SelectTrigger id={`${idPrefix}-month`} data-testid={`${idPrefix}-select-month`} className={fieldClass}>
              <SelectValue>{(v: string | null) => v || <Placeholder text="Select month" />}</SelectValue>
            </SelectTrigger>
            <SelectContent data-testid={`${idPrefix}-month-options`}>
              {MONTH_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt} data-testid={`${idPrefix}-month-option-${opt.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </EnquiryField>
        <EnquiryField id={`${idPrefix}-travelers`} label="Number of Travellers">
          <Select value={form.travelers || null} onValueChange={set("travelers")} required>
            <SelectTrigger id={`${idPrefix}-travelers`} data-testid={`${idPrefix}-select-travelers`} className={fieldClass}>
              <SelectValue>{(v: string | null) => v || <Placeholder text="2 Adults" />}</SelectValue>
            </SelectTrigger>
            <SelectContent data-testid={`${idPrefix}-travelers-options`}>
              {TRAVELER_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt} data-testid={`${idPrefix}-travelers-option-${opt.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </EnquiryField>
        <TravelStyleField
          idPrefix={idPrefix}
          value={form.travel_style}
          onChange={(travel_style) => setForm((prev) => ({ ...prev, travel_style }))}
        />
      </div>

      {error && (
        <p data-testid={`${idPrefix}-form-error`} className="text-sm font-medium text-[#B91C1C]">
          {error}
        </p>
      )}

      <Button
        type="submit"
        data-testid={`${idPrefix}-form-submit-button`}
        disabled={mutation.isPending}
        className="w-full h-12 rounded-xl bg-gold hover:bg-gold-deep text-white font-bold text-[13px] sm:text-[15px] uppercase tracking-normal transition-[background-color,box-shadow,transform] duration-200 active:scale-[0.985] gold-glow"
      >
        {mutation.isPending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-5 animate-spin" /> Sending OTP...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            Get My Free Bali Quote <ArrowRight className="size-5" />
          </span>
        )}
      </Button>

      <ul
        data-testid={`${idPrefix}-reassurance`}
        className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-ink-muted"
      >
        {REASSURANCE.map((item, index) => (
          <li key={item} data-testid={`${idPrefix}-reassurance-${index}`} className="inline-flex items-center gap-1">
            <Check className="size-3.5 text-teal-deep" strokeWidth={3} />
            {item}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-line-soft" />
        <span className="text-[11px] uppercase tracking-[0.18em] text-[#94A3B8]">or</span>
        <span className="h-px flex-1 bg-line-soft" />
      </div>

      <WhatsAppButton
        data-testid={`${idPrefix}-whatsapp-cta`}
        variant="ghost"
        className="w-full min-h-11 h-auto justify-center whitespace-normal px-2 py-2 text-center text-xs sm:text-sm leading-5"
        label="Prefer WhatsApp? Chat with a Bali Expert"
      />
    </form>
  );
}
