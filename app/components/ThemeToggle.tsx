"use client";

import { useTheme } from "@/app/hooks/useTheme";
import styles from "./header.module.css";
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className={styles.themeToggle}>
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  );
};
