import { useEffect, useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { ApiError, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface OtpSendResult {
  lead_id: string;
  otp_status: "unverified" | "verified";
  otp_sent: boolean;
  masked_mobile: string;
  resend_cooldown_seconds: number;
  resends_left: number;
  message: string;
}

const errorMessage = (err: unknown, fallback: string) => {
  if (err instanceof ApiError) {
    const detail = (err.body as { detail?: unknown } | null)?.detail;
    if (typeof detail === "string") return detail;
    if (detail && typeof detail === "object" && "message" in detail) return String((detail as { message: string }).message);
  }
  return fallback;
};

const btnClass =
  "w-full h-12 rounded-xl bg-gold hover:bg-gold-deep text-white font-bold text-[15px] uppercase tracking-[0.08em] transition-[background-color,box-shadow,transform] duration-200 hover:scale-[1.015] active:scale-[0.985] gold-glow disabled:opacity-60";

function OtpBoxes({ value, onChange, idPrefix, disabled }: { value: string; onChange: (v: string) => void; idPrefix: string; disabled: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const setAt = (i: number, d: string) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join(""));
  };

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    onChange(text);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  return (
    <div className="flex justify-between gap-2" data-testid={`${idPrefix}-otp-inputs`}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          data-testid={`${idPrefix}-otp-digit-${i}`}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={d}
          onPaste={onPaste}
          onKeyDown={onKeyDown(i)}
          onChange={(e) => {
            const c = e.target.value.replace(/\D/g, "").slice(-1);
            setAt(i, c);
            if (c && i < 5) refs.current[i + 1]?.focus();
          }}
          className="h-13 w-full max-w-[52px] rounded-xl border border-[#CBD5E1] bg-white text-center font-heading text-2xl font-semibold text-navy outline-none transition-[border-color,box-shadow] duration-200 focus:border-teal-brand focus:ring-2 focus:ring-teal-brand/30 disabled:opacity-60"
        />
      ))}
    </div>
  );
}

export function OtpStep({
  idPrefix,
  initial,
  onVerified,
}: {
  idPrefix: string;
  initial: OtpSendResult;
  onVerified: () => void;
}) {
  const [state, setState] = useState<OtpSendResult>(initial);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(initial.otp_sent ? initial.message : null);
  const [changing, setChanging] = useState(false);
  const [newMobile, setNewMobile] = useState("");
  const [cooldown, setCooldown] = useState(initial.otp_sent ? initial.resend_cooldown_seconds : 0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const applySend = (res: OtpSendResult) => {
    setState(res);
    setOtp("");
    setError(res.otp_sent ? null : res.message);
    setNotice(res.otp_sent ? res.message : null);
    setCooldown(res.otp_sent ? res.resend_cooldown_seconds : 0);
  };

  const verify = async () => {
    if (otp.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await apiPost(`/leads/${state.lead_id}/verify-otp`, { otp });
      onVerified();
    } catch (err) {
      setError(errorMessage(err, "We couldn't verify the code right now. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      applySend(await apiPost<OtpSendResult>(`/leads/${state.lead_id}/resend-otp`));
    } catch (err) {
      setError(errorMessage(err, "We couldn't send the verification code right now. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const changeNumber = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      applySend(await apiPost<OtpSendResult>(`/leads/${state.lead_id}/change-number`, { mobile: newMobile }));
      setChanging(false);
      setNewMobile("");
    } catch (err) {
      setError(errorMessage(err, "Enter a valid 10-digit Indian mobile number"));
    } finally {
      setBusy(false);
    }
  };

  if (changing) {
    return (
      <div data-testid={`${idPrefix}-change-number`} className="space-y-4">
        <button
          type="button"
          data-testid={`${idPrefix}-change-number-back`}
          onClick={() => {
            setChanging(false);
            setError(null);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-teal-brand"
        >
          <ArrowLeft className="size-3.5" /> Back to OTP
        </button>
        <div>
          <h3 className="font-heading text-xl font-semibold text-navy">Change WhatsApp Number</h3>
          <p className="mt-1 text-sm text-ink-muted">We&apos;ll send a new verification code to the updated number.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-new-mobile`} className="text-[13px] font-semibold text-navy">
            Mobile Number (WhatsApp)
          </Label>
          <Input
            id={`${idPrefix}-new-mobile`}
            data-testid={`${idPrefix}-new-mobile-input`}
            type="tel"
            inputMode="tel"
            placeholder="+91 98765 43210"
            value={newMobile}
            onChange={(e) => setNewMobile(e.target.value)}
            className="h-11 rounded-xl border-[#CBD5E1] text-navy placeholder:text-[#94A3B8] focus-visible:ring-teal-brand/40"
          />
        </div>
        {error && <p data-testid={`${idPrefix}-otp-error`} className="text-sm font-medium text-[#B91C1C]">{error}</p>}
        <Button type="button" data-testid={`${idPrefix}-change-number-submit`} onClick={changeNumber} disabled={busy || newMobile.replace(/\D/g, "").length < 10} className={btnClass}>
          {busy ? (<span className="inline-flex items-center gap-2"><Loader2 className="size-5 animate-spin" /> Sending OTP...</span>) : "Send OTP to New Number"}
        </Button>
      </div>
    );
  }

  return (
    <div data-testid={`${idPrefix}-otp-step`} className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-pale text-teal-deep">
          <ShieldCheck className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <h3 data-testid={`${idPrefix}-otp-heading`} className="font-heading text-xl font-semibold text-navy leading-tight">
            Verify Your WhatsApp Number
          </h3>
          <p data-testid={`${idPrefix}-otp-subtext`} className="mt-1 text-sm text-ink-muted">
            We&apos;ve sent a 6-digit verification code to <span className="font-semibold text-navy whitespace-nowrap">{state.masked_mobile}</span>
          </p>
        </div>
      </div>

      <OtpBoxes value={otp} onChange={(v) => { setOtp(v); setError(null); }} idPrefix={idPrefix} disabled={busy} />

      {notice && !error && (
        <p data-testid={`${idPrefix}-otp-notice`} className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-deep">
          <CheckCircle2 className="size-3.5" /> {notice}
        </p>
      )}
      {error && <p data-testid={`${idPrefix}-otp-error`} className="text-sm font-medium text-[#B91C1C]">{error}</p>}

      <Button type="button" data-testid={`${idPrefix}-verify-otp-btn`} onClick={verify} disabled={busy || otp.length !== 6} className={btnClass}>
        {busy ? (<span className="inline-flex items-center gap-2"><Loader2 className="size-5 animate-spin" /> Verifying...</span>) : "Verify OTP"}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
        <span>
          Didn&apos;t receive the code?{" "}
          {cooldown > 0 ? (
            <span data-testid={`${idPrefix}-resend-countdown`} className="font-semibold text-navy">Resend OTP in {cooldown}s</span>
          ) : (
            <button
              type="button"
              data-testid={`${idPrefix}-resend-otp-btn`}
              onClick={resend}
              disabled={busy || state.resends_left <= 0}
              className="font-bold uppercase tracking-[0.08em] text-gold hover:text-gold-deep disabled:text-[#94A3B8] disabled:cursor-not-allowed"
            >
              {state.resends_left > 0 ? "Resend OTP" : "Resend limit reached"}
            </button>
          )}
        </span>
        <button
          type="button"
          data-testid={`${idPrefix}-change-number-btn`}
          onClick={() => { setChanging(true); setError(null); }}
          className="font-semibold text-navy underline-offset-2 hover:underline"
        >
          Change Number
        </button>
      </div>
    </div>
  );
}

export function ThankYou({ idPrefix }: { idPrefix: string }) {
  return (
    <div data-testid={`${idPrefix}-thank-you`} className="py-4 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#DCFCE7] text-teal-deep">
        <CheckCircle2 className="size-8" strokeWidth={2} />
      </span>
      <h3 className="mt-4 font-heading text-2xl font-semibold text-navy">Thank You!</h3>
      <p className="mt-2 text-sm text-ink-muted leading-relaxed">
        Your Bali enquiry has been received. Our travel expert will contact you shortly.
      </p>
    </div>
  );
}
