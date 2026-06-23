import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { lightColors, darkColors } from "../theme/colors";

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  const value = useMemo(
    () => ({ isDark, toggleTheme, colors: isDark ? darkColors : lightColors }),
    [isDark, toggleTheme],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useAppTheme ThemeProvider ichida ishlatilishi kerak");
  return ctx;
}
