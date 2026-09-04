import type { UnsafeFileNameReason } from "../types/upload-field";

/* NUL and the other C0 controls. A NUL is the classic poison-null-byte trick:
   a backend handing the name to a C string API reads "shell.php" followed by a
   NUL and ".jpg" as just "shell.php", so the extension it checks and the file
   it saves disagree. */
// eslint-disable-next-line no-control-regex -- matching control characters is the point
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;

/** A separator means the name can escape its directory once joined to a path. */
const PATH_SEPARATORS = /[/\\]/;

/* Bidi overrides reorder rendered text, so a name can render as a harmless
   image while its real trailing extension is something else entirely. */
const BIDI_OVERRIDES = /[\u202A-\u202E\u2066-\u2069]/;

// eslint-disable-next-line no-control-regex -- matching control characters is the point
const UNSAFE_DISPLAY_CHARACTERS = /[\u0000-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g;

/**
 * First reason a file name is unsafe to accept, or null when it looks fine.
 *
 * This is a usability and defence-in-depth check, NOT a security boundary: an
 * attacker skips the browser and posts to the API directly. The server has to
 * run the same rule on the name it receives.
 */
export function findUnsafeFileNameReason(name: string): UnsafeFileNameReason | null {
  if (!name || !name.trim()) return "empty";
  if (CONTROL_CHARACTERS.test(name)) return "control-character";
  if (PATH_SEPARATORS.test(name)) return "path-separator";
  if (BIDI_OVERRIDES.test(name)) return "bidi-override";
  return null;
}

/** True when the name carries none of the patterns above. */
export function isSafeFileName(name: string): boolean {
  return findUnsafeFileNameReason(name) === null;
}

/**
 * Replaces the offending characters with U+FFFD so they are visible. Echoing a
 * rejected name back verbatim would let a bidi override disguise it in the
 * error message as well.
 */
export function sanitizeFileNameForDisplay(name: string): string {
  return name.replace(UNSAFE_DISPLAY_CHARACTERS, "\uFFFD");
}
