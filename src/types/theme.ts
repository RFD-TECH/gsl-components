import type { CSSProperties, ReactNode } from "react";
import type { CletComponentTokenMap, CletGlobalTokens } from "../generated/components.theme";

export type CletTheme = "light" | "dark" | "system";

export type ResolvedCletTheme = "light" | "dark";

/** Accessibility text-size step. "md" is the default and matches the shipped sizes. */
export type CletFontSize = "sm" | "md" | "lg" | "xl";

export interface ThemeProviderProps {
  theme?: CletTheme;
  defaultTheme?: CletTheme;
  onThemeChange?: (theme: CletTheme) => void;
  /** localStorage key for persisting theme across sessions. Omit for no persistence. */
  storageKey?: string;
  /** Controlled accessibility text-size step. */
  fontSize?: CletFontSize;
  defaultFontSize?: CletFontSize;
  onFontSizeChange?: (fontSize: CletFontSize) => void;
  /** localStorage key for persisting font size across sessions. Omit for no persistence. */
  fontSizeStorageKey?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface ThemeContextValue {
  theme: CletTheme;
  setTheme: (theme: CletTheme) => void;
  resolvedTheme: ResolvedCletTheme;
  fontSize: CletFontSize;
  setFontSize: (fontSize: CletFontSize) => void;
}

export type UseThemeReturn = ThemeContextValue;

export type UseFontSizeReturn = Pick<ThemeContextValue, "fontSize" | "setFontSize">;

export interface CletComponentThemeOverrides<T> {
  /** Applied to both light and dark, per token — a token here is skipped if that mode sets its own value. */
  all?: T;
  light?: T;
  dark?: T;
}

export type CletComponentThemeConfig = {
  [K in keyof CletComponentTokenMap]?: CletComponentThemeOverrides<CletComponentTokenMap[K]>;
};

export interface CletThemeConfig {
  /** --clet-* token overrides applied to both light and dark — per token, skipped if that mode sets its own value below. */
  all?: CletGlobalTokens;
  /** --clet-* token overrides applied under [data-clet-theme="light"] */
  light?: CletGlobalTokens;
  /** --clet-* token overrides applied under [data-clet-theme="dark"] */
  dark?: CletGlobalTokens;
  /** Per-component --clet-<component>-* token overrides, keyed by component name (e.g. AppHeader, Card). */
  components?: CletComponentThemeConfig;
}
