/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-red)",
        "on-primary": "var(--pure-white)",
        secondary: "var(--dark-grey)",
        "on-surface": "var(--dark-grey)",
        background: "var(--pure-white)",
        surface: "var(--pure-white)",
        "surface-container-low": "var(--light-grey)",
        "outline-variant": "rgba(0,0,0,0.05)",
        "inverse-surface": "var(--dark-grey)",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "6px",
        xl: "12px",
        full: "9999px",
      },
      spacing: {
        "margin-desktop": "48px",
        "container-max": "1280px",
        "stack-sm": "8px",
        "stack-lg": "32px",
        "stack-md": "16px",
        "margin-mobile": "16px",
        gutter: "24px",
      },
      fontFamily: {
        "body-md": ["var(--font-proxima)"],
        "headline-lg-mobile": ["var(--font-sailors)"],
        "headline-md": ["var(--font-sailors)"],
        "body-lg": ["var(--font-proxima)"],
        "headline-lg": ["var(--font-sailors)"],
        "headline-xl": ["var(--font-sailors)"],
        "label-sm": ["var(--font-proxima)"],
        "label-bold": ["var(--font-proxima)"],
      },
      fontSize: {
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "headline-lg-mobile": ["28px", { lineHeight: "1.1", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.15", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "headline-lg": ["40px", { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-xl": ["56px", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "1", fontWeight: "500" }],
        "label-bold": ["14px", { lineHeight: "1", fontWeight: "600" }],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 120s linear infinite',
      },
    },
  },
  plugins: [],
};
