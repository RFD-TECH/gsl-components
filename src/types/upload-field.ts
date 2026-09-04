import type { HTMLAttributes, ReactNode } from "react";

export type UploadFieldFileStatusKind = "uploading" | "completed" | "failed";

/** Why a file name was rejected before the file was ever accepted. */
export type UnsafeFileNameReason =
  | "empty"
  | "control-character"
  | "path-separator"
  | "bidi-override";

export interface UploadFieldFileStatus {
  status: UploadFieldFileStatusKind;
  /** 0–100, read when `status` is `"uploading"`. */
  progress?: number;
  /** Shown when `status` is `"failed"`; falls back to "Failed" when omitted. */
  error?: string;
}

export interface UploadFieldClassNames {
  root?: string;
  icon?: string;
  title?: string;
  subtitle?: string;
  files?: string;
  fileCard?: string;
  fileName?: string;
  fileSize?: string;
  fileProgress?: string;
  fileStatusText?: string;
  retryButton?: string;
  cancelButton?: string;
  completedIcon?: string;
  removeButton?: string;
  actionButton?: string;
}

export interface UploadFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "value" | "defaultValue"> {
  invalid?: boolean;
  disabled?: boolean;
  classNames?: UploadFieldClassNames;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  /**
   * Overrides the hint under the title. By default it is derived from `accept`
   * and `maxSize` (e.g. "Only PDF and JPG files are supported. Maximum filesize
   * 5MB."). Pass "" to drop the line entirely.
   */
  subtitle?: ReactNode;
  value?: File | File[] | null;
  onChange?: (file: File | File[] | null) => void;
  name?: string;
  /**
   * Optional per-file status overlay — index-aligned with `value` (a single
   * `File` value is treated as index 0). Omit entirely for the default plain
   * attach/remove look with no uploading/completed/failed affordances.
   */
  fileStatuses?: UploadFieldFileStatus[];
  /** Called when the cancel (×) control is clicked on a file with status `"uploading"`. */
  onCancel?: (file: File, index: number) => void;
  /** Called when "Try Again" is clicked on a file with status `"failed"`. */
  onRetry?: (file: File, index: number) => void;
}
