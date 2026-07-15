"use client";

import { useState, useEffect } from "react";

/**
 * useTypewriter — types out `text` character by character, then optionally
 * calls onDone. Used to animate the landing page's fake chat demo so it
 * feels alive instead of static.
 */
export function useTypewriter(text: string, options: { speed?: number; startDelay?: number; onDone?: () => void; active?: boolean } = {}) {
  const { speed = 25, startDelay = 0, onDone, active = true } = options;
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    setDisplayed("");
    setDone(false);

    let i = 0;
    let interval: ReturnType<typeof setInterval>;

    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
          onDone?.();
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, active]);

  return { displayed, done };
}