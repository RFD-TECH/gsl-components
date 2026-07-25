import { useCallback, useState } from "react";
import { Settings2 } from "lucide-react";
import type { QuickActionsProps } from "../../types/quick-actions";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "../dialog";
import "./styles/quick-actions.css";

export function QuickActions({
  actions,
  title = "Quick actions",
  customizable = false,
  hiddenIds,
  onToggleVisibility,
  onAction,
  customizeLabel = "Customize",
  emptyMessage = "No quick actions available.",
  classNames,
  className,
  ...props
}: QuickActionsProps) {
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const handleItemClick = useCallback(
    (id: string) => {
      onAction?.(id);
    },
    [onAction],
  );

  return (
    <div
      className={cn("clet-quick-actions", classNames?.root, className)}
      {...props}
    >
      <div className={cn("clet-quick-actions__header", classNames?.header)}>
        <span
          className={cn("clet-quick-actions__title", classNames?.title)}
        >
          {title}
        </span>
        {customizable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCustomizeOpen(true)}
            className={classNames?.customizeButton}
          >
            <Settings2 size={14} strokeWidth={1.5} aria-hidden />
            {customizeLabel}
          </Button>
        )}
      </div>

      {actions.length > 0 ? (
        <div className={cn("clet-quick-actions__grid", classNames?.grid)}>
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={cn("clet-quick-actions__item", classNames?.item)}
              onClick={() => handleItemClick(action.id)}
            >
              <span
                className={cn(
                  "clet-quick-actions__item-icon",
                  classNames?.itemIcon,
                )}
              >
                {action.icon}
              </span>
              <span
                className={cn(
                  "clet-quick-actions__item-content",
                  classNames?.itemContent,
                )}
              >
                <span
                  className={cn(
                    "clet-quick-actions__item-label",
                    classNames?.itemLabel,
                  )}
                >
                  {action.label}
                </span>
                {action.description && (
                  <span
                    className={cn(
                      "clet-quick-actions__item-description",
                      classNames?.itemDescription,
                    )}
                  >
                    {action.description}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className={cn("clet-quick-actions__empty", classNames?.empty)}>
          {emptyMessage}
        </p>
      )}

      {customizable && (
        <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent
              showCloseButton
              className={classNames?.dialog}
            >
              <DialogTitle>Customize quick actions</DialogTitle>
              <DialogDescription>
                Choose which shortcuts this section shows. The selection is saved
                on this device.
              </DialogDescription>
              <div
                className={cn(
                  "clet-quick-actions__dialog-checkbox",
                  classNames?.dialogCheckbox,
                )}
              >
                {actions.map((action) => (
                  <Checkbox
                    key={action.id}
                    label={action.label}
                    checked={
                      hiddenIds ? !hiddenIds.has(action.id) : true
                    }
                    onCheckedChange={() =>
                      onToggleVisibility?.(action.id)
                    }
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2" style={{ marginTop: 16 }}>
                <Button
                  variant="ghost"
                  onClick={() => setCustomizeOpen(false)}
                >
                  Done
                </Button>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      )}
    </div>
  );
}
