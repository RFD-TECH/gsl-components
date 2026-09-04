/**
 * Current accessibility text scale, 1 when unset or unreadable.
 *
 * Reads the --gsl-* spelling first, matching the order every stylesheet in the
 * library uses, so a consumer overriding the legacy name gets the same number
 * here as their CSS gets.
 */
export function getTextScale(): number {
  if (typeof document === "undefined") return 1;

  const styles = getComputedStyle(document.documentElement);
  const raw =
    styles.getPropertyValue("--gsl-text-scale").trim() ||
    styles.getPropertyValue("--clet-text-scale").trim();

  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}
