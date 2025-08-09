"use client";
import { ReactNode, useEffect, useState, useCallback, createContext } from "react";

const LARGE_TEXT_KEY = "pref_large_text";
const HIGH_CONTRAST_KEY = "pref_high_contrast";

export type ThemeContextValue = {
  largeText: boolean;
  highContrast: boolean;
  updateLargeText: (on: boolean) => void;
  updateHighContrast: (on: boolean) => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  largeText: false,
  highContrast: false,
  updateLargeText: () => {},
  updateHighContrast: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [largeText, setLargeText] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    const lt = typeof window !== "undefined" && localStorage.getItem(LARGE_TEXT_KEY) === "1";
    const hc = typeof window !== "undefined" && localStorage.getItem(HIGH_CONTRAST_KEY) === "1";
    setLargeText(lt);
    setHighContrast(hc);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("large-text", largeText);
    root.classList.toggle("high-contrast", highContrast);
  }, [largeText, highContrast]);

  const updateLargeText = useCallback((on: boolean) => {
    setLargeText(on);
    try { localStorage.setItem(LARGE_TEXT_KEY, on ? "1" : "0"); } catch {}
  }, []);
  const updateHighContrast = useCallback((on: boolean) => {
    setHighContrast(on);
    try { localStorage.setItem(HIGH_CONTRAST_KEY, on ? "1" : "0"); } catch {}
  }, []);

  const value: ThemeContextValue = {
    largeText,
    highContrast,
    updateLargeText,
    updateHighContrast,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}