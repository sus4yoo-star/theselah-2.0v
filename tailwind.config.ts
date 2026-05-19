import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // SELAH brand palette (from the reference design)
        selah: {
          bg: "#07111f",
          bg1: "#0a1828",
          bg2: "#10243a",
          bg3: "#15385a",
          bg4: "#1b446b",
          navy: "#133564",
          gold: "#D4AF37",
          gold2: "#d9962e",
          glow: "rgba(212,175,55,0.14)",
          cream: "#f6f1e8",
          cream2: "#cfc2ad",
          cream3: "#948879",
          verse: "#0b1d31",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Noto Serif KR", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Noto Sans KR", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        breathe: {
          "0%,100%": { transform: "translate(-50%,-50%) scale(1)", opacity: "0.4" },
          "50%": { transform: "translate(-50%,-50%) scale(1.12)", opacity: "0.9" },
        },
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        rise: "rise 0.45s ease both",
        breathe: "breathe 4s ease-in-out infinite",
        blink: "blink 0.7s steps(1) infinite",
        "fade-in": "fade-in 0.5s ease both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
