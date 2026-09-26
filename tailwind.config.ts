import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        clinic: {
          teal: "#1f6f6b",
          dark: "#123b39",
          paper: "#faf7f2",
          terracotta: "#c26b4a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
