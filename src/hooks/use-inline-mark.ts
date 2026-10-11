"use client";

import { useLayoutEffect, useRef, useState } from "react";

export type InlineMarkMode = "group" | "word" | "none";

function measureText(paragraph: HTMLElement, text: string) {
  const probe = document.createElement("span");
  probe.textContent = text;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.whiteSpace = "pre";
  paragraph.appendChild(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width;
}

export function useInlineMark(previousWord: string, token: string) {
  const markRef = useRef<HTMLImageElement>(null);
  const modeRef = useRef<InlineMarkMode>("none");
  const [mode, setMode] = useState<InlineMarkMode>("none");

  useLayoutEffect(() => {
    const mark = markRef.current;
    const paragraph = mark?.closest("p");
    if (!mark || !paragraph) return;

    const measure = () => {
      if (!previousWord) {
        if (modeRef.current !== "none") {
          modeRef.current = "none";
          setMode("none");
        }
        return;
      }

      const style = getComputedStyle(mark);
      const box =
        mark.getBoundingClientRect().width +
        (parseFloat(style.marginLeft) || 0) +
        (parseFloat(style.marginRight) || 0);
      const line = paragraph.clientWidth;
      const word = measureText(paragraph, previousWord);
      const name = measureText(paragraph, token);

      let next: InlineMarkMode = "none";
      if (word + box + name <= line + 1) next = "group";
      else if (word + box <= line + 1) next = "word";

      if (next !== modeRef.current) {
        modeRef.current = next;
        setMode(next);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(paragraph);
    return () => observer.disconnect();
  }, [previousWord, token]);

  return { markRef, mode };
}
