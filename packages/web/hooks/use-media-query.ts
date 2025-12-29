"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create a stable event handler
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Use addEventListener if available (modern browsers), fallback to addListener (older Safari)
    if (media.addEventListener) {
      media.addEventListener("change", listener);
    } else if (media.addListener) {
      media.addListener(listener);
    }

    // Cleanup function
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener);
      } else if (media.removeListener) {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}
