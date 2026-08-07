import type {
  HTMLAttributes,
  InputHTMLAttributes,
  MouseEvent,
  ReactNode,
} from "react";

export interface TableColumn<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => ReactNode;
  cell?: (info: { row: T; value: ReactNode }) => ReactNode;
  /** Width in px. If omitted, column shares remaining space equally. */
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  align?: "left" | "center" | "right";
}

export type SortDirection = "asc" | "desc";

export interface TableSortState {
  column: string;
  direction: SortDirection;
}

export interface TableRowAction<T> {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
  /** If provided, must return true for the action to appear for this row */
  condition?: (row: T) => boolean;
}

export interface TableBulkAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (selectedIds: Set<string | number>) => void;
  destructive?: boolean;
}

export interface TableBulkActionsClassNames {
  root?: string;
  count?: string;
}

export interface TableBulkActionsProps {
  /** Currently selected row keys */
  selectedIds: Set<string | number>;
  /** Override the displayed count (defaults to selectedIds.size) */
  selectedCount?: number;
  /** Callback to clear all selections */
  onClear?: () => void;
  /** Predefined actions rendered as inline buttons */
  actions?: TableBulkAction[];
  /**
   * Render prop for custom action content.
   * Receives selectedIds so consumers never need to manage selection state directly.
   */
  renderActions?: (params: { selectedIds: Set<string | number> }) => ReactNode;
  classNames?: TableBulkActionsClassNames;
  className?: string;
}

export interface TableClassNames {
  root?: string;
  header?: string;
  content?: string;
  footer?: string;
  selectionCell?: string;
}

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: TableClassNames;
  className?: string;
  /** URL param namespace shared by all child table components */
  paramPrefix: string;
  height?: number;
}

export interface TableHeaderClassNames {
  root?: string;
}

export interface TableHeaderProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: TableHeaderClassNames;
  className?: string;
}

export interface TableActionsClassNames {
  root?: string;
}

export interface TableActionsProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: TableActionsClassNames;
  className?: string;
}

export interface TableContentClassNames {
  root?: string;
  detailRow?: string;
  empty?: string;
  emptyIcon?: string;
  emptyText?: string;
  th?: string;
  thLabel?: string;
  sortIcon?: string;
  checkboxCell?: string;
  actionsCell?: string;
  actionsTrigger?: string;
  actionsMenu?: string;
  actionsItem?: string;
  actionsSectionLabel?: string;
  skeleton?: string;
  viewport?: string;
}

export interface TableContentProps<
  T = unknown,
> extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  classNames?: TableContentClassNames;
  /**
   * Visual style of the table content wrapper.
   * `"panel"` gives a faint recessed surface, subtle row dividers, and a
   * border all around — suited for embedding inside tabs or cards.
   */
  variant?: "default" | "panel";
  columns?: TableColumn<T>[];
  data?: T[];
  rowKey?: (row: T) => string | number;
  /** Icon (JSX/ReactNode) shown above the empty text when data is empty */
  emptyIcon?: ReactNode;
  /** Message shown when data is empty (defaults to "No results") */
  emptyText?: string;
  /** Show skeleton loading rows instead of data (default false) */
  loading?: boolean;
  /** Number of skeleton rows to show while loading (default 5) */
  loadingRows?: number;
  /** Show a checkbox selection column (default false) */
  selectable?: boolean;
  /** Current set of selected row keys. Pass with onSelectionChange for controlled mode. Required for TableBulkActions sync. */
  selectedIds?: Set<string | number>;
  /** Called when selection changes with the full set of selected row keys */
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
  /** Row-level actions rendered as a kebab dropdown at the end of each row */
  rowActions?: TableRowAction<T>[];
  /**
   * Bulk actions surfaced inside the row-actions menu (kebab click or
   * right-click) as a "Bulk actions" section below the row's own actions —
   * always includes a "Select all" / "Deselect all" toggle, with the rest of
   * the list appearing once one or more rows are selected.
   */
  bulkActions?: TableBulkAction[];
  /**
   * When true, also renders the `TableBulkActions` bar at the bottom of the
   * table automatically, wired to the same `bulkActions`/`selectedIds` — no
   * need to place `<TableBulkActions>` yourself as a sibling. When false
   * (default), `bulkActions` only surface inside the row-actions menu.
   */
  bulkActionsFooter?: boolean;
  /** Called when a row is clicked (in addition to selection toggling, when `selectable` is set) */
  onRowClick?: (row: T, event: MouseEvent<HTMLTableRowElement>) => void;
  /**
   * When provided, each row becomes expandable: clicking the row (or its
   * chevron) slides open a full-width detail region beneath it with this
   * content. Expansion is managed internally. Not compatible with
   * `virtualRowHeight` (virtual rows have fixed heights).
   */
  getRowDetail?: (row: T) => ReactNode;
  /** Row height in px. Set this to enable virtual scrolling. Parent <Table> must have a height set. */
  virtualRowHeight?: number;
}

export interface TableFooterClassNames {
  root?: string;
}

export interface TableFooterProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: TableFooterClassNames;
  className?: string;
  /** Removes the footer's top border. Prefer this over hand-writing `className="clet-table__footer--no-border"`. */
  noBorder?: boolean;
}

export interface TableSearchClassNames {
  root?: string;
  icon?: string;
  input?: string;
  clear?: string;
}

export interface TableSearchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "children"
> {
  placeholder?: string;
  debounceMs?: number;
  onSearch?: (value: string) => void;
  classNames?: TableSearchClassNames;
  className?: string;
}

export interface TableFilterClassNames {
  root?: string;
  trigger?: string;
  badge?: string;
  content?: string;
  header?: string;
  resetButton?: string;
  fields?: string;
  actions?: string;
  applyButton?: string;
}

export type TableFilterVariant = "popover" | "spread";

export interface TableFilterProps {
  children?: ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  applyLabel?: string;
  resetLabel?: string;
  /** "popover" (default) opens the fields in a popover panel. "spread" removes the popover and lays the fields out inline as a flex row. */
  variant?: TableFilterVariant;
  classNames?: TableFilterClassNames;
  className?: string;
}

export interface TablePaginationClassNames {
  root?: string;
  results?: string;
  pageSize?: string;
  pages?: string;
  ellipsis?: string;
}

export interface PaginationControlsProps {
  totalPages: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  visiblePages?: number;
  classNames?: TablePaginationClassNames;
  className?: string;
}
