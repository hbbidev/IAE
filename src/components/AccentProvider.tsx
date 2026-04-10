"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// ─── Preset Color Palettes ─────────────────────────────────────────────────────

export type AccentPreset = {
    name: string;
    h: number; // hue
    s: number; // saturation %
    l: number; // lightness %
    hex: string; // for display
};

export const ACCENT_PRESETS: AccentPreset[] = [
    { name: "Biru",      h: 217, s: 91, l: 60,  hex: "#3b82f6" },
    { name: "Ungu",      h: 258, s: 90, l: 66,  hex: "#a855f7" },
    { name: "Indigo",    h: 239, s: 84, l: 67,  hex: "#818cf8" },
    { name: "Cyan",      h: 192, s: 91, l: 46,  hex: "#06b6d4" },
    { name: "Hijau",     h: 142, s: 71, l: 45,  hex: "#22c55e" },
    { name: "Toska",     h: 162, s: 95, l: 39,  hex: "#10b981" },
    { name: "Kuning",    h: 38,  s: 92, l: 50,  hex: "#f59e0b" },
    { name: "Oranye",    h: 25,  s: 95, l: 53,  hex: "#f97316" },
    { name: "Merah",     h: 0,   s: 84, l: 60,  hex: "#f87171" },
    { name: "Pink",      h: 330, s: 81, l: 60,  hex: "#f472b6" },
    { name: "Slate",     h: 215, s: 25, l: 48,  hex: "#64748b" },
    { name: "Custom",    h: 217, s: 91, l: 60,  hex: "#3b82f6" },
];

const DEFAULT_PRESET = ACCENT_PRESETS[0];
const STORAGE_KEY = "lms-accent-color";

// ─── Context ───────────────────────────────────────────────────────────────────

type AccentContextType = {
    preset: AccentPreset;
    customHex: string;
    setPreset: (p: AccentPreset) => void;
    setCustomHex: (hex: string) => void;
};

const AccentContext = createContext<AccentContextType>({
    preset: DEFAULT_PRESET,
    customHex: DEFAULT_PRESET.hex,
    setPreset: () => {},
    setCustomHex: () => {},
});

export function useAccent() {
    return useContext(AccentContext);
}

// ─── Helper: hex to HSL ────────────────────────────────────────────────────────

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

// ─── Apply accent to DOM ───────────────────────────────────────────────────────

function applyAccent(h: number, s: number, l: number) {
    const root = document.documentElement;
    root.style.setProperty("--accent-h", String(h));
    root.style.setProperty("--accent-s", `${s}%`);
    root.style.setProperty("--accent-l", `${l}%`);
    // Darker variant for hover states
    root.style.setProperty("--accent-l-dark", `${Math.max(l - 10, 20)}%`);
    // NOTE: --accent-l-light and --accent-l-subtle are managed by CSS (.dark selector)
    // to correctly adapt to light/dark mode without JS
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AccentProvider({ children }: { children: React.ReactNode }) {
    const [preset, setPresetState] = useState<AccentPreset>(DEFAULT_PRESET);
    const [customHex, setCustomHexState] = useState(DEFAULT_PRESET.hex);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                applyAccent(data.h, data.s, data.l);
                setPresetState(data.preset ?? DEFAULT_PRESET);
                setCustomHexState(data.hex ?? DEFAULT_PRESET.hex);
            } else {
                applyAccent(DEFAULT_PRESET.h, DEFAULT_PRESET.s, DEFAULT_PRESET.l);
            }
        } catch {
            applyAccent(DEFAULT_PRESET.h, DEFAULT_PRESET.s, DEFAULT_PRESET.l);
        }
    }, []);

    const setPreset = (p: AccentPreset) => {
        applyAccent(p.h, p.s, p.l);
        setPresetState(p);
        if (p.name !== "Custom") setCustomHexState(p.hex);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ h: p.h, s: p.s, l: p.l, preset: p, hex: p.hex }));
    };

    const setCustomHex = (hex: string) => {
        const hsl = hexToHsl(hex);
        if (!hsl) return;
        applyAccent(hsl.h, hsl.s, hsl.l);
        setCustomHexState(hex);
        const customPreset: AccentPreset = { ...ACCENT_PRESETS[11], ...hsl, hex };
        setPresetState(customPreset);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...hsl, preset: customPreset, hex }));
    };

    return (
        <AccentContext.Provider value={{ preset, customHex, setPreset, setCustomHex }}>
            {children}
        </AccentContext.Provider>
    );
}
