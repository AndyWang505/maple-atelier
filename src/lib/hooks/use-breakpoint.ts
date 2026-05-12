"use client";

import { useSyncExternalStore } from "react";

// Tailwind v4 breakpoints: sm=640, md=768, lg=1024, xl=1280, 2xl=1536

function makeMq(query: string) {
  const subscribe = (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
  const getSnapshot = () => window.matchMedia(query).matches;
  return { subscribe, getSnapshot };
}

const mqMobile = makeMq("(max-width: 639px)");   // < sm
const mqTablet = makeMq("(max-width: 1023px)");  // < lg (mobile + tablet)

/** < 640px (Tailwind sm 以下) */
export function useIsMobile(): boolean {
  return useSyncExternalStore(mqMobile.subscribe, mqMobile.getSnapshot, () => false);
}

/** < 1024px (Tailwind lg 以下,含手機與平板) */
export function useIsBelowLg(): boolean {
  return useSyncExternalStore(mqTablet.subscribe, mqTablet.getSnapshot, () => false);
}
