import type { HTMLAttributes, ReactNode } from "react";

export interface QuickActionItem {
  id: string;
  label: string;
  icon: ReactNode;
  description?: string;
}

export interface QuickActionsClassNames {
  root?: string;
  header?: string;
  title?: string;
  customizeButton?: string;
  grid?: string;
  item?: string;
  itemIcon?: string;
  itemContent?: string;
  itemLabel?: string;
  itemDescription?: string;
  dialog?: string;
  dialogCheckbox?: string;
  empty?: string;
}

export interface QuickActionsProps extends HTMLAttributes<HTMLDivElement> {
  actions: QuickActionItem[];
  title?: string;
  customizable?: boolean;
  hiddenIds?: Set<string>;
  onToggleVisibility?: (id: string) => void;
  onAction?: (id: string) => void;
  customizeLabel?: string;
  emptyMessage?: string;
  classNames?: QuickActionsClassNames;
  className?: string;
}
