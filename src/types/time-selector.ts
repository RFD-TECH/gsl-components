/**
 * Layout of the picker panel.
 *
 * - `wheel` — three scroll-snapping columns (hour, minute, meridiem) with a
 *   centred selection band.
 * - `clock` — editable hour/minute fields above an analog dial.
 */
export type TimeSelectorVariant = "wheel" | "clock";

/** Which half of the day a 12-hour time falls in. */
export type TimeSelectorMeridiem = "AM" | "PM";

/** A wall-clock time, always stored on a 24-hour scale. */
export interface TimeValue {
  /** 0–23 */
  hours: number;
  /** 0–59 */
  minutes: number;
}

export interface TimeSelectorClassNames {
  root?: string;
  trigger?: string;
  triggerIcon?: string;
  triggerText?: string;
  panel?: string;
  title?: string;
  /** `wheel` only — the row holding all three columns */
  wheels?: string;
  /** `wheel` only — a single scrolling column */
  wheel?: string;
  /** `wheel` only — a single option inside a column */
  wheelOption?: string;
  /** `clock` only — the row holding the hour/minute fields and meridiem toggle */
  fields?: string;
  /** `clock` only — an hour or minute field */
  field?: string;
  /** `clock` only — the AM/PM toggle wrapper */
  meridiem?: string;
  /** `clock` only — a single AM or PM button */
  meridiemOption?: string;
  /** `clock` only — the dial face */
  dial?: string;
  /** `clock` only — a number on the dial face */
  dialNumber?: string;
  /** `clock` only — the hand pointing at the active number */
  dialHand?: string;
  footer?: string;
  cancelButton?: string;
  confirmButton?: string;
}

export interface TimeSelectorProps {
  /**
   * Panel layout.
   * @default "wheel"
   */
  variant?: TimeSelectorVariant;
  /** Controlled selected time */
  value?: TimeValue | null;
  /** Uncontrolled initial time */
  defaultValue?: TimeValue;
  /** Called when a time is confirmed (null when cleared) */
  onChange?: (value: TimeValue | null) => void;
  /** Placeholder shown in the trigger when no time is selected */
  placeholder?: string;
  /**
   * 12-hour (with an AM/PM control) or 24-hour scale.
   * @default 12
   */
  hourCycle?: 12 | 24;
  /**
   * Minute increment offered by the `wheel` column. The `clock` dial always
   * offers 5-minute steps on its face, but typing into the minute field
   * accepts any value.
   * @default 1
   */
  minuteStep?: number;
  /**
   * Heading shown at the top of the panel.
   * @default "Select time"
   */
  title?: string;
  /** @default "Cancel" */
  cancelLabel?: string;
  /** @default "Save" for `wheel`, "Apply" for `clock` */
  confirmLabel?: string;
  /** `Intl.DateTimeFormat` options for the trigger's display text */
  formatOptions?: Intl.DateTimeFormatOptions;
  invalid?: boolean;
  disabled?: boolean;
  classNames?: TimeSelectorClassNames;
  className?: string;
  /** Form field name (for RHF integration) */
  name?: string;
  /** Called when the panel closes */
  onBlur?: () => void;
}
