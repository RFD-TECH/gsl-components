import markBird from "./assets/mark-bird.png";
import markCrossed from "./assets/mark-crossed.png";
import markLattice from "./assets/mark-lattice.png";
import markQuatrefoil from "./assets/mark-quatrefoil.png";
import markRings from "./assets/mark-rings.png";
import type { MetricCardMark } from "../../types/metric-card";

/**
 * The bundled watermark set, keyed by id. Order matters: `pickMark` indexes into
 * MARK_IDS, so inserting in the middle would reshuffle which mark every
 * existing card lands on. Append new ones at the end.
 */
export const MARKS: Record<MetricCardMark, string> = {
  rings: markRings,
  lattice: markLattice,
  quatrefoil: markQuatrefoil,
  bird: markBird,
  crossed: markCrossed,
};

export const MARK_IDS = Object.keys(MARKS) as MetricCardMark[];

/**
 * Deterministically maps a string to one of the bundled marks, so a card that
 * doesn't name one still gets a stable choice: the same label always draws the
 * same mark across reloads and across machines, and a row of differently
 * labelled cards spreads across the set instead of repeating one.
 *
 * FNV-1a: short, dependency-free, and far better distributed over short ASCII
 * labels than a plain character sum, which would collide on anagrams and
 * cluster badly across a handful of buckets.
 */
export function pickMark(seed: string): MetricCardMark {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return MARK_IDS[hash % MARK_IDS.length];
}
