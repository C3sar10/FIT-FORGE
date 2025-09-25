"use client";

import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

import "../styles/globals.css";
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
      <button
        className="px-8 py-4 mt-6 bg-lime-700 text-white rounded hover:bg-lime-500 transition"
        onClick={() => (window.location.href = "/auth")}
      >
        Go to Auth
      </button>
    </main>
  );
}
