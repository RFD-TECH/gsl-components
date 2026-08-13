import markBird from "./assets/mark-bird.png";
import markCrossed from "./assets/mark-crossed.png";
import markLattice from "./assets/mark-lattice.png";
import markQuatrefoil from "./assets/mark-quatrefoil.png";
import markRings from "./assets/mark-rings.png";
import type { MetricCardMark } from "../../types/metric-card";

/** Order matters: `pickMark` indexes into MARK_IDS. Append new ones at the end. */
export const MARKS: Record<MetricCardMark, string> = {
  rings: markRings,
  lattice: markLattice,
  quatrefoil: markQuatrefoil,
  bird: markBird,
  crossed: markCrossed,
};

export const MARK_IDS = Object.keys(MARKS) as MetricCardMark[];

/** FNV-1a, so the same label always draws the same mark. */
export function pickMark(seed: string): MetricCardMark {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return MARK_IDS[hash % MARK_IDS.length];
}
