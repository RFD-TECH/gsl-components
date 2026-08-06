import { forwardRef, useContext, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  User,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Avatar } from "../avatar/Avatar";
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
import type {
  ProfilePopoverItem,
  ProfilePopoverProps,
} from "../../types/profile-popover";
import { cn } from "../../utils/cn";
import { ThemeContext } from "../theme/ThemeContext";
import "./styles/profile-popover.css";

export const ProfilePopover = forwardRef<HTMLElement, ProfilePopoverProps>(
  function ProfilePopover(
    {
      fullName,
      email,
      profilePhoto,
      user,
      variant = "full",
      trigger,
      triggerClassName,
      items,
      onMyProfile,
      onAccountSettings,
      onHelpAndSupport,
      onSignOut,
      noConfirmSignOut = false,
      children,
      side = "top",
      align = "start",
      sideOffset = 8,
      className,
      hideThemeAction = false,
      themeAction,
      loading = false,
      loadingLabel = "Loading profile",
    },
    ref,
  ) {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false);

    const resolvedFullName = fullName ?? user?.name ?? "";
    const resolvedEmail = email ?? user?.email;
    const resolvedPhoto = profilePhoto ?? user?.avatar;
    const isAvatarOnly = variant === "avatar";

    const defaultItems: ProfilePopoverItem[] = [
      {
        icon: <User size={20} strokeWidth={1.5} aria-hidden />,
        label: "My Profile",
        onClick: onMyProfile,
      },
      {
        icon: <Settings size={20} strokeWidth={1.5} aria-hidden />,
        label: "Account Settings",
        onClick: onAccountSettings,
      },
      {
        icon: <HelpCircle size={20} strokeWidth={1.5} aria-hidden />,
        label: "Help and Support",
        onClick: onHelpAndSupport,
      },
    ];
    const resolvedItems = items ?? defaultItems;

    const handleSignOutClick = () => {
      if (noConfirmSignOut) {
        setPopoverOpen(false);
        onSignOut?.();
        return;
      }
      setPopoverOpen(false);
      setConfirmSignOutOpen(true);
    };

    const handleConfirmSignOut = () => {
      setConfirmSignOutOpen(false);
      onSignOut?.();
    };

    const themeContext = useContext(ThemeContext);
    const themeToggle = !hideThemeAction && themeAction !== undefined ? themeAction : (
      themeContext && !hideThemeAction ? (
        <button
          type="button"
          className="clet-profile-menu__header-action-btn gsl-profile-menu__header-action-btn"
          aria-label={
            themeContext.resolvedTheme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          onClick={() =>
            themeContext.setTheme(
              themeContext.resolvedTheme === "dark" ? "light" : "dark",
            )
          }
        >
          {themeContext.resolvedTheme === "dark" ? (
            <Sun size={18} strokeWidth={1.5} aria-hidden />
          ) : (
            <Moon size={18} strokeWidth={1.5} aria-hidden />
          )}
        </button>
      ) : null
    );

    const headerStyleTrigger = user ? (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          "clet-app-header__profile gsl-app-header__profile",
          isAvatarOnly && "clet-app-header__profile--avatar gsl-app-header__profile--avatar",
          triggerClassName,
        )}
        aria-busy={loading || undefined}
      >
        {loading ? (
          <span
            className="clet-skeleton gsl-skeleton clet-app-header__skeleton-avatar gsl-app-header__skeleton-avatar"
            aria-hidden
          />
        ) : (
          <Avatar
            name={user.name}
            src={user.avatar}
            size={32}
            backgroundVar="--clet-profile-avatar-bg"
          />
        )}
        {!isAvatarOnly &&
          (loading ? (
            <span
              className="clet-app-header__user-info gsl-app-header__user-info clet-app-header__user-info--loading gsl-app-header__user-info--loading"
              aria-hidden
            >
              <span className="clet-skeleton gsl-skeleton clet-app-header__skeleton-name gsl-app-header__skeleton-name" />
              <span className="clet-skeleton gsl-skeleton clet-app-header__skeleton-role gsl-app-header__skeleton-role" />
            </span>
          ) : (
            <>
              <div className="clet-app-header__user-info gsl-app-header__user-info">
                <span className="clet-app-header__user-name gsl-app-header__user-name">{user.name}</span>
                <span className="clet-app-header__user-role gsl-app-header__user-role">{user.role}</span>
              </div>
              <ChevronDown size={16} strokeWidth={1.5} aria-hidden />
            </>
          ))}
        {loading ? (
          <span className="clet-app-header__sr-only gsl-app-header__sr-only" role="status">
            {loadingLabel}
          </span>
        ) : null}
      </div>
    ) : (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cn("clet-profile-menu__trigger gsl-profile-menu__trigger", triggerClassName)}
      >
        {loading ? (
          <span
            className="clet-skeleton gsl-skeleton clet-profile-menu__skeleton-avatar gsl-profile-menu__skeleton-avatar"
            aria-hidden
          />
        ) : (
          <Avatar
            name={resolvedFullName}
            src={resolvedPhoto}
            size="md"
            backgroundVar="--clet-profile-avatar-bg"
          />
        )}
        <div
          className={cn(
            "clet-profile-menu__trigger-info gsl-profile-menu__trigger-info",
            loading && "clet-profile-menu__trigger-info--loading gsl-profile-menu__trigger-info--loading",
          )}
        >
          {loading ? (
            <>
              <span className="clet-skeleton gsl-skeleton clet-profile-menu__skeleton-name gsl-profile-menu__skeleton-name" />
              <span className="clet-skeleton gsl-skeleton clet-profile-menu__skeleton-email gsl-profile-menu__skeleton-email" />
            </>
          ) : (
            <>
              <span className="clet-profile-menu__trigger-name gsl-profile-menu__trigger-name">
                {resolvedFullName}
              </span>
              {resolvedEmail && (
                <span className="clet-profile-menu__trigger-email gsl-profile-menu__trigger-email">
                  {resolvedEmail}
                </span>
              )}
            </>
          )}
        </div>
      </button>
    );

    const hasItems = resolvedItems.length > 0;
    const hasContent = loading || hasItems || Boolean(children);

    return (
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Trigger asChild>
          {trigger ?? headerStyleTrigger}
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={cn("clet-profile-menu gsl-profile-menu", className)}
            side={side}
            align={align}
            sideOffset={sideOffset}
            role="menu"
            aria-busy={loading || undefined}
          >
            {loading ? (
              <span className="clet-profile-menu__sr-only gsl-profile-menu__sr-only" role="status">
                {loadingLabel}
              </span>
            ) : null}

            <div
              className="clet-profile-menu__header gsl-profile-menu__header"
              aria-hidden={loading || undefined}
            >
              {loading ? (
                <span className="clet-skeleton gsl-skeleton clet-profile-menu__skeleton-avatar gsl-profile-menu__skeleton-avatar clet-profile-menu__skeleton-avatar--lg gsl-profile-menu__skeleton-avatar--lg" />
              ) : (
                <Avatar
                  name={resolvedFullName}
                  src={resolvedPhoto}
                  size="lg"
                  backgroundVar="--clet-profile-avatar-bg"
                />
              )}
              <div
                className={cn(
                  "clet-profile-menu__header-info gsl-profile-menu__header-info",
                  loading && "clet-profile-menu__header-info--loading gsl-profile-menu__header-info--loading",
                )}
              >
                {loading ? (
                  <>
                    <span className="clet-skeleton gsl-skeleton clet-profile-menu__skeleton-name gsl-profile-menu__skeleton-name" />
                    <span className="clet-skeleton gsl-skeleton clet-profile-menu__skeleton-email gsl-profile-menu__skeleton-email" />
                  </>
                ) : (
                  <>
                    <span className="clet-profile-menu__name gsl-profile-menu__name">
                      {resolvedFullName}
                    </span>
                    {resolvedEmail && (
                      <span className="clet-profile-menu__email gsl-profile-menu__email">
                        {resolvedEmail}
                      </span>
                    )}
                  </>
                )}
              </div>
              {themeToggle && (
                <div className="clet-profile-menu__header-action gsl-profile-menu__header-action">
                  {themeToggle}
                </div>
              )}
            </div>

            {hasContent && <div className="clet-profile-menu__divider gsl-profile-menu__divider" />}

            {loading ? (
              <div className="clet-profile-menu__items gsl-profile-menu__items">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="clet-profile-menu__skeleton-item gsl-profile-menu__skeleton-item">
                    <span className="clet-skeleton gsl-skeleton clet-profile-menu__skeleton-item-icon gsl-profile-menu__skeleton-item-icon" />
                    <span className="clet-skeleton gsl-skeleton clet-profile-menu__skeleton-item-label gsl-profile-menu__skeleton-item-label" />
                  </div>
                ))}
              </div>
            ) : hasContent ? (
              <div className="clet-profile-menu__content gsl-profile-menu__content">
                {hasItems && (
                  <div className="clet-profile-menu__items gsl-profile-menu__items">
                    {resolvedItems.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        className={cn(
                          "clet-profile-menu__item gsl-profile-menu__item",
                          item.danger && "clet-profile-menu__item--danger gsl-profile-menu__item--danger",
                        )}
                        onClick={item.onClick}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="clet-profile-menu__items gsl-profile-menu__items">{children}</div>
              </div>
            ) : null}

            <div className="clet-profile-menu__divider gsl-profile-menu__divider" />
            <div className="clet-profile-menu__items gsl-profile-menu__items clet-profile-menu__items--signout gsl-profile-menu__items--signout">
              <button
                type="button"
                className="clet-profile-menu__item gsl-profile-menu__item clet-profile-menu__item--danger gsl-profile-menu__item--danger"
                onClick={handleSignOutClick}
              >
                <LogOut size={20} strokeWidth={1.5} aria-hidden />
                <span>Sign Out</span>
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>

        <Dialog
          open={confirmSignOutOpen}
          onOpenChange={(open) => {
            if (!open) setConfirmSignOutOpen(false);
          }}
        >
          <DialogPortal>
            <DialogOverlay />
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Confirm Sign Out</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Are you sure you want to sign out?
              </DialogDescription>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setConfirmSignOutOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmSignOut}>
                  Sign Out
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </Popover.Root>
    );
  },
);

(ProfilePopover as unknown as { componentId: string }).componentId =
  "ProfilePopover";
