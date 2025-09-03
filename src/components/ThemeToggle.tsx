"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import "../styles/globals.css";

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    
    if (!mounted) return null;

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