import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Popover from "@radix-ui/react-popover";
import { Clock } from "lucide-react";
import type {
  TimeSelectorClassNames,
  TimeSelectorMeridiem,
  TimeSelectorProps,
  TimeValue,
} from "../../types/time-selector";
import { Button } from "../button";
import { cn } from "../../utils/cn";
import "./styles/time-selector.css";

const HOURS_PER_HALF_DAY = 12;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const DIAL_POSITIONS = 12;
const DEGREES_PER_POSITION = 360 / DIAL_POSITIONS;
const DIAL_START_ANGLE = -90;
const DIAL_OUTER_RADIUS = 40;
const DIAL_INNER_RADIUS = 22;
const MINUTES_PER_DIAL_STEP = 5;
/** How long the wheel must stop moving before its resting option is committed. */
const WHEEL_SETTLE_MS = 120;
/** How long imperative scrolls suppress the settle handler for. */
const WHEEL_SUPPRESS_MS = 260;

interface WheelOption {
  value: number;
  label: string;
}

interface DialNumber {
  value: number;
  label: string;
  index: number;
  radius: number;
  /** True for the 24-hour scale's inner 00–11 ring. */
  inner?: boolean;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function clampInt(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function toMeridiem(hours24: number): TimeSelectorMeridiem {
  return hours24 < HOURS_PER_HALF_DAY ? "AM" : "PM";
}

function to12Hour(hours24: number): number {
  const mod = hours24 % HOURS_PER_HALF_DAY;
  return mod === 0 ? HOURS_PER_HALF_DAY : mod;
}

function to24Hour(hours12: number, meridiem: TimeSelectorMeridiem): number {
  const base = hours12 % HOURS_PER_HALF_DAY;
  return meridiem === "AM" ? base : base + HOURS_PER_HALF_DAY;
}

function isSameTime(a: TimeValue | null, b: TimeValue | null): boolean {
  if (a === null || b === null) return a === b;
  return a.hours === b.hours && a.minutes === b.minutes;
}

/** Position of a dial number, as percentages of the square dial's box. */
function dialPosition(index: number, radius: number): { left: string; top: string } {
  const angle = ((DIAL_START_ANGLE + index * DEGREES_PER_POSITION) * Math.PI) / 180;
  return {
    left: `${50 + radius * Math.cos(angle)}%`,
    top: `${50 + radius * Math.sin(angle)}%`,
  };
}

/* ─────────────────────────── Wheel column ─────────────────────────── */

interface TimeWheelProps {
  options: WheelOption[];
  value: number;
  onSelect: (value: number) => void;
  label: string;
  classNames?: TimeSelectorClassNames;
}

function TimeWheel({ options, value, onSelect, label, classNames }: TimeWheelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const suppressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const suppressed = useRef(false);
  const fromScroll = useRef(false);

  const activeIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  );

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior) => {
    const list = listRef.current;
    if (!list || index < 0) return;
    const item = list.children[index];
    if (!(item instanceof HTMLElement)) return;

    const listBox = list.getBoundingClientRect();
    const itemBox = item.getBoundingClientRect();
    const delta =
      itemBox.top + itemBox.height / 2 - (listBox.top + listBox.height / 2);
    if (Math.abs(delta) < 1) return;

    suppressed.current = true;
    clearTimeout(suppressTimer.current);
    suppressTimer.current = setTimeout(() => {
      suppressed.current = false;
    }, WHEEL_SUPPRESS_MS);

    list.scrollTo({ top: list.scrollTop + delta, behavior });
  }, []);

  // Keep the resting option centred when the value changes from anywhere other
  // than the user's own scrolling (mount, option click, controlled update).
  useEffect(() => {
    if (fromScroll.current) {
      fromScroll.current = false;
      return;
    }
    scrollToIndex(activeIndex, "auto");
  }, [activeIndex, scrollToIndex]);

  useEffect(
    () => () => {
      clearTimeout(settleTimer.current);
      clearTimeout(suppressTimer.current);
    },
    [],
  );

  const handleScroll = useCallback(() => {
    if (suppressed.current) return;
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const list = listRef.current;
      if (!list) return;

      const middle = list.scrollTop + list.clientHeight / 2;
      let nearest = -1;
      let nearestDistance = Number.POSITIVE_INFINITY;

      Array.from(list.children).forEach((child, index) => {
        if (!(child instanceof HTMLElement)) return;
        const distance = Math.abs(child.offsetTop + child.offsetHeight / 2 - middle);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }
      });

      const option = options[nearest];
      if (option && option.value !== value) {
        fromScroll.current = true;
        onSelect(option.value);
      }
    }, WHEEL_SETTLE_MS);
  }, [onSelect, options, value]);

  return (
    <div
      ref={listRef}
      className={cn("clet-time-selector__wheel gsl-time-selector__wheel", classNames?.wheel)}
      role="listbox"
      aria-label={label}
      tabIndex={-1}
      onScroll={handleScroll}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={cn(
              "clet-time-selector__wheel-option gsl-time-selector__wheel-option",
              selected &&
                "clet-time-selector__wheel-option--selected gsl-time-selector__wheel-option--selected",
              classNames?.wheelOption,
            )}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ──────────────────────────── Clock dial ──────────────────────────── */

interface ClockDialProps {
  numbers: DialNumber[];
  activeValue: number;
  onSelect: (value: number) => void;
  label: string;
  classNames?: TimeSelectorClassNames;
}

function ClockDial({ numbers, activeValue, onSelect, label, classNames }: ClockDialProps) {
  const active = useMemo(
    () => numbers.find((number) => number.value === activeValue),
    [numbers, activeValue],
  );

  // Two rings only happen on the 24-hour scale, which needs a roomier face.
  const isDualRing = useMemo(() => numbers.some((number) => number.inner), [numbers]);

  const handStyle = useMemo(() => {
    if (!active) return undefined;
    return {
      width: `${active.radius}%`,
      transform: `rotate(${DIAL_START_ANGLE + active.index * DEGREES_PER_POSITION}deg)`,
    };
  }, [active]);

  return (
    <div
      className={cn(
        "clet-time-selector__dial gsl-time-selector__dial",
        isDualRing && "clet-time-selector__dial--dual gsl-time-selector__dial--dual",
        classNames?.dial,
      )}
      role="listbox"
      aria-label={label}
    >
      {handStyle ? (
        <span
          className={cn(
            "clet-time-selector__dial-hand gsl-time-selector__dial-hand",
            classNames?.dialHand,
          )}
          style={handStyle}
          aria-hidden
        />
      ) : null}

      {numbers.map((number) => {
        const selected = number.value === activeValue;
        return (
          <button
            key={number.value}
            type="button"
            role="option"
            aria-selected={selected}
            aria-label={number.label}
            style={dialPosition(number.index, number.radius)}
            className={cn(
              "clet-time-selector__dial-number gsl-time-selector__dial-number",
              number.inner &&
                "clet-time-selector__dial-number--inner gsl-time-selector__dial-number--inner",
              selected &&
                "clet-time-selector__dial-number--selected gsl-time-selector__dial-number--selected",
              classNames?.dialNumber,
            )}
            onClick={() => onSelect(number.value)}
          >
            {number.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── TimeSelector ─────────────────────────── */

export const TimeSelector = forwardRef<HTMLDivElement, TimeSelectorProps>(
  function TimeSelector(
    {
      variant = "wheel",
      value: controlledValue,
      defaultValue,
      onChange,
      placeholder = "Select time",
      hourCycle = 12,
      minuteStep = 1,
      title = "Select time",
      cancelLabel = "Cancel",
      confirmLabel,
      formatOptions,
      invalid = false,
      disabled = false,
      classNames,
      className,
      name,
      onBlur,
    },
    ref,
  ) {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<TimeValue | null>(
      defaultValue ?? null,
    );
    const selected = isControlled ? (controlledValue ?? null) : internalValue;

    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState<TimeValue>(
      () => selected ?? { hours: 0, minutes: 0 },
    );
    const [dialMode, setDialMode] = useState<"hour" | "minute">("hour");
    const [hourDraft, setHourDraft] = useState<string | null>(null);
    const [minuteDraft, setMinuteDraft] = useState<string | null>(null);

    const is12Hour = hourCycle === 12;
    const meridiem = toMeridiem(pending.hours);
    const displayHours = is12Hour ? to12Hour(pending.hours) : pending.hours;
    const resolvedConfirmLabel =
      confirmLabel ?? (variant === "clock" ? "Apply" : "Save");

    /* ── Trigger text ── */

    const displayText = useMemo(() => {
      if (!selected) return "";
      const date = new Date(2000, 0, 1, selected.hours, selected.minutes);
      return date.toLocaleTimeString(
        "en-US",
        formatOptions ?? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: is12Hour,
        },
      );
    }, [selected, formatOptions, is12Hour]);

    /* ── Wheel options ── */

    const hourOptions = useMemo<WheelOption[]>(() => {
      if (is12Hour) {
        return Array.from({ length: HOURS_PER_HALF_DAY }, (_, i) => {
          const hour = i + 1;
          return { value: hour, label: pad2(hour) };
        });
      }
      return Array.from({ length: HOURS_PER_DAY }, (_, hour) => ({
        value: hour,
        label: pad2(hour),
      }));
    }, [is12Hour]);

    const minuteOptions = useMemo<WheelOption[]>(() => {
      const step = clampInt(minuteStep, 1, MINUTES_PER_HOUR);
      const count = Math.ceil(MINUTES_PER_HOUR / step);
      return Array.from({ length: count }, (_, i) => {
        const minute = i * step;
        return { value: minute, label: pad2(minute) };
      });
    }, [minuteStep]);

    /* ── Dial numbers ── */

    const dialNumbers = useMemo<DialNumber[]>(() => {
      if (dialMode === "minute") {
        return Array.from({ length: DIAL_POSITIONS }, (_, index) => {
          const minute = index * MINUTES_PER_DIAL_STEP;
          return {
            value: minute,
            label: pad2(minute),
            index,
            radius: DIAL_OUTER_RADIUS,
          };
        });
      }

      if (is12Hour) {
        // 12 sits at the top, then 1 through 11 clockwise.
        return Array.from({ length: DIAL_POSITIONS }, (_, index) => {
          const hour = index === 0 ? HOURS_PER_HALF_DAY : index;
          return {
            value: hour,
            label: pad2(hour),
            index,
            radius: DIAL_OUTER_RADIUS,
          };
        });
      }

      // 24-hour: 12–23 on the outer ring, 00–11 on the inner ring.
      const outer = Array.from({ length: DIAL_POSITIONS }, (_, index) => {
        const hour = HOURS_PER_HALF_DAY + index;
        return { value: hour, label: pad2(hour), index, radius: DIAL_OUTER_RADIUS };
      });
      const inner = Array.from({ length: DIAL_POSITIONS }, (_, index) => ({
        value: index,
        label: pad2(index),
        index,
        radius: DIAL_INNER_RADIUS,
        inner: true,
      }));
      return [...outer, ...inner];
    }, [dialMode, is12Hour]);

    const dialActiveValue = dialMode === "minute" ? pending.minutes : displayHours;

    /* ── Pending edits ── */

    const setPendingHours = useCallback((hours: number) => {
      setPending((prev) => ({ ...prev, hours }));
    }, []);

    const handleWheelHour = useCallback(
      (hour: number) => {
        setPendingHours(is12Hour ? to24Hour(hour, toMeridiem(pending.hours)) : hour);
      },
      [is12Hour, pending.hours, setPendingHours],
    );

    const handleWheelMinute = useCallback((minutes: number) => {
      setPending((prev) => ({ ...prev, minutes }));
    }, []);

    const handleMeridiem = useCallback(
      (next: TimeSelectorMeridiem) => {
        setPendingHours(to24Hour(to12Hour(pending.hours), next));
      },
      [pending.hours, setPendingHours],
    );

    // The meridiem column is a wheel like the others, so it speaks in numbers:
    // 0 = AM, 1 = PM.
    const meridiemOptions = useMemo<WheelOption[]>(
      () => [
        { value: 0, label: "AM" },
        { value: 1, label: "PM" },
      ],
      [],
    );

    const handleMeridiemWheel = useCallback(
      (next: number) => {
        handleMeridiem(next === 0 ? "AM" : "PM");
      },
      [handleMeridiem],
    );

    const handleDialSelect = useCallback(
      (next: number) => {
        if (dialMode === "minute") {
          setPending((prev) => ({ ...prev, minutes: next }));
          return;
        }
        setPendingHours(is12Hour ? to24Hour(next, meridiem) : next);
        // Hours picked — move on to minutes, the way analog pickers do.
        setDialMode("minute");
      },
      [dialMode, is12Hour, meridiem, setPendingHours],
    );

    /* ── Typed hour / minute fields ── */

    const commitHourDraft = useCallback(
      (raw: string) => {
        const parsed = Number.parseInt(raw, 10);
        if (Number.isNaN(parsed)) return;
        if (is12Hour) {
          setPendingHours(to24Hour(clampInt(parsed, 1, HOURS_PER_HALF_DAY), meridiem));
        } else {
          setPendingHours(clampInt(parsed, 0, HOURS_PER_DAY - 1));
        }
      },
      [is12Hour, meridiem, setPendingHours],
    );

    const commitMinuteDraft = useCallback((raw: string) => {
      const parsed = Number.parseInt(raw, 10);
      if (Number.isNaN(parsed)) return;
      setPending((prev) => ({
        ...prev,
        minutes: clampInt(parsed, 0, MINUTES_PER_HOUR - 1),
      }));
    }, []);

    const handleHourInput = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const digits = event.target.value.replace(/\D/g, "").slice(0, 2);
        setHourDraft(digits);
        commitHourDraft(digits);
      },
      [commitHourDraft],
    );

    const handleMinuteInput = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const digits = event.target.value.replace(/\D/g, "").slice(0, 2);
        setMinuteDraft(digits);
        commitMinuteDraft(digits);
      },
      [commitMinuteDraft],
    );

    /* ── Open / confirm / cancel ── */

    const handleOpenChange = useCallback(
      (next: boolean) => {
        if (disabled) return;
        setOpen(next);
        if (next) {
          setPending(selected ?? { hours: 0, minutes: 0 });
          setDialMode("hour");
          setHourDraft(null);
          setMinuteDraft(null);
        } else {
          onBlur?.();
        }
      },
      [disabled, onBlur, selected],
    );

    const handleConfirm = useCallback(() => {
      if (!isControlled) setInternalValue(pending);
      if (!isSameTime(pending, selected)) onChange?.(pending);
      setOpen(false);
      onBlur?.();
    }, [isControlled, onBlur, onChange, pending, selected]);

    const handleCancel = useCallback(() => {
      setOpen(false);
      onBlur?.();
    }, [onBlur]);

    return (
      <div
        ref={ref}
        className={cn(
          "clet-time-selector gsl-time-selector",
          `clet-time-selector--${variant}`,
          `gsl-time-selector--${variant}`,
          invalid && "clet-time-selector--invalid gsl-time-selector--invalid",
          disabled && "clet-time-selector--disabled gsl-time-selector--disabled",
          classNames?.root,
          className,
        )}
      >
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "clet-time-selector__trigger gsl-time-selector__trigger",
                !selected &&
                  "clet-time-selector__trigger--placeholder gsl-time-selector__trigger--placeholder",
                classNames?.trigger,
              )}
              aria-invalid={invalid || undefined}
              aria-haspopup="dialog"
              aria-expanded={open}
              data-name={name}
            >
              <Clock
                size={16}
                strokeWidth={1.75}
                className={cn(
                  "clet-time-selector__trigger-icon gsl-time-selector__trigger-icon",
                  classNames?.triggerIcon,
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "clet-time-selector__trigger-text gsl-time-selector__trigger-text",
                  classNames?.triggerText,
                )}
              >
                {selected ? displayText : placeholder}
              </span>
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className={cn(
                "clet-time-selector__panel gsl-time-selector__panel",
                // The panel is portalled out of the root, so it carries its
                // own variant modifier.
                `clet-time-selector__panel--${variant}`,
                `gsl-time-selector__panel--${variant}`,
                classNames?.panel,
              )}
              side="bottom"
              align="start"
              sideOffset={4}
              aria-label="Time picker"
            >
              <div
                className={cn(
                  "clet-time-selector__title gsl-time-selector__title",
                  classNames?.title,
                )}
              >
                {title}
              </div>

              {variant === "wheel" ? (
                <div
                  className={cn(
                    "clet-time-selector__wheels gsl-time-selector__wheels",
                    classNames?.wheels,
                  )}
                >
                  <TimeWheel
                    options={hourOptions}
                    value={displayHours}
                    onSelect={handleWheelHour}
                    label="Hour"
                    classNames={classNames}
                  />
                  <span
                    className="clet-time-selector__separator gsl-time-selector__separator"
                    aria-hidden
                  >
                    :
                  </span>
                  <TimeWheel
                    options={minuteOptions}
                    value={pending.minutes}
                    onSelect={handleWheelMinute}
                    label="Minute"
                    classNames={classNames}
                  />
                  {is12Hour ? (
                    <TimeWheel
                      options={meridiemOptions}
                      value={meridiem === "AM" ? 0 : 1}
                      onSelect={handleMeridiemWheel}
                      label="AM or PM"
                      classNames={classNames}
                    />
                  ) : null}
                  <span
                    className="clet-time-selector__wheel-band gsl-time-selector__wheel-band"
                    aria-hidden
                  />
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "clet-time-selector__fields gsl-time-selector__fields",
                      classNames?.fields,
                    )}
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label="Hour"
                      value={hourDraft ?? pad2(displayHours)}
                      onChange={handleHourInput}
                      onFocus={() => setDialMode("hour")}
                      onBlur={() => setHourDraft(null)}
                      className={cn(
                        "clet-time-selector__field gsl-time-selector__field",
                        dialMode === "hour" &&
                          "clet-time-selector__field--active gsl-time-selector__field--active",
                        classNames?.field,
                      )}
                    />
                    <span
                      className="clet-time-selector__separator gsl-time-selector__separator"
                      aria-hidden
                    >
                      :
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label="Minute"
                      value={minuteDraft ?? pad2(pending.minutes)}
                      onChange={handleMinuteInput}
                      onFocus={() => setDialMode("minute")}
                      onBlur={() => setMinuteDraft(null)}
                      className={cn(
                        "clet-time-selector__field gsl-time-selector__field",
                        dialMode === "minute" &&
                          "clet-time-selector__field--active gsl-time-selector__field--active",
                        classNames?.field,
                      )}
                    />

                    {is12Hour ? (
                      <div
                        className={cn(
                          "clet-time-selector__meridiem gsl-time-selector__meridiem",
                          classNames?.meridiem,
                        )}
                        role="radiogroup"
                        aria-label="AM or PM"
                      >
                        <button
                          type="button"
                          role="radio"
                          aria-checked={meridiem === "AM"}
                          onClick={() => handleMeridiem("AM")}
                          className={cn(
                            "clet-time-selector__meridiem-option gsl-time-selector__meridiem-option",
                            meridiem === "AM" &&
                              "clet-time-selector__meridiem-option--selected gsl-time-selector__meridiem-option--selected",
                            classNames?.meridiemOption,
                          )}
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={meridiem === "PM"}
                          onClick={() => handleMeridiem("PM")}
                          className={cn(
                            "clet-time-selector__meridiem-option gsl-time-selector__meridiem-option",
                            meridiem === "PM" &&
                              "clet-time-selector__meridiem-option--selected gsl-time-selector__meridiem-option--selected",
                            classNames?.meridiemOption,
                          )}
                        >
                          PM
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <ClockDial
                    numbers={dialNumbers}
                    activeValue={dialActiveValue}
                    onSelect={handleDialSelect}
                    label={dialMode === "minute" ? "Select minute" : "Select hour"}
                    classNames={classNames}
                  />
                </>
              )}

              <div
                className={cn(
                  "clet-time-selector__footer gsl-time-selector__footer",
                  classNames?.footer,
                )}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(classNames?.cancelButton)}
                  onClick={handleCancel}
                >
                  {cancelLabel}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className={cn(classNames?.confirmButton)}
                  onClick={handleConfirm}
                >
                  {resolvedConfirmLabel}
                </Button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    );
  },
);
