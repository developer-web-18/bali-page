import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

let lenis: Lenis | null = null;

export function useLenis() {
  useEffect(() => {
    const instance = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis = instance;
    let rafId = 0;
    const raf = (time: number) => {
      instance.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      instance.destroy();
      if (lenis === instance) lenis = null;
    };
  }, []);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: -72, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function focusLeadForm() {
  scrollToId("lead-form");
  window.setTimeout(() => {
    document.getElementById("lead-mobile")?.focus({ preventScroll: true });
  }, 700);
}
