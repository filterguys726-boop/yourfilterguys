"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle({
  expanded = false
}: {
  expanded?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const syncTheme = () => setTheme(getTheme());

    syncTheme();
    window.addEventListener("themechange", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
    window.dispatchEvent(new Event("themechange"));
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`button-secondary h-10 ${
        expanded ? "w-full justify-between px-3" : "w-10 p-0"
      }`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      data-enter={expanded ? undefined : "fade"}
      data-enter-delay={expanded ? undefined : "6"}
    >
      {expanded ? (
        <span>{isDark ? "Use light mode" : "Use dark mode"}</span>
      ) : null}
      {isDark ? (
        <Sun key="sun" aria-hidden className="theme-icon h-4 w-4" />
      ) : (
        <Moon key="moon" aria-hidden className="theme-icon h-4 w-4" />
      )}
      <span className={expanded ? "hidden" : "sr-only"}>
        {isDark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}
