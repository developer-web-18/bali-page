import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageCarousel({
  images,
  alt,
  testId,
  className,
}: {
  images: readonly string[];
  alt: string;
  testId: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const last = images.length - 1;

  const go = (next: number) => setIndex(Math.min(last, Math.max(0, next)));

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
  };

  return (
    <div
      data-testid={testId}
      className={cn("group/carousel relative aspect-[16/10] overflow-hidden bg-mist touch-pan-y select-none", className)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (startX.current = null)}
    >
      <div
        data-testid={`${testId}-track`}
        className="flex h-full will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${alt} — photo ${i + 1} of ${images.length}`}
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
            className="h-full w-full shrink-0 object-cover"
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous image"
        data-testid={`${testId}-prev`}
        disabled={index === 0}
        onClick={() => go(index - 1)}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-white/90 text-navy shadow-md backdrop-blur transition-[opacity,transform,background-color] duration-200 hover:bg-white hover:scale-105 disabled:opacity-0 disabled:pointer-events-none"
      >
        <ChevronLeft className="size-5" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        aria-label="Next image"
        data-testid={`${testId}-next`}
        disabled={index === last}
        onClick={() => go(index + 1)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-white/90 text-navy shadow-md backdrop-blur transition-[opacity,transform,background-color] duration-200 hover:bg-white hover:scale-105 disabled:opacity-0 disabled:pointer-events-none"
      >
        <ChevronRight className="size-5" strokeWidth={2.25} />
      </button>

      <div
        data-testid={`${testId}-dots`}
        className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5"
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Show image ${i + 1}`}
            aria-current={i === index}
            data-testid={`${testId}-dot-${i}`}
            onClick={() => go(i)}
            className={cn(
              "h-1.5 rounded-full bg-white/70 shadow transition-[width,background-color] duration-300",
              i === index ? "w-5 bg-white" : "w-1.5 hover:bg-white"
            )}
          />
        ))}
      </div>
    </div>
  );
}
