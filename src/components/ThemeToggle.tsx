"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import "../styles/globals.css";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Force theme sync on mount
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "dark" : "light");
    }
  }, [theme, resolvedTheme, setTheme]);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
    >
      {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
  );
}
