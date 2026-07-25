import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import type { DateSelectorProps } from "../../types/date-selector";
import { cn } from "../../utils/cn";
import "./styles/date-selector.css";

const WEEKDAYS = [
  { short: "M", full: "Monday" },
  { short: "T", full: "Tuesday" },
  { short: "W", full: "Wednesday" },
  { short: "T", full: "Thursday" },
  { short: "F", full: "Friday" },
  { short: "S", full: "Saturday" },
  { short: "S", full: "Sunday" },
] as const;

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleDateString("en-US", { month: "short" }),
);

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDateInRange(date: Date, min?: Date, max?: Date): boolean {
  if (min) {
    const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    if (date < minDay) return false;
  }
  if (max) {
    const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
    if (date > maxDay) return false;
  }
  return true;
}

function isMonthDisabled(year: number, month: number, min?: Date, max?: Date): boolean {
  if (min) {
    const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    if (new Date(year, month + 1, 0) < minDay) return true;
  }
  if (max) {
    const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
    if (new Date(year, month, 1) > maxDay) return true;
  }
  return false;
}

function isYearDisabled(year: number, min?: Date, max?: Date): boolean {
  if (min) {
    const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    if (new Date(year, 11, 31) < minDay) return true;
  }
  if (max) {
    const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
    if (new Date(year, 0, 1) > maxDay) return true;
  }
  return false;
}

function computeCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday = 0, Sunday = 6
  const startDow = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const days: Date[] = [];

  // Previous month padding
  for (let i = startDow - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Current month
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }

  // Next month padding to fill full rows
  const remainder = days.length % 7;
  if (remainder > 0) {
    for (let i = 1; i <= 7 - remainder; i++) {
      days.push(new Date(year, month + 1, i));
    }
  }

  return days;
}

export const DateSelector = forwardRef<HTMLDivElement, DateSelectorProps>(
  function DateSelector(
    {
      value: controlledValue,
      defaultValue,
      onChange,
      placeholder = "Select date",
      invalid = false,
      disabled = false,
      min,
      max,
      formatOptions,
      classNames,
      className,
      name,
      onBlur,
    },
    ref,
  ) {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<Date | null>(
      defaultValue ?? null,
    );
    const selected = isControlled ? (controlledValue ?? null) : internalValue;
    const [open, setOpen] = useState(false);

    const today = useMemo(() => {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }, []);

    const [viewYear, setViewYear] = useState(() =>
      selected ? selected.getFullYear() : today.getFullYear(),
    );
    const [viewMonth, setViewMonth] = useState(() =>
      selected ? selected.getMonth() : today.getMonth(),
    );
    const [viewMode, setViewMode] = useState<"day" | "month" | "year">("day");

    const calendarDays = useMemo(
      () => computeCalendarDays(viewYear, viewMonth),
      [viewYear, viewMonth],
    );

    const yearPageStart = useMemo(
      () => Math.floor((viewYear - 1) / 12) * 12 + 1,
      [viewYear],
    );

    const yearGrid = useMemo(
      () => Array.from({ length: 12 }, (_, i) => yearPageStart + i),
      [yearPageStart],
    );

    const monthLabel = useMemo(() => {
      const d = new Date(viewYear, viewMonth, 1);
      return d.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }, [viewYear, viewMonth]);

    const headerTitle = useMemo(() => {
      if (viewMode === "day") return monthLabel;
      if (viewMode === "month") return String(viewYear);
      const start = Math.floor((viewYear - 1) / 12) * 12 + 1;
      return `${start} \u2013 ${start + 11}`;
    }, [viewMode, monthLabel, viewYear]);

    const displayText = useMemo(() => {
      if (!selected) return "";
      return selected.toLocaleDateString(
        "en-US",
        formatOptions ?? DEFAULT_FORMAT,
      );
    }, [selected, formatOptions]);

    const setSelected = useCallback(
      (date: Date | null) => {
        if (!isControlled) {
          setInternalValue(date);
        }
        onChange?.(date);
      },
      [isControlled, onChange],
    );

    const handleSelect = useCallback(
      (day: Date) => {
        if (disabled) return;
        if (!isDateInRange(day, min, max)) return;
        const normalized = new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
        );
        setSelected(normalized);
        setOpen(false);
      },
      [disabled, min, max, setSelected],
    );

    const handleOpenChange = useCallback(
      (next: boolean) => {
        if (disabled) return;
        setOpen(next);
        if (next) {
          setViewMode("day");
          if (selected) {
            setViewYear(selected.getFullYear());
            setViewMonth(selected.getMonth());
          }
        } else {
          onBlur?.();
        }
      },
      [disabled, onBlur, selected],
    );

    const handlePrev = useCallback(() => {
      if (viewMode === "day") {
        setViewMonth((m) => (m === 0 ? 11 : m - 1));
        if (viewMonth === 0) setViewYear((y) => y - 1);
      } else if (viewMode === "month") {
        setViewYear((y) => y - 1);
      } else {
        setViewYear((y) => y - 12);
      }
    }, [viewMode, viewMonth]);

    const handleNext = useCallback(() => {
      if (viewMode === "day") {
        setViewMonth((m) => (m === 11 ? 0 : m + 1));
        if (viewMonth === 11) setViewYear((y) => y + 1);
      } else if (viewMode === "month") {
        setViewYear((y) => y + 1);
      } else {
        setViewYear((y) => y + 12);
      }
    }, [viewMode, viewMonth]);

    const handleTitleClick = useCallback(() => {
      setViewMode((mode) => {
        if (mode === "day") return "month";
        if (mode === "month") return "year";
        return "month";
      });
    }, []);

    return (
      <div
        ref={ref}
        className={cn(
          "clet-date-selector gsl-date-selector",
          invalid && "clet-date-selector--invalid gsl-date-selector--invalid",
          disabled && "clet-date-selector--disabled gsl-date-selector--disabled",
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
                "clet-date-selector__trigger gsl-date-selector__trigger",
                !selected && "clet-date-selector__trigger--placeholder gsl-date-selector__trigger--placeholder",
                classNames?.trigger,
              )}
              aria-invalid={invalid || undefined}
              aria-haspopup="dialog"
              aria-expanded={open}
              data-name={name}
            >
              <Calendar
                size={16}
                strokeWidth={1.75}
                className="clet-date-selector__trigger-icon gsl-date-selector__trigger-icon"
                aria-hidden
              />
              <span className="clet-date-selector__trigger-text gsl-date-selector__trigger-text">
                {selected ? displayText : placeholder}
              </span>
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className={cn(
                "clet-date-selector__calendar gsl-date-selector__calendar",
                classNames?.calendar,
              )}
              side="bottom"
              align="start"
              sideOffset={4}
              aria-label="Date picker"
            >
              {/* Month / Year header */}
              <div
                className={cn(
                  "clet-date-selector__calendar-header gsl-date-selector__calendar-header",
                  classNames?.calendarHeader,
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "clet-date-selector__calendar-nav gsl-date-selector__calendar-nav",
                    classNames?.calendarNav,
                  )}
                  onClick={handlePrev}
                  aria-label={
                    viewMode === "day"
                      ? "Previous month"
                      : viewMode === "month"
                        ? "Previous year"
                        : "Previous 12 years"
                  }
                >
                  <ChevronLeft size={16} strokeWidth={2} aria-hidden />
                </button>

                <button
                  type="button"
                  className={cn(
                    "clet-date-selector__calendar-title gsl-date-selector__calendar-title",
                    classNames?.calendarTitle,
                  )}
                  onClick={handleTitleClick}
                  aria-label={
                    viewMode === "day"
                      ? "Switch to month picker"
                      : viewMode === "month"
                        ? "Switch to year picker"
                        : "Switch to month picker"
                  }
                >
                  {headerTitle}
                </button>

                <button
                  type="button"
                  className={cn(
                    "clet-date-selector__calendar-nav gsl-date-selector__calendar-nav",
                    classNames?.calendarNav,
                  )}
                  onClick={handleNext}
                  aria-label={
                    viewMode === "day"
                      ? "Next month"
                      : viewMode === "month"
                        ? "Next year"
                        : "Next 12 years"
                  }
                >
                  <ChevronRight size={16} strokeWidth={2} aria-hidden />
                </button>
              </div>

              {viewMode === "day" && (
                <>
                  {/* Weekday labels */}
                  <div
                    className={cn(
                      "clet-date-selector__calendar-weekdays gsl-date-selector__calendar-weekdays",
                      classNames?.calendarWeekdays,
                    )}
                    role="row"
                  >
                    {WEEKDAYS.map((day) => (
                      <div
                        key={day.full}
                        className={cn(
                          "clet-date-selector__calendar-weekday gsl-date-selector__calendar-weekday",
                          classNames?.calendarWeekday,
                        )}
                        role="columnheader"
                        aria-label={day.full}
                      >
                        {day.short}
                      </div>
                    ))}
                  </div>

                  {/* Day grid */}
                  <div
                    className={cn(
                      "clet-date-selector__calendar-grid gsl-date-selector__calendar-grid",
                      classNames?.calendarGrid,
                    )}
                    role="grid"
                  >
                    {calendarDays.map((day, i) => {
                      const isCurrentMonth = day.getMonth() === viewMonth;
                      const isToday = isSameDay(day, today);
                      const isSelected = selected ? isSameDay(day, selected) : false;
                      const isDisabled = !isDateInRange(day, min, max);

                      return (
                        <button
                          key={i}
                          type="button"
                          role="gridcell"
                          disabled={isDisabled || !isCurrentMonth}
                          aria-selected={isSelected}
                          aria-label={day.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                          className={cn(
                            "clet-date-selector__calendar-day gsl-date-selector__calendar-day",
                            !isCurrentMonth &&
                              "clet-date-selector__calendar-day--outside gsl-date-selector__calendar-day--outside",
                            isToday && "clet-date-selector__calendar-day--today gsl-date-selector__calendar-day--today",
                            isSelected &&
                              "clet-date-selector__calendar-day--selected gsl-date-selector__calendar-day--selected",
                            classNames?.calendarDay,
                          )}
                          onClick={() => handleSelect(day)}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {viewMode === "month" && (
                <div
                  className={cn(
                    "clet-date-selector__calendar-month-grid gsl-date-selector__calendar-month-grid",
                    classNames?.calendarMonthGrid,
                  )}
                  role="grid"
                >
                  {MONTH_LABELS.map((label, i) => {
                    const isCurrentMonth =
                      viewYear === today.getFullYear() && i === today.getMonth();
                    const isSelected =
                      selected !== null &&
                      selected.getFullYear() === viewYear &&
                      selected.getMonth() === i;
                    const isDisabled = isMonthDisabled(viewYear, i, min, max);

                    return (
                      <button
                        key={i}
                        type="button"
                        role="gridcell"
                        disabled={isDisabled}
                        aria-selected={isSelected}
                        aria-label={`${label} ${viewYear}`}
                        className={cn(
                          "clet-date-selector__calendar-month gsl-date-selector__calendar-month",
                          isCurrentMonth &&
                            "clet-date-selector__calendar-month--today gsl-date-selector__calendar-month--today",
                          isSelected &&
                            "clet-date-selector__calendar-month--selected gsl-date-selector__calendar-month--selected",
                          classNames?.calendarMonth,
                        )}
                        onClick={() => {
                          setViewMonth(i);
                          setViewMode("day");
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {viewMode === "year" && (
                <div
                  className={cn(
                    "clet-date-selector__calendar-year-grid gsl-date-selector__calendar-year-grid",
                    classNames?.calendarYearGrid,
                  )}
                  role="grid"
                >
                  {yearGrid.map((year) => {
                    const isCurrentYear = year === today.getFullYear();
                    const isSelected =
                      selected !== null && selected.getFullYear() === year;
                    const isDisabled = isYearDisabled(year, min, max);

                    return (
                      <button
                        key={year}
                        type="button"
                        role="gridcell"
                        disabled={isDisabled}
                        aria-selected={isSelected}
                        aria-label={String(year)}
                        className={cn(
                          "clet-date-selector__calendar-year gsl-date-selector__calendar-year",
                          isCurrentYear &&
                            "clet-date-selector__calendar-year--today gsl-date-selector__calendar-year--today",
                          isSelected &&
                            "clet-date-selector__calendar-year--selected gsl-date-selector__calendar-year--selected",
                          classNames?.calendarYear,
                        )}
                        onClick={() => {
                          setViewYear(year);
                          setViewMode("month");
                        }}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    );
  },
);
