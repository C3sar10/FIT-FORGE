"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import "../styles/globals.css";

export default function ThemeToggle() {
<<<<<<< HEAD
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
=======
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
>>>>>>> 2f286ae3f752f9e8f9562ef4f1aa966eb52a683f

  useEffect(() => {
    setMounted(true);
    // Force theme sync on mount
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "dark" : "light");
    }
  }, [theme, resolvedTheme, setTheme]);

<<<<<<< HEAD
    const isDark = resolvedTheme === "dark";
    console.log(resolvedTheme);
    

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded bg-[var(--primary-button)] transition"
        >
            {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
    );
}
=======
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
>>>>>>> 2f286ae3f752f9e8f9562ef4f1aa966eb52a683f
