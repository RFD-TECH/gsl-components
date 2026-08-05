import type { HTMLAttributes, ReactNode } from "react";

export type LogoLoaderVariant = "inline" | "block" | "fill" | "fullscreen";

export type LogoLoaderSize = "sm" | "md" | "lg";

export interface LogoLoaderClassNames {
  /** Outermost element — the backdrop for `fill` and `fullscreen`. */
  root?: string;
  /** Floating card that holds the mark. `fullscreen` only. */
  panel?: string;
  /** Square that stacks the halo, rings and logo. */
  mark?: string;
  halo?: string;
  outerRing?: string;
  /** The rotating arc. */
  ring?: string;
  logo?: string;
  label?: string;
}

export interface LogoLoaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Layout behaviour. @default "inline" */
  variant?: LogoLoaderVariant;
  /** Mark diameter preset. Ignored when `width`/`height` are given. @default "md" */
  size?: LogoLoaderSize;
  /** Image rendered as the mark. @default the baked-in CLET logo */
  src?: string;
  /** Alt text. An empty string marks the image decorative, which is usually right. @default "" */
  alt?: string;
  /** Explicit mark width — a number is treated as px. Overrides `size`. */
  width?: number | string;
  /** Explicit mark height — a number is treated as px. Overrides `size`. */
  height?: number | string;
  /** Caption rendered beneath the mark. */
  label?: ReactNode;
  /**
   * Animation speed multiplier. `2` runs twice as fast, `0.5` half as fast.
   * Scales the sweep and the pulse together.
   * @default 1
   */
  speed?: number;
  /**
   * Animate the halo outward on every sweep. Off by default — the halo renders
   * as a static disc behind the logo, which reads calmer next to the arc.
   * @default false
   */
  pulse?: boolean;
  /**
   * Hide the halo disc entirely, leaving only the arc and the logo.
   * @default false
   */
  noHalo?: boolean;
  /**
   * Pulse the logo's own opacity. Composes with the halo: the disc stays put
   * and the logo breathes. @default false
   */
  fadePulse?: boolean;
  /**
   * Backdrop blur behind the loader — a number is treated as px, and `0`
   * removes the blur. Only `fill` and `fullscreen` paint a backdrop.
   * @default 4px for `fullscreen`, 2px for `fill`
   */
  blur?: number | string;
  /**
   * Drop the faint outer ring. That ring sits outside the arc, and the mark
   * reserves room for it, so removing it also tightens the loader's footprint.
   * @default false
   */
  noBorder?: boolean;
  /**
   * Drives the enter/exit transition for `fullscreen`. Pass it and keep the
   * loader mounted: the backdrop blur ramps 0 -> full and the panel fades in on
   * `true`, and both reverse on `false` instead of vanishing. Omit it entirely
   * to keep the plain mount/unmount behaviour.
   */
  open?: boolean;
  classNames?: LogoLoaderClassNames;
  className?: string;
}
