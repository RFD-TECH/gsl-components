import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, MutableRefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Checkbox } from "../../checkbox/Checkbox";
import { Button } from "../../button/Button";
import type {
  BulkImportField,
  BulkImportResult,
  BulkImportValidationError,
} from "../../../types/bulk-import-modal";
import { useScaledRowHeight } from "../../../hooks/useTextScale";
import { validateRowsChunked } from "../utils/validateRowsChunked";
import { validateFieldValue } from "../utils/validateFieldValue";
import { useDebounce } from "../../../hooks/useDebounce";
import { BACKGROUND_VALIDATION_CHUNK_SIZE } from "../constants";

interface ColumnDef {
  key: string;
  label: string;
}

interface VisibleRow {
  row: Record<string, string>;
  rowId: number;
}

interface ValidateDataStepProps {
  fields: BulkImportField[];
  mappedRows: Record<string, string>[];
  errors: BulkImportValidationError[];
  discardedRows: number[];
  dirtyCellsRef: MutableRefObject<Record<string, string>>;
  stepResultRef: MutableRefObject<() => BulkImportResult>;
  onDiscardSelectedRows: (ids: number[]) => void;
  onResetDiscardedRows: () => void;
  onCanConfirmChange: (canConfirm: boolean) => void;
}

interface CellInputProps {
  rowId: number;
  fieldKey: string;
  baseValue: string;
  errorMessage: string | undefined;
  ariaLabel: string;
  field: BulkImportField;
  dirtyCellsRef: MutableRefObject<Record<string, string>>;
  onDirty: (cellKey: string, value: string, field: BulkImportField) => void;
}

function buildErrorMap(errors: BulkImportValidationError[]) {
  const map = new Map<string, string>();
  for (const issue of errors) {
    map.set(`${issue.row}:${issue.fieldKey}`, issue.message);
  }
  return map;
}

function patchRows(
  baseRows: Record<string, string>[],
  dirtyCells: Record<string, string>,
): Record<string, string>[] {
  if (Object.keys(dirtyCells).length === 0) return baseRows;
  return baseRows.map((row, i) => {
    const rowId = i + 1;
    let patched = row;
    for (const [cellKey, value] of Object.entries(dirtyCells)) {
      const colonIdx = cellKey.indexOf(":");
      const dRowId = Number(cellKey.slice(0, colonIdx));
      if (dRowId !== rowId) continue;
      const fieldKey = cellKey.slice(colonIdx + 1);
      if (patched === row) patched = { ...row };
      patched[fieldKey] = value;
    }
    return patched;
  });
}

function CellInput({
  rowId,
  fieldKey,
  baseValue,
  errorMessage,
  ariaLabel,
  field,
  dirtyCellsRef,
  onDirty,
}: CellInputProps) {
  const cellKey = `${rowId}:${fieldKey}`;
  const [value, setValue] = useState(
    () => dirtyCellsRef.current[cellKey] ?? baseValue,
  );

  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const stored = dirtyCellsRef.current[cellKey];
    if (stored === debouncedValue) return;
    if (stored === undefined && debouncedValue === baseValue) return;
    dirtyCellsRef.current[cellKey] = debouncedValue;
    onDirty(cellKey, debouncedValue, field);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  return (
    <span className="clet-bulk-import__cell-inner gsl-bulk-import__cell-inner">
      <input
        type="text"
        className={[
          "clet-bulk-import__cell-input gsl-bulk-import__cell-input",
          errorMessage ? "clet-bulk-import__cell-input--error gsl-bulk-import__cell-input--error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        value={value}
        aria-invalid={errorMessage ? true : undefined}
        aria-label={ariaLabel}
        onChange={handleChange}
      />
      {errorMessage && (
        <span className="clet-bulk-import__cell-error-tooltip gsl-bulk-import__cell-error-tooltip" role="tooltip">
          {errorMessage}
        </span>
      )}
    </span>
  );
}

const ROW_HEIGHT = 44;

type SelectionState = "ALL" | Set<number>;

export function ValidateDataStep({
  fields,
  mappedRows,
  errors,
  discardedRows,
  dirtyCellsRef,
  stepResultRef,
  onDiscardSelectedRows,
  onResetDiscardedRows,
  onCanConfirmChange,
}: ValidateDataStepProps) {
  const [selection, setSelection] = useState<SelectionState>(new Set());
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);

  // Local validation: per-cell instant checks plus a background full scan.
  const [localValidation, setLocalValidation] = useState<
    BulkImportValidationError[]
  >([]);

  const bgAbortRef = useRef(new AbortController());
  const bgTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [dirtyCellKeys, setDirtyCellKeys] = useState<Set<string>>(new Set());

  const mappedRowsRef = useRef(mappedRows);
  mappedRowsRef.current = mappedRows;
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;

  const startBackgroundValidation = useCallback(async () => {
    bgAbortRef.current.abort();
    bgAbortRef.current = new AbortController();
    const signal = bgAbortRef.current.signal;
    const baseRows = mappedRowsRef.current;
    const dirty = dirtyCellsRef.current;

    const issues = await validateRowsChunked({
      rows: baseRows,
      fields: fieldsRef.current,
      signal,
      getRow: (row, rowIndex) => {
        const rowId = rowIndex + 1;
        let patched = row;
        for (const [cellKey, value] of Object.entries(dirty)) {
          const colonIdx = cellKey.indexOf(":");
          const dRowId = Number(cellKey.slice(0, colonIdx));
          if (dRowId !== rowId) continue;
          const fieldKey = cellKey.slice(colonIdx + 1);
          if (patched === row) patched = { ...row };
          patched[fieldKey] = value;
        }
        return patched;
      },
      chunk_size: BACKGROUND_VALIDATION_CHUNK_SIZE,
    });

    if (!signal.aborted) setLocalValidation(issues);
  }, [dirtyCellsRef]);

  const handleDirty = useCallback(
    (cellKey: string, value: string, field: BulkImportField) => {
      const colonIdx = cellKey.indexOf(":");
      const rowId = Number(cellKey.slice(0, colonIdx));
      const fieldKey = cellKey.slice(colonIdx + 1);

      const msg = validateFieldValue(field, value);
      setLocalValidation((prev) => {
        const next = prev.filter(
          (e) => !(e.row === rowId && e.fieldKey === fieldKey),
        );
        if (msg) {
          next.push({
            row: rowId,
            fieldKey,
            fieldLabel: field.label,
            message: msg,
            severity: "error",
          });
        }
        return next;
      });

      setDirtyCellKeys((prev) => {
        const next = new Set(prev);
        next.add(cellKey);
        return next;
      });

      if (bgTimerRef.current) clearTimeout(bgTimerRef.current);
      bgTimerRef.current = setTimeout(startBackgroundValidation, 300);
    },
    [startBackgroundValidation],
  );

  // Merge flow errors (clean cells) with local validation (dirty cells).
  const flowErrorMap = useMemo(() => buildErrorMap(errors), [errors]);
  const localErrorMap = useMemo(
    () => buildErrorMap(localValidation),
    [localValidation],
  );

  const mergedErrors = useMemo(() => {
    const merged = new Map<string, string>();
    for (const [key, msg] of flowErrorMap) {
      if (!dirtyCellKeys.has(key)) {
        merged.set(key, msg);
      }
    }
    for (const [key, msg] of localErrorMap) {
      merged.set(key, msg);
    }
    return merged;
  }, [flowErrorMap, localErrorMap, dirtyCellKeys]);

  const activeErrors = useMemo(() => {
    const cleanFlowErrors = errors.filter(
      (e) => !dirtyCellKeys.has(`${e.row}:${e.fieldKey}`),
    );
    const all = [...cleanFlowErrors, ...localValidation];
    return all.filter(
      (e) => e.severity === "error" && !discardedRows.includes(e.row),
    );
  }, [errors, localValidation, discardedRows, dirtyCellKeys]);

  const rowsWithErrors = useMemo(
    () => new Set(activeErrors.map((issue) => issue.row)),
    [activeErrors],
  );

  const dataKeys = useMemo(() => {
    if (mappedRows.length === 0) return new Set<string>();
    return new Set(Object.keys(mappedRows[0]));
  }, [mappedRows]);

  const visibleFields = useMemo(
    () => fields.filter((f) => dataKeys.has(f.key) || f.required),
    [fields, dataKeys],
  );

  const columns: ColumnDef[] = useMemo(
    () =>
      visibleFields.map((f) => ({
        key: f.key,
        label: f.label.toUpperCase(),
      })),
    [visibleFields],
  );

  const visibleRows: VisibleRow[] = useMemo(
    () =>
      mappedRows
        .map((row, index) => ({ row, rowId: index + 1 }))
        .filter(({ rowId }) => !discardedRows.includes(rowId))
        .filter(({ rowId }) => !showOnlyErrors || rowsWithErrors.has(rowId)),
    [mappedRows, discardedRows, showOnlyErrors, rowsWithErrors],
  );

  const visibleRowIds = useMemo(
    () => visibleRows.map(({ rowId }) => rowId),
    [visibleRows],
  );

  const allSelected = useMemo(() => {
    if (selection === "ALL") return visibleRows.length > 0;
    if (visibleRows.length === 0) return false;
    return visibleRowIds.every((id) => selection.has(id));
  }, [selection, visibleRowIds, visibleRows.length]);

  const someSelected = selection === "ALL" || selection.size > 0;
  const indeterminate = someSelected && !allSelected;

  const visibleRowIdsRef = useRef(visibleRowIds);
  visibleRowIdsRef.current = visibleRowIds;

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelection(checked ? "ALL" : new Set());
  }, []);

  const handleToggleRow = useCallback((rowId: number) => {
    setSelection((prev) => {
      if (prev === "ALL") {
        return new Set(visibleRowIdsRef.current.filter((id) => id !== rowId));
      }
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      if (next.size >= visibleRowIdsRef.current.length) return "ALL";
      return next;
    });
  }, []);

  const handleDiscard = useCallback(() => {
    const ids =
      selection === "ALL" ? visibleRowIdsRef.current : Array.from(selection);
    if (ids.length === 0) return;
    onDiscardSelectedRows(ids);
    setSelection(new Set());
  }, [selection, onDiscardSelectedRows]);

  // Step result, read by BulkImportModal on Confirm.
  const activeErrorList = useMemo(() => {
    const cleanFlowErrors = errors.filter(
      (e) => !dirtyCellKeys.has(`${e.row}:${e.fieldKey}`),
    );
    const all = [...cleanFlowErrors, ...localValidation];
    return all.filter((e) => !discardedRows.includes(e.row));
  }, [errors, localValidation, discardedRows, dirtyCellKeys]);

  useEffect(() => {
    stepResultRef.current = () => {
      const rows = patchRows(mappedRows, dirtyCellsRef.current).filter(
        (_, index) => !discardedRows.includes(index + 1),
      );
      return {
        rows,
        errors: activeErrorList.filter((e) => e.severity === "error"),
        warnings: activeErrorList.filter((e) => e.severity === "warning"),
      };
    };
    onCanConfirmChange(
      activeErrorList.filter((e) => e.severity === "error").length === 0,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stepResultRef,
    mappedRows,
    discardedRows,
    activeErrorList,
    onCanConfirmChange,
  ]);

  // Clear dirty cells on unmount / data change.
  useEffect(() => {
    return () => {
      if (bgTimerRef.current) clearTimeout(bgTimerRef.current);
      bgAbortRef.current.abort();
      dirtyCellsRef.current = {};
    };
  }, [dirtyCellsRef]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Each row is pinned to this height below, so estimate and reality agree.
  const rowHeight = useScaledRowHeight(ROW_HEIGHT);

  const virtualizer = useVirtualizer({
    count: visibleRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 25,
  });
  const virtualRows = virtualizer.getVirtualItems();
  const hasVirtualRows = virtualRows.length > 0;
  const isSmallDataset = visibleRows.length <= 50;

  const items = hasVirtualRows
    ? virtualRows
    : isSmallDataset
      ? visibleRows.map((_, i) => ({
          key: i,
          index: i,
          start: i * rowHeight,
          size: rowHeight,
        }))
      : [];

  const totalHeight = hasVirtualRows
    ? virtualizer.getTotalSize()
    : isSmallDataset
      ? visibleRows.length * rowHeight
      : 0;

  const colCount = columns.length + 1;

  return (
    <div className="clet-bulk-import__step gsl-bulk-import__step clet-bulk-import__step--validate gsl-bulk-import__step--validate">
      <div className="clet-bulk-import__step-header gsl-bulk-import__step-header">
        <h3 className="clet-bulk-import__step-title gsl-bulk-import__step-title">Validate data</h3>
        {discardedRows.length > 0 && (
          <Button variant="outline" size="sm" onClick={onResetDiscardedRows}>
            Reset discarded rows
          </Button>
        )}
      </div>

      <div className="clet-bulk-import__validate-toolbar gsl-bulk-import__validate-toolbar">
        <div className="clet-bulk-import__validate-actions gsl-bulk-import__validate-actions">
          <Button
            variant="outline"
            size="sm"
            disabled={!someSelected}
            onClick={handleDiscard}
          >
            Discard selected rows
            {someSelected && selection !== "ALL" && ` (${selection.size})`}
          </Button>
          <label className="clet-bulk-import__switch gsl-bulk-import__switch">
            <input
              type="checkbox"
              role="switch"
              className="clet-bulk-import__switch-input gsl-bulk-import__switch-input"
              checked={showOnlyErrors}
              onChange={(event) => setShowOnlyErrors(event.target.checked)}
            />
            <span className="clet-bulk-import__switch-track gsl-bulk-import__switch-track" aria-hidden="true">
              <span className="clet-bulk-import__switch-thumb gsl-bulk-import__switch-thumb" />
            </span>
            <span className="clet-bulk-import__switch-label gsl-bulk-import__switch-label">
              Show only rows with errors{" "}
              {rowsWithErrors.size > 0 && `(${rowsWithErrors.size})`}
            </span>
          </label>
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <div className="clet-bulk-import__validate-empty-wrap gsl-bulk-import__validate-empty-wrap">
          <p className="clet-bulk-import__validate-empty gsl-bulk-import__validate-empty">
            {showOnlyErrors ? "No rows with errors." : "No rows to validate."}
          </p>
          {showOnlyErrors && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyErrors(false)}
            >
              Show all rows
            </Button>
          )}
        </div>
      ) : (
        <div className="clet-bulk-import__table-wrap--validate gsl-bulk-import__table-wrap--validate">
          <div ref={scrollRef} className="clet-bulk-import__validate-scroll gsl-bulk-import__validate-scroll">
            <table className="clet-bulk-import__validate-table gsl-bulk-import__validate-table">
              <thead>
                <tr>
                  <th className="clet-bulk-import__validate-th-checkbox gsl-bulk-import__validate-th-checkbox">
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : indeterminate
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all rows"
                    />
                  </th>
                  {columns.map((col) => (
                    <th key={col.key} className="clet-bulk-import__validate-th gsl-bulk-import__validate-th">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr
                  className="clet-bulk-import__validate-spacer-row gsl-bulk-import__validate-spacer-row"
                  style={{ height: totalHeight }}
                >
                  <td
                    colSpan={colCount}
                    className="clet-bulk-import__validate-spacer-td gsl-bulk-import__validate-spacer-td"
                  >
                    {items.map((item) => {
                      const { row, rowId } = visibleRows[item.index];
                      const isSelected =
                        selection === "ALL" || selection.has(rowId);

                      return (
                        <div
                          key={item.key}
                          data-index={item.index}
                          className="clet-bulk-import__validate-row-container gsl-bulk-import__validate-row-container"
                          style={{
                            height: `${item.size}px`,
                            transform: `translateY(${item.start}px)`,
                          }}
                        >
                          <table className="clet-bulk-import__validate-row-table gsl-bulk-import__validate-row-table">
                            <tbody>
                              <tr
                                data-selected={isSelected || undefined}
                                className={[
                                  "clet-bulk-import__data-row gsl-bulk-import__data-row",
                                  isSelected
                                    ? "clet-bulk-import__data-row--selected gsl-bulk-import__data-row--selected"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                style={{ height: rowHeight }}
                              >
                                <td className="clet-bulk-import__validate-td-checkbox gsl-bulk-import__validate-td-checkbox">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      handleToggleRow(rowId)
                                    }
                                    aria-label="Select row"
                                  />
                                </td>
                                {visibleFields.map((field) => {
                                  const cellKey = `${rowId}:${field.key}`;
                                  const errorMessage =
                                    mergedErrors.get(cellKey);

                                  return (
                                    <td
                                      key={field.key}
                                      className={[
                                        "clet-bulk-import__validate-td gsl-bulk-import__validate-td",
                                        errorMessage
                                          ? "clet-bulk-import__cell--error gsl-bulk-import__cell--error"
                                          : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    >
                                      <CellInput
                                        rowId={rowId}
                                        fieldKey={field.key}
                                        field={field}
                                        baseValue={String(row[field.key] ?? "")}
                                        errorMessage={errorMessage}
                                        ariaLabel={`${field.label}, row ${rowId}`}
                                        dirtyCellsRef={dirtyCellsRef}
                                        onDirty={handleDirty}
                                      />
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
