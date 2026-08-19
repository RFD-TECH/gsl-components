import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
  type ChangeEvent,
  type ReactNode,
} from "react";
import * as Popover from "@radix-ui/react-popover";
import { Search, FilterIcon, XCircle } from "lucide-react";
import { getRouterAdapter } from "../../hooks/../adapters/registry";
import { useDebounce } from "../../hooks/useDebounce";
import { TABLE_FILTER_RESET_EVENT } from "../../hooks/useTableFilterReset";
import type {
  TableSearchProps,
  TableFilterProps,
  TableActionsProps,
  TableHeaderProps,
} from "../../types/table";
import { cn } from "../../utils/cn";
import "./styles/table.css";
import { useTableContext } from "./TableContext";
import { Button } from "../button";

const FILTER_PREFIX = "f_";

function paramKey(prefix: string | undefined, key: string): string {
  return prefix ? `${prefix}.${key}` : key;
}

// Bundlers replace `process.env.NODE_ENV` in library code, so a production
// build resolves this to false and drops the checks. A browser dev server
// leaves `process` undefined entirely. Unknown means dev, not silence.
const DEV =
  typeof process === "undefined" || process.env?.NODE_ENV !== "production";

/**
 * A TableFilter collects its values from the DOM: it snapshots `FormData` over
 * the fields it wraps, so a field only reaches the URL, and therefore the
 * table's state, when it renders a *named* form control. A field left without
 * `name` looks like it works (it holds its own value) while filtering nothing,
 * so the two invariants that make the mechanism sound are checked in dev and
 * reported loudly rather than left to be discovered on a screen.
 */

function displayNameOf(type: unknown): string {
  if (typeof type === "function") {
    const fn = type as { displayName?: string; name?: string };
    return fn.displayName || fn.name || "field";
  }
  if (typeof type === "string") return `<${type}>`;
  return "field";
}

/**
 * How many fields a spread row lays out inline before it stops reading as a
 * row. Past this the filter groups itself back into the popover: the two
 * variants render the same fields under the same names and URL keys, so a row
 * that has outgrown itself costs nothing to fold away.
 */
const MAX_SPREAD_FILTERS = 2;

/**
 * The fields a filter is rendering. Walks fragments and markup wrappers so a
 * field counts where it sits rather than where it was declared, and falls back
 * to the direct children when nothing announces itself as a field, which is
 * what a consumer's own wrapper component looks like from here.
 */
function countFilterFields(node: ReactNode): number {
  let fields = 0;

  const walk = (current: ReactNode): void => {
    Children.forEach(current, (child) => {
      if (!isValidElement(child)) return;
      const props = child.props as Record<string, unknown>;
      const isField =
        typeof props.onValueChange === "function" ||
        (typeof props.name === "string" && props.name !== "");
      if (isField) {
        fields += 1;
        return;
      }
      walk(props.children as ReactNode);
    });
  };

  walk(node);
  if (fields > 0) return fields;
  return Children.toArray(node).filter((child) => isValidElement(child)).length;
}

/**
 * Invariant 1: every value-carrying field declares `name`.
 *
 * Walks the children the filter was handed, through fragments and plain markup
 * wrappers, and flags any component that takes an `onValueChange` (the kit's
 * select-like fields: Dropdown, Combobox, and anything following that contract)
 * without a `name`. Fields driven by an explicit `onApply`/`onReset` pair are a
 * deliberate manual pattern and are not walked.
 */
function collectUnnamedFields(node: ReactNode, found: string[] = []): string[] {
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;

    const props = child.props as Record<string, unknown>;

    if (child.type === Fragment || typeof child.type === "string") {
      collectUnnamedFields(props.children as ReactNode, found);
      return;
    }

    if (typeof props.onValueChange === "function" && !props.name) {
      found.push(displayNameOf(child.type));
    }
  });
  return found;
}

/**
 * Invariant 2: the fields are seeded from the URL.
 *
 * A filter param that no field carries, or that a field disagrees with, means
 * the screen renders one state while the URL claims another; the next snapshot
 * then rewrites the URL from the DOM and the param is lost on reload.
 */
function reportUnseededFilters(
  form: HTMLFormElement,
  searchParams: URLSearchParams,
  filterPrefix: string,
): void {
  const data = new FormData(form);

  for (const [key, paramValue] of searchParams.entries()) {
    if (!key.startsWith(filterPrefix)) continue;
    const fieldName = key.slice(filterPrefix.length);
    if (!fieldName) continue;

    if (!data.has(fieldName)) {
      console.error(
        `[TableFilter] The URL carries "${key}" but no field inside this ` +
          `TableFilter is named "${fieldName}", so the filter is not applied ` +
          `and the param is dropped on the next change. Add name="${fieldName}" ` +
          `to the field that owns it.`,
      );
      continue;
    }

    const fieldValue = data.get(fieldName);
    if (typeof fieldValue === "string" && fieldValue !== paramValue) {
      console.error(
        `[TableFilter] The field named "${fieldName}" rendered as ` +
          `"${fieldValue}" while the URL says "${paramValue}". Seed its initial ` +
          `value from the URL, useTableState({ paramPrefix }).filters.${fieldName}, ` +
          `so a reload restores what the user had selected.`,
      );
    }
  }
}

export const TableActions = forwardRef<HTMLDivElement, TableActionsProps>(
  function TableActions({ classNames, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-table__actions gsl-table__actions", classNames?.root, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const TableHeader = forwardRef<HTMLDivElement, TableHeaderProps>(
  function TableHeader({ className, classNames, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-table__header-bar gsl-table__header-bar", classNames?.root, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const TableSearch = forwardRef<HTMLInputElement, TableSearchProps>(
  function TableSearch(
    {
      placeholder = "Search...",
      debounceMs = 300,
      onSearch,
      onChange,
      className,
      classNames,
      ...props
    },
    ref,
  ) {
    const { paramPrefix } = useTableContext();
    const searchKey = paramKey(paramPrefix, "search");
    const pageKey = paramKey(paramPrefix, "page");

    const { searchParams, setSearchParams } = getRouterAdapter();
    const urlSearch = searchParams.get(searchKey) ?? "";

    const [value, setValue] = useState(urlSearch);
    const debouncedValue = useDebounce(value, debounceMs);

    // Sync URL → input when URL changes externally (e.g. back/forward, external reset)
    useEffect(() => {
      setValue(urlSearch);
    }, [urlSearch]);

    // Write to URL on debounced change
    useEffect(() => {
      if (debouncedValue === urlSearch) return;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (debouncedValue) {
            next.set(searchKey, debouncedValue);
          } else {
            next.delete(searchKey);
          }
          next.set(pageKey, "1");
          return next;
        },
        { replace: true },
      );
      onSearch?.(debouncedValue);
    }, [
      debouncedValue,
      urlSearch,
      setSearchParams,
      searchKey,
      pageKey,
      onSearch,
    ]);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange?.(e);
      },
      [onChange],
    );

    const clear = useCallback(() => {
      setValue("");
      onChange?.({
        target: { value: "" },
      } as ChangeEvent<HTMLInputElement>);
    }, [onChange]);

    return (
      <div className={cn("clet-table__search gsl-table__search", classNames?.root, className)}>
        <Search
          size={16}
          strokeWidth={1.5}
          className={cn("clet-table__search-icon gsl-table__search-icon", classNames?.icon)}
          aria-hidden
        />
        <input
          ref={ref}
          type="text"
          className={cn("clet-table__search-input gsl-table__search-input", classNames?.input)}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {value && (
          <div
            className={cn("clet-table__search-clear gsl-table__search-clear", classNames?.clear)}
            onClick={clear}
            aria-label="Clear search"
          >
            <XCircle size={16} strokeWidth={1.5} aria-hidden />
          </div>
        )}
      </div>
    );
  },
);

export const TableFilter = forwardRef<HTMLDivElement, TableFilterProps>(
  function TableFilter(
    {
      children,
      onApply,
      onReset,
      applyLabel = "Apply Filter",
      variant = "popover",
      classNames,
      className,
    },
    ref,
  ) {
    const { paramPrefix } = useTableContext();
    const [open, setOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { searchParams, setSearchParams } = getRouterAdapter();

    const filterPrefix = paramKey(paramPrefix, FILTER_PREFIX);

    const activeCount = useMemo(() => {
      let count = 0;
      for (const key of searchParams.keys()) {
        if (key.startsWith(filterPrefix)) count++;
      }
      return count || undefined;
    }, [searchParams, filterPrefix]);

    const handleApply = useCallback(() => {
      const form = formRef.current;
      if (form) {
        const data = new FormData(form);
        const owned = new Set(data.keys());
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            // Clear the filter params this form owns. A param with no field
            // behind it belongs to something else (or to a field that has not
            // mounted yet) and is left alone rather than wiped.
            for (const key of [...next.keys()]) {
              if (
                key.startsWith(filterPrefix) &&
                owned.has(key.slice(filterPrefix.length))
              ) {
                next.delete(key);
              }
            }
            // Set new filter values
            for (const [key, value] of data.entries()) {
              if (value && typeof value === "string" && value !== "") {
                next.set(`${filterPrefix}${key}`, value);
              }
            }
            // Reset to first page
            next.set(paramKey(paramPrefix, "page"), "1");
            return next;
          },
          { replace: true },
        );
      }
      onApply?.();
      setOpen(false);
    }, [setSearchParams, filterPrefix, paramPrefix, onApply]);

    const handleReset = useCallback(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const key of [...next.keys()]) {
            if (key.startsWith(filterPrefix)) {
              next.delete(key);
            }
          }
          return next;
        },
        { replace: true },
      );
      // Native controls reset themselves; controlled fields (Dropdown,
      // Combobox, anything holding its value in React) cannot be reached that
      // way, so the reset is announced to them as well.
      const form = formRef.current;
      form?.reset();
      form?.dispatchEvent(new CustomEvent(TABLE_FILTER_RESET_EVENT));
      onReset?.();
      setOpen(false);
    }, [setSearchParams, filterPrefix, onReset]);

    // Invariant 1: no unnamed field. Checked from the elements themselves, so
    // it fires on the first render whether or not any filter is applied yet.
    useEffect(() => {
      if (!DEV) return;
      const unnamed = collectUnnamedFields(children);
      if (unnamed.length === 0) return;
      console.error(
        `[TableFilter] ${unnamed.join(", ")} ${
          unnamed.length === 1 ? "is" : "are"
        } missing a "name". A filter field without a name is never collected ` +
          `into the table's state: it holds its own value, filters nothing, and ` +
          `is untouched by clear. Give every field a name matching its filter key.`,
      );
    }, [children]);

    // Invariant 2: the fields agree with the URL they were loaded with. Radix
    // mounts its hidden native <select> after the trigger paints, so this waits
    // a tick for the form to be fully populated, and reports once per form.
    const devCheckedFormRef = useRef<HTMLFormElement | null>(null);

    useEffect(() => {
      if (!DEV) return;
      const form = formRef.current;
      if (!form || devCheckedFormRef.current === form) return;
      const id = setTimeout(() => {
        const current = formRef.current;
        if (!current) return;
        devCheckedFormRef.current = current;
        reportUnseededFilters(current, searchParams, filterPrefix);
      }, 0);
      return () => clearTimeout(id);
    }, [children, open, searchParams, filterPrefix]);

    // "spread" is a request, not a guarantee: past the limit the fields group
    // back into the popover, which renders them under the same names and the
    // same URL keys.
    const fieldCount = useMemo(() => countFilterFields(children), [children]);
    const outgrewSpread =
      variant === "spread" && fieldCount > MAX_SPREAD_FILTERS;
    const effectiveVariant = outgrewSpread ? "popover" : variant;

    useEffect(() => {
      if (!DEV || !outgrewSpread) return;
      console.info(
        `[TableFilter] ${fieldCount} filter fields is more than the ${MAX_SPREAD_FILTERS} ` +
          "a spread row stays readable at, so they are grouped into the filter popover " +
          'instead. Drop variant="spread" to say so in the markup.',
      );
    }, [outgrewSpread, fieldCount]);

    // Spread variant has no Apply button — auto-apply whenever a field's
    // value changes. Field changes may come from a Dropdown driving a
    // hidden input (no native "change" event fires for that), so this
    // compares a FormData snapshot after every render instead of relying
    // on DOM change events.
    const spreadSnapshotRef = useRef<string | null>(null);

    useEffect(() => {
      if (effectiveVariant !== "spread") return;
      const form = formRef.current;
      if (!form) return;
      const snapshot = JSON.stringify([...new FormData(form).entries()]);
      if (spreadSnapshotRef.current === null) {
        spreadSnapshotRef.current = snapshot;
        return;
      }
      if (snapshot !== spreadSnapshotRef.current) {
        spreadSnapshotRef.current = snapshot;
        handleApply();
      }
    });

    if (effectiveVariant === "spread") {
      return (
        <div
          ref={ref}
          className={cn(
            "clet-table__filter gsl-table__filter",
            "clet-table__filter--spread gsl-table__filter--spread",
            classNames?.root,
            className,
          )}
        >
          {children && (
            <form
              ref={formRef}
              className={cn(
                "clet-table__filter-fields gsl-table__filter-fields",
                "clet-table__filter-fields--spread gsl-table__filter-fields--spread",
                classNames?.fields,
              )}
            >
              {children}
            </form>
          )}

          {/* Inline variant: the reset only exists when a filter is actually
              applied, so the row never carries a control with nothing to do. */}
          {activeCount != null && activeCount > 0 && (
            <div
              className={cn(
                "clet-table__filter-actions gsl-table__filter-actions",
                "clet-table__filter-actions--spread gsl-table__filter-actions--spread",
                classNames?.actions,
              )}
            >
              <button
                type="button"
                className={cn(
                  "clet-table__filter-btn--reset gsl-table__filter-btn--reset",
                  classNames?.resetButton,
                )}
                onClick={handleReset}
              >
                clear
                <XCircle size={14} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("clet-table__filter gsl-table__filter", classNames?.root, className)}
      >
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button
              className={cn("clet-table__filter-trigger gsl-table__filter-trigger", classNames?.trigger)}
              aria-label="Filter"
            >
              <FilterIcon size={14} strokeWidth={1.5} aria-hidden />
              Filters
              {activeCount != null && activeCount > 0 && (
                <span
                  className={cn("clet-table__filter-badge gsl-table__filter-badge", classNames?.badge)}
                >
                  {activeCount}
                </span>
              )}
            </Button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className={cn("clet-table__filter-content gsl-table__filter-content", classNames?.content)}
              side="bottom"
              align="end"
              sideOffset={6}
            >
              <div
                className={cn("clet-table__filter-header gsl-table__filter-header", classNames?.header)}
              >
                <div>Filters</div>
                <button
                  type="button"
                  className={cn(
                    "clet-table__filter-btn--reset gsl-table__filter-btn--reset",
                    classNames?.resetButton,
                  )}
                  onClick={handleReset}
                >
                  clear
                  <XCircle size={14} strokeWidth={1.5} />
                </button>
              </div>

              {children && (
                <form
                  ref={formRef}
                  className={cn("clet-table__filter-fields gsl-table__filter-fields", classNames?.fields)}
                >
                  {children}
                </form>
              )}

              <div
                className={cn("clet-table__filter-actions gsl-table__filter-actions", classNames?.actions)}
              >
                <button
                  type="button"
                  className={cn(
                    "clet-table__filter-btn gsl-table__filter-btn clet-table__filter-btn--apply gsl-table__filter-btn--apply",
                    classNames?.applyButton,
                  )}
                  onClick={handleApply}
                >
                  {applyLabel}
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    );
  },
);
