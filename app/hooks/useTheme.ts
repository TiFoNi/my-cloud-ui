import { useEffect, useState } from "react";

export const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const root = window.document.documentElement;

    if (stored === "dark") {
      root.classList.add("dark");
      setTheme("dark");
    } else {
      root.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;

    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  return { theme, toggleTheme };
};
