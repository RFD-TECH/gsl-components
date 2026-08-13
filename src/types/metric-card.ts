import type { HTMLAttributes, ReactNode } from "react";

export type MetricTrend = "up" | "down" | "neutral";

export type MetricCardVariant = "default" | "outline" | "bordered" | "soft";

/** Ids of the watermarks bundled with `variant="soft"`. */
export type MetricCardMark =
  | "rings"
  | "lattice"
  | "quatrefoil"
  | "bird"
  | "crossed";

export interface MetricCardClassNames {
  root?: string;
  icon?: string;
  label?: string;
  value?: string;
  description?: string;
  trend?: string;
  mark?: string;
}

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Metric label shown above the value */
  label: string;
  /** The primary metric value */
  value: string | number;
  /** Optional icon displayed alongside the label */
  icon?: ReactNode;
  /** Subtitle or description below the value */
  description?: string;
  /**
   * Visual variant.
   * "outline" renders a no-fill, bordered card with chevron trend icons and no +/- prefix.
   * "bordered" renders the same layout as "default" with a 1px border added.
   * "soft" renders a borderless card on a shadow, with the `Card` corner radius
   * and a brand watermark bleeding off the bottom-right corner.
   */
  variant?: MetricCardVariant;
  /**
   * Which bundled watermark `variant="soft"` draws. Omit it and the mark is
   * picked by hashing `label`, so each card gets a stable one and a row of
   * cards spreads across the set. Pass `false` for no watermark, or a node to
   * supply your own artwork instead of the bundled set.
   */
  mark?: MetricCardMark | ReactNode | false;
  /** Direction of the trend indicator */
  trend?: MetricTrend;
  /** Formatted trend text (e.g. "+12.5%") */
  trendValue?: string;
  /** Enable count-up animation from 0 to the target value on mount and value change */
  animate?: boolean;
  /** Duration of the count-up animation in ms (default: 1500) */
  animationDuration?: number;
  /** Show shimmering skeleton placeholders instead of the label/value/description content */
  loading?: boolean;
  /** Accessible label announced while loading (default: "Loading metric") */
  loadingLabel?: string;
  classNames?: MetricCardClassNames;
  className?: string;
}
