import { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        inherit: colors.inherit,
        current: colors.current,
        transparent: colors.transparent,
        primary: "#000000",
        secondary: "#ff7e33",
        info: "#0C63E7",
        black: colors.black,
        white: colors.white,
        slate: colors.slate,
        gray: {
          50: "#FAFAFC",
          100: "#E9E9EC",
          200: "#C6C8CD",
          300: "#ACAEB6",
          400: "#92959F",
          500: "#777C87",
          600: "#5D6370",
          700: "#434959",
          800: "#293041",
          900: "#0f172a",
        },
        zinc: colors.zinc,
        neutral: colors.neutral,
        stone: colors.stone,
        red: colors.red,
        orange: colors.orange,
        amber: colors.amber,
        yellow: colors.yellow,
        lime: colors.lime,
        green: colors.green,
        emerald: colors.emerald,
        teal: colors.teal,
        cyan: colors.cyan,
        sky: colors.sky,
        blue: colors.blue,
        indigo: colors.indigo,
        violet: colors.violet,
        purple: colors.purple,
        fuchsia: colors.fuchsia,
        pink: colors.pink,
        rose: colors.rose,
        charcoal: '#1C1C1C',
        electricblue: '#94C5CC',
        vibrantgreen: '#00C853',
        subtlegray: '#333333',
        lightgray: '#F5F5F5',
        darkerblue: '#8497B0',
      },
    },
  },
  plugins: [],
};

export default config;

