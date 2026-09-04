import { useContext } from "react";
import type { UseFontSizeReturn } from "../../types/theme";
import { ThemeContext } from "./ThemeContext";

export function useFontSize(): UseFontSizeReturn {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useFontSize must be used within a ThemeProvider");
  }

  return { fontSize: context.fontSize, setFontSize: context.setFontSize };
}
