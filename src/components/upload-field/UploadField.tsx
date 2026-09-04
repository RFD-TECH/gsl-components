import {
  CheckCircle2,
  CloudUpload,
  FileImage,
  FilePlay,
  FileText,
  Trash2,
  X,
} from "lucide-react";
import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../dialog/Dialog";
import { Button } from "../button/Button";
import { ProgressBar } from "../progress-bar/ProgressBar";
import type { UnsafeFileNameReason, UploadFieldProps } from "../../types/upload-field";
import { cn } from "../../utils/cn";
import { findUnsafeFileNameReason, sanitizeFileNameForDisplay } from "../../utils/fileName";
import "./styles/upload-field.css";

function FilePdfIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 15h6" stroke="var(--gsl-error, var(--clet-error))" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12v6" stroke="var(--gsl-error, var(--clet-error))" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function getFileKind(file: File): "pdf" | "image" | "video" | "text" {
  const type = file.type;
  const name = file.name.toLowerCase();
  if (type.startsWith("image/") || name.match(/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/)) return "image";
  if (type.startsWith("video/") || name.match(/\.(mp4|webm|avi|mov|mkv)$/)) return "video";
  if (name.endsWith(".pdf")) return "pdf";
  return "text";
}

/** File-type badge icon (PDF/image/video/generic) for a given `File`. Also used internally by `UploadField`'s file cards. */
export function FileFormatIcon({ file, size = 20 }: { file: File; size?: number }) {
  const kind = getFileKind(file);
  if (kind === "pdf") return <FilePdfIcon size={size} />;
  if (kind === "image") return <FileImage size={size} strokeWidth={1.5} aria-hidden />;
  if (kind === "video") return <FilePlay size={size} strokeWidth={1.5} aria-hidden />;
  return <FileText size={size} strokeWidth={1.5} aria-hidden />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EXTENSION_LABELS: Record<string, string> = {
  pdf: "PDF",
  jpg: "JPG",
  jpeg: "JPG",
  png: "PNG",
  gif: "GIF",
  webp: "WebP",
  svg: "SVG",
  bmp: "BMP",
  heic: "HEIC",
  csv: "CSV",
  xls: "Excel",
  xlsx: "Excel",
  doc: "Word",
  docx: "Word",
  ppt: "PowerPoint",
  pptx: "PowerPoint",
  txt: "text",
  json: "JSON",
  xml: "XML",
  zip: "archive",
  tar: "archive",
  gz: "archive",
  mp4: "MP4",
  webm: "WebM",
  mov: "MOV",
  mp3: "MP3",
  wav: "WAV",
};

const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "text/csv": "CSV",
  "text/plain": "text",
  "application/json": "JSON",
  "application/xml": "XML",
  "application/zip": "archive",
  "application/msword": "Word",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
};

const MIME_GROUP_LABELS: Record<string, string> = {
  image: "image",
  video: "video",
  audio: "audio",
  text: "text",
};

/** Human label for one `accept` entry: ".jpg", "image/*" or a full MIME type. */
function labelForAcceptToken(token: string): string | null {
  const value = token.trim().toLowerCase();
  if (!value) return null;

  if (value.startsWith(".")) {
    const extension = value.slice(1);
    return EXTENSION_LABELS[extension] ?? extension.toUpperCase();
  }

  if (MIME_LABELS[value]) return MIME_LABELS[value];

  const [group, subtype] = value.split("/");
  if (!subtype) return null;
  if (subtype === "*") return MIME_GROUP_LABELS[group] ?? null;
  return EXTENSION_LABELS[subtype] ?? subtype.toUpperCase();
}

function joinLabels(labels: string[]): string {
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/**
 * Describes every entry in `accept`, not just the first one that matches.
 * Returns "" when there is nothing to say, so the caller can drop the sentence
 * rather than print "Only any files are supported".
 */
function acceptToLabel(accept?: string): string {
  if (!accept || !accept.trim()) return "";

  const labels: string[] = [];
  for (const token of accept.split(",")) {
    const label = labelForAcceptToken(token);
    if (label && !labels.includes(label)) labels.push(label);
  }

  if (labels.length === 0) return "";

  return `${joinLabels(labels)} files`;
}

const UNSAFE_FILE_NAME_MESSAGES: Record<UnsafeFileNameReason, string> = {
  empty: "This file has no name. Rename it and try again.",
  "control-character":
    "This file name contains hidden control characters. Rename the file and try again.",
  "path-separator":
    "This file name contains a path separator. Rename the file and try again.",
  "bidi-override":
    "This file name contains hidden characters that disguise its real type. Rename the file and try again.",
};

function maxSizeLabel(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
}

export const UploadField = forwardRef<HTMLDivElement, UploadFieldProps>(
  function UploadField(
    {
      invalid = false,
      disabled = false,
      classNames,
      className,
      accept,
      multiple = false,
      maxSize,
      subtitle,
      value: controlledValue,
      onChange,
      name,
      fileStatuses,
      onCancel,
      onRetry,
      id,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedby,
      ...props
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = useState<File | File[] | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [fileErrorDialog, setFileErrorDialog] = useState<{ name: string; message: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const isControlled = controlledValue !== undefined;

    const setValue = useCallback(
      (next: File | File[] | null) => {
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const handleFiles = useCallback(
      (files: FileList | null) => {
        if (!files || files.length === 0) return;

        /* Name check first: a file rejected for its name is rejected outright,
           never merged into the accepted set alongside sound ones. */
        for (const file of Array.from(files)) {
          const reason = findUnsafeFileNameReason(file.name);
          if (reason) {
            setFileErrorDialog({
              name: sanitizeFileNameForDisplay(file.name),
              message: UNSAFE_FILE_NAME_MESSAGES[reason],
            });
            return;
          }
        }

        const filtered = Array.from(files).filter((f) => {
          if (maxSize && f.size > maxSize) return false;
          return true;
        });
        if (filtered.length === 0) {
          const rejected = Array.from(files)[0];
          setFileErrorDialog({
            name: rejected.name,
            message: `File exceeds maximum size of ${maxSizeLabel(maxSize!)}`,
          });
          return;
        }
        if (multiple) {
          setValue(filtered);
        } else {
          setValue(filtered[0]);
        }
      },
      [maxSize, multiple, setValue],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        e.target.value = "";
      },
      [handleFiles],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        handleFiles(e.dataTransfer.files);
      },
      [disabled, handleFiles],
    );

    const handleClick = useCallback(() => {
      if (!disabled) inputRef.current?.click();
    }, [disabled]);

    const handleDialogRetry = useCallback(() => {
      setFileErrorDialog(null);
      if (!disabled) inputRef.current?.click();
    }, [disabled]);

    const handleRemoveFile = useCallback(
      (index: number) => {
        if (!Array.isArray(value)) {
          setValue(null);
          return;
        }
        const next = value.filter((_, i) => i !== index);
        setValue(next.length > 0 ? next : null);
      },
      [value, setValue],
    );

    const invalidBool = ariaInvalid !== undefined ? !!ariaInvalid : invalid;
    const hasFiles = value ? (Array.isArray(value) ? value.length > 0 : true) : false;
    const files = value ? (Array.isArray(value) ? value : [value]) : [];

    const derivedSubtitle = useMemo(() => {
      const supportedLabel = acceptToLabel(accept);
      const sizeLabel = maxSizeLabel(maxSize);
      return [
        supportedLabel ? `Only ${supportedLabel} are supported.` : "",
        sizeLabel ? `Maximum filesize ${sizeLabel}.` : "",
      ]
        .filter(Boolean)
        .join(" ");
    }, [accept, maxSize]);

    /* Anything explicit wins, so "" and null both drop the line. Only leaving
       the prop off falls back to the derived text. */
    const resolvedSubtitle = subtitle !== undefined ? subtitle : derivedSubtitle;

    return (
      <>
        <div
          ref={ref}
          id={id}
          className={cn(
            "clet-upload-field gsl-upload-field",
            dragOver && "clet-upload-field--drag-over gsl-upload-field--drag-over",
            hasFiles && "clet-upload-field--has-files gsl-upload-field--has-files",
            invalidBool && "clet-upload-field--invalid gsl-upload-field--invalid",
            disabled && "clet-upload-field--disabled gsl-upload-field--disabled",
            classNames?.root,
            className,
          )}
          aria-invalid={invalidBool || undefined}
          aria-describedby={ariaDescribedby}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleClick();
          }}
          aria-label="Drop files here"
          {...props}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            name={name}
            onChange={handleChange}
            className="clet-upload-field__input gsl-upload-field__input"
          />

          <div
            className={cn(
              "clet-upload-field__icon gsl-upload-field__icon",
              classNames?.icon,
            )}
          >
            <CloudUpload size={20} strokeWidth={1.75} aria-hidden />
          </div>
          <p className={cn("clet-upload-field__title gsl-upload-field__title", classNames?.title)}>
            Click to upload or drag and drop
          </p>
          {resolvedSubtitle ? (
            <p className={cn("clet-upload-field__subtitle gsl-upload-field__subtitle", classNames?.subtitle)}>
              {resolvedSubtitle}
            </p>
          ) : null}

          {hasFiles && (
            <div className={cn("clet-upload-field__files gsl-upload-field__files", classNames?.files)}>
              {files.map((file, i) => {
                const status = fileStatuses?.[i];
                const isUploading = status?.status === "uploading";
                const isCompleted = status?.status === "completed";
                const isFailed = status?.status === "failed";

                return (
                  <div
                    key={i}
                    className={cn(
                      "clet-upload-field__file-card gsl-upload-field__file-card",
                      isFailed && "clet-upload-field__file-card--failed gsl-upload-field__file-card--failed",
                      classNames?.fileCard,
                    )}
                  >
                    <span className="clet-upload-field__file-card-icon gsl-upload-field__file-card-icon">
                      <FileFormatIcon file={file} size={20} />
                    </span>
                    <div className="clet-upload-field__file-card-info gsl-upload-field__file-card-info">
                      <span className={cn("clet-upload-field__file-card-name gsl-upload-field__file-card-name", classNames?.fileName)}>
                        {file.name}
                      </span>
                      {isUploading ? (
                        <ProgressBar
                          value={status?.progress ?? 0}
                          size="sm"
                          className={cn(
                            "clet-upload-field__file-card-progress gsl-upload-field__file-card-progress",
                            classNames?.fileProgress,
                          )}
                          aria-label={`Uploading ${file.name}`}
                        />
                      ) : isFailed ? (
                        <span
                          className={cn(
                            "clet-upload-field__file-card-status gsl-upload-field__file-card-status",
                            classNames?.fileStatusText,
                          )}
                        >
                          <span
                            className="clet-upload-field__file-card-status-dot gsl-upload-field__file-card-status-dot"
                            aria-hidden
                          />
                          {status?.error ?? "Failed"}
                          <button
                            type="button"
                            className={cn(
                              "clet-upload-field__file-card-retry gsl-upload-field__file-card-retry",
                              classNames?.retryButton,
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRetry?.(file, i);
                            }}
                          >
                            Try Again
                          </button>
                        </span>
                      ) : (
                        <span className={cn("clet-upload-field__file-card-size gsl-upload-field__file-card-size", classNames?.fileSize)}>
                          {formatSize(file.size)}
                          {isCompleted && (
                            <CheckCircle2
                              className={cn(
                                "clet-upload-field__file-card-completed-icon gsl-upload-field__file-card-completed-icon",
                                classNames?.completedIcon,
                              )}
                              size={14}
                              aria-label="Completed"
                            />
                          )}
                        </span>
                      )}
                    </div>
                    {!disabled &&
                      (isUploading ? (
                        <button
                          type="button"
                          className={cn(
                            "clet-upload-field__file-card-cancel gsl-upload-field__file-card-cancel",
                            classNames?.cancelButton,
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancel?.(file, i);
                          }}
                          aria-label={`Cancel upload of ${file.name}`}
                        >
                          <X size={16} strokeWidth={1.75} aria-hidden />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={cn("clet-upload-field__file-card-remove gsl-upload-field__file-card-remove", classNames?.removeButton)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(i);
                          }}
                          aria-label={`Remove ${file.name}`}
                        >
                          <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                        </button>
                      ))}
                  </div>
                );
              })}
            </div>
          )}

          {!multiple && (
            <Button
              variant="primary"
              size="md"
              className={cn(
                "clet-upload-field__action gsl-upload-field__action",
                classNames?.actionButton,
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              disabled={disabled}
            >
              {hasFiles ? "Replace file" : "Upload file"}
            </Button>
          )}
        </div>

        <Dialog open={fileErrorDialog !== null} onOpenChange={(open) => { if (!open) setFileErrorDialog(null); }}>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent showCloseButton aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Upload failed</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                {fileErrorDialog?.name && (
                  <span className="clet-upload-field__dialog-filename gsl-upload-field__dialog-filename">{fileErrorDialog.name}</span>
                )}
                {fileErrorDialog?.message}
              </DialogDescription>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setFileErrorDialog(null)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleDialogRetry}>
                  Try again
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  },
);
