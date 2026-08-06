import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a 1px border around the card, using the same border color as other bordered surfaces. */
  bordered?: boolean;
  /**
   * Swaps the card's contents for a centred `LogoLoader`. The children are not
   * rendered at all, so in-flight data never flashes before it is ready.
   */
  loading?: boolean;
  /** Caption shown under the loader while `loading`. */
  loadingLabel?: ReactNode;
  /** Minimum height held while `loading`, so the card does not collapse. @default 220px */
  loadingMinHeight?: number | string;
  children?: ReactNode;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
}

export interface CardActionsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
