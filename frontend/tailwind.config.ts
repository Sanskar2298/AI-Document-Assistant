import type { Config } from "tailwindcss";

/**
 * Lexora design tokens.
 *
 * Everything a component needs — color, spacing, radius, shadow, motion —
 * is defined here once. Components should never hardcode a hex value or a
 * one-off pixel spacing; they reference these tokens instead. That's what
 * makes "redesign the button" a one-line change here instead of a find/replace
 * across 20 files.
 */
const config: Config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Neutral scale — the backbone of the whole UI. Almost everything
                // (backgrounds, borders, body text) comes from here, not from
                // "brand" colors. This is what makes premium SaaS UIs feel calm
                // instead of loud — color is the exception, not the rule.
                neutral: {
                    0: "#ffffff",
                    50: "#fafafa",
                    100: "#f4f4f5",
                    200: "#e4e4e7",
                    300: "#d4d4d8",
                    400: "#a1a1aa",
                    500: "#71717a",
                    600: "#52525b",
                    700: "#3f3f46",
                    800: "#27272a",
                    900: "#18181b",
                    950: "#09090b",
                },
                // Accent — used sparingly. Primary actions, active states, focus
                // rings, links. Violet keeps continuity with your existing
                // portfolio's palette rather than introducing a new brand color.
                accent: {
                    50: "#f5f3ff",
                    100: "#ede9fe",
                    200: "#ddd6fe",
                    300: "#c4b5fd",
                    400: "#a78bfa",
                    500: "#8b5cf6",
                    600: "#7c3aed",
                    700: "#6d28d9",
                    800: "#5b21b6",
                    900: "#4c1d95",
                },
                // Semantic roles — status communication only. Never used decoratively.
                success: { light: "#dcfce7", DEFAULT: "#16a34a", dark: "#14532d" },
                warning: { light: "#fef9c3", DEFAULT: "#ca8a04", dark: "#713f12" },
                danger: { light: "#fee2e2", DEFAULT: "#dc2626", dark: "#7f1d1d" },
            },
            fontFamily: {
                // Sans for UI chrome (labels, buttons, nav) — Inter is the safest
                // "doesn't look like a tutorial" choice: excellent hinting at small
                // sizes, used by Linear/Vercel/Raycast.
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                // A distinct display face for large headings gives hierarchy real
                // weight instead of relying on font-size alone.
                display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
                mono: ["var(--font-jetbrains-mono)", "monospace"],
            },
            fontSize: {
                // A restrained type scale. Every size below is used somewhere
                // specific — resist adding ad-hoc sizes in components.
                xs: ["0.75rem", { lineHeight: "1rem" }],
                sm: ["0.875rem", { lineHeight: "1.25rem" }],
                base: ["1rem", { lineHeight: "1.6rem" }],
                lg: ["1.125rem", { lineHeight: "1.75rem" }],
                xl: ["1.25rem", { lineHeight: "1.85rem" }],
                "2xl": ["1.5rem", { lineHeight: "2rem" }],
                "3xl": ["1.875rem", { lineHeight: "2.3rem" }],
                "4xl": ["2.5rem", { lineHeight: "2.9rem", letterSpacing: "-0.02em" }],
                "5xl": ["3.25rem", { lineHeight: "3.6rem", letterSpacing: "-0.02em" }],
            },
            spacing: {
                // A few extra steps beyond Tailwind's defaults for generous,
                // consistent whitespace — the "premium" feeling is mostly spacing
                // discipline, not decoration.
                18: "4.5rem",
                22: "5.5rem",
                30: "7.5rem",
            },
            borderRadius: {
                // One consistent radius scale used everywhere. Cards, inputs,
                // buttons, and modals should never invent their own radius value.
                sm: "6px",
                DEFAULT: "8px",
                md: "10px",
                lg: "14px",
                xl: "20px",
            },
            boxShadow: {
                // Soft, low-contrast shadows only — no hard drop shadows. This is
                // what separates "premium minimal" from "generic Bootstrap card."
                xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
                sm: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
                md: "0 4px 12px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
                lg: "0 12px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04)",
                focus: "0 0 0 3px rgb(139 92 246 / 0.25)", // accent-500 at low opacity
            },
            transitionDuration: {
                fast: "120ms",
                base: "180ms",
                slow: "280ms",
            },
            transitionTimingFunction: {
                // A slight overshoot-free ease-out. Fast in, gentle stop — reads
                // as responsive without feeling springy or playful.
                smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
            },
            keyframes: {
                "fade-in": {
                    from: { opacity: "0", transform: "translateY(4px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
            animation: {
                "fade-in": "fade-in 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                shimmer: "shimmer 1.8s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};

export default config;