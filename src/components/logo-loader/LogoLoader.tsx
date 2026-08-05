import { forwardRef } from "react";
import type { CSSProperties } from "react";
import type { LogoLoaderProps } from "../../types/logo-loader";
import { cn } from "../../utils/cn";
import cletLogo from "./assets/clet-logo.png";
import "./styles/logo-loader.css";

function toLength(value?: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Branded loading indicator — a logo sitting inside a sweeping arc with a
 * pulsing halo and a faint outer ring. The CLET emblem is baked in as the
 * default, and any app can swap it for its own via `src`.
 *
 * The arc is velocity-coupled: it lengthens as it whips around and trails off
 * short as it slows, rather than turning at a constant rate.
 *
 * The ring geometry is derived from the mark's size, so `width`/`height` scale
 * the whole assembly rather than just the image.
 *
 * @example
 * // Inline, in a card
 * <LogoLoader size="sm" />
 * // A whole route
 * <LogoLoader variant="block" label="Loading meeting…" />
 * // Cover one section — the parent needs `position: relative`
 * <LogoLoader variant="fill" label="Loading section…" />
 * // Block the page during an initial load
 * <LogoLoader variant="fullscreen" label="Loading…" />
 * // Another portal's emblem, at an explicit size
 * <LogoLoader src={gslLogo} width={96} />
 * // Faster, with the logo breathing
 * <LogoLoader speed={1.6} fadePulse />
 * // Animate the halo outward on every sweep
 * <LogoLoader pulse />
 * // Arc and logo only
 * <LogoLoader noHalo />
 */
export const LogoLoader = forwardRef<HTMLDivElement, LogoLoaderProps>(
  function LogoLoader(
    {
      variant = "inline",
      size = "md",
      src = cletLogo,
      alt = "",
      width,
      height,
      label,
      speed,
      pulse = false,
      noHalo = false,
      fadePulse = false,
      blur,
      noBorder = false,
      open,
      classNames,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const markStyle = {
      ...(width
        ? { "--clet-logo-loader-mark-size": toLength(width) }
        : null),
      ...(height
        ? { "--clet-logo-loader-mark-height": toLength(height) }
        : null),
      // Durations are divided by this, so a non-positive value would stall or
      // reverse the animation.
      ...(speed && speed > 0 ? { "--clet-logo-loader-speed": speed } : null),
    } as CSSProperties;

    // The backdrop is painted by the root, so its blur belongs there rather
    // than on the mark. `0` is meaningful (no blur), hence the undefined check.
    const rootStyle = {
      ...(blur === undefined
        ? null
        : { "--clet-logo-loader-blur": toLength(blur) }),
      ...style,
    } as CSSProperties;

    const mark = (
      <>
        <div
          className={cn(
            "clet-logo-loader__mark gsl-logo-loader__mark",
            classNames?.mark,
          )}
          style={markStyle}
        >
          {noHalo ? null : (
            <span
              aria-hidden="true"
              className={cn(
                "clet-logo-loader__halo gsl-logo-loader__halo",
                classNames?.halo,
              )}
            />
          )}
          {noBorder ? null : (
            <span
              aria-hidden="true"
              className={cn(
                "clet-logo-loader__outer-ring gsl-logo-loader__outer-ring",
                classNames?.outerRing,
              )}
            />
          )}
          <svg
            aria-hidden="true"
            viewBox="0 0 50 50"
            className={cn(
              "clet-logo-loader__ring gsl-logo-loader__ring",
              classNames?.ring,
            )}
          >
            {/* The track is the full circle; the arc rides on top of it and its
                dash length is animated in step with the sweep. */}
            <circle className="clet-logo-loader__track" cx="25" cy="25" r="20" />
            <circle className="clet-logo-loader__arc" cx="25" cy="25" r="20" />
          </svg>
          <img
            src={src}
            alt={alt}
            className={cn(
              "clet-logo-loader__logo gsl-logo-loader__logo",
              classNames?.logo,
            )}
          />
        </div>
        {label ? (
          <p
            className={cn(
              "clet-logo-loader__label gsl-logo-loader__label",
              classNames?.label,
            )}
          >
            {label}
          </p>
        ) : null}
        <span className="clet-logo-loader__sr-only gsl-logo-loader__sr-only">
          Loading…
        </span>
      </>
    );

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          "clet-logo-loader gsl-logo-loader",
          `clet-logo-loader--${variant} gsl-logo-loader--${variant}`,
          `clet-logo-loader--${size} gsl-logo-loader--${size}`,
          noBorder && "clet-logo-loader--no-border gsl-logo-loader--no-border",
          open === undefined
            ? null
            : open
              ? "clet-logo-loader--open gsl-logo-loader--open"
              : "clet-logo-loader--closed gsl-logo-loader--closed",
          pulse && !noHalo && "clet-logo-loader--pulse gsl-logo-loader--pulse",
          noHalo && "clet-logo-loader--no-halo gsl-logo-loader--no-halo",
          fadePulse && "clet-logo-loader--fade-pulse gsl-logo-loader--fade-pulse",
          classNames?.root,
          className,
        )}
        style={rootStyle}
        {...props}
      >
        {variant === "fullscreen" ? (
          <div
            className={cn(
              "clet-logo-loader__panel gsl-logo-loader__panel",
              classNames?.panel,
            )}
          >
            {mark}
          </div>
        ) : (
          mark
        )}
      </div>
    );
  },
);
