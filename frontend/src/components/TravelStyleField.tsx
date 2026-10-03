export type TravelStyle = "Budget" | "Luxury" | null;

export function TravelStyleField({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: TravelStyle;
  onChange: (value: TravelStyle) => void;
}) {
  return (
    <div data-testid={`${idPrefix}-travel-style-field`} className="grid min-w-0 gap-1.5">
      <span id={`${idPrefix}-travel-style-label`} className="text-[13px] leading-4 font-semibold text-navy">
        Travel Style
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${idPrefix}-travel-style-label`}
        data-testid={`${idPrefix}-travel-style-group`}
        className="flex h-11 items-center gap-4 sm:gap-3 text-sm text-navy"
      >
        {(["Budget", "Luxury"] as const).map((style) => (
          <label key={style} className="inline-flex min-h-11 cursor-pointer items-center gap-1.5">
            <input
              type="radio"
              name={`${idPrefix}-travel-style`}
              value={style}
              checked={value === style}
              onChange={() => onChange(style)}
              data-testid={`${idPrefix}-travel-style-${style.toLowerCase()}`}
              className="size-4 shrink-0 cursor-pointer accent-teal-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-brand"
            />
            {style}
          </label>
        ))}
      </div>
    </div>
  );
}