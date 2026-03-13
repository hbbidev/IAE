"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] animate-pulse" />
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-3.5 bg-white dark:bg-slate-800/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun size={20} className="animate-in spin-in-90 duration-300" />
            ) : (
                <Moon size={20} className="animate-in spin-in-90 duration-300" />
            )}
        </button>
    );
}
