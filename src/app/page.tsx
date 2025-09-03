'use client';

import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // optional: return loading spinner or blank
  }

  const isDark = resolvedTheme === "dark";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to My App</h1>
      <ThemeToggle />
    </main>
  );
}
