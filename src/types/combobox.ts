import type { ReactNode } from "react";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Leading icon/adornment rendered before the label (e.g. a star). */
  icon?: ReactNode;
}

export interface ComboboxClassNames {
  root?: string;
  trigger?: string;
  content?: string;
  input?: string;
  list?: string;
  item?: string;
  itemIcon?: string;
  itemCheck?: string;
  empty?: string;
  loading?: string;
}

interface ComboboxBaseProps {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  clearable?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  emptyMessage?: ReactNode;
  "aria-label"?: string;
  classNames?: ComboboxClassNames;
  className?: string;
  name?: string;
}

export type ComboboxProps =
  | (ComboboxBaseProps & {
      multiple?: false;
      value: string | null;
      onValueChange: (value: string | null) => void;
    })
  | (ComboboxBaseProps & {
      multiple: true;
      value: string[];
      onValueChange: (value: string[]) => void;
    });
