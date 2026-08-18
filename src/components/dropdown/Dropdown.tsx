import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import type { DropdownProps } from "../../types/dropdown";
import { cn } from "../../utils/cn";
import "./styles/dropdown.css";
import { useCallback, useMemo, useRef } from "react";
import { useTableFilterReset } from "../../hooks/useTableFilterReset";

const EMPTY_VALUE = "__clet_dropdown_none__";

export function Dropdown({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  clearable = false,
  disabled = false,
  invalid = false,
  "aria-label": ariaLabel,
  formatOption,
  classNames,
  className,
  name,
  required,
  form,
}: DropdownProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Named Dropdowns take part in table state, so a TableFilter's "clear" has to
  // empty this one rather than let Radix restore the value it mounted with.
  const handleFilterReset = useCallback(() => onValueChange(null), [
    onValueChange,
  ]);
  useTableFilterReset(rootRef, handleFilterReset, Boolean(name));

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );
  const isPlaceholder = !selectedOption;
  const valueDisplay = useMemo(
    () =>
      formatOption?.(
        selectedOption ?? null,
        isPlaceholder ? "empty" : "selected",
      ) ??
      selectedOption?.label ??
      placeholder,
    [formatOption, selectedOption, placeholder, isPlaceholder],
  );

  return (
    <Select.Root
      // "" (not the clearable sentinel) so Radix's own hidden bubble
      // <select> — wired up via name/required/form below — submits an
      // empty value for FormData when nothing's selected, instead of the
      // internal EMPTY_VALUE marker. The sentinel is only ever a menu
      // item's value (Radix disallows "" there), never Root's value.
      value={value ?? ""}
      onValueChange={(nextValue) =>
        onValueChange(nextValue === EMPTY_VALUE ? null : nextValue)
      }
      disabled={disabled}
      name={name}
      required={required}
      form={form}
    >
      <div
        ref={rootRef}
        className={cn("clet-dropdown gsl-dropdown", classNames?.root, className)}
      >
        <Select.Trigger
          className={cn(
            "clet-dropdown__trigger gsl-dropdown__trigger",
            isPlaceholder && "clet-dropdown__trigger--placeholder gsl-dropdown__trigger--placeholder",
            invalid && "clet-dropdown__trigger--invalid gsl-dropdown__trigger--invalid",
            classNames?.trigger,
          )}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
        >
          <Select.Value placeholder={placeholder}>{valueDisplay}</Select.Value>
          <Select.Icon
            className={cn("clet-dropdown__trigger-icon gsl-dropdown__trigger-icon", classNames?.icon)}
            aria-hidden="true"
          >
            <ChevronDown size={16} strokeWidth={2} aria-hidden />
          </Select.Icon>
        </Select.Trigger>
      </div>

      <Select.Portal>
        <Select.Content
          className={cn("clet-dropdown__menu gsl-dropdown__menu", classNames?.menu)}
          position="popper"
          sideOffset={4}
          onPointerDownOutside={(e) => e.stopPropagation()}
        >
          <Select.Viewport>
            {clearable ? (
              <Select.Item
                value={EMPTY_VALUE}
                // Root's value is "" (not EMPTY_VALUE) when nothing's
                // selected, so Radix no longer marks this item "checked"
                // on its own — restore that highlight manually.
                data-state={isPlaceholder ? "checked" : undefined}
                className={cn("clet-dropdown__option gsl-dropdown__option", classNames?.option)}
              >
                <Select.ItemText>{placeholder}</Select.ItemText>
              </Select.Item>
            ) : null}
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn("clet-dropdown__option gsl-dropdown__option", classNames?.option)}
              >
                <Select.ItemText>
                  {formatOption
                    ? formatOption(
                        option,
                        option.value === value ? "selected" : "idle",
                      )
                    : option.label}
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
