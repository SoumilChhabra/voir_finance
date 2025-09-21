import { useEffect, useState } from "react";
import { isPlatform } from "@ionic/react";

/**
 * Hook: returns true for desktop-like environments (Ionic desktop platform
 * or width >= breakpoint). Used to toggle swipe vs visible action buttons.
 */
export function useIsDesktop(breakpoint: number = 768) {
  const initial =
    typeof window !== "undefined"
      ? isPlatform("desktop") || window.innerWidth >= breakpoint
      : false;
  const [isDesktop, setIsDesktop] = useState(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(min-width:${breakpoint}px)`);
    const handler = () => setIsDesktop(isPlatform("desktop") || mq.matches);
    handler();
    mq.addEventListener("change", handler);
    window.addEventListener("resize", handler);
    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("resize", handler);
    };
  }, [breakpoint]);

  return isDesktop;
}
