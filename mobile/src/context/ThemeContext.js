import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors } from "../theme/colors";

const THEME_MODE_KEY = "themeMode";
const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_MODE_KEY)
      .then((saved) => {
        if (saved === "light" || saved === "dark" || saved === "system") {
          setThemeModeState(saved);
        }
      })
      .catch(() => {});
  }, []);

  const setThemeMode = useCallback((mode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_MODE_KEY, mode).catch(() => {});
  }, []);

  const isDark = themeMode === "system" ? systemScheme === "dark" : themeMode === "dark";

  // Splash ekranidagi tezkor almashtirish tugmasi uchun — tizim rejimidan
  // chiqib, aniq yorug'/tungi rejimni tanlaydi.
  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? "light" : "dark");
  }, [isDark, setThemeMode]);

  const value = useMemo(
    () => ({ isDark, themeMode, setThemeMode, toggleTheme, colors: isDark ? darkColors : lightColors }),
    [isDark, themeMode, setThemeMode, toggleTheme],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useAppTheme ThemeProvider ichida ishlatilishi kerak");
  return ctx;
}
