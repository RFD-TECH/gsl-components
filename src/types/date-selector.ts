export interface DateSelectorClassNames {
  root?: string;
  trigger?: string;
  calendar?: string;
  calendarHeader?: string;
  calendarTitle?: string;
  calendarNav?: string;
  calendarWeekdays?: string;
  calendarWeekday?: string;
  calendarGrid?: string;
  calendarDay?: string;
  calendarMonthGrid?: string;
  calendarMonth?: string;
  calendarYearGrid?: string;
  calendarYear?: string;
}

export interface DateSelectorProps {
  /** Controlled selected date */
  value?: Date | null;
  /** Uncontrolled default date */
  defaultValue?: Date;
  /** Called when a date is selected (null when cleared) */
  onChange?: (date: Date | null) => void;
  /** Placeholder text shown when no date is selected */
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  /** Minimum selectable date (inclusive) */
  min?: Date;
  /** Maximum selectable date (inclusive) */
  max?: Date;
  /** Intl.DateTimeFormat options for displaying the selected date */
  formatOptions?: Intl.DateTimeFormatOptions;
  classNames?: DateSelectorClassNames;
  className?: string;
  /** Form field name (for RHF integration) */
  name?: string;
  /** Called when the trigger loses focus */
  onBlur?: () => void;
}
