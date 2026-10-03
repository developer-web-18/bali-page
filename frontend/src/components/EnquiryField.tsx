import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function EnquiryField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      data-testid={`${id}-field`}
      className="grid min-w-0 gap-1.5"
    >
      <Label htmlFor={id} className="text-[13px] leading-4 font-semibold text-navy">
        {label}
      </Label>
      {children}
    </div>
  );
}