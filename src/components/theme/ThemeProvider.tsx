import { useCallback, useEffect, useMemo, useState } from "react";
import type { CletFontSize, CletTheme, ThemeProviderProps } from "../../types/theme";
import { getSystemTheme, resolveTheme } from "./resolveTheme";
import { ThemeContext } from "./ThemeContext";

const FONT_SIZES: readonly CletFontSize[] = ["sm", "md", "lg", "xl"];

function isFontSize(value: string | null): value is CletFontSize {
  return value !== null && (FONT_SIZES as readonly string[]).includes(value);
}

export function ThemeProvider({
  theme: controlledTheme,
  defaultTheme = "system",
  onThemeChange,
  storageKey = "clet-theme",
  fontSize: controlledFontSize,
  defaultFontSize = "md",
  onFontSizeChange,
  fontSizeStorageKey = "clet-font-size",
  className,
  style,
  children,
}: ThemeProviderProps) {
  const resolvedDefault = useMemo(() => {
    if (!storageKey) return defaultTheme;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    } catch {
      // localStorage unavailable
    }
    return defaultTheme;
  }, [storageKey, defaultTheme]);

  const [uncontrolledTheme, setUncontrolledTheme] =
    useState<CletTheme>(resolvedDefault);
  const isControlled = controlledTheme !== undefined;
  const theme = isControlled ? controlledTheme : uncontrolledTheme;
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolvedDefaultFontSize = useMemo(() => {
    if (!fontSizeStorageKey) return defaultFontSize;
    try {
      const stored = localStorage.getItem(fontSizeStorageKey);
      if (isFontSize(stored)) {
        return stored;
      }
    } catch {
      // localStorage unavailable
    }
    return defaultFontSize;
  }, [fontSizeStorageKey, defaultFontSize]);

  const [uncontrolledFontSize, setUncontrolledFontSize] = useState<CletFontSize>(
    resolvedDefaultFontSize,
  );
  const isFontSizeControlled = controlledFontSize !== undefined;
  const fontSize = isFontSizeControlled ? controlledFontSize : uncontrolledFontSize;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setSystemTheme(getSystemTheme());
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const resolvedTheme = useMemo(
    () => (theme === "system" ? systemTheme : resolveTheme(theme)),
    [theme, systemTheme],
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.setAttribute("data-clet-theme", resolvedTheme);
    document.documentElement.setAttribute("data-gsl-theme", resolvedTheme);

    return () => {
      document.documentElement.removeAttribute("data-clet-theme");
      document.documentElement.removeAttribute("data-gsl-theme");
    };
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    /* Stamped on the documentElement, not the wrapper below, so portaled
       surfaces mounted on document.body inherit the same scale. */
    document.documentElement.setAttribute("data-clet-font-size", fontSize);
    document.documentElement.setAttribute("data-gsl-font-size", fontSize);

    return () => {
      document.documentElement.removeAttribute("data-clet-font-size");
      document.documentElement.removeAttribute("data-gsl-font-size");
    };
  }, [fontSize]);

  const setTheme = useCallback(
    (nextTheme: CletTheme) => {
      if (isControlled) {
        onThemeChange?.(nextTheme);
        return;
      }

      setUncontrolledTheme(nextTheme);
      try {
        if (storageKey) localStorage.setItem(storageKey, nextTheme);
      } catch {
        // localStorage unavailable
      }
      onThemeChange?.(nextTheme);
    },
    [isControlled, onThemeChange, storageKey],
  );

  const setFontSize = useCallback(
    (nextFontSize: CletFontSize) => {
      if (isFontSizeControlled) {
        onFontSizeChange?.(nextFontSize);
        return;
      }

      setUncontrolledFontSize(nextFontSize);
      try {
        if (fontSizeStorageKey)
          localStorage.setItem(fontSizeStorageKey, nextFontSize);
      } catch {
        // localStorage unavailable
      }
      onFontSizeChange?.(nextFontSize);
    },
    [isFontSizeControlled, onFontSizeChange, fontSizeStorageKey],
  );

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      fontSize,
      setFontSize,
    }),
    [theme, setTheme, resolvedTheme, fontSize, setFontSize],
  );

  const rootClass = ["clet-theme gsl-theme", className].filter(Boolean).join(" ");

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        className={rootClass}
        data-clet-theme={resolvedTheme}
        data-gsl-theme={resolvedTheme}
        data-clet-font-size={fontSize}
        data-gsl-font-size={fontSize}
        style={style}
        suppressHydrationWarning
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
