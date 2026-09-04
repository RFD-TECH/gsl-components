import { useEffect, useState } from "react";
import { getTextScale } from "../utils/textScale";

const FONT_SIZE_ATTRIBUTE = "data-clet-font-size";

/**
 * Tracks the accessibility text scale for measurements CSS cannot express,
 * such as a virtualiser's row-height estimate. Re-reads when the step changes.
 */
export function useTextScale(): number {
  const [scale, setScale] = useState(getTextScale);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const observer = new MutationObserver(() => setScale(getTextScale()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [FONT_SIZE_ATTRIBUTE],
    });

    // The attribute can land between first render and this effect.
    setScale(getTextScale());

    return () => observer.disconnect();
  }, []);

  return scale;
}

/**
 * A base pixel height scaled to the current text step, for a virtualiser whose
 * rows are sized from the same scale. Only use it where the row's rendered
 * height actually follows the scale, or the estimate drifts from reality.
 */
export function useScaledRowHeight(basePx: number): number {
  return Math.round(basePx * useTextScale());
}
