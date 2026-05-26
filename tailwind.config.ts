import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        asphalt: "#243247",
        shopred: "#c6952c",
        electric: "#173f6d",
        bay: "#5d6670",
        paper: "#f5f7fa"
      },
      boxShadow: {
        panel: "0 18px 50px rgba(17, 24, 39, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
