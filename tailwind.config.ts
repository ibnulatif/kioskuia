import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0B1B3A", 700: "#14284F", 500: "#3A4A6B", 100: "#E7EBF3" },
        brand: { DEFAULT: "#1D6FEB", 600: "#1559C4", 50: "#EEF4FE", 100: "#D9E7FD" },
      },
      borderRadius: { xl2: "1.25rem" },
      boxShadow: { card: "0 1px 3px rgba(11,27,58,0.08), 0 1px 2px rgba(11,27,58,0.04)" },
    },
  },
  plugins: [],
};

export default config;
