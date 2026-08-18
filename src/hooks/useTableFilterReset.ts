import { useEffect, type RefObject } from "react";

/**
 * Event a TableFilter dispatches on its form when "clear" is pressed.
 *
 * A native `form.reset()` cannot clear a controlled field: React re-renders it
 * straight back from props, and Radix's own reset handling restores the value
 * the field had when it mounted rather than emptying it. Clearing a filter has
 * to reach the state the field actually reads from, so TableFilter announces
 * the reset and every field that participates in table state answers it.
 */
export const TABLE_FILTER_RESET_EVENT = "clet-table-filter-reset";

/**
 * Subscribe a filter field to its TableFilter's "clear".
 *
 * `ref` is any element the field renders inside the filter's form; the closest
 * form is resolved from it. Fields that do not carry a `name` take no part in
 * table state and pass `enabled: false`.
 */
export function useTableFilterReset(
  ref: RefObject<HTMLElement | null>,
  onReset: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const form = ref.current?.closest("form");
    if (!form) return;

    const handle = () => onReset();
    form.addEventListener(TABLE_FILTER_RESET_EVENT, handle);
    return () => form.removeEventListener(TABLE_FILTER_RESET_EVENT, handle);
  }, [ref, onReset, enabled]);
}
