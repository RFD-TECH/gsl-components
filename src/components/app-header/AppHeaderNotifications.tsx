import { Children, forwardRef, isValidElement, useMemo, type ReactNode } from "react";
import type { AppHeaderNotificationsProps } from "../../types/app-header";
import { Bell } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../../utils/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/Tabs";

const NEW_TAB = "new";
const HISTORY_TAB = "history";

/**
 * Splits the popover's children into unread and read piles by reading the
 * `unread` prop off each `AppHeaderNotificationItem`.
 *
 * Returns `null` when nothing in `children` is an `AppHeaderNotificationItem`:
 * a consumer rendering its own markup can't be partitioned, and guessing would
 * hide half of it behind a tab it never asked for. That case falls through to
 * the untabbed list, so existing usage renders exactly as it did before.
 */
function partitionByUnread(
  children: ReactNode,
): { unread: ReactNode[]; read: ReactNode[] } | null {
  const items = Children.toArray(children);
  const unread: ReactNode[] = [];
  const read: ReactNode[] = [];
  let recognised = false;

  for (const child of items) {
    if (isValidElement<{ unread?: boolean }>(child)) {
      const componentId = (child.type as { componentId?: string })?.componentId;
      if (componentId === "AppHeaderNotificationItem") {
        recognised = true;
        (child.props.unread ? unread : read).push(child);
        continue;
      }
    }

    // Anything unrecognised stays with the unread pile rather than vanishing:
    // "New" is the tab that opens, so nothing is hidden on first paint.
    unread.push(child);
  }

  return recognised ? { unread, read } : null;
}

export const AppHeaderNotifications = forwardRef<HTMLButtonElement, AppHeaderNotificationsProps>(
  function AppHeaderNotifications({ className, children, loading, loadingLabel = "Loading notifications..." }, ref) {
    const partitioned = useMemo(() => partitionByUnread(children), [children]);

    const skeleton = (
      <div className="clet-notif-popover__loading gsl-notif-popover__loading" aria-label={loadingLabel}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="clet-notif-popover__skeleton gsl-notif-popover__skeleton">
            <div className="clet-notif-popover__skeleton-dot gsl-notif-popover__skeleton-dot" />
            <div className="clet-notif-popover__skeleton-lines gsl-notif-popover__skeleton-lines">
              <div className="clet-notif-popover__skeleton-line gsl-notif-popover__skeleton-line clet-notif-popover__skeleton-line--wide" />
              <div className="clet-notif-popover__skeleton-line gsl-notif-popover__skeleton-line clet-notif-popover__skeleton-line--narrow" />
            </div>
          </div>
        ))}
      </div>
    );

    const empty = (label: string) => (
      <p className="clet-notif-popover__empty gsl-notif-popover__empty">{label}</p>
    );

    return (
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            type="button"
            className={cn("clet-app-header__notif-btn gsl-app-header__notif-btn", className)}
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.5} aria-hidden />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="clet-notif-popover gsl-notif-popover"
            side="bottom"
            align="end"
            sideOffset={8}
          >
            {loading || !partitioned ? (
              <>
                <div className="clet-notif-popover__header gsl-notif-popover__header">
                  <span className="clet-notif-popover__title gsl-notif-popover__title">Notifications</span>
                </div>
                <div className="clet-notif-popover__body gsl-notif-popover__body">
                  {loading ? skeleton : children}
                </div>
              </>
            ) : (
              <Tabs
                variant="pill"
                defaultValue={NEW_TAB}
                className="clet-notif-popover__tabs gsl-notif-popover__tabs"
              >
                <div className="clet-notif-popover__header gsl-notif-popover__header">
                  <span className="clet-notif-popover__title gsl-notif-popover__title">Notifications</span>
                  <TabsList
                    className="clet-notif-popover__tabs-list gsl-notif-popover__tabs-list"
                    aria-label="Notification filter"
                  >
                    <TabsTrigger value={NEW_TAB}>New</TabsTrigger>
                    <TabsTrigger value={HISTORY_TAB}>History</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent
                  value={NEW_TAB}
                  className="clet-notif-popover__body gsl-notif-popover__body"
                >
                  {partitioned.unread.length > 0
                    ? partitioned.unread
                    : empty("You're all caught up.")}
                </TabsContent>
                <TabsContent
                  value={HISTORY_TAB}
                  className="clet-notif-popover__body gsl-notif-popover__body"
                >
                  {partitioned.read.length > 0
                    ? partitioned.read
                    : empty("Nothing here yet.")}
                </TabsContent>
              </Tabs>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);

(AppHeaderNotifications as unknown as { componentId: string }).componentId = "AppHeaderNotifications";
